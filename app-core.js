(() => {
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

const DEFAULT_BASE_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 730" fill="none">
  <defs>
    <linearGradient id="skin" x1="142" x2="361" y1="172" y2="455" gradientUnits="userSpaceOnUse"><stop stop-color="#704938"/><stop offset=".48" stop-color="#C28A68"/><stop offset="1" stop-color="#885B46"/></linearGradient>
    <linearGradient id="tee" x1="129" x2="438" y1="200" y2="547" gradientUnits="userSpaceOnUse"><stop stop-color="#FAF9F3"/><stop offset=".47" stop-color="#F1F0E9"/><stop offset="1" stop-color="#DCDDD5"/></linearGradient>
    <linearGradient id="denim" x1="226" x2="353" y1="539" y2="727" gradientUnits="userSpaceOnUse"><stop stop-color="#294552"/><stop offset=".55" stop-color="#65828A"/><stop offset="1" stop-color="#294552"/></linearGradient>
    <pattern id="folds" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)"><path d="M8 0v44" stroke="#9EA098" stroke-opacity=".17" stroke-width="2"/></pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="15" stdDeviation="12" flood-color="#26342D" flood-opacity=".22"/></filter>
  </defs>
  <ellipse cx="280" cy="692" rx="133" ry="25" fill="#26342D" fill-opacity=".24"/>
  <g filter="url(#shadow)">
    <path d="M106 269c-27 12-43 47-40 96l12 128c2 30 16 48 43 48 26 0 37-17 40-43l8-105-19-100-44-24Z" fill="url(#skin)"/>
    <path d="M454 269c27 12 43 47 40 96l-12 128c-2 30-16 48-43 48-26 0-37-17-40-43l-8-105 19-100 44-24Z" fill="url(#skin)"/>
    <path d="M250 138h60v82h-60z" fill="#A77056"/>
    <path d="M218 39c0-37 28-63 62-63 33 0 61 26 61 63v87c0 40-28 65-61 65-35 0-62-25-62-65V39Z" fill="url(#skin)"/>
    <path d="M211 102c-2-68 10-112 69-112 58 0 75 42 67 111-5 25-20 40-38 47V77c-14 13-56 24-91 25v0Z" fill="#251C1A"/>
    <path d="M189 210l56-18 35 23 35-23 56 18 68 44-44 130-20 178H185l-20-178-44-130 68-44Z" fill="url(#tee)"/>
    <path d="M189 210l56-18 35 23 35-23 56 18 68 44-44 130-20 178H185l-20-178-44-130 68-44Z" fill="url(#folds)"/>
    <path d="M245 192c7 31 23 41 35 41s28-10 35-41l-35 23-35-23Z" fill="#E0E0D9"/>
    <path d="M207 555h146l-6 175h-56l-11-102-11 102h-56l-6-175Z" fill="url(#denim)"/>
    <path d="M280 557v72M217 582h126" stroke="#92A8A7" stroke-opacity=".48" stroke-width="2"/>
  </g>
</svg>`)}`;

const DEFAULT_ARTWORK = {
  label: 'ROUGE / 07',
  name: 'Rouge 07 · mặc định',
  src: null,
};

const DEFAULT_SAFE_AREA = Object.freeze({
  x: 50,
  y: 47,
  width: 36.3,
  height: 32,
  isCalibrated: true,
});

const EXPORT_DIMENSIONS = Object.freeze({
  square: Object.freeze({ width: 4096, height: 4096, ratio: 'square' }),
  portrait: Object.freeze({ width: 2304, height: 4096, ratio: 'portrait' }),
});

// Kích thước xuất cơ sở (1x). Cạnh dài = 1200 → square 1200×1200, portrait 675×1200.
const EXPORT_BASE_DIMENSIONS = Object.freeze({
  square: Object.freeze({ width: 1200, height: 1200, ratio: 'square' }),
  portrait: Object.freeze({ width: 675, height: 1200, ratio: 'portrait' }),
});

const EXPORT_SCALES = Object.freeze([1, 2, 4]);

function normalizeCanvasRatio(value) {
  return value === 'square' ? 'square' : 'portrait';
}

const ARTWORK_BASE_WIDTH = 20.5;
const ARTWORK_BASE_HEIGHT = ARTWORK_BASE_WIDTH / 1.19;
const MIN_DIRECT_ARTWORK_SCALE = .35;
const MAX_DIRECT_ARTWORK_SCALE = 3.2;
const MAX_DIRECT_ARTWORK_ROTATION = 60;
const SAFE_AREA_MARGIN = 4;
const DEFAULT_BASE_DIMENSIONS = Object.freeze({ width: 560, height: 730 });
const MIN_BASE_SCALE = .6;
const MAX_BASE_SCALE = 1.6;
const MIN_WORKSPACE_ZOOM = .55;
const MAX_WORKSPACE_ZOOM = 1.8;
const MAX_WORKSPACE_PAN = 640;

// ─── Text & Icon decorations ──────────────────────────────────────────────
const TEXT_FONTS = Object.freeze(['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana',
  'Trebuchet MS', 'Impact', 'Palatino Linotype']);
const TEXT_STYLES = Object.freeze(['normal', 'bold', 'italic', 'bold italic']);
const MIN_TEXT_FONT_SIZE = 8;
const MAX_TEXT_FONT_SIZE = 160;
const MIN_ICON_SIZE = 10;
const MAX_ICON_SIZE = 220;
const MAX_DECOR_ROTATION = 90;
const MAX_DECOR_TEXT_LENGTH = 120;
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function normalizeHexColor(value, fallback) {
  return typeof value === 'string' && HEX_COLOR_RE.test(value) ? value : fallback;
}

const round = (value, precision = 3) => Number(Number(value).toFixed(precision));

function normalizeWorkspaceView(view = {}) {
  return {
    zoom: round(clamp(number(view.zoom, 1), MIN_WORKSPACE_ZOOM, MAX_WORKSPACE_ZOOM), 3),
    panX: round(clamp(number(view.panX, 0), -MAX_WORKSPACE_PAN, MAX_WORKSPACE_PAN), 1),
    panY: round(clamp(number(view.panY, 0), -MAX_WORKSPACE_PAN, MAX_WORKSPACE_PAN), 1),
  };
}

function normalizeSafeArea(area, fallback = DEFAULT_SAFE_AREA) {
  const width = clamp(number(area?.width, fallback.width), 18, 62);
  const height = clamp(number(area?.height, fallback.height), 18, 62);
  return {
    x: round(clamp(number(area?.x, fallback.x), width / 2 + SAFE_AREA_MARGIN, 100 - width / 2 - SAFE_AREA_MARGIN)),
    y: round(clamp(number(area?.y, fallback.y), height / 2 + SAFE_AREA_MARGIN, 100 - height / 2 - SAFE_AREA_MARGIN)),
    width: round(width),
    height: round(height),
    isCalibrated: area?.isCalibrated !== false,
  };
}

function constrainOverlayToSafeArea(overlay, safeArea) {
  const area = normalizeSafeArea(safeArea);
  const requestedScale = clamp(number(overlay.scale, 1), 0.45, 1.5);
  const maxScale = Math.min(
    1.5,
    (area.width * .92) / ARTWORK_BASE_WIDTH,
    (area.height * .92) / ARTWORK_BASE_HEIGHT,
  );
  const scale = round(Math.max(.45, Math.min(requestedScale, maxScale)), 3);
  const halfWidth = (ARTWORK_BASE_WIDTH * scale) / 2;
  const halfHeight = (ARTWORK_BASE_HEIGHT * scale) / 2;
  return {
    ...overlay,
    x: round(clamp(number(overlay.x, area.x), area.x - area.width / 2 + halfWidth, area.x + area.width / 2 - halfWidth)),
    y: round(clamp(number(overlay.y, area.y), area.y - area.height / 2 + halfHeight, area.y + area.height / 2 - halfHeight)),
    scale,
  };
}

let _overlayIdCounter = 0;

const createOverlay = (side) => ({
  id: ++_overlayIdCounter,
  side,
  kind: 'print',
  x: 51.5,
  y: side === 'front' ? 42 : 46,
  scale: 1,
  rotation: -4,
  opacity: 0.88,
  locked: false,
  artwork: { ...DEFAULT_ARTWORK },
});

// Text & icon dùng chung một dãy id để selection (type, id) luôn duy nhất.
let _decorIdCounter = 0;

function constrainTextItem(item) {
  return {
    ...item,
    x: round(clamp(number(item.x, 50), 3, 97)),
    y: round(clamp(number(item.y, 42), 3, 97)),
    fontSize: clamp(Math.round(number(item.fontSize, 28)), MIN_TEXT_FONT_SIZE, MAX_TEXT_FONT_SIZE),
    rotation: clamp(round(number(item.rotation, 0)), -MAX_DECOR_ROTATION, MAX_DECOR_ROTATION),
    opacity: clamp(number(item.opacity, 1), 0.05, 1),
    locked: Boolean(item.locked),
    content: String(item.content ?? '').slice(0, MAX_DECOR_TEXT_LENGTH),
    font: TEXT_FONTS.includes(item.font) ? item.font : 'Arial',
    style: TEXT_STYLES.includes(item.style) ? item.style : 'bold',
    color: normalizeHexColor(item.color, '#17211e'),
  };
}

function constrainIconItem(item) {
  return {
    ...item,
    x: round(clamp(number(item.x, 50), 3, 97)),
    y: round(clamp(number(item.y, 42), 3, 97)),
    size: clamp(Math.round(number(item.size, 40)), MIN_ICON_SIZE, MAX_ICON_SIZE),
    rotation: clamp(round(number(item.rotation, 0)), -MAX_DECOR_ROTATION, MAX_DECOR_ROTATION),
    opacity: clamp(number(item.opacity, 1), 0.05, 1),
    locked: Boolean(item.locked),
    iconId: String(item.iconId || ''),
    color: normalizeHexColor(item.color, '#17211e'),
  };
}

const createTextItem = (side, patch = {}) => constrainTextItem({
  id: ++_decorIdCounter,
  type: 'text',
  side,
  x: 50,
  y: 42,
  content: 'NEW TEXT',
  font: 'Arial',
  style: 'bold',
  fontSize: 28,
  color: '#17211e',
  rotation: 0,
  opacity: 1,
  locked: false,
  ...patch,
});

const createIconItem = (side, patch = {}) => constrainIconItem({
  id: ++_decorIdCounter,
  type: 'icon',
  side,
  x: 50,
  y: 55,
  size: 40,
  iconId: '',
  color: '#17211e',
  rotation: 0,
  opacity: 1,
  locked: false,
  ...patch,
});

function createScene() {
  const frontOverlay = createOverlay('front');
  const backOverlay = createOverlay('back');
  return withLegacy({
    view: 'front',
    canvasRatio: 'portrait',
    baseTransform: { scale: 1, x: 50, y: 50 },
    base: {
      kind: 'default',
      name: 'Phôi trơn · mẫu mặc định',
      src: DEFAULT_BASE_SRC,
      locked: true,
      metadata: null,
    },
    background: { kind: 'preset', value: 'linen', name: 'Linen daylight', src: null },
    safeArea: { ...DEFAULT_SAFE_AREA },
    logo: {
      enabled: true, x: 88, y: 93, scale: 1, opacity: 0.72, name: 'FORM', src: null,
      // Watermark grid
      mode: 'single',          // 'single' | 'grid'
      wmType: 'logo',          // 'logo' | 'text' | 'both'
      gridType: 'diagonal',    // 'diagonal'|'straight'|'brick'|'radial'|'scatter'|'cross'
      gridCols: 4, gridRows: 4,
      rotation: -35,
      spacingH: 0, spacingV: 0,
      // Text watermark
      textContent: '© FORM', textFont: 'Arial', textStyle: 'normal', textSize: 32, textColor: '#ffffff',
      // Logo absolute size (px, reference model) + text shadow
      logoSizePx: 80, shadowBlur: 0, shadowColor: '#000000',
      // Grid lines
      showGridLines: false, gridLineWidth: 1, gridLineOpacity: 0.2, gridLineColor: '#ffffff', gridLineStyle: 'solid',
      // Appearance
      blendMode: 'source-over',
    },
    overlays: [frontOverlay],
    backOverlays: [backOverlay],
    activeOverlayId: frontOverlay.id,
    textItems: [],
    backTextItems: [],
    iconItems: [],
    backIconItems: [],
    activeDecor: null,
  });
}

// Sync legacy .overlay / .backOverlay from arrays for backward compat
function withLegacy(scene) {
  scene.overlay = scene.overlays[0] || null;
  scene.backOverlay = scene.backOverlays[0] || null;
  return scene;
}

function validateImageFile(file) {
  if (!file || typeof file !== 'object') {
    return { ok: false, error: 'Chọn một tệp ảnh trước khi tải lên.' };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, error: 'Chỉ hỗ trợ ảnh PNG, JPG hoặc WEBP.' };
  }
  if (number(file.size, 0) > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'Ảnh vượt giới hạn 12 MB cho phiên bản chạy trong trình duyệt.' };
  }
  return { ok: true };
}

