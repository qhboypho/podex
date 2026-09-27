(() => {
  'use strict';

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const luminanceAt = (data, index) => data[index] * .2126 + data[index + 1] * .7152 + data[index + 2] * .0722;

  function blurLuminance(luminance, width, height, radius) {
    const horizontal = new Float32Array(luminance.length);
    const output = new Float32Array(luminance.length);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        let total = 0;
        for (let offset = -radius; offset <= radius; offset += 1) total += luminance[y * width + clamp(x + offset, 0, width - 1)];
        horizontal[y * width + x] = total / (radius * 2 + 1);
      }
    }
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        let total = 0;
        for (let offset = -radius; offset <= radius; offset += 1) total += horizontal[clamp(y + offset, 0, height - 1) * width + x];
        output[y * width + x] = total / (radius * 2 + 1);
      }
    }
    return output;
  }

  // Độ đục chuẩn hóa của một pixel (0..1).
  function alpha01(pixels, index) {
    return pixels[index * 4 + 3] / 255;
  }

  // Tạo ánh sáng nếp vải trên RGB nhưng luôn giữ nguyên alpha artwork.
  // Giới hạn vùng tối để nếp sâu không biến thành vệt đen/cắt thủng hình in.
  function applyFoldLighting(pixels, fabricLuminance, fold, emboss, offset = 0) {
    const deviation = (fabricLuminance - 0.5) * fold * emboss * 1.4;
    const factor = clamp(1 + deviation, 0.72, 1.12);
    pixels[offset] = Math.round(clamp(pixels[offset] * factor, 0, 255));
    pixels[offset + 1] = Math.round(clamp(pixels[offset + 1] * factor, 0, 255));
    pixels[offset + 2] = Math.round(clamp(pixels[offset + 2] * factor, 0, 255));
    return pixels;
  }

  function buildFoldField(fabricPixels, width, height, strength = 1) {
    const size = width * height;
    const luminance = new Float32Array(size);
    const coverage = new Float32Array(size);
    const dx = new Float32Array(size);
    const dy = new Float32Array(size);
    const shade = new Float32Array(size);
    // Phôi nền trong suốt: luminance vùng rỗng vô nghĩa — thay bằng luminance
    // trung bình của vùng đục để mép silhouet không sinh gradient giả. Chỉ bật
    // khi ảnh thật sự có pixel trong suốt (ảnh chụp/JPEG luôn opaque toàn phần).
    let transparentN = 0, opaqueSum = 0, opaqueN = 0;
    for (let index = 0; index < size; index += 1) {
      const alpha = fabricPixels[index * 4 + 3];
      luminance[index] = luminanceAt(fabricPixels, index * 4);
      if (alpha < 8) transparentN += 1;
      if (alpha > 16) { opaqueSum += luminance[index]; opaqueN += 1; }
    }
    const hasTransparency = transparentN > 0;
    const meanLum = opaqueN ? opaqueSum / opaqueN : 0.5;
    for (let index = 0; index < size; index += 1) {
      coverage[index] = hasTransparency ? alpha01(fabricPixels, index) : 1;
      if (hasTransparency && coverage[index] < 0.06) luminance[index] = meanLum;
    }
    const radius = clamp(Math.round(Math.min(width, height) / 90), 1, 12);
    const smooth = blurLuminance(luminance, width, height, radius);
    const sample = (field, x, y) => field[clamp(y, 0, height - 1) * width + clamp(x, 0, width - 1)];
    const sampleCoverage = (x, y) => coverage[clamp(y, 0, height - 1) * width + clamp(x, 0, width - 1)];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        if (coverage[index] < 0.5
          || sampleCoverage(x - 1, y) < 0.5 || sampleCoverage(x + 1, y) < 0.5
          || sampleCoverage(x, y - 1) < 0.5 || sampleCoverage(x, y + 1) < 0.5) {
          // Ngoài silhouet phôi: không dịch chuyển, không đổ bóng.
          dx[index] = 0;
          dy[index] = 0;
          shade[index] = 1;
          continue;
        }
        const detail = luminance[index] - smooth[index];
        const trough = Math.max(0, -detail);
        const ridge = Math.max(0, detail);
        const gradientX = (sample(smooth, x + 1, y) - sample(smooth, x - 1, y)) / 2;
        const gradientY = (sample(smooth, x, y + 1) - sample(smooth, x, y - 1)) / 2;
        const displacement = clamp((trough / 22 + Math.hypot(gradientX, gradientY) / 18) * strength, 0, 15);
        const length = Math.hypot(gradientX, gradientY) || 1;
        dx[index] = gradientX === 0 ? 0 : clamp(-gradientX / length * displacement, -15, 15);
        dy[index] = gradientY === 0 ? 0 : clamp(-gradientY / length * displacement, -15, 15);
        shade[index] = clamp(1 - trough / 45 * .28 + ridge / 75 * .08, .72, 1.08);
      }
    }
    return { dx, dy, shade };
  }

  function warpArtworkPixels(artworkPixels, foldField, width, height, clothCoverage = null) {
    const output = new Uint8ClampedArray(artworkPixels.length);
    const sampleIndex = (x, y) => (clamp(y, 0, height - 1) * width + clamp(x, 0, width - 1)) * 4;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixel = y * width + x;
        const target = pixel * 4;
        const source = sampleIndex(Math.round(x + foldField.dx[pixel]), Math.round(y + foldField.dy[pixel]));
        const cloth = clothCoverage ? clothCoverage[pixel] : 1;
        const shade = foldField.shade[pixel] * cloth;
        output[target] = Math.round(artworkPixels[source] * shade);
        output[target + 1] = Math.round(artworkPixels[source + 1] * shade);
        output[target + 2] = Math.round(artworkPixels[source + 2] * shade);
        output[target + 3] = Math.round(artworkPixels[source + 3] * cloth);
      }
    }
    return output;
  }

  function warpArtworkLayer(artworkContext, fabricContext, bounds, options = {}) {
    if (bounds.width < 2 || bounds.height < 2) return;
    const artwork = artworkContext.getImageData(bounds.x, bounds.y, bounds.width, bounds.height);
    const fabric = fabricContext.getImageData(bounds.x, bounds.y, bounds.width, bounds.height);
    const field = buildFoldField(fabric.data, bounds.width, bounds.height, options.strength || 1);

    // Apply emboss override to shade field if caller supplied a value
    if (typeof options.emboss === 'number' && options.emboss !== 0.60) {
      const scale = options.emboss / 0.60; // normalise against engine default
      for (let i = 0; i < field.shade.length; i++) {
        // Re-center at 1, scale the deviation
        field.shade[i] = clamp(1 + (field.shade[i] - 1) * scale, 0.72, 1.12);
      }
    }

    const warped = warpArtworkPixels(artwork.data, field, bounds.width, bounds.height);

    // Edge blend: feather artwork alpha near the region border
    const edgeBlend = typeof options.edgeBlend === 'number' ? options.edgeBlend : 0.40;
    if (edgeBlend > 0.02) {
      const W = bounds.width, H = bounds.height;
      const feather = Math.round(Math.min(W, H) * 0.10 * edgeBlend);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          if (warped[idx + 3] === 0) continue;
          const dx = Math.min(x, W - 1 - x);
          const dy = Math.min(y, H - 1 - y);
          const dist = Math.min(dx, dy);
          if (dist < feather) {
            warped[idx + 3] = Math.round(warped[idx + 3] * (dist / feather));
          }
        }
      }
    }

    artwork.data.set(warped);
    artworkContext.putImageData(artwork, bounds.x, bounds.y);
  }

  globalThis.FormFabricEngine = { applyFoldLighting, buildFoldField, warpArtworkLayer, warpArtworkPixels };
})();
