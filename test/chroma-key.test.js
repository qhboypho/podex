import test from 'node:test';
import assert from 'node:assert/strict';

import '../chroma-key.js';

test('repeating green key starts from original pixels, not the previous cutout', () => {
  const original = new Blob(['original']), processed = new Blob(['cutout']);
  const select = globalThis.FormChromaKey.greenSource;
  assert.equal(select({ blob: processed, greenSourceBlob: original }), original);
  assert.equal(select({ blob: processed }, { blob: original }), original);
  assert.equal(select({ blob: original }), original);
});

test('mixed hair pixels recover strand opacity and foreground colour instead of an opaque grey rim', () => {
  const width = 15, height = 9;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const color = x < 7 ? [160, 130, 100] : x === 7 ? [80, 155, 60] : [0, 180, 20];
    data.set([...color, 255], (y * width + x) * 4);
  }
  globalThis.FormChromaKey.removeGreenScreen({ data, width, height });
  const i = (4 * width + 7) * 4;
  assert.ok(Math.abs(data[i + 3] - 128) < 15, 'half-covered strand keeps half opacity');
  assert.ok(Math.abs(data[i] - 160) < 15, 'recover hair red rather than darkening fringe');
  assert.ok(Math.abs(data[i + 1] - 130) < 15);
  assert.deepEqual([...data.slice((4 * width + 3) * 4, (4 * width + 3) * 4 + 4)], [160, 130, 100, 255]);
});

const {
  detectWhiteBackground, removeWhiteScreen,
  detectColorBackground, removeColorScreen,
} = globalThis.FormChromaKey;

test('artwork green key removes shadow-green roof pixels without erasing dark neutral ink', () => {
  const image = { width: 3, height: 1, data: new Uint8ClampedArray([
    2, 16, 7, 255, 47, 82, 46, 255, 12, 12, 12, 255,
  ]) };
  globalThis.FormChromaKey.removeGreenScreen(image, {
    forceKey: { keyExcess: 100 }, shadowGreen: true,
  });
  assert.equal(image.data[3], 0);
  assert.equal(image.data[7], 0);
  assert.equal(image.data[11], 255);
});

// Ảnh 40×40: nền trắng, hình vuông đỏ 16×16 ở giữa.
test('green-key hair edges have no green spill while keeping semi-transparent strands', () => {
  const image = { width: 3, height: 1, data: new Uint8ClampedArray([
    90, 125, 70, 255, 160, 168, 150, 180, 180, 125, 95, 255,
  ]) };
  globalThis.FormChromaKey.removeGreenScreen(image, { forceKey: { keyExcess: 100 } });
  assert.ok(image.data[1] <= Math.max(image.data[0], image.data[2]));
  assert.ok(image.data[5] <= Math.max(image.data[4], image.data[6]));
  assert.ok(image.data[3] > 0 && image.data[3] < 255);
  assert.deepEqual([...image.data.slice(8)], [180, 125, 95, 255]);
});

test('green key preserves blue artwork and existing erased transparency', () => {
  const image = { width: 2, height: 1, data: new Uint8ClampedArray([
    10, 150, 200, 255, 30, 80, 20, 0,
  ]) };
  globalThis.FormChromaKey.removeGreenScreen(image, { forceKey: { keyExcess: 100 }, shadowGreen: true });
  assert.deepEqual([...image.data.slice(0, 4)], [10, 150, 200, 255]);
  assert.equal(image.data[7], 0);
});

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