function isEditableLayer(layer) {
  return layer !== 'base';
}

function setBase(scene, { name, src, metadata = null }) {
  return {
    ...scene,
    base: {
      kind: 'upload',
      name: name || 'Phôi đã tải lên',
      src,
      locked: true,
      metadata,
    },
    baseTransform: { scale: 1, x: 50, y: 50 },
    safeArea: { ...normalizeSafeArea(scene.safeArea), isCalibrated: false },
  };
}

function resetBase(scene) {
  return {
    ...scene,
    base: {
      kind: 'default',
      name: 'Phôi trơn · mẫu mặc định',
      src: DEFAULT_BASE_SRC,
      locked: true,
      metadata: null,
    },
    baseTransform: { scale: 1, x: 50, y: 50 },
    safeArea: { ...DEFAULT_SAFE_AREA },
  };
}

function setBackground(scene, background) {
  const next = { ...scene.background, ...background };
  if (next.kind === 'upload') {
    delete next.value;
  } else {
    next.src = null;
  }
  return { ...scene, background: next };
}

function setCanvasRatio(scene, canvasRatio) {
  const nextRatio = normalizeCanvasRatio(canvasRatio);
  if (nextRatio === normalizeCanvasRatio(scene.canvasRatio)) return scene;
  return {
    ...scene,
    canvasRatio: nextRatio,
    safeArea: { ...normalizeSafeArea(scene.safeArea), isCalibrated: false },
  };
}

