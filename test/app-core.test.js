import test from 'node:test';
import assert from 'node:assert/strict';

import '../app-core.js';

const {
  MAX_IMAGE_BYTES,
  createScene,
  applyDraft,
  getExportDimensions,
  getBaseDisplayBox,
  getActiveOverlay,
  getExportFileName,
  getOverlayStyle,
  isEditableLayer,
  moveOverlay,
  normalizeWorkspaceView,
  resizeOverlay,
  rotateOverlay,
  resetBase,
  serializeDraft,
  setSafeArea,
  selectView,
  setBase,
  setBackground,
  setBaseTransform,
  setCanvasRatio,
  setLogo,
  updateOverlay,
  validateImageFile,
} = globalThis.FormCore;

test('accepts supported image types inside the configured upload limit', () => {
  const result = validateImageFile({ type: 'image/png', size: MAX_IMAGE_BYTES });
  assert.deepEqual(result, { ok: true });
});

test('normalizes the workspace viewport for wheel zoom and drag pan', () => {
  const view = normalizeWorkspaceView({ zoom: 4, panX: -900, panY: 760 });
  assert.deepEqual(view, { zoom: 1.8, panX: -640, panY: 640 });
});

test('rejects an unsupported garment upload instead of changing the locked base', () => {
  const result = validateImageFile({ type: 'application/pdf', size: 1024 });
  assert.equal(result.ok, false);
  assert.match(result.error, /PNG, JPG hoặc WEBP/);
});

test('rejects an image that exceeds the safe browser-side size limit', () => {
  const result = validateImageFile({ type: 'image/jpeg', size: MAX_IMAGE_BYTES + 1 });
  assert.equal(result.ok, false);
  assert.match(result.error, /12 MB/);
});

test('starts on the current default blank garment and keeps the base locked', () => {
  const scene = createScene();
  assert.equal(scene.base.kind, 'default');
  assert.equal(scene.base.locked, true);
  assert.equal(isEditableLayer('base'), false);
});

test('replaces a base source without ever unlocking its model or garment layer', () => {
  const scene = createScene();
  const next = setBase(scene, { name: 'ao-tron.png', src: 'data:image/png;base64,abc' });
  assert.equal(next.base.kind, 'upload');
  assert.equal(next.base.name, 'ao-tron.png');
  assert.equal(next.base.locked, true);
  assert.equal(scene.base.kind, 'default');
});

test('scales and moves the locked base non-destructively inside the composition frame', () => {
  const portrait = setBaseTransform(createScene(), { scale: 2.4, x: -30, y: 130 });
  const square = setCanvasRatio(portrait, 'square');
  const box = getBaseDisplayBox(square);

  assert.equal(portrait.base.locked, true);
  assert.deepEqual(portrait.baseTransform, { scale: 1.6, x: 0, y: 100 });
  assert.deepEqual(box, { x: 0, y: 100, width: 122.74, height: 160, scale: 1.6 });
});

test('persists base presentation scale without serializing the locked source', () => {
  const scene = setBaseTransform(createScene(), { scale: .78, x: 67, y: 39 });
  const draft = serializeDraft(scene);
  const restored = applyDraft(createScene(), draft);

  assert.deepEqual(draft.baseTransform, { scale: .78, x: 67, y: 39 });
  assert.equal(draft.base, undefined);
  assert.deepEqual(restored.baseTransform, { scale: .78, x: 67, y: 39 });
});

test('moves the safe print area and both garment artworks with the moved base', () => {
  let scene = setSafeArea(createScene(), { x: 50, y: 47, width: 30, height: 30 });
  scene = updateOverlay(scene, { x: 52, y: 45 });
  scene = selectView(scene, 'back');
  scene = updateOverlay(scene, { x: 49, y: 46 });
  const before = { frontX: scene.overlay.x, backY: scene.backOverlay.y };
  const moved = setBaseTransform(scene, { x: 58, y: 54 });

  assert.equal(moved.safeArea.x, 58);
  assert.equal(moved.safeArea.y, 51);
  assert.equal(moved.overlay.x, before.frontX + 8);
  assert.equal(moved.backOverlay.y, before.backY + 4);
});

