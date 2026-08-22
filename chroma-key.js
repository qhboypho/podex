(() => {
  'use strict';

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // "Độ xanh trội" của một pixel: green vượt trội so với kênh lớn hơn trong (R,B).
  // >0 nghĩa là pixel nghiêng về xanh lá (đặc trưng của green screen).
  function greenExcess(r, g, b) {
    return g - Math.max(r, b);
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
    const low = clamp(key * (options.lowFactor ?? 0.30), 8, 255);    // dưới → giữ nguyên
    const high = clamp(key * (options.highFactor ?? 0.75), low + 6, 255); // trên → trong suốt hẳn
    const despill = options.despill !== false;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const ex = greenExcess(r, g, b);

      // Alpha theo độ xanh trội: <low giữ, >high bỏ, giữa nội suy mượt (feather).
      let alphaMul = 1;
      if (ex >= high) alphaMul = 0;
      else if (ex > low) alphaMul = 1 - (ex - low) / (high - low);

      if (alphaMul <= 0) {
        data[i + 3] = 0;
        continue;
      }

      // Despill: kéo green thừa xuống ngang kênh trội hơn để xoá rìa xanh.
      if (despill && ex > 0) {
        const cap = Math.max(r, b);
        data[i + 1] = Math.round(g - (g - cap) * clamp(ex / high, 0, 1));
      }

      data[i + 3] = Math.round(data[i + 3] * alphaMul);
    }
    return { changed: true };
  }

  // Xử lý một Blob/File ảnh → trả về { blob, changed, mode }. Nếu không phát hiện
  // nền cần khử, changed=false và blob là ảnh gốc (không đụng vào).
  // options.mode: 'green' | 'black' | 'auto' (mặc định 'auto' — thử xanh rồi đen).
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

    let result = { changed: false }, used = null;
    if (mode === 'green') { result = tryGreen(); used = 'green'; }
    else if (mode === 'black') { result = tryBlack(); used = 'black'; }
    else {
      // auto: ưu tiên xanh (đặc trưng hơn), nếu không có thì thử đen.
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

  globalThis.FormChromaKey = {
    detectBackground, removeGreenScreen, processBlob, greenExcess, estimateGreenKey,
    detectBlackBackground, removeBlackScreen, estimateBlackLuma,
  };
})();