function setBaseTransform(scene, transform = {}, { moveAttached = true } = {}) {
  const current = scene.baseTransform || { scale: 1, x: 50, y: 50 };
  const baseTransform = {
    scale: round(clamp(number(transform.scale, current.scale), MIN_BASE_SCALE, MAX_BASE_SCALE), 3),
    x: round(clamp(number(transform.x, current.x), 0, 100), 3),
    y: round(clamp(number(transform.y, current.y), 0, 100), 3),
  };
  const deltaX = baseTransform.x - current.x;
  const deltaY = baseTransform.y - current.y;
  if (!moveAttached || (!deltaX && !deltaY)) return { ...scene, baseTransform };

  const safeArea = normalizeSafeArea({
    ...scene.safeArea,
    x: scene.safeArea.x + deltaX,
    y: scene.safeArea.y + deltaY,
  }, scene.safeArea);
  const moveOverlayItem = (overlay) => constrainOverlayToCanvas({
    ...overlay,
    x: overlay.x + deltaX,
    y: overlay.y + deltaY,
  });
  return withLegacy({
    ...scene,
    baseTransform,
    safeArea,
    overlays: scene.overlays.map(moveOverlayItem),
    backOverlays: scene.backOverlays.map(moveOverlayItem),
    textItems: moveAllDecorItems(scene.textItems || [], deltaX, deltaY, constrainTextItem),
    backTextItems: moveAllDecorItems(scene.backTextItems || [], deltaX, deltaY, constrainTextItem),
    iconItems: moveAllDecorItems(scene.iconItems || [], deltaX, deltaY, constrainIconItem),
    backIconItems: moveAllDecorItems(scene.backIconItems || [], deltaX, deltaY, constrainIconItem),
  });
}