test('reset returns the unmodified blank default garment in its locked state', () => {
  const changed = setBase(createScene(), { name: 'ao-tron.png', src: 'data:image/png;base64,abc' });
  const reset = resetBase(changed);
  assert.equal(reset.base.kind, 'default');
  assert.equal(reset.base.locked, true);
});

test('keeps artwork within safe placement ranges when a user drags or resizes it', () => {
  const scene = createScene();
  const next = updateOverlay(scene, { x: -14, y: 151, scale: 1.9, rotation: 40 });
  assert.equal(next.overlay.x, 47.225);
  assert.equal(next.overlay.y, 50.08);
  assert.equal(next.overlay.scale, 1.5);
  assert.equal(next.overlay.rotation, 25);
});

test('allows direct artwork controls to scale, move and rotate beyond the inspector safe-range', () => {
  const scene = createScene();
  const enlarged = resizeOverlay(scene, 9);
  const rotated = rotateOverlay(enlarged, 87);
  const moved = moveOverlay(rotated, { x: -40, y: 180 });

  assert.equal(enlarged.overlay.scale, 3.2);
  assert.equal(rotated.overlay.rotation, 60);
  assert.equal(moved.overlay.scale, 3.2);
  assert.equal(moved.overlay.x, 32.8);
  assert.equal(moved.overlay.y, 72.437);
});

test('persists an enlarged directly-manipulated artwork without shrinking it on restore', () => {
  const direct = rotateOverlay(resizeOverlay(createScene(), 3.2), 60);
  const restored = applyDraft(createScene(), serializeDraft(direct));

  assert.equal(restored.overlay.scale, 3.2);
  assert.equal(restored.overlay.rotation, 60);
});

test('keeps a direct artwork transform when its uploaded asset is attached after restore', () => {
  const direct = rotateOverlay(resizeOverlay(createScene(), 2.7), 47);
  const attached = updateOverlay(direct, { artwork: { name: 'embroidered-logo.png', src: 'blob:artwork' } });

  assert.equal(attached.overlay.scale, 2.7);
  assert.equal(attached.overlay.rotation, 47);
});

test('creates a deterministic render style from the editable overlay only', () => {
  const style = getOverlayStyle({ x: 51.5, y: 42, scale: 1, rotation: -4, opacity: 0.88 });
  assert.deepEqual(style, {
    left: '51.5%',
    top: '42%',
    opacity: '0.88',
    transform: 'translate(-50%, -50%) rotate(-4deg) scale(1)',
  });
});

test('keeps separate artwork placement for front and back views', () => {
  const front = updateOverlay(createScene(), { x: 62 });
  const back = updateOverlay(selectView(front, 'back'), { x: 37, kind: 'embroidery' });
  assert.equal(getActiveOverlay(back).x, 42.1);
  assert.equal(getActiveOverlay(back).kind, 'embroidery');
  assert.equal(back.overlay.x, 57.9);
});

test('clamps background and watermark settings without touching the locked base', () => {
  const scene = setBackground(createScene(), { kind: 'upload', name: 'wall.webp', src: 'blob:wall' });
  const next = setLogo(scene, { x: 140, y: -4, scale: 4, opacity: 0 });
  assert.deepEqual(next.background, { kind: 'upload', name: 'wall.webp', src: 'blob:wall' });
  // Clamping: x/y into 5..95, scale into 0.35..1.75, opacity into 0..1.
  assert.equal(next.logo.x, 95);
  assert.equal(next.logo.y, 5);
  assert.equal(next.logo.scale, 1.75);
  assert.equal(next.logo.opacity, 0);
  assert.equal(next.logo.enabled, true);
  assert.equal(next.logo.name, 'FORM');
  assert.equal(next.logo.src, null);
  assert.equal(next.base.locked, true);
});

test('creates a safe export name from the current garment and selected side', () => {
  const scene = selectView(setBase(createScene(), { name: 'Áo mùa hè 07.PNG', src: 'blob:base' }), 'back');
  assert.equal(getExportFileName(scene), 'o-m-a-h-07-back-render.png');
});

