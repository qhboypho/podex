import test from 'node:test';
import assert from 'node:assert/strict';

import '../fabric-engine.js';

const { buildFoldField, warpArtworkPixels } = globalThis.FormFabricEngine;

test('keeps flat fabric neutral while extracting bounded directional fold data from an edge', () => {
  const flat = new Uint8ClampedArray(3 * 3 * 4).fill(180);
  const flatField = buildFoldField(flat, 3, 3, 1);
  assert.equal(flatField.dx[4], 0);

  const fold = new Uint8ClampedArray(5 * 3 * 4).fill(255);
  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 2; x += 1) fold[(y * 5 + x) * 4] = 30;
  }
  const foldedField = buildFoldField(fold, 5, 3, 1);
  assert.ok(Math.abs(foldedField.dx[7]) > 0);
  assert.ok(Math.abs(foldedField.dx[7]) <= 12);
});

test('warps artwork pixels and reduces ink intensity in a dark fabric fold', () => {
  const artwork = new Uint8ClampedArray([
    240, 100, 50, 255,
    240, 100, 50, 255,
    240, 100, 50, 255,
  ]);
  const field = { dx: new Float32Array([0, 0, 0]), dy: new Float32Array([0, 0, 0]), shade: new Float32Array([1, .7, 1]) };
  const output = warpArtworkPixels(artwork, field, 3, 1);
  assert.equal(output[4], 168);
});

test('treats an evenly dark garment as neutral but creates occlusion at a local dark trough', () => {
  const solidBlack = new Uint8ClampedArray(7 * 7 * 4).fill(36);
  const neutral = buildFoldField(solidBlack, 7, 7, 1);
  assert.ok(neutral.shade[24] > .95);

  const trough = new Uint8ClampedArray(7 * 7 * 4).fill(110);
  for (let y = 0; y < 7; y += 1) {
    const index = (y * 7 + 3) * 4;
    trough[index] = 20;
    trough[index + 1] = 20;
    trough[index + 2] = 20;
  }
  const folded = buildFoldField(trough, 7, 7, 1);
  assert.ok(folded.shade[24] < .7);
});