function getBaseDisplayBox(scene) {
  const dimensions = scene?.base?.metadata || DEFAULT_BASE_DIMENSIONS;
  const sourceWidth = Math.max(1, number(dimensions.width, DEFAULT_BASE_DIMENSIONS.width));
  const sourceHeight = Math.max(1, number(dimensions.height, DEFAULT_BASE_DIMENSIONS.height));
  const sourceRatio = sourceWidth / sourceHeight;
  const canvas = getExportDimensions(scene);
  const canvasRatio = canvas.width / canvas.height;
  const scale = clamp(number(scene?.baseTransform?.scale, 1), MIN_BASE_SCALE, MAX_BASE_SCALE);
  const width = sourceRatio > canvasRatio ? 100 : (sourceRatio / canvasRatio) * 100;
  const height = sourceRatio > canvasRatio ? (canvasRatio / sourceRatio) * 100 : 100;
  return {
    x: round(clamp(number(scene?.baseTransform?.x, 50), 0, 100), 3),
    y: round(clamp(number(scene?.baseTransform?.y, 50), 0, 100), 3),
    width: round(width * scale, 2),
    height: round(height * scale, 2),
    scale: round(scale, 3),
  };
}

function setLogo(scene, logo) {
  return {
    ...scene,
    logo: {
      ...scene.logo,
      ...logo,
      x: clamp(number(logo.x, scene.logo.x), 5, 95),
      y: clamp(number(logo.y, scene.logo.y), 5, 95),
      scale: clamp(number(logo.scale, scene.logo.scale), 0.35, 1.75),
      opacity: clamp(number(logo.opacity, scene.logo.opacity), 0, 1),
      gridCols: clamp(number(logo.gridCols, scene.logo.gridCols), 1, 20),
      gridRows: clamp(number(logo.gridRows, scene.logo.gridRows), 1, 20),
      rotation: clamp(number(logo.rotation, scene.logo.rotation), -90, 90),
      spacingH: clamp(number(logo.spacingH, scene.logo.spacingH), -100, 300),
      spacingV: clamp(number(logo.spacingV, scene.logo.spacingV), -100, 300),
      textSize: clamp(number(logo.textSize, scene.logo.textSize), 8, 120),
      logoSizePx: clamp(number(logo.logoSizePx, scene.logo.logoSizePx), 10, 400),
      shadowBlur: clamp(number(logo.shadowBlur, scene.logo.shadowBlur), 0, 20),
      gridLineWidth: clamp(number(logo.gridLineWidth, scene.logo.gridLineWidth), 0.5, 10),
      gridLineOpacity: clamp(number(logo.gridLineOpacity, scene.logo.gridLineOpacity), 0, 1),
    },
  };
}

function selectView(scene, view) {
  return withLegacy({ ...scene, view: view === 'back' ? 'back' : 'front' });
}

function setSafeArea(scene, area) {
  const safeArea = normalizeSafeArea({ ...area, isCalibrated: true }, scene.safeArea);
  return withLegacy({
    ...scene,
    safeArea,
  });
}

function getOverlays(scene) {
  return scene.view === 'back' ? scene.backOverlays : scene.overlays;
}

function getOverlayById(scene, id) {
  return scene.overlays.find(o => o.id === id)
    || scene.backOverlays.find(o => o.id === id)
    || null;
}

function getActiveOverlay(scene) {
  const list = getOverlays(scene);
  if (scene.activeOverlayId != null) {
    const found = list.find(o => o.id === scene.activeOverlayId);
    if (found) return found;
  }
  return list[list.length - 1] || null;
}

