import test from 'node:test';
import assert from 'node:assert/strict';

import '../mask-assets.js';

const { createMaskAsset, normalizeMaskAssetMap } = globalThis.FormMaskAssets;

test('keeps an erased overlay mask as a binary asset with its canvas dimensions', () => {
  const blob = new Blob(['mask-bytes'], { type: 'image/png' });
  const asset = createMaskAsset(blob, 640, 960);

  assert.equal(asset.blob, blob);
  assert.equal(asset.width, 640);
  assert.equal(asset.height, 960);
});

test('restores structured and legacy brush-mask assets by their overlay id', () => {
  const frontMask = new Blob(['front'], { type: 'image/png' });
  const backMask = new Blob(['back'], { type: 'image/png' });
  const masks = normalizeMaskAssetMap({
    17: createMaskAsset(frontMask, 800, 800),
    31: backMask,
    invalid: { width: 200, height: 200 },
  });

  assert.deepEqual(Object.keys(masks), ['17', '31']);
  assert.equal(masks[17].blob, frontMask);
  assert.equal(masks[17].width, 800);
  assert.equal(masks[31].blob, backMask);
});
