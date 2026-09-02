import test from 'node:test';
import assert from 'node:assert/strict';

import '../chroma-key.js';

const {
  detectWhiteBackground, removeWhiteScreen,
  detectColorBackground, removeColorScreen,
} = globalThis.FormChromaKey;

// Ảnh 40×40: nền trắng, hình vuông đỏ 16×16 ở giữa.
function whiteBackgroundImage() {
  const width = 40, height = 40;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const inside = x >= 12 && x < 28 && y >= 12 && y < 28;
      if (inside) { data[i] = 200; data[i + 1] = 40; data[i + 2] = 40; }
      else { data[i] = 252; data[i + 1] = 252; data[i + 2] = 250; }
      data[i + 3] = 255;
    }
  }
  return { data, width, height };
}

// Ảnh 40×40: nền xanh dương đồng nhất, hình vuông cam ở giữa.
function blueBackgroundImage() {
  const width = 40, height = 40;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const inside = x >= 12 && x < 28 && y >= 12 && y < 28;
      if (inside) { data[i] = 235; data[i + 1] = 140; data[i + 2] = 30; }
      else { data[i] = 30; data[i + 1] = 90; data[i + 2] = 220; }
      data[i + 3] = 255;
    }
  }
  return { data, width, height };
}

test('detects a uniform white border as a white background', () => {
  const image = whiteBackgroundImage();
  const bg = detectWhiteBackground(image.data, image.width, image.height);
  assert.equal(bg.isWhite, true);
  assert.ok(bg.bgLuma > 240);
});

test('removes white background while keeping the subject intact', () => {
  const image = whiteBackgroundImage();
  const result = removeWhiteScreen(image, { lowOffset: 55, highOffset: 10 });
  assert.equal(result.changed, true);
  const at = (x, y) => (y * image.width + x) * 4;
  assert.equal(image.data[at(2, 2) + 3], 0, 'góc nền trắng phải trong suốt');
  assert.equal(image.data[at(20, 20) + 3], 255, 'tâm chủ thể phải giữ nguyên');
  assert.equal(image.data[at(20, 20)], 200);
  assert.equal(image.data[at(20, 20) + 1], 40);
});

test('keeps a light-grey garment intact while removing the white background', () => {
  // Áo xám sáng (luma ~210) chiếm nửa dưới, nền trắng ở nửa trên.
  // (Áo trắng tinh trên nền trắng tinh là case mơ hồ tuyệt đối — ngoài khả năng
  // của mọi keyer dựa trên màu; người dùng nên chọn nền tương phản.)
  const width = 40, height = 40;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      if (y >= 20) { data[i] = 205; data[i + 1] = 208; data[i + 2] = 212; }
      else { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
      data[i + 3] = 255;
    }
  }
  removeWhiteScreen({ data, width, height });
  const at = (x, y) => (y * width + x) * 4;
  assert.equal(data[at(20, 2) + 3], 0, 'nền trắng phải trong suốt');
  assert.equal(data[at(20, 30) + 3], 255, 'áo xám sáng phải giữ nguyên alpha');
});

test('detects a uniform blue border as a single-color background', () => {
  const image = blueBackgroundImage();
  const bg = detectColorBackground(image.data, image.width, image.height);
  assert.equal(bg.uniform, true);
  assert.ok(bg.keyB > 180, 'màu key phải nghiêng xanh dương');
  assert.ok(bg.spread < 10);
});

test('removes a single-color background with soft feather', () => {
  const image = blueBackgroundImage();
  const result = removeColorScreen(image);
  assert.equal(result.changed, true);
  const at = (x, y) => (y * image.width + x) * 4;
  assert.equal(image.data[at(2, 2) + 3], 0, 'nền xanh dương phải trong suốt');
  assert.equal(image.data[at(20, 20) + 3], 255, 'chủ thể giữ nguyên');
  // Mép chủ thể: alpha giảm dần chứ không cắt cứng — kiểm tra điểm biên.
  const edge = image.data[at(11, 20) + 3];
  assert.ok(edge >= 0 && edge <= 255);
});

test('does not touch an image with a noisy multi-color border', () => {
  const width = 40, height = 40;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      data[i] = (x * 37 + y * 91) % 256;
      data[i + 1] = (x * 53 + y * 17) % 256;
      data[i + 2] = (x * 11 + y * 73) % 256;
      data[i + 3] = 255;
    }
  }
  assert.equal(detectColorBackground(data, width, height).uniform, false);
  assert.equal(removeColorScreen({ data, width, height }).changed, false);
});