function updateOverlay(scene, patch, targetId) {
  const listKey = scene.view === 'back' ? 'backOverlays' : 'overlays';
  const list = scene[listKey];
  const id = targetId != null ? targetId : scene.activeOverlayId;
  let idx = id != null ? list.findIndex(o => o.id === id) : -1;
  if (idx < 0) idx = list.length - 1;
  if (idx < 0) return scene;
  const overlay = list[idx];
  const requested = {
    ...overlay,
    ...patch,
    opacity: clamp(number(patch.opacity, overlay.opacity), 0.15, 1),
  };
  const next = constrainOverlayToCanvas(requested);
  const newList = [...list];
  newList[idx] = next;
  return withLegacy({ ...scene, [listKey]: newList });
}

function constrainOverlayToCanvas(overlay) {
  const scale = round(clamp(number(overlay.scale, 1), MIN_DIRECT_ARTWORK_SCALE, MAX_DIRECT_ARTWORK_SCALE), 3);
  const halfWidth = (ARTWORK_BASE_WIDTH * scale) / 2;
  const halfHeight = (ARTWORK_BASE_HEIGHT * scale) / 2;
  return {
    ...overlay,
    scale,
    x: round(clamp(number(overlay.x, 50), halfWidth, 100 - halfWidth)),
    y: round(clamp(number(overlay.y, 50), halfHeight, 100 - halfHeight)),
    rotation: round(clamp(number(overlay.rotation, 0), -MAX_DIRECT_ARTWORK_ROTATION, MAX_DIRECT_ARTWORK_ROTATION)),
  };
}

function updateDirectOverlay(scene, patch, targetId) {
  const listKey = scene.view === 'back' ? 'backOverlays' : 'overlays';
  const list = scene[listKey];
  const id = targetId != null ? targetId : scene.activeOverlayId;
  let idx = id != null ? list.findIndex(o => o.id === id) : -1;
  if (idx < 0) idx = list.length - 1;
  if (idx < 0) return scene;
  const newList = [...list];
  newList[idx] = constrainOverlayToCanvas({ ...list[idx], ...patch });
  return withLegacy({ ...scene, [listKey]: newList });
}

function resizeOverlay(scene, scale, targetId) {
  return updateDirectOverlay(scene, { scale }, targetId);
}

function moveOverlay(scene, position, targetId) {
  const active = targetId != null ? getOverlayById(scene, targetId) : getActiveOverlay(scene);
  return updateDirectOverlay(scene, {
    x: number(position?.x, active ? active.x : 50),
    y: number(position?.y, active ? active.y : 50),
  }, targetId);
}

function rotateOverlay(scene, rotation, targetId) {
  return updateDirectOverlay(scene, { rotation }, targetId);
}

function plainOverlay(overlay) {
  return {
    id: overlay.id,
    kind: overlay.kind,
    x: overlay.x,
    y: overlay.y,
    scale: overlay.scale,
    rotation: overlay.rotation,
    opacity: overlay.opacity,
    locked: overlay.locked || false,
    artwork: overlay.artwork ? { name: overlay.artwork.name, label: overlay.artwork.label } : undefined,
  };
}

function plainDecorItem(item) {
  return {
    id: item.id,
    type: item.type,
    side: item.side,
    x: item.x,
    y: item.y,
    rotation: item.rotation,
    opacity: item.opacity,
    locked: item.locked || false,
    ...(item.type === 'text'
      ? { content: item.content, font: item.font, style: item.style, fontSize: item.fontSize, color: item.color }
      : { iconId: item.iconId, size: item.size, color: item.color }),
  };
}

function serializeDraft(scene) {
  return {
    version: 3,
    view: scene.view,
    canvasRatio: normalizeCanvasRatio(scene.canvasRatio),
    baseTransform: {
      scale: clamp(number(scene.baseTransform?.scale, 1), MIN_BASE_SCALE, MAX_BASE_SCALE),
      x: clamp(number(scene.baseTransform?.x, 50), 0, 100),
      y: clamp(number(scene.baseTransform?.y, 50), 0, 100),
    },
    safeArea: { ...normalizeSafeArea(scene.safeArea) },
    background: {
      kind: scene.background.kind,
      value: scene.background.kind === 'preset' ? scene.background.value : 'linen',
    },
    logo: {
      enabled: scene.logo.enabled,
      x: scene.logo.x,
      y: scene.logo.y,
      scale: scene.logo.scale,
      opacity: scene.logo.opacity,
      mode: scene.logo.mode,
      wmType: scene.logo.wmType,
      gridType: scene.logo.gridType,
      gridCols: scene.logo.gridCols,
      gridRows: scene.logo.gridRows,
      rotation: scene.logo.rotation,
      spacingH: scene.logo.spacingH,
      spacingV: scene.logo.spacingV,
      textContent: scene.logo.textContent,
      textFont: scene.logo.textFont,
      textStyle: scene.logo.textStyle,
      textSize: scene.logo.textSize,
      textColor: scene.logo.textColor,
      logoSizePx: scene.logo.logoSizePx,
      shadowBlur: scene.logo.shadowBlur,
      shadowColor: scene.logo.shadowColor,
      showGridLines: scene.logo.showGridLines,
      gridLineWidth: scene.logo.gridLineWidth,
      gridLineOpacity: scene.logo.gridLineOpacity,
      gridLineColor: scene.logo.gridLineColor,
      gridLineStyle: scene.logo.gridLineStyle,
      blendMode: scene.logo.blendMode,
    },
    activeOverlayId: scene.activeOverlayId,
    overlays: scene.overlays.map(plainOverlay),
    backOverlays: scene.backOverlays.map(plainOverlay),
    textItems: (scene.textItems || []).map(plainDecorItem),
    backTextItems: (scene.backTextItems || []).map(plainDecorItem),
    iconItems: (scene.iconItems || []).map(plainDecorItem),
    backIconItems: (scene.backIconItems || []).map(plainDecorItem),
    activeDecor: scene.activeDecor || null,
    // Legacy fields for backward compat reads
    overlay: plainOverlay(scene.overlays[0] || createOverlay('front')),
    backOverlay: plainOverlay(scene.backOverlays[0] || createOverlay('back')),
  };
}

