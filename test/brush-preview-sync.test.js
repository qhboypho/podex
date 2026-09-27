import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('requests a second preview after asynchronous brush-mask restoration', async () => {
  const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');

  assert.match(
    source,
    /const restoredMasks = await restorePendingMasks\(W, H\);\s*if \(restoredMasks\) scheduleFabricPreview\(\);/,
  );
});

test('hides the unmasked HTML artwork while a saved brush mask is loading', async () => {
  const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');

  assert.match(
    source,
    /const awaitingMaskPreview = Boolean\(pendingMaskAssets \|\| pendingMaskRestore\);/,
  );
});

test('hydrates saved brush masks before the first restored workspace render', async () => {
  const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');

  assert.match(source, /await restorePendingMasks\(0, 0\);\s*render\(\);/);
});

test('does not darken the garment with a black edge-blend layer outside the artwork alpha', async () => {
  const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');
  const previewStart = source.indexOf('async function runFabricPreview()');
  const previewEnd = source.indexOf('// ─── Canvas-based decorations', previewStart);
  const preview = source.slice(previewStart, previewEnd);

  assert.doesNotMatch(preview, /const vCanvas = document\.createElement\('canvas'\);[\s\S]*?ctx\.globalCompositeOperation = 'multiply';/);
});
