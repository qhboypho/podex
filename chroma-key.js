(() => {
  'use strict';

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // "Độ xanh trội" của một pixel: green vượt trội so với kênh lớn hơn trong (R,B).
  // >0 nghĩa là pixel nghiêng về xanh lá (đặc trưng của green screen).
  function greenExcess(r, g, b) {
    return g - Math.max(r, b);
  }

  // Solve C = alpha F + (1-alpha) B at the boundary. Unlike blurring a
  // cut-out, this preserves individual strands and removes baked-in green.
  function recoverGreenEdge(source, width, height, x, y, high) {
    const i = (y * width + x) * 4;
    const c = [source[i], source[i + 1], source[i + 2]];
    let background = null, nearest = Infinity;
    const foregrounds = [];
    for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
      const j = (yy * width + xx) * 4;
      if (source[j + 3] < 250) continue;
      const r = source[j], g = source[j + 1], b = source[j + 2];
      const excess = greenExcess(r, g, b), distance = dx * dx + dy * dy;
      if (excess >= high && excess / Math.max(g, 1) > 0.65 && distance < nearest) {
        background = [r, g, b]; nearest = distance;
      } else if (excess <= 0) foregrounds.push([r, g, b, distance]);
    }
    if (!background || !foregrounds.length) return null;
    let best = null, bestScore = Infinity;
    for (const f of foregrounds) {
      let numerator = 0, denominator = 0;
      for (let k = 0; k < 3; k++) {
        const d = f[k] - background[k];
        numerator += (c[k] - background[k]) * d;
        denominator += d * d;
      }
      if (denominator < 400) continue;
      const alpha = clamp(numerator / denominator, 0, 1);
      let error = 0;
      for (let k = 0; k < 3; k++) {
        error += (c[k] - alpha * f[k] - (1 - alpha) * background[k]) ** 2;
      }
      const score = error + f[3] * 2;
      if (error < 900 && score < bestScore) {
        bestScore = score;
        best = { alpha, color: f.slice(0, 3) };
      }
    }
    return best;
  }

  // Lấy mẫu các pixel viền (4 cạnh) để đoán màu nền và xác định có phải green
  // screen hay không. Trả về { isGreen, keyR, keyG, keyB, keyExcess }.
  function detectBackground(data, width, height) {
    const samples = [];
    const step = Math.max(1, Math.round(Math.min(width, height) / 96));
    const push = (x, y) => {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 8) return; // bỏ pixel đã trong suốt
      samples.push([data[i], data[i + 1], data[i + 2]]);
    };
    // Lấy mẫu vài hàng/cột sát biên (dày 3px) để bền hơn với nhiễu mép.
    for (let d = 0; d < 3; d += 1) {
      for (let x = 0; x < width; x += step) { push(x, d); push(x, height - 1 - d); }
      for (let y = 0; y < height; y += step) { push(d, y); push(width - 1 - d, y); }
    }
    if (!samples.length) return { isGreen: false };

    let greenish = 0, sumR = 0, sumG = 0, sumB = 0, sumEx = 0, n = 0;
    for (const [r, g, b] of samples) {
      const ex = greenExcess(r, g, b);
      // "Xanh nền": green là kênh trội và trội đủ rõ so với chính độ sáng của nó.
      // Dùng cả ngưỡng tuyệt đối (ex) lẫn tương đối (ex/g) để bắt được cả xanh
      // sáng (#00b140) lẫn xanh lá tối (rgb(25,75,30)).
      if (g > Math.max(r, b) && (ex >= 14 || (g > 0 && ex / g >= 0.18)) && g > 32) {
        greenish += 1; sumR += r; sumG += g; sumB += b; sumEx += ex; n += 1;
      }
    }
    const ratio = greenish / samples.length;
    // Hạ ngưỡng: chỉ cần ~40% viền là xanh (góc có thể bị chủ thể/nhiễu che).
    if (ratio < 0.4 || n === 0) return { isGreen: false };
    return {
      isGreen: true,
      keyR: sumR / n,
      keyG: sumG / n,
      keyB: sumB / n,
      keyExcess: sumEx / n,
    };
  }

  // Khử nền xanh triệt để: alpha mềm 2 ngưỡng (feather) + despill viền.
  // options: { lowFactor, highFactor, despill } — chủ yếu dùng mặc định.
  function removeGreenScreen(imageData, options = {}) {
    const { data, width, height } = imageData;
    const bg = options.forceKey ? { isGreen: true, keyExcess: options.forceKey.keyExcess }
      : detectBackground(data, width, height);
    if (!bg.isGreen) return { changed: false };

    // Ngưỡng dựa trên độ xanh trội của nền tham chiếu, có sàn tối thiểu để bắt
    // được cả nền xanh tối (keyExcess nhỏ).
    const key = Math.max(bg.keyExcess, 18);
    const low = clamp(key * (options.lowFactor ?? 0.18), 6, 255);
    const high = clamp(key * (options.highFactor ?? 0.70), low + 6, 255);
    const despill = options.despill !== false;
    const source = options.refineEdges === false ? null : new Uint8ClampedArray(data);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const ex = greenExcess(r, g, b);

      // Alpha theo độ xanh trội: <low giữ, >high bỏ, giữa nội suy mượt (feather).
      let alphaMul = 1;
      if (ex >= high) alphaMul = 0;
      else if (ex > low) alphaMul = 1 - (ex - low) / (high - low);

      // Artwork can contain shaded green inside closed shapes (e.g. roofs).
      // Relative chroma detects those shadows independently of exposure.
      // Opt-in only: preserve the existing garment/background key behavior.
      if (options.shadowGreen && g > 0 && ex > 2) {
        const relativeGreen = ex / g;
        const shadowAlpha = 1 - clamp((relativeGreen - 0.12) / 0.28, 0, 1);
        alphaMul = Math.min(alphaMul, shadowAlpha);
      }

      // Restrict reconstruction to mixed green pixels, never opaque interior
      // skin, neutral clothing, transparent brush erasures or solid key colour.
      const edge = source && ex > 0 && ex / Math.max(g, 1) < 0.85
        && data[i + 3] > 0 && (!options.shadowGreen || alphaMul > 0)
        ? recoverGreenEdge(source, width, height, (i / 4) % width, Math.floor(i / 4 / width), high)
        : null;
      if (edge) {
        data[i + 3] = Math.round(source[i + 3] * edge.alpha);
        if (despill) {
          data[i] = edge.color[0];
          data[i + 1] = Math.min(edge.color[1], Math.max(edge.color[0], edge.color[2]));
          data[i + 2] = edge.color[2];
        }
        continue;
      }

      if (alphaMul <= 0) {
        data[i + 3] = 0;
        continue;
      }

      // Despill: kéo green thừa xuống ngang kênh trội hơn để xoá rìa xanh.
      if (despill && ex > 0) {
        const cap = Math.max(r, b);
        // Partial suppression left a green halo, especially on blond hair.
        // Neutralize remaining spill completely without eroding strand alpha.
        data[i + 1] = cap;
      }

      data[i + 3] = Math.round(data[i + 3] * alphaMul);
    }
    return { changed: true };
  }

  // Xử lý một Blob/File ảnh → trả về { blob, changed, mode }. Nếu không phát hiện
  // nền cần khử, changed=false và blob là ảnh gốc (không đụng vào).
  // options.mode: 'green' | 'black' | 'white' | 'color' | 'auto' (mặc định 'auto'
  // — thử xanh rồi đen, trắng, cuối cùng là bất kỳ màu nền đơn nào).
  // options.force = true: bỏ qua ngưỡng phát hiện, ép khử theo màu nền ước lượng.
  async function processBlob(inputBlob, options = {}) {
    const bitmap = await createImageBitmap(inputBlob);
    const width = bitmap.width, height = bitmap.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0);
    if (typeof bitmap.close === 'function') bitmap.close();

    const imageData = ctx.getImageData(0, 0, width, height);
    const mode = options.mode || 'auto';
    const data = imageData.data;

    const tryGreen = () => {
      const opts = options.force
        ? { ...options, forceKey: { keyExcess: estimateGreenKey(data, width, height) } }
        : options;
      return removeGreenScreen(imageData, opts);
    };
    const tryBlack = () => {
      const opts = options.force
        ? { ...options, forceBlack: { bgLuma: estimateBlackLuma(data, width, height) } }
        : options;
      return removeBlackScreen(imageData, opts);
    };
    const tryWhite = () => {
      const opts = options.force
        ? { ...options, forceWhite: { bgLuma: estimateWhiteLuma(data, width, height) } }
        : options;
      return removeWhiteScreen(imageData, opts);
    };
    const tryColor = () => {
      const opts = options.force
        ? { ...options, forceColor: estimateColorKey(data, width, height) }
        : options;
      return removeColorScreen(imageData, opts);
    };

    let result = { changed: false }, used = null;
    if (mode === 'green') { result = tryGreen(); used = 'green'; }
    else if (mode === 'black') { result = tryBlack(); used = 'black'; }
    else if (mode === 'white') { result = tryWhite(); used = 'white'; }
    else if (mode === 'color') { result = tryColor(); used = 'color'; }
    else if (mode === 'auto-all') {
      // Dùng cho phôi nguồn: thử mọi loại nền, kể cả trắng và màu đơn tùy ý.
      result = tryGreen(); used = 'green';
      if (!result.changed) { result = tryBlack(); used = 'black'; }
      if (!result.changed) { result = tryWhite(); used = 'white'; }
      if (!result.changed) { result = tryColor(); used = 'color'; }
    } else {
      // auto (mặc định): xanh rồi đen — an toàn cho artwork vì hai loại nền này
      // đặc trưng rõ; trắng/màu đơn có thể trùng với chính chủ thể (logo khối màu).
      result = tryGreen(); used = 'green';
      if (!result.changed) { result = tryBlack(); used = 'black'; }
    }

    if (!result.changed) return { blob: inputBlob, changed: false, mode: null };

    ctx.putImageData(imageData, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    return { blob: blob || inputBlob, changed: Boolean(blob), mode: used };
  }

  // Ước lượng độ xanh trội trung bình của viền (không kèm ngưỡng chặn) — dùng
  // cho chế độ khử thủ công/ép buộc.
  function estimateGreenKey(data, width, height) {
    let sum = 0, n = 0;
    const step = Math.max(1, Math.round(Math.min(width, height) / 96));
    const acc = (x, y) => {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 8) return;
      const ex = greenExcess(data[i], data[i + 1], data[i + 2]);
      if (ex > 0) { sum += ex; n += 1; }
    };
    for (let x = 0; x < width; x += step) { acc(x, 0); acc(x, height - 1); }
    for (let y = 0; y < height; y += step) { acc(0, y); acc(width - 1, y); }
    return n ? sum / n : 24;
  }

  // ─── Khử nền ĐEN ───────────────────────────────────────────────────────────
  // Độ sáng (luma) của một pixel theo Rec.601.
  function luma(r, g, b) {
    return r * 0.299 + g * 0.587 + b * 0.114;
  }

  // Kiểm tra viền có phải nền đen/tối không. Trả về { isBlack, bgLuma }.
  function detectBlackBackground(data, width, height) {
    const step = Math.max(1, Math.round(Math.min(width, height) / 96));
    let dark = 0, total = 0, sumLuma = 0, n = 0;
    const acc = (x, y) => {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 8) return;
      total += 1;
      const l = luma(data[i], data[i + 1], data[i + 2]);
      // "Tối": luma thấp và không lệch màu mạnh (đen/xám tối, không phải xanh đậm).
      if (l < 45) { dark += 1; sumLuma += l; n += 1; }
    };
    for (let d = 0; d < 3; d += 1) {
      for (let x = 0; x < width; x += step) { acc(x, d); acc(x, height - 1 - d); }
      for (let y = 0; y < height; y += step) { acc(d, y); acc(width - 1 - d, y); }
    }
    if (!total || dark / total < 0.4 || n === 0) return { isBlack: false };
    return { isBlack: true, bgLuma: sumLuma / n };
  }

  // Khử nền đen: alpha mềm 2 ngưỡng theo luma (feather ở mép sáng dần).
  function removeBlackScreen(imageData, options = {}) {
    const { data, width, height } = imageData;
    const bg = options.forceBlack ? { isBlack: true, bgLuma: options.forceBlack.bgLuma }
      : detectBlackBackground(data, width, height);
    if (!bg.isBlack) return { changed: false };

    // low: dưới ngưỡng này coi là nền (alpha 0). high: trên ngưỡng này giữ hẳn.
    // Neo quanh độ sáng nền để mép chủ thể được feather mượt.
    const base = Math.max(bg.bgLuma, 8);
    const low = clamp(base + (options.lowOffset ?? 12), 8, 120);
    const high = clamp(base + (options.highOffset ?? 55), low + 10, 180);

    for (let i = 0; i < data.length; i += 4) {
      const l = luma(data[i], data[i + 1], data[i + 2]);
      let alphaMul;
      if (l <= low) alphaMul = 0;
      else if (l >= high) alphaMul = 1;
      else alphaMul = (l - low) / (high - low);

      if (alphaMul <= 0) { data[i + 3] = 0; continue; }
      data[i + 3] = Math.round(data[i + 3] * alphaMul);
    }
    return { changed: true };
  }

  // Ước lượng độ sáng nền từ viền (không kèm ngưỡng chặn) — cho khử đen thủ công.
  function estimateBlackLuma(data, width, height) {
    const step = Math.max(1, Math.round(Math.min(width, height) / 96));
    let sum = 0, n = 0, minL = 255;
    const acc = (x, y) => {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 8) return;
      const l = luma(data[i], data[i + 1], data[i + 2]);
      sum += l; n += 1; if (l < minL) minL = l;
    };
    for (let x = 0; x < width; x += step) { acc(x, 0); acc(x, height - 1); }
    for (let y = 0; y < height; y += step) { acc(0, y); acc(width - 1, y); }
    return n ? Math.min(sum / n, minL + 10) : 10;
  }

  // ─── Khử nền TRẮNG ────────────────────────────────────────────────────────
  // Kiểm tra viền có phải nền trắng/sáng đồng nhất không. Trả về { isWhite, bgLuma }.
  // Dùng MEDIAN luma của các pixel sáng ở viền: chủ thể sạm chạm mép không kéo
  // lệch giá trị nền như trung bình.
  function detectWhiteBackground(data, width, height) {
    const step = Math.max(1, Math.round(Math.min(width, height) / 96));
    let bright = 0, total = 0;
    const brightLumas = [];
    const acc = (x, y) => {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 8) return;
      total += 1;
      const l = luma(data[i], data[i + 1], data[i + 2]);
      // "Sáng": luma cao và không lệch màu mạnh (trắng/xám sáng, không phải vàng nhạt).
      const maxC = Math.max(data[i], data[i + 1], data[i + 2]);
      const minC = Math.min(data[i], data[i + 1], data[i + 2]);
      if (l > 205 && maxC - minC < 40) { bright += 1; brightLumas.push(l); }
    };
    for (let d = 0; d < 3; d += 1) {
      for (let x = 0; x < width; x += step) { acc(x, d); acc(x, height - 1 - d); }
      for (let y = 0; y < height; y += step) { acc(d, y); acc(width - 1 - d, y); }
    }
    if (!total || bright / total < 0.4 || !brightLumas.length) return { isWhite: false };
    brightLumas.sort((a, b) => a - b);
    const bgLuma = brightLumas[Math.floor(brightLumas.length / 2)];
    return { isWhite: true, bgLuma };
  }

  // Khử nền trắng: alpha mềm theo luma (ngược chiều với khử đen).
  function removeWhiteScreen(imageData, options = {}) {
    const { data, width, height } = imageData;
    const bg = options.forceWhite ? { isWhite: true, bgLuma: options.forceWhite.bgLuma }
      : detectWhiteBackground(data, width, height);
    if (!bg.isWhite) return { changed: false };

    // Nền càng sáng, ngưỡng càng sát mép trắng để giữ lại chi tiết sáng của chủ thể.
    const base = Math.min(bg.bgLuma, 250);
    const high = clamp(base - (options.highOffset ?? 8), 120, 252); // từ mức này → trong suốt
    const low = clamp(base - (options.lowOffset ?? 42), 40, high - 10); // dưới mức này → giữ hẳn

    for (let i = 0; i < data.length; i += 4) {
      const l = luma(data[i], data[i + 1], data[i + 2]);
      let alphaMul;
      if (l >= high) alphaMul = 0;
      else if (l <= low) alphaMul = 1;
      else alphaMul = (high - l) / (high - low);

      if (alphaMul <= 0) { data[i + 3] = 0; continue; }
      data[i + 3] = Math.round(data[i + 3] * alphaMul);
    }
    return { changed: true };
  }

  // Ước lượng độ sáng nền trắng từ viền (cho khử trắng thủ công) — dùng P90
  // của luma viền để chủ thể chạm mép không kéo giá trị xuống.
  function estimateWhiteLuma(data, width, height) {
    const step = Math.max(1, Math.round(Math.min(width, height) / 96));
    const lumas = [];
    const acc = (x, y) => {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 8) return;
      lumas.push(luma(data[i], data[i + 1], data[i + 2]));
    };
    for (let x = 0; x < width; x += step) { acc(x, 0); acc(x, height - 1); }
    for (let y = 0; y < height; y += step) { acc(0, y); acc(width - 1, y); }
    if (!lumas.length) return 245;
    lumas.sort((a, b) => a - b);
    return lumas[Math.min(lumas.length - 1, Math.floor(lumas.length * 0.9))];
  }

  // ─── Khử nền MÀU ĐƠN TÙY Ý (xanh dương, đỏ, bất kỳ màu đồng nhất) ─────────
  // Khoảng cách màu Euclid rút gọn (bình phương) giữa 2 pixel.
  function colorDist2(r1, g1, b1, r2, g2, b2) {
    const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
    return dr * dr + dg * dg + db * db;
  }

  // Phân tích viền: nếu đa số pixel gần một màu trung bình (nền đồng nhất) thì
  // trả về màu key. Trả về { uniform, keyR, keyG, keyB, spread }.
  function detectColorBackground(data, width, height) {
    const step = Math.max(1, Math.round(Math.min(width, height) / 96));
    const samples = [];
    const push = (x, y) => {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 8) return;
      samples.push([data[i], data[i + 1], data[i + 2]]);
    };
    for (let d = 0; d < 3; d += 1) {
      for (let x = 0; x < width; x += step) { push(x, d); push(x, height - 1 - d); }
      for (let y = 0; y < height; y += step) { push(d, y); push(width - 1 - d, y); }
    }
    if (samples.length < 16) return { uniform: false };

    let sumR = 0, sumG = 0, sumB = 0;
    for (const [r, g, b] of samples) { sumR += r; sumG += g; sumB += b; }
    const keyR = sumR / samples.length, keyG = sumG / samples.length, keyB = sumB / samples.length;

    // Độ phân tán: khoảng cách màu trung bình tới màu key.
    let spreadSum = 0;
    for (const [r, g, b] of samples) spreadSum += Math.sqrt(colorDist2(r, g, b, keyR, keyG, keyB));
    const spread = spreadSum / samples.length;
    // Nền đồng nhất: phân tán nhỏ. Nới ngưỡng khi màu nền rất đậm hoặc rất sáng
    // (ảnh JPEG thường nhiễu hơn trên nền trung tính).
    const l = luma(keyR, keyG, keyB);
    const tolerance = l < 60 || l > 210 ? 46 : 34;
    if (spread > tolerance) return { uniform: false };
    return { uniform: true, keyR, keyG, keyB, spread };
  }

  // Khử nền màu đơn: alpha mềm theo khoảng cách màu tới key, có feather.
  function removeColorScreen(imageData, options = {}) {
    const { data, width, height } = imageData;
    const key = options.forceColor || null;
    let keyR, keyG, keyB, spread;
    if (key) {
      keyR = key.keyR; keyG = key.keyG; keyB = key.keyB; spread = key.spread ?? 30;
    } else {
      const bg = detectColorBackground(data, width, height);
      if (!bg.uniform) return { changed: false };
      keyR = bg.keyR; keyG = bg.keyG; keyB = bg.keyB; spread = bg.spread;
    }

    // Ngưỡng khoảng cách màu: dưới low → trong suốt, trên high → giữ hẳn.
    const low = clamp(Math.max(spread * 1.6, options.lowDist ?? 42), 20, 160);
    const high = clamp(low + (options.feather ?? 55), low + 10, 220);
    const low2 = low * low, high2 = high * high;

    for (let i = 0; i < data.length; i += 4) {
      const d2 = colorDist2(data[i], data[i + 1], data[i + 2], keyR, keyG, keyB);
      let alphaMul;
      if (d2 <= low2) alphaMul = 0;
      else if (d2 >= high2) alphaMul = 1;
      else alphaMul = (Math.sqrt(d2) - low) / (high - low);

      if (alphaMul <= 0) { data[i + 3] = 0; continue; }
      data[i + 3] = Math.round(data[i + 3] * alphaMul);
    }
    return { changed: true };
  }

  // Ước lượng màu nền đồng nhất từ viền (cho khử màu thủ công/ép buộc).
  function estimateColorKey(data, width, height) {
    const bg = detectColorBackground(data, width, height);
    if (bg.uniform) return { keyR: bg.keyR, keyG: bg.keyG, keyB: bg.keyB, spread: bg.spread };
    // Không đồng nhất vẫn ước lượng màu trung bình viền (ep buộc theo yêu cầu người dùng).
    const step = Math.max(1, Math.round(Math.min(width, height) / 96));
    let sumR = 0, sumG = 0, sumB = 0, n = 0;
    const acc = (x, y) => {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 8) return;
      sumR += data[i]; sumG += data[i + 1]; sumB += data[i + 2]; n += 1;
    };
    for (let x = 0; x < width; x += step) { acc(x, 0); acc(x, height - 1); }
    for (let y = 0; y < height; y += step) { acc(0, y); acc(width - 1, y); }
    if (!n) return { keyR: 255, keyG: 255, keyB: 255, spread: 30 };
    return { keyR: sumR / n, keyG: sumG / n, keyB: sumB / n, spread: 40 };
  }

  function greenSource(asset, libraryEntry) {
    return asset.greenSourceBlob || libraryEntry?.blob || asset.blob;
  }

  globalThis.FormChromaKey = {
    greenSource,
    detectBackground, removeGreenScreen, processBlob, greenExcess, estimateGreenKey,
    detectBlackBackground, removeBlackScreen, estimateBlackLuma,
    detectWhiteBackground, removeWhiteScreen, estimateWhiteLuma,
    detectColorBackground, removeColorScreen, estimateColorKey, colorDist2,
  };
})();