function applyOverlayDraft(scene, listKey, idx, draftOverlay) {
  if (!draftOverlay || typeof draftOverlay !== 'object') return scene;
  const list = scene[listKey];
  if (idx < 0 || idx >= list.length) return scene;
  const draftView = listKey === 'backOverlays' ? 'back' : 'front';
  const withView = selectView(scene, draftView);
  const { artwork, ...overlayPatch } = draftOverlay;
  const activeId = list[idx].id;
  let next = updateOverlay(withView, {
    ...overlayPatch,
    artwork: artwork ? { ...list[idx].artwork, ...artwork } : list[idx].artwork,
  }, activeId);
  const hasDirectTransform = Number(draftOverlay.scale) > 1.5 || Math.abs(Number(draftOverlay.rotation)) > 25;
  if (hasDirectTransform) {
    const updatedList = next[listKey];
    const updatedOverlay = updatedList.find(o => o.id === activeId) || updatedList[idx];
    next = updateDirectOverlay(next, {
      x: number(draftOverlay.x, updatedOverlay.x),
      y: number(draftOverlay.y, updatedOverlay.y),
      scale: number(draftOverlay.scale, updatedOverlay.scale),
      rotation: number(draftOverlay.rotation, updatedOverlay.rotation),
    }, activeId);
  }
  return withLegacy({ ...next, view: scene.view });
}

function applyDraft(scene, draft) {
  if (!draft || (draft.version !== 1 && draft.version !== 2 && draft.version !== 3) || typeof draft !== 'object') return scene;
  const safeArea = normalizeSafeArea(draft.safeArea, scene.safeArea);
  let next = {
    ...scene,
    view: draft.view === 'back' ? 'back' : 'front',
    canvasRatio: normalizeCanvasRatio(draft.canvasRatio),
    background: draft.background?.kind === 'upload' && scene.background.kind === 'upload'
      ? scene.background
      : {
        kind: 'preset',
        value: ['linen', 'coast', 'studio', 'snow', 'pearl', 'blush', 'sage', 'slate'].includes(draft.background?.value) ? draft.background.value : 'linen',
        name: scene.background.name,
        src: null,
      },
    safeArea,
  };
  next = setLogo(next, draft.logo || {});
  next = setBaseTransform(next, draft.baseTransform, { moveAttached: false });

  if (draft.version === 2 && Array.isArray(draft.overlays)) {
    // v2: restore arrays of overlays
    // Rebuild overlays from draft, keeping ids
    const restoreList = (draftList, side) => draftList.map(d => {
      const base = createOverlay(side);
      return { ...base, ...d, id: d.id || base.id };
    });
    next = {
      ...next,
      overlays: restoreList(draft.overlays, 'front'),
      backOverlays: restoreList(draft.backOverlays || [], 'back'),
      activeOverlayId: draft.activeOverlayId || null,
    };
    // Apply constraints for each overlay
    for (let i = 0; i < next.overlays.length; i++) {
      next = applyOverlayDraft(next, 'overlays', i, draft.overlays[i]);
    }
    for (let i = 0; i < next.backOverlays.length; i++) {
      next = applyOverlayDraft(next, 'backOverlays', i, (draft.backOverlays || [])[i]);
    }
  } else {
    // v1: single overlay/backOverlay → convert to array
    next = applyOverlayDraft(next, 'overlays', 0, draft.overlay);
    next = applyOverlayDraft(next, 'backOverlays', 0, draft.backOverlay);
  }

  if (draft.version === 3 && Array.isArray(draft.textItems) && Array.isArray(draft.iconItems)) {
    const restoreDecor = (list) => (list || []).map((d) => {
      if (!d || typeof d !== 'object') return null;
      return d.type === 'icon'
        ? constrainIconItem({ ...createIconItem(d.side), ...d })
        : constrainTextItem({ ...createTextItem(d.side), ...d });
    }).filter(Boolean);
    const withDecor = {
      ...next,
      textItems: restoreDecor(draft.textItems),
      backTextItems: restoreDecor(draft.backTextItems),
      iconItems: restoreDecor(draft.iconItems),
      backIconItems: restoreDecor(draft.backIconItems),
    };
    // Resolve selection trên scene đã có danh sách mới.
    withDecor.activeDecor = resolveDecorSelection(withDecor, draft.activeDecor);
    next = withDecor;
    // Đồng bộ counter để id mới không đụng id đã khôi phục.
    for (const list of [next.textItems, next.backTextItems, next.iconItems, next.backIconItems]) {
      for (const item of list) {
        if (item.id > _decorIdCounter) _decorIdCounter = item.id;
      }
    }
  }
  return withLegacy({ ...next, view: draft.view === 'back' ? 'back' : 'front' });
}