test('switches the composition frame between exact 1:1 and 9:16 export ratios', () => {
  const square = setCanvasRatio(createScene(), 'square');
  const portrait = setCanvasRatio(square, 'portrait');

  assert.deepEqual(getExportDimensions(square), { width: 4096, height: 4096, ratio: 'square' });
  assert.deepEqual(getExportDimensions(portrait), { width: 2304, height: 4096, ratio: 'portrait' });
  assert.equal(portrait.canvasRatio, 'portrait');
  assert.equal(portrait.safeArea.isCalibrated, false);
});

test('persists the chosen composition ratio without changing the locked base source', () => {
  const source = setBase(createScene(), { name: 'phoi-da-tai.png', src: 'blob:base' });
  const restored = applyDraft(source, {
    version: 1,
    canvasRatio: 'square',
    safeArea: source.safeArea,
    background: { value: 'linen' },
    logo: {},
    overlay: {},
    backOverlay: {},
  });

  assert.equal(restored.canvasRatio, 'square');
  assert.equal(restored.base.src, 'blob:base');
  assert.equal(restored.base.locked, true);
});

test('marks the print safe area as requiring calibration when the locked base is replaced', () => {
  const scene = setBase(createScene(), { name: 'my-model.png', src: 'blob:source' });
  assert.equal(scene.safeArea.isCalibrated, false);
  assert.equal(scene.base.locked, true);
});

test('keeps an artwork inside the calibrated garment-safe area', () => {
  const calibrated = setSafeArea(createScene(), { x: 50, y: 48, width: 28, height: 26 });
  const next = updateOverlay(calibrated, { x: 90, y: 80, scale: 1.5 });
  assert.equal(next.overlay.scale, 1.257);
  assert.equal(next.overlay.x, 51.116);
  assert.equal(next.overlay.y, 50.173);
});

test('clamps a calibrated safe-area definition to a usable region', () => {
  const next = setSafeArea(createScene(), { x: 2, y: 112, width: 3, height: 88 });
  assert.deepEqual(next.safeArea, { x: 13, y: 65, width: 18, height: 62, isCalibrated: true });
});

test('serializes only editable control state and never persists local source image URLs', () => {
  let scene = setBase(createScene(), { name: 'base.png', src: 'blob:base' });
  scene = setBackground(scene, { kind: 'upload', name: 'wall.png', src: 'blob:background' });
  scene = setLogo(scene, { src: 'blob:logo', name: 'logo.png', x: 73 });
  scene = updateOverlay(scene, { artwork: { name: 'art.png', label: 'ART', src: 'blob:art' }, rotation: 19 });
  const draft = serializeDraft(scene);
  assert.equal(draft.background.value, 'linen');
  assert.equal(draft.logo.src, undefined);
  assert.equal(draft.overlay.artwork.src, undefined);
  assert.equal(draft.base, undefined);
  assert.equal(draft.overlay.rotation, 19);
});

test('applies a valid draft to controls while preserving whatever locked source is loaded now', () => {
  const source = setBase(createScene(), { name: 'current-source.png', src: 'blob:current' });
  const restored = applyDraft(source, {
    version: 1,
    view: 'back',
    safeArea: { x: 55, y: 46, width: 31, height: 30, isCalibrated: true },
    background: { value: 'studio' },
    logo: { enabled: false, x: 72, y: 88, scale: 1.2, opacity: 0.5 },
    overlay: { kind: 'embroidery', x: 54, y: 45, scale: 1, rotation: 8, opacity: .9 },
    backOverlay: { kind: 'print', x: 51, y: 46, scale: .8, rotation: -3, opacity: .7 },
  });
  assert.equal(restored.base.src, 'blob:current');
  assert.equal(restored.base.locked, true);
  assert.equal(restored.view, 'back');
  assert.equal(restored.background.value, 'studio');
  assert.equal(restored.overlay.kind, 'embroidery');
  assert.equal(restored.logo.enabled, false);
});

test('ignores a malformed draft instead of altering the current scene', () => {
  const scene = createScene();
  assert.equal(applyDraft(scene, { version: 9 }), scene);
});
