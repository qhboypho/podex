import test from 'node:test';
import assert from 'node:assert/strict';

import '../app-core.js';

const {
  MAX_IMAGE_BYTES,
  MIN_TEXT_FONT_SIZE,
  MAX_TEXT_FONT_SIZE,
  createScene,
  applyDraft,
  getExportDimensions,
  getBaseDisplayBox,
  getActiveOverlay,
  getExportFileName,
  getOverlayStyle,
  getTextItems,
  getIconItems,
  findDecorItem,
  addTextItem,
  addIconItem,
  updateTextItem,
  updateIconItem,
  removeTextItem,
  removeIconItem,
  selectDecor,
  toggleDecorLock,
  toggleDecorHidden,
  groupDecorItems,
  ungroupDecorItems,
  duplicateDecorItem,
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

// ─── Text & icon decorations ────────────────────────────────────────────────

test('adds a text item on the current side and selects it', () => {
  let scene = addTextItem(createScene());
  assert.equal(getTextItems(scene).length, 1);
  const item = getTextItems(scene)[0];
  assert.equal(item.type, 'text');
  assert.equal(item.side, 'front');
  assert.deepEqual(scene.activeDecor, { type: 'text', id: item.id });
});

test('routes added text items to the back-side list while viewing the back', () => {
  let scene = selectView(createScene(), 'back');
  scene = addTextItem(scene);
  assert.equal(scene.textItems.length, 0);
  assert.equal(scene.backTextItems.length, 1);
  assert.equal(getTextItems(scene)[0].side, 'back');
});

test('clamps text content length, font size and position into safe bounds', () => {
  let scene = addTextItem(createScene());
  scene = updateTextItem(scene, {
    x: -40,
    y: 250,
    fontSize: 9999,
    rotation: -500,
    opacity: 12,
    content: 'x'.repeat(500),
    font: 'Not-A-Font',
    style: 'rainbow',
    color: 'javascript:void(0)',
  }, scene.activeDecor.id);
  const item = getTextItems(scene)[0];
  assert.equal(item.x > 0 && item.x < 10, true);
  assert.equal(item.y <= 97, true);
  assert.equal(item.fontSize, MAX_TEXT_FONT_SIZE);
  assert.equal(item.rotation, -90);
  assert.equal(item.opacity, 1);
  assert.equal(item.content.length, 120);
  assert.equal(item.font, 'Arial');
  assert.equal(item.style, 'bold');
  assert.equal(item.color, '#17211e');
});

test('updates only the targeted text item and keeps other layers intact', () => {
  let scene = addTextItem(createScene());
  scene = addTextItem(scene);
  const [first, second] = getTextItems(scene);
  scene = updateTextItem(scene, { x: 20, y: 30, fontSize: MIN_TEXT_FONT_SIZE }, second.id);
  const kept = findDecorItem(scene, 'text', first.id);
  const moved = findDecorItem(scene, 'text', second.id);
  assert.equal(kept.x, first.x);
  assert.equal(moved.x, 20);
  assert.equal(moved.fontSize, MIN_TEXT_FONT_SIZE);
});

test('adds icons with a registry id and clamps their size like text', () => {
  let scene = addIconItem(createScene(), { iconId: 'star', size: 4000 });
  const item = getIconItems(scene)[0];
  assert.equal(item.type, 'icon');
  assert.equal(item.iconId, 'star');
  assert.equal(item.size >= 200, true);
  scene = updateIconItem(scene, { iconId: 'flame', color: '#c54a2e' }, item.id);
  assert.equal(findDecorItem(scene, 'icon', item.id).iconId, 'flame');
  assert.equal(findDecorItem(scene, 'icon', item.id).color, '#c54a2e');
});

test('removing the active decoration clears the selection', () => {
  let scene = addTextItem(createScene());
  const id = scene.activeDecor.id;
  scene = removeTextItem(scene, id);
  assert.equal(getTextItems(scene).length, 0);
  assert.equal(scene.activeDecor, null);
});

test('duplicates a text layer with a new id, a small offset and selects the copy', () => {
  let scene = addTextItem(createScene(), { content: 'CLUB', x: 40, y: 30 });
  const sourceId = scene.activeDecor.id;
  scene = duplicateDecorItem(scene, 'text', sourceId);
  assert.equal(getTextItems(scene).length, 2);
  const source = findDecorItem(scene, 'text', sourceId);
  const copy = getTextItems(scene)[1];
  assert.notEqual(copy.id, sourceId);
  assert.equal(copy.content, 'CLUB');
  assert.equal(copy.x, source.x + 3);
  assert.equal(copy.y, source.y + 3);
  assert.deepEqual(scene.activeDecor, { type: 'text', id: copy.id });
});

test('duplicates icon layers and ignores unknown decoration ids', () => {
  let scene = addIconItem(createScene(), { iconId: 'bolt' });
  const source = getIconItems(scene)[0];
  const untouched = duplicateDecorItem(scene, 'icon', 99999);
  assert.equal(untouched, scene);
  scene = duplicateDecorItem(scene, 'icon', source.id);
  assert.equal(getIconItems(scene).length, 2);
  const copy = getIconItems(scene)[1];
  assert.equal(copy.iconId, 'bolt');
  assert.equal(copy.type, 'icon');
  assert.deepEqual(scene.activeDecor, { type: 'icon', id: copy.id });
});

test('toggles the hidden flag of a decoration and persists it in drafts', () => {
  let scene = addTextItem(createScene());
  const id = scene.activeDecor.id;
  assert.equal(getTextItems(scene)[0].hidden, false);
  scene = toggleDecorHidden(scene, 'text', id);
  assert.equal(getTextItems(scene)[0].hidden, true);
  scene = toggleDecorHidden(scene, 'text', id);
  assert.equal(getTextItems(scene)[0].hidden, false);
  scene = toggleDecorHidden(scene, 'icon', id);
  assert.equal(getTextItems(scene)[0].hidden, false, 'unknown type is a no-op');
  scene = toggleDecorHidden(scene, 'text', id);
  const restored = applyDraft(createScene(), serializeDraft(scene));
  assert.equal(restored.textItems[0].hidden, true);
});

test('Ctrl+G grouping assigns one groupId and persists across drafts', () => {
  let scene = createScene();
  scene = addTextItem(scene);
  scene = addIconItem(scene);
  const selections = [
    { type: 'text', id: getTextItems(scene)[0].id },
    { type: 'icon', id: getIconItems(scene)[0].id },
  ];
  const untouched = groupDecorItems(scene, selections.slice(0, 1));
  assert.equal(untouched, scene, 'nhóm cần tối thiểu 2 lớp');
  scene = groupDecorItems(scene, selections);
  const groupId = getTextItems(scene)[0].groupId;
  assert.equal(groupId, getIconItems(scene)[0].groupId);
  const restored = applyDraft(createScene(), serializeDraft(scene));
  assert.equal(restored.textItems[0].groupId, groupId);
  assert.equal(restored.iconItems[0].groupId, groupId);
});

test('ungroup clears groupId only for the selected members', () => {
  let scene = createScene();
  scene = addTextItem(scene);
  scene = addTextItem(scene);
  const [first, second] = getTextItems(scene);
  scene = groupDecorItems(scene, [
    { type: 'text', id: first.id },
    { type: 'text', id: second.id },
  ]);
  scene = ungroupDecorItems(scene, [{ type: 'text', id: first.id }]);
  assert.equal(findDecorItem(scene, 'text', first.id).groupId, null);
  assert.equal(findDecorItem(scene, 'text', second.id).groupId, null, 'nhóm còn 1 thành viên tự giải tán');
});

test('removing a group member dissolves a two-member group', () => {
  let scene = createScene();
  scene = addTextItem(scene);
  scene = addTextItem(scene);
  const [first, second] = getTextItems(scene);
  scene = groupDecorItems(scene, [
    { type: 'text', id: first.id },
    { type: 'text', id: second.id },
  ]);
  scene = removeTextItem(scene, first.id);
  assert.equal(findDecorItem(scene, 'text', second.id).groupId, null);
});

test('decorations follow the base transform like artwork overlays do', () => {
  let scene = addTextItem(createScene());
  scene = addIconItem(scene);
  const beforeText = getTextItems(scene)[0];
  const beforeIcon = getIconItems(scene)[0];
  scene = setBaseTransform(scene, { x: 60, y: 60 });
  const afterText = getTextItems(scene)[0];
  const afterIcon = getIconItems(scene)[0];
  assert.equal(afterText.x, Math.round(beforeText.x + 10));
  assert.equal(Math.abs(afterIcon.y - (beforeIcon.y + 10)) < 3, true);
});

test('serializes decorations without leaking anything beyond editable state', () => {
  let scene = addTextItem(createScene(), { content: 'FORM CLUB' });
  scene = addIconItem(scene, { iconId: 'bolt' });
  const draft = serializeDraft(scene);
  assert.equal(draft.version, 3);
  assert.equal(draft.textItems[0].content, 'FORM CLUB');
  assert.equal(draft.iconItems[0].iconId, 'bolt');
  assert.equal(draft.textItems[0].src, undefined);
  assert.equal(draft.iconItems[0].src, undefined);
});

test('round-trips a v3 draft including text and icon decorations', () => {
  let scene = createScene();
  scene = addTextItem(scene, { content: 'SUNDAY', fontSize: 44 });
  scene = addIconItem(scene, { iconId: 'gem' });
  const restored = applyDraft(createScene(), serializeDraft(scene));
  assert.equal(restored.textItems.length, 1);
  assert.equal(restored.iconItems.length, 1);
  assert.equal(restored.textItems[0].content, 'SUNDAY');
  assert.equal(restored.textItems[0].fontSize, 44);
  assert.equal(restored.iconItems[0].iconId, 'gem');
  assert.deepEqual(restored.activeDecor, { type: 'icon', id: restored.iconItems[0].id });
});

test('still accepts v2 drafts when decorations are absent', () => {
  const source = setBase(createScene(), { name: 'phoi.png', src: 'blob:base' });
  const restored = applyDraft(source, {
    version: 2,
    canvasRatio: 'square',
    safeArea: source.safeArea,
    background: { value: 'linen' },
    logo: {},
    overlays: [],
    backOverlays: [],
    activeOverlayId: null,
  });
  assert.equal(restored.canvasRatio, 'square');
  assert.equal(restored.textItems.length, 0);
  assert.equal(restored.iconItems.length, 0);
});