function getOverlayStyle({ x, y, scale, rotation, opacity }) {
  return {
    left: `${number(x, 50)}%`,
    top: `${number(y, 50)}%`,
    opacity: String(number(opacity, 1)),
    transform: `translate(-50%, -50%) rotate(${number(rotation, 0)}deg) scale(${number(scale, 1)})`,
  };
}

function getExportFileName(scene, ext = 'png') {
  const baseName = scene.base.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').replace(/(^-|-$)/g, '') || 'form';
  const safeExt = ext === 'jpg' || ext === 'jpeg' ? 'jpg' : 'png';
  return `${baseName}-${scene.view}-render.${safeExt}`.toLowerCase();
}

function getExportDimensions(scene) {
  const ratio = normalizeCanvasRatio(scene?.canvasRatio);
  return { ...EXPORT_DIMENSIONS[ratio] };
}

// Kích thước xuất theo hệ số scale (1x/2x/4x) dựa trên cạnh 1200 cơ sở.
function getExportDimensionsScaled(scene, scale = 1) {
  const ratio = normalizeCanvasRatio(scene?.canvasRatio);
  const base = EXPORT_BASE_DIMENSIONS[ratio];
  const factor = EXPORT_SCALES.includes(Number(scale)) ? Number(scale) : 1;
  return {
    width: base.width * factor,
    height: base.height * factor,
    ratio,
    scale: factor,
  };
}

function addOverlay(scene) {
  const side = scene.view === 'back' ? 'back' : 'front';
  const listKey = scene.view === 'back' ? 'backOverlays' : 'overlays';
  const newOverlay = createOverlay(side);
  const newList = [...scene[listKey], newOverlay];
  return withLegacy({ ...scene, [listKey]: newList, activeOverlayId: newOverlay.id });
}

function removeOverlay(scene, overlayId) {
  const listKey = scene.view === 'back' ? 'backOverlays' : 'overlays';
  const list = scene[listKey];
  const idx = list.findIndex(o => o.id === overlayId);
  if (idx < 0) return scene;
  const newList = list.filter(o => o.id !== overlayId);
  let activeOverlayId = scene.activeOverlayId;
  if (activeOverlayId === overlayId) {
    // Select the previous overlay, or next, or null
    activeOverlayId = newList.length > 0
      ? (newList[Math.min(idx, newList.length - 1)]?.id || null)
      : null;
  }
  return withLegacy({ ...scene, [listKey]: newList, activeOverlayId });
}

function selectOverlayById(scene, overlayId) {
  return withLegacy({ ...scene, activeOverlayId: overlayId });
}

function toggleOverlayLock(scene, overlayId) {
  const listKey = scene.overlays.find(o => o.id === overlayId) ? 'overlays' : 'backOverlays';
  const list = scene[listKey];
  const idx = list.findIndex(o => o.id === overlayId);
  if (idx < 0) return scene;
  const newList = [...list];
  newList[idx] = { ...newList[idx], locked: !newList[idx].locked };
  return withLegacy({ ...scene, [listKey]: newList });
}

// ─── Text & icon decoration API ───────────────────────────────────────────
const DECOR_KEYS = {
  text: { front: 'textItems', back: 'backTextItems' },
  icon: { front: 'iconItems', back: 'backIconItems' },
};

function getDecorList(scene, type) {
  const key = DECOR_KEYS[type];
  if (!key) return [];
  return scene.view === 'back' ? scene[key.back] : scene[key.front];
}

function getDecorListKey(scene, type) {
  return scene.view === 'back' ? DECOR_KEYS[type]?.back : DECOR_KEYS[type]?.front;
}

function getTextItems(scene) {
  return getDecorList(scene, 'text');
}

function getIconItems(scene) {
  return getDecorList(scene, 'icon');
}

function resolveDecorSelection(scene, selection) {
  if (!selection || (selection.type !== 'text' && selection.type !== 'icon')) return null;
  const item = getDecorList(scene, selection.type).find((entry) => entry.id === selection.id);
  return item ? { type: selection.type, id: item.id } : null;
}

function findDecorItem(scene, type, id) {
  return getDecorList(scene, type).find((entry) => entry.id === id) || null;
}

function selectDecor(scene, selection) {
  return { ...scene, activeDecor: resolveDecorSelection(scene, selection) };
}

function addTextItem(scene, patch = {}) {
  const side = scene.view === 'back' ? 'back' : 'front';
  const item = createTextItem(side, patch);
  const listKey = getDecorListKey(scene, 'text');
  return {
    ...scene,
    [listKey]: [...scene[listKey], item],
    activeDecor: { type: 'text', id: item.id },
  };
}

function addIconItem(scene, patch = {}) {
  const side = scene.view === 'back' ? 'back' : 'front';
  const item = createIconItem(side, patch);
  const listKey = getDecorListKey(scene, 'icon');
  return {
    ...scene,
    [listKey]: [...scene[listKey], item],
    activeDecor: { type: 'icon', id: item.id },
  };
}

function updateTextItem(scene, patch, itemId) {
  const selection = resolveDecorSelection(scene, { type: 'text', id: itemId ?? scene.activeDecor?.id });
  if (!selection) return scene;
  const listKey = getDecorListKey(scene, 'text');
  const list = scene[listKey];
  return {
    ...scene,
    [listKey]: list.map((item) => (item.id === selection.id ? constrainTextItem({ ...item, ...patch }) : item)),
  };
}

function updateIconItem(scene, patch, itemId) {
  const selection = resolveDecorSelection(scene, { type: 'icon', id: itemId ?? scene.activeDecor?.id });
  if (!selection) return scene;
  const listKey = getDecorListKey(scene, 'icon');
  const list = scene[listKey];
  return {
    ...scene,
    [listKey]: list.map((item) => (item.id === selection.id ? constrainIconItem({ ...item, ...patch }) : item)),
  };
}

function removeTextItem(scene, itemId) {
  const listKey = getDecorListKey(scene, 'text');
  if (!listKey) return scene;
  const list = scene[listKey];
  if (!list.some((item) => item.id === itemId)) return scene;
  return {
    ...scene,
    [listKey]: list.filter((item) => item.id !== itemId),
    activeDecor: scene.activeDecor?.type === 'text' && scene.activeDecor.id === itemId
      ? null
      : scene.activeDecor,
  };
}

function removeIconItem(scene, itemId) {
  const listKey = getDecorListKey(scene, 'icon');
  if (!listKey) return scene;
  const list = scene[listKey];
  if (!list.some((item) => item.id === itemId)) return scene;
  return {
    ...scene,
    [listKey]: list.filter((item) => item.id !== itemId),
    activeDecor: scene.activeDecor?.type === 'icon' && scene.activeDecor.id === itemId
      ? null
      : scene.activeDecor,
  };
}

function toggleDecorLock(scene, type, itemId) {
  const listKey = getDecorListKey(scene, type);
  if (!listKey) return scene;
  const list = scene[listKey];
  if (!list.some((item) => item.id === itemId)) return scene;
  return {
    ...scene,
    [listKey]: list.map((item) => (item.id === itemId ? { ...item, locked: !item.locked } : item)),
  };
}

// Nhân bản một lớp chữ/icon: id mới, lệch nhẹ để thấy rõ bản copy, và chọn bản copy.
function duplicateDecorItem(scene, type, itemId) {
  const listKey = getDecorListKey(scene, type);
  if (!listKey) return scene;
  const list = scene[listKey];
  const source = list.find((item) => item.id === itemId);
  if (!source) return scene;
  const clone = source.type === 'icon'
    ? constrainIconItem({ ...source, id: ++_decorIdCounter, x: source.x + 3, y: source.y + 3 })
    : constrainTextItem({ ...source, id: ++_decorIdCounter, x: source.x + 3, y: source.y + 3 });
  return { ...scene, [listKey]: [...list, clone], activeDecor: { type, id: clone.id } };
}

function moveAllDecorItems(items, deltaX, deltaY, constrain) {
  return items.map((item) => constrain({
    ...item,
    x: number(item.x, 50) + deltaX,
    y: number(item.y, 50) + deltaY,
  }));
}

globalThis.FormCore = {
  addOverlay,
  addIconItem,
  addTextItem,
  applyDraft,
  DEFAULT_ARTWORK,
  DEFAULT_BASE_SRC,
  EXPORT_DIMENSIONS,
  EXPORT_SCALES,
  DEFAULT_SAFE_AREA,
  MAX_IMAGE_BYTES,
  MIN_TEXT_FONT_SIZE,
  MAX_TEXT_FONT_SIZE,
  MIN_ICON_SIZE,
  MAX_ICON_SIZE,
  MAX_DECOR_TEXT_LENGTH,
  TEXT_FONTS,
  TEXT_STYLES,
  createScene,
  getBaseDisplayBox,
  getExportDimensions,
  getExportDimensionsScaled,
  getActiveOverlay,
  getOverlays,
  getOverlayById,
  getExportFileName,
  getOverlayStyle,
  getTextItems,
  getIconItems,
  findDecorItem,
  isEditableLayer,
  moveOverlay,
  normalizeWorkspaceView,
  removeOverlay,
  removeTextItem,
  removeIconItem,
  resizeOverlay,
  rotateOverlay,
  resetBase,
  selectDecor,
  selectOverlayById,
  serializeDraft,
  duplicateDecorItem,
  toggleDecorLock,
  toggleOverlayLock,
  setSafeArea,
  selectView,
  setBackground,
  setBase,
  setBaseTransform,
  setCanvasRatio,
  setLogo,
  updateOverlay,
  updateTextItem,
  updateIconItem,
  validateImageFile,
};
})();
