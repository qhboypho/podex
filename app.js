(() => {
  'use strict';

  const Core = globalThis.FormCore;
  const DraftStore = globalThis.FormDraftStore;
  const FabricEngine = globalThis.FormFabricEngine;
  const ChromaKey = globalThis.FormChromaKey;
  if (!Core) {
    throw new Error('Không thể khởi tạo bộ xử lý FORM.');
  }

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const element = {
    artboard: $('#artboard'),
    artworkDefaultLabel: $('#artworkDefaultLabel'),
    artworkFile: $('#artworkFile'),
    artworkFileHint: $('#artworkFileHint'),
    artworkFileName: $('#artworkFileName'),
    artworkImage: $('#artworkImage'),
    artworkLayerName: $('#artworkLayerName'),
    artworkLayerSide: $('#artworkLayerSide'),
    artworkMessage: $('#artworkMessage'),
    artworkOverlay: $('#artworkOverlay'),
    artworkHandles: $$('#artworkOverlay [data-artwork-handle]'),
    artworkRotate: $('#artworkOverlay [data-artwork-rotate]'),
    artworkX: $('#artworkX'),
    artworkY: $('#artworkY'),
    backgroundFile: $('#backgroundFile'),
    backgroundFileTrigger: $('#backgroundFileTrigger'),
    backgroundFileName: $('#backgroundFileName'),
    backgroundImage: $('#backgroundImage'),
    backgroundLayerName: $('#backgroundLayerName'),
    backgroundMessage: $('#backgroundMessage'),
    baseFile: $('#baseFile'),
    baseFileTrigger: $('#baseFileTrigger'),
    baseImage: $('#baseImage'),
    baseLayerName: $('#baseLayerName'),
    baseMessage: $('#baseMessage'),
    baseMeta: $('#baseMeta'),
    baseName: $('#baseName'),
    baseSelection: $('#baseSelection'),
    baseHandles: $$('#baseSelection [data-base-handle]'),
    baseThumbnail: $('#baseThumbnail'),
    baseLockToggle: $('#baseLockToggle'),
    baseLockLabel: $('#baseLockLabel'),
    clearDraft: $('#clearDraft'),
    confirmSafeArea: $('#confirmSafeArea'),
    draftStamp: $('#draftStamp'),
    embroideryType: $('#embroideryType'),
    exportButton: $('#exportButton'),
    fmtPng: $('#fmtPng'),
    fmtJpg: $('#fmtJpg'),
    scale1x: $('#scale1x'),
    scale2x: $('#scale2x'),
    scale4x: $('#scale4x'),
    exportSizeOutput: $('#exportSizeOutput'),
    inkOption: $('#inkOption'),
    logoEnabled: $('#logoEnabled'),
    logoFile: $('#logoFile'),
    logoFileTrigger: $('#logoFileTrigger'),
    logoFileName: $('#logoFileName'),
    logoImage: $('#logoImage'),
    logoLayerState: $('#logoLayerState'),
    logoMessage: $('#logoMessage'),
    logoOpacity: $('#logoOpacity'),
    logoOpacityOutput: $('#logoOpacityOutput'),
    logoOverlay: $('#logoOverlay'),
    watermarkCanvas: $('#watermarkCanvas'),
    logoX: $('#logoX'),
    logoY: $('#logoY'),
    opacityOutput: $('#opacityOutput'),
    opacityRange: $('#opacityRange'),
    printType: $('#printType'),
    renderStatus: $('#renderStatus'),
    ratioPortrait: $('#ratioPortrait'),
    ratioOutput: $('#ratioOutput'),
    ratioSquare: $('#ratioSquare'),
    resetBase: $('#resetBase'),
    rotationOutput: $('#rotationOutput'),
    rotationRange: $('#rotationRange'),
    safeArea: $('#safeArea'),
    safeAreaBadge: $('#safeAreaBadge'),
    safeAreaHint: $('#safeAreaHint'),
    safeAreaLabel: $('#safeAreaLabel'),
    safeAreaMessage: $('#safeAreaMessage'),
    safeHeight: $('#safeHeight'),
    safeWidth: $('#safeWidth'),
    safeX: $('#safeX'),
    safeY: $('#safeY'),
    saveDraft: $('#saveDraft'),
    sizeOutput: $('#sizeOutput'),
    sizeRange: $('#sizeRange'),
    sourceFingerprint: $('#sourceFingerprint'),
    stageWell: $('#stageWell'),
    threadOption: $('#threadOption'),
    toast: $('#toast'),
    viewLabel: $('#viewLabel'),
    zoomIn: $('#zoomIn'),
    zoomOut: $('#zoomOut'),
    zoomValue: $('#zoomValue'),
    artworkFileTrigger: $('#artworkFileTrigger'),
    blendModeSelect: $('#blendModeSelect'),
    blendOpacityRange: $('#blendOpacityRange'),
    blendOpacityOutput: $('#blendOpacityOutput'),
    dispStrengthRange: $('#dispStrengthRange'),
    dispStrengthOutput: $('#dispStrengthOutput'),
    blurRadiusRange: $('#blurRadiusRange'),
    blurRadiusOutput: $('#blurRadiusOutput'),
    contrastRange: $('#contrastRange'),
    contrastOutput: $('#contrastOutput'),
    embossRange: $('#embossRange'),
    embossOutput: $('#embossOutput'),
    edgeBlendRange: $('#edgeBlendRange'),
    edgeBlendOutput: $('#edgeBlendOutput'),
    brushToggle: $('#brushToggle'),
    brushErase: $('#brushErase'),
    brushBlur: $('#brushBlur'),
    brushRestore: $('#brushRestore'),
    brushSizeRange: $('#brushSizeRange'),
    brushSizeOutput: $('#brushSizeOutput'),
    brushOpacityRange: $('#brushOpacityRange'),
    brushOpacityOutput: $('#brushOpacityOutput'),
    brushHardnessRange: $('#brushHardnessRange'),
    brushHardnessOutput: $('#brushHardnessOutput'),
    brushResetMask: $('#brushResetMask'),
    brushUndo: $('#brushUndo'),
    brushRedo: $('#brushRedo'),
    artworkList: $('#artworkList'),
    artworkControls: $('#artworkControls'),
    artworkReplaceTrigger: $('#artworkReplaceTrigger'),
    artworkChromaKey: $('#artworkChromaKey'),
    artworkChromaBlack: $('#artworkChromaBlack'),
    chromaMessage: $('#chromaMessage'),
    overlaysContainer: $('#overlaysContainer'),
    // Watermark grid additions
    wmModeSingle: $('#wmModeSingle'),
    wmModeGrid: $('#wmModeGrid'),
    wmTypeLogo: $('#wmTypeLogo'),
    wmTypeText: $('#wmTypeText'),
    wmTypeBoth: $('#wmTypeBoth'),
    logoSection: $('#logoSection'),
    textSection: $('#textSection'),
    singlePositionSection: $('#singlePositionSection'),
    gridSection: $('#gridSection'),
    logoSizeRange: $('#logoSizeRange'),
    logoSizeOutput: $('#logoSizeOutput'),
    wmTextContent: $('#wmTextContent'),
    wmFontSelect: $('#wmFontSelect'),
    wmTextSizeRange: $('#wmTextSizeRange'),
    wmTextSizeOutput: $('#wmTextSizeOutput'),
    wmTextColorPicker: $('#wmTextColorPicker'),
    wmTextColorHex: $('#wmTextColorHex'),
    logoScale: $('#logoScale'),
    logoScaleOutput: $('#logoScaleOutput'),
    wmGridCols: $('#wmGridCols'),
    wmGridColsOut: $('#wmGridColsOut'),
    wmGridRows: $('#wmGridRows'),
    wmGridRowsOut: $('#wmGridRowsOut'),
    wmRotation: $('#wmRotation'),
    wmRotationOut: $('#wmRotationOut'),
    wmSpacingH: $('#wmSpacingH'),
    wmSpacingHOut: $('#wmSpacingHOut'),
    wmSpacingV: $('#wmSpacingV'),
    wmSpacingVOut: $('#wmSpacingVOut'),
    wmShowGridLines: $('#wmShowGridLines'),
    gridLineControls: $('#gridLineControls'),
    wmGridLineWidth: $('#wmGridLineWidth'),
    wmGridLineWidthOut: $('#wmGridLineWidthOut'),
    wmGridLineColor: $('#wmGridLineColor'),
    wmGridLineColorHex: $('#wmGridLineColorHex'),
    wmGridLineOpacity: $('#wmGridLineOpacity'),
    wmGridLineOpacityOut: $('#wmGridLineOpacityOut'),
    wmBlendMode: $('#wmBlendMode'),
    wmShadowBlur: $('#wmShadowBlur'),
    wmShadowBlurOut: $('#wmShadowBlurOut'),
    wmShadowColor: $('#wmShadowColor'),
    wmShadowColorHex: $('#wmShadowColorHex'),
  };

  const presetNames = {
    linen: 'Linen daylight',
    coast: 'Coast haze',
    studio: 'Studio contrast',
    snow: 'Snow studio',
    pearl: 'Pearl grey',
    blush: 'Blush pastel',
    sage: 'Sage calm',
    slate: 'Slate modern',
  };
  const fileUrls = { base: null, background: null, logo: null };
  const fileBlobs = { base: null, background: null, logo: null };
  // Per-overlay artwork blobs/urls keyed by overlay id
  const artworkUrls = {};   // { [overlayId]: objectUrl }
  const artworkBlobs = {};  // { [overlayId]: { blob, name, metadata } }
  const revisions = { base: 0, background: 0, logo: 0, artwork: 0 };
  let scene = Core.createScene();
  let workspaceView = Core.normalizeWorkspaceView();
  let toastTimer = 0;
  let draftDirty = false;
  let baseSelected = false;
  let baseLocked = true;
  let artworkSelected = false;
  let autoSaveTimer = 0;
  let workspaceRevision = 0;
  const AUTO_SAVE_DELAY = 180;

  // ─── Blend/fabric params (live + export) ─────────────────────────────────
  const blendParams = {
    mode: 'overlay',
    opacity: 0.90,
    dispStrength: 8,
    blurRadius: 0,
    contrast: 100,
    overlayColor: 'none',
    emboss: 0.60,
    edgeBlend: 0.40,
  };

  // ─── Brush state ─────────────────────────────────────────────────────────
  const brushState = {
    active: false,
    mode: 'erase',   // 'erase' | 'blur' | 'restore'
    size: 40,
    opacity: 0.70,
    hardness: 0.50,
  };

  // ─── Export options (định dạng + độ phân giải) ────────────────────────────
  const exportParams = {
    format: 'png',   // 'png' | 'jpg'
    scale: 1,        // 1 | 2 | 4  (1x = 1200 cạnh dài)
  };

  // ─── Settings persistence ────────────────────────────────────────────────
  const SETTINGS_KEY = 'form_ui_settings_v1';

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        blend: { ...blendParams },
        brush: {
          active: brushState.active,
          mode: brushState.mode,
          size: brushState.size,
          opacity: brushState.opacity,
          hardness: brushState.hardness,
        },
        export: { ...exportParams },
      }));
    } catch {}
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.blend) Object.assign(blendParams, s.blend);
      if (s.brush) {
        if (s.brush.active != null) brushState.active = s.brush.active;
        if (s.brush.mode)     brushState.mode     = s.brush.mode;
        if (s.brush.size)     brushState.size     = s.brush.size;
        if (s.brush.opacity != null) brushState.opacity  = s.brush.opacity;
        if (s.brush.hardness != null) brushState.hardness = s.brush.hardness;
      }
      if (s.export) {
        if (s.export.format === 'png' || s.export.format === 'jpg') exportParams.format = s.export.format;
        if ([1, 2, 4].includes(Number(s.export.scale))) exportParams.scale = Number(s.export.scale);
      }
    } catch {}
  }

  // Call before UI is wired so sliders get correct initial values
  loadSettings();

  function formatBytes(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function percentage(value) {
    const rounded = Math.round(Number(value) * 100);
    return `${rounded}%`;
  }

  function percentInput(value) {
    const rounded = Math.round(Number(value) * 10) / 10;
    return `${rounded}%`;
  }

  function degree(value) {
    const amount = Math.round(Number(value));
    return `${amount < 0 ? '−' : amount > 0 ? '+' : ''}${Math.abs(amount)}°`;
  }

  function setMessage(target, text = '', type = '') {
    target.textContent = text;
    target.className = `message${type ? ` ${type}` : ''}`;
  }

  function setStatus(text, type = '') {
    element.renderStatus.textContent = `● ${text}`;
    element.renderStatus.className = `status${type ? ` ${type}` : ''}`;
  }

  function showToast(text, type = '') {
    clearTimeout(toastTimer);
    element.toast.textContent = text;
    element.toast.className = `toast show${type ? ` ${type}` : ''}`;
    toastTimer = window.setTimeout(() => element.toast.classList.remove('show'), 3600);
  }

  function baseMetaText() {
    if (scene.base.kind === 'default') return 'DEFAULT · KHÔNG CHỈNH SỬA';
    const { width, height, size } = scene.base.metadata || {};
    const dimensions = width && height ? `${width}×${height}` : 'ẢNH TÙY CHỈNH';
    return `UPLOAD · ${dimensions}${size ? ` · ${formatBytes(size)}` : ''}`;
  }

  function stampDraft(text = 'CHƯA LƯU') {
    element.draftStamp.textContent = text;
  }

  function markDirty() {
    draftDirty = true;
    workspaceRevision += 1;
    stampDraft('ĐANG TỰ LƯU');
    scheduleAutoSave();
  }

  function makeAsset(file, metadata) {
    return { blob: file, name: file.name, metadata };
  }

  // Tự động khử nền xanh lá / nền đen cho artwork khi upload. Trả về Blob đã xử
  // lý (nếu phát hiện nền cần khử) kèm cờ `removed` và `mode` ('green'|'black'),
  // cùng tên file gợi ý. Nếu không có nền cần khử hoặc lỗi, trả blob gốc.
  async function maybeRemoveBackground(file) {
    if (!ChromaKey?.processBlob || typeof createImageBitmap !== 'function') {
      return { blob: file, name: file.name, removed: false, mode: null };
    }
    try {
      const { blob, changed, mode } = await ChromaKey.processBlob(file, { mode: 'auto' });
      if (!changed) return { blob: file, name: file.name, removed: false, mode: null };
      const name = file.name.replace(/\.[^/.]+$/, '') + '.png';
      return { blob, name, removed: true, mode };
    } catch {
      return { blob: file, name: file.name, removed: false, mode: null };
    }
  }

  function toObjectUrl(key, blob) {
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    replaceObjectUrl(key, url);
    return url;
  }

  function toArtworkObjectUrl(overlayId, blob) {
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    const prev = artworkUrls[overlayId];
    artworkUrls[overlayId] = url;
    if (prev && prev !== url) URL.revokeObjectURL(prev);
    return url;
  }

  function render() {
    const overlays = Core.getOverlays(scene);
    const overlay = Core.getActiveOverlay(scene);
    const baseBox = Core.getBaseDisplayBox(scene);
    const sourceIsDefault = scene.base.kind === 'default';
    const backgroundIsUploaded = scene.background.kind === 'upload';
    const artworkIsUploaded = overlay ? Boolean(overlay.artwork?.src) : false;

    element.artboard.dataset.bg = scene.background.value || 'linen';
    element.artboard.dataset.ratio = scene.canvasRatio;
    element.artboard.dataset.uploadedBackground = String(backgroundIsUploaded);
    element.artboard.style.setProperty('--zoom', String(workspaceView.zoom));
    element.artboard.style.setProperty('--pan-x', `${workspaceView.panX}px`);
    element.artboard.style.setProperty('--pan-y', `${workspaceView.panY}px`);
    element.backgroundImage.classList.toggle('visible', backgroundIsUploaded);
    element.backgroundImage.src = backgroundIsUploaded ? scene.background.src : '';

    element.baseImage.src = scene.base.src;
    element.baseImage.classList.toggle('uploaded', !sourceIsDefault);
    element.baseImage.classList.toggle('locked', baseLocked);
    element.baseImage.style.setProperty('--base-scale', String(baseBox.scale));
    element.baseImage.style.left = `${baseBox.x}%`;
    element.baseImage.style.top = `${baseBox.y}%`;
    element.baseSelection.style.left = `${baseBox.x}%`;
    element.baseSelection.style.top = `${baseBox.y}%`;
    element.baseSelection.style.width = `${baseBox.width}%`;
    element.baseSelection.style.height = `${baseBox.height}%`;
    element.baseSelection.classList.toggle('visible', baseSelected);
    element.baseSelection.setAttribute('aria-hidden', String(!baseSelected));
    element.baseThumbnail.src = scene.base.src;
    element.baseName.textContent = scene.base.name;
    element.baseMeta.textContent = baseMetaText();
    element.baseLayerName.textContent = sourceIsDefault ? 'Phôi & người mẫu' : scene.base.name;
    element.baseLockToggle.classList.toggle('unlocked', !baseLocked);
    element.baseLockLabel.textContent = baseLocked ? 'KHÓA' : 'MỞ KHÓA';
    const safeArea = scene.safeArea;
    element.safeArea.style.left = `${safeArea.x}%`;
    element.safeArea.style.top = `${safeArea.y}%`;
    element.safeArea.style.width = `${safeArea.width}%`;
    element.safeArea.style.height = `${safeArea.height}%`;
    element.safeArea.classList.toggle('needs-calibration', !safeArea.isCalibrated);
    element.safeAreaLabel.textContent = safeArea.isCalibrated ? 'VÙNG IN AN TOÀN' : 'CẦN HIỆU CHỈNH VÙNG IN';
    element.safeAreaBadge.textContent = safeArea.isCalibrated ? 'ĐÃ HIỆU CHỈNH' : 'CẦN THIẾT LẬP';
    element.safeAreaBadge.classList.toggle('warning', !safeArea.isCalibrated);
    element.safeAreaHint.textContent = safeArea.isCalibrated
      ? 'Artwork sẽ luôn bị giữ trong vùng này; phôi không bị chỉnh sửa.'
      : 'Phôi hoặc khung mới cần khoanh vùng áo trước khi đặt artwork chính xác.';
    element.safeX.value = percentInput(safeArea.x);
    element.safeY.value = percentInput(safeArea.y);
    element.safeWidth.value = percentInput(safeArea.width);
    element.safeHeight.value = percentInput(safeArea.height);

    if (sourceIsDefault) {
      element.sourceFingerprint.textContent = 'Phôi mặc định đang được dùng. Tải ảnh để xem tên file, kích thước và mã kiểm tra.';
    } else {
      const metadata = scene.base.metadata || {};
      element.sourceFingerprint.textContent = `Nguồn đọc-only · ${metadata.width || '?'}×${metadata.height || '?'} px · ${formatBytes(metadata.size || 0)} · SHA-256 ${metadata.fingerprint || 'đang kiểm tra'}.`;
    }

    // ── Render primary artworkOverlay (first overlay or active) on artboard
    if (overlay) {
      Object.assign(element.artworkOverlay.style, Core.getOverlayStyle(overlay));
      element.artworkOverlay.style.setProperty('--artwork-control-scale', String(1 / overlay.scale));
      element.artworkOverlay.classList.toggle('is-print', overlay.kind === 'print');
      element.artworkOverlay.classList.toggle('is-embroidery', overlay.kind === 'embroidery');
      element.artworkOverlay.classList.toggle('has-image', artworkIsUploaded);
      element.artworkOverlay.classList.toggle('selected', artworkSelected && overlay.id === scene.activeOverlayId);
      element.artworkOverlay.classList.toggle('locked-overlay', overlay.locked);
      element.artworkOverlay.setAttribute('aria-valuetext', `Artwork ${percentInput(overlay.x)} ngang, ${percentInput(overlay.y)} dọc`);
      element.artworkImage.src = artworkIsUploaded ? overlay.artwork.src : '';
      element.artworkDefaultLabel.textContent = overlay.artwork?.label || 'ROUGE / 07';
      element.artworkOverlay.style.display = '';
      element.artworkOverlay.dataset.overlayId = String(overlay.id);
    } else {
      element.artworkOverlay.style.display = 'none';
    }

    // ── Render additional overlay nodes in overlaysContainer
    renderOverlayNodes(overlays, overlay);

    // ── Render artwork list panel
    renderArtworkList(overlays, overlay);

    // ── Update controls for active overlay
    if (overlay) {
      element.artworkControls.classList.remove('hidden');
      element.artworkFileName.textContent = overlay.artwork?.name || 'Rouge 07 · mặc định';
      element.artworkFileHint.textContent = artworkIsUploaded ? 'Ảnh gốc dùng cho mặt đang chọn' : 'Ảnh PNG, JPG hoặc WEBP';
      element.artworkLayerName.textContent = `${overlay.kind === 'embroidery' ? 'Hình thêu' : 'Hình in'} · ${overlay.artwork?.name || 'Rouge 07'}`;
      element.artworkLayerSide.textContent = scene.view === 'front' ? 'MẶT TRƯỚC' : 'MẶT SAU';
      element.sizeRange.value = overlay.scale;
      element.rotationRange.value = overlay.rotation;
      element.opacityRange.value = overlay.opacity;
      element.sizeOutput.textContent = `${Math.round(34 * overlay.scale)} cm`;
      element.rotationOutput.textContent = degree(overlay.rotation);
      element.opacityOutput.textContent = percentage(overlay.opacity);
      element.artworkX.value = percentInput(overlay.x);
      element.artworkY.value = percentInput(overlay.y);
      element.printType.classList.toggle('active', overlay.kind === 'print');
      element.embroideryType.classList.toggle('active', overlay.kind === 'embroidery');
      element.inkOption.classList.toggle('active', overlay.kind === 'print');
      element.threadOption.classList.toggle('active', overlay.kind === 'embroidery');
    } else {
      element.artworkControls.classList.add('hidden');
    }

    element.backgroundFileName.textContent = scene.background.name;
    element.backgroundLayerName.textContent = scene.background.kind === 'upload' ? scene.background.name : 'Phông nền';
    $$('.swatch').forEach((swatch) => swatch.classList.toggle('active', scene.background.kind === 'preset' && swatch.dataset.background === scene.background.value));
    element.ratioSquare.classList.toggle('active', scene.canvasRatio === 'square');
    element.ratioPortrait.classList.toggle('active', scene.canvasRatio === 'portrait');
    const scaledDims = Core.getExportDimensionsScaled(scene, exportParams.scale);
    element.ratioOutput.textContent = `${scene.canvasRatio === 'square' ? '1:1' : '9:16'} · ${scaledDims.width}×${scaledDims.height}`;
    element.exportButton.textContent = `Xuất ${exportParams.format.toUpperCase()} · ${exportParams.scale}x`;

    // Sync export options UI
    if (element.fmtPng) {
      element.fmtPng.classList.toggle('active', exportParams.format === 'png');
      element.fmtJpg.classList.toggle('active', exportParams.format === 'jpg');
      element.scale1x.classList.toggle('active', exportParams.scale === 1);
      element.scale2x.classList.toggle('active', exportParams.scale === 2);
      element.scale4x.classList.toggle('active', exportParams.scale === 4);
      element.exportSizeOutput.textContent = `${scaledDims.width}×${scaledDims.height}`;
    }

    // Live watermark preview (canvas) — mirrors the export renderer exactly
    renderWatermarkPreview();

    // logoOverlay now serves ONLY as the drag handle for single mode.
    // The visible watermark is painted on watermarkCanvas.
    const singleMode = scene.logo.mode !== 'grid';
    element.logoOverlay.style.display = (scene.logo.enabled && singleMode) ? 'grid' : 'none';
    element.logoOverlay.style.left = `${scene.logo.x}%`;
    element.logoOverlay.style.top = `${scene.logo.y}%`;
    element.logoOverlay.style.opacity = '0'; // invisible handle; canvas shows the mark
    element.logoOverlay.style.transform = `translate(-50%, -50%) scale(${scene.logo.scale})`;
    element.logoOverlay.classList.toggle('has-image', Boolean(scene.logo.src));
    element.logoImage.src = scene.logo.src || '';
    element.logoFileName.textContent = scene.logo.name;
    element.logoLayerState.textContent = scene.logo.enabled ? 'BẬT' : 'TẮT';
    element.logoEnabled.checked = scene.logo.enabled;
    element.logoX.value = percentInput(scene.logo.x);
    element.logoY.value = percentInput(scene.logo.y);
    element.logoOpacity.value = scene.logo.opacity;
    element.logoOpacityOutput.textContent = percentage(scene.logo.opacity);

    // Watermark grid UI sync
    const logo = scene.logo;
    const isGrid = logo.mode === 'grid';
    element.wmModeSingle.classList.toggle('active', !isGrid);
    element.wmModeGrid.classList.toggle('active', isGrid);
    element.singlePositionSection.style.display = isGrid ? 'none' : '';
    element.gridSection.style.display = isGrid ? '' : 'none';

    // wmType sections
    const showLogo = logo.wmType === 'logo' || logo.wmType === 'both';
    const showText = logo.wmType === 'text' || logo.wmType === 'both';
    element.logoSection.style.display = showLogo ? '' : 'none';
    element.textSection.style.display = showText ? '' : 'none';
    element.wmTypeLogo.classList.toggle('active', logo.wmType === 'logo');
    element.wmTypeText.classList.toggle('active', logo.wmType === 'text');
    element.wmTypeBoth.classList.toggle('active', logo.wmType === 'both');

    // Logo size (absolute px, reference model)
    const logoSizePx = Math.round(logo.logoSizePx != null ? logo.logoSizePx : 80);
    if (element.logoSizeRange) { element.logoSizeRange.value = logoSizePx; element.logoSizeOutput.textContent = logoSizePx + 'px'; }

    // Text controls
    if (element.wmTextContent) element.wmTextContent.value = logo.textContent;
    if (element.wmFontSelect) element.wmFontSelect.value = logo.textFont;
    if (element.wmTextSizeRange) { element.wmTextSizeRange.value = logo.textSize; element.wmTextSizeOutput.textContent = logo.textSize + 'px'; }
    if (element.wmTextColorPicker) { element.wmTextColorPicker.value = logo.textColor; element.wmTextColorHex.value = logo.textColor; }

    // Scale (single mode)
    if (element.logoScale) { element.logoScale.value = Math.round(logo.scale * 100); element.logoScaleOutput.textContent = Math.round(logo.scale * 100) + '%'; }

    // Grid controls
    if (element.wmGridCols) { element.wmGridCols.value = logo.gridCols; element.wmGridColsOut.textContent = logo.gridCols; }
    if (element.wmGridRows) { element.wmGridRows.value = logo.gridRows; element.wmGridRowsOut.textContent = logo.gridRows; }
    if (element.wmRotation) { element.wmRotation.value = logo.rotation; element.wmRotationOut.textContent = (logo.rotation >= 0 ? '' : '−') + Math.abs(logo.rotation) + '°'; }
    if (element.wmSpacingH) { element.wmSpacingH.value = logo.spacingH; element.wmSpacingHOut.textContent = logo.spacingH; }
    if (element.wmSpacingV) { element.wmSpacingV.value = logo.spacingV; element.wmSpacingVOut.textContent = logo.spacingV; }

    // Grid lines
    if (element.wmShowGridLines) {
      element.wmShowGridLines.checked = logo.showGridLines;
      element.gridLineControls.style.display = logo.showGridLines ? '' : 'none';
    }
    if (element.wmGridLineWidth) { element.wmGridLineWidth.value = logo.gridLineWidth; element.wmGridLineWidthOut.textContent = logo.gridLineWidth + 'px'; }
    if (element.wmGridLineColor) { element.wmGridLineColor.value = logo.gridLineColor; element.wmGridLineColorHex.value = logo.gridLineColor; }
    if (element.wmGridLineOpacity) { element.wmGridLineOpacity.value = Math.round(logo.gridLineOpacity * 100); element.wmGridLineOpacityOut.textContent = Math.round(logo.gridLineOpacity * 100) + '%'; }

    // Grid pattern buttons
    document.querySelectorAll('.wm-gp').forEach(btn => btn.classList.toggle('active', btn.dataset.gp === logo.gridType));
    // Text style buttons
    document.querySelectorAll('.wm-style-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.style === logo.textStyle));
    // Grid line style buttons
    document.querySelectorAll('.wm-ls-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.ls === logo.gridLineStyle));

    // Blend mode
    if (element.wmBlendMode) element.wmBlendMode.value = logo.blendMode;

    // Text shadow
    if (element.wmShadowBlur) {
      const sb = Math.round(logo.shadowBlur != null ? logo.shadowBlur : 0);
      element.wmShadowBlur.value = sb;
      element.wmShadowBlurOut.textContent = sb + 'px';
    }
    if (element.wmShadowColor) {
      const sc = logo.shadowColor || '#000000';
      element.wmShadowColor.value = sc;
      element.wmShadowColorHex.value = sc;
    }

    $$('.view-switch button').forEach((button) => button.classList.toggle('active', button.dataset.view === scene.view));
    element.viewLabel.textContent = scene.view === 'front' ? 'MẶT TRƯỚC' : 'MẶT SAU';
    element.zoomValue.textContent = `${Math.round(workspaceView.zoom * 100)}%`;

    // Trigger live fabric warp preview — check ALL overlays, not just active
    const currentOverlays = Core.getOverlays(scene);
    const hasAnyArtwork = currentOverlays.some(o => o.artwork?.src) && scene.base.kind !== 'default';
    if (hasAnyArtwork) {
      scheduleFabricPreview();
    } else {
      clearFabricPreview();
    }
  }

  // ── Render dynamic overlay nodes on artboard for multi-overlay support
  const _overlayNodes = new Map(); // overlayId → DOM element

  function renderOverlayNodes(overlays, activeOverlay) {
    const container = element.overlaysContainer;
    const activeId = activeOverlay?.id;

    // The first overlay in the current view uses #artworkOverlay (static DOM).
    // Additional overlays get dynamic nodes in #overlaysContainer.
    const extraOverlays = overlays.filter(o => o !== activeOverlay);

    // Remove stale nodes
    for (const [id, node] of _overlayNodes) {
      if (!extraOverlays.find(o => o.id === id)) {
        node.remove();
        _overlayNodes.delete(id);
      }
    }

    // Create/update extra overlay nodes
    for (const ov of extraOverlays) {
      let node = _overlayNodes.get(ov.id);
      if (!node) {
        node = document.createElement('div');
        node.className = 'artwork-overlay';
        node.dataset.overlayId = String(ov.id);
        node.innerHTML = '<img class="artwork-image" alt="" draggable="false" /><div class="artwork-default"><span></span></div>';
        node.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          selectArtworkOverlay(ov.id);
        });
        container.appendChild(node);
        _overlayNodes.set(ov.id, node);
      }
      const style = Core.getOverlayStyle(ov);
      Object.assign(node.style, style);
      node.classList.toggle('is-print', ov.kind === 'print');
      node.classList.toggle('is-embroidery', ov.kind === 'embroidery');
      node.classList.toggle('has-image', Boolean(ov.artwork?.src));
      node.classList.toggle('selected', false);
      node.classList.toggle('locked-overlay', ov.locked);
      const img = node.querySelector('.artwork-image');
      img.src = ov.artwork?.src || '';
      node.querySelector('.artwork-default span').textContent = ov.artwork?.label || 'ROUGE / 07';
    }
  }

  // ── Render artwork list in the inspector panel
  function renderArtworkList(overlays, activeOverlay) {
    const list = element.artworkList;
    // Build HTML
    let html = '';
    for (const ov of overlays) {
      const isActive = ov.id === activeOverlay?.id;
      const hasImage = Boolean(ov.artwork?.src);
      const name = ov.artwork?.name || 'Rouge 07 · mặc định';
      const label = ov.artwork?.label || 'ROUGE';
      const isLocked = ov.locked;
      const thumbHtml = hasImage
        ? `<img class="artwork-thumb" src="${ov.artwork.src}" alt="" />`
        : `<div class="artwork-thumb-placeholder">${label.slice(0, 4)}</div>`;
      html += `<div class="artwork-list-item${isActive ? ' active' : ''}${isLocked ? ' locked' : ''}" data-overlay-id="${ov.id}">`
        + thumbHtml
        + `<div class="artwork-item-info"><span class="artwork-item-name">${name}</span>`
        + `<span class="artwork-item-meta">${ov.kind === 'embroidery' ? 'Thêu' : 'In'} · ${Math.round(34 * ov.scale)}cm${isLocked ? ' · 🔒' : ''}</span></div>`
        + `<button class="artwork-item-lock${isLocked ? ' is-locked' : ''}" data-lock-id="${ov.id}" type="button" title="${isLocked ? 'Mở khóa' : 'Khóa'}">${isLocked ? '🔒' : '🔓'}</button>`
        + `<button class="artwork-item-remove" data-remove-id="${ov.id}" type="button" title="Xóa artwork này">✕</button>`
        + `</div>`;
    }
    list.innerHTML = html;

    // Attach events
    list.querySelectorAll('.artwork-list-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.artwork-item-remove, .artwork-item-lock')) return;
        selectArtworkOverlay(Number(item.dataset.overlayId));
      });
    });
    list.querySelectorAll('.artwork-item-lock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.lockId);
        scene = Core.toggleOverlayLock(scene, id);
        const ov = Core.getOverlayById(scene, id);
        markDirty();
        render();
        showToast(ov?.locked ? 'Đã khóa artwork — không thể di chuyển.' : 'Đã mở khóa artwork.');
      });
    });
    list.querySelectorAll('.artwork-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.removeId);
        removeArtworkOverlay(id);
      });
    });
  }

  function selectArtworkOverlay(overlayId) {
    scene = Core.selectOverlayById(scene, overlayId);
    artworkSelected = true;
    baseSelected = false;
    markDirty();
    render();
  }

  function removeArtworkOverlay(overlayId) {
    // Cleanup blob/url for this overlay
    if (artworkUrls[overlayId]) {
      URL.revokeObjectURL(artworkUrls[overlayId]);
      delete artworkUrls[overlayId];
    }
    delete artworkBlobs[overlayId];
    // Remove DOM node if exists
    const node = _overlayNodes.get(overlayId);
    if (node) { node.remove(); _overlayNodes.delete(overlayId); }
    scene = Core.removeOverlay(scene, overlayId);
    markDirty();
    render();
    showToast('Đã xóa artwork khỏi mặt đang chọn.');
  }

  function invalidatePending(kind) {
    revisions[kind] += 1;
    return revisions[kind];
  }

  function replaceObjectUrl(key, nextUrl) {
    const previousUrl = fileUrls[key];
    fileUrls[key] = nextUrl;
    if (previousUrl && previousUrl !== nextUrl) URL.revokeObjectURL(previousUrl);
  }

  function decodeImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('Trình duyệt không thể đọc ảnh này.'));
      image.src = src;
    });
  }

  async function fingerprint(file) {
    try {
      if (!globalThis.crypto?.subtle) return 'LOCAL';
      const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
      return [...new Uint8Array(digest)].slice(0, 6).map((part) => part.toString(16).padStart(2, '0')).join('').toUpperCase();
    } catch {
      return 'LOCAL';
    }
  }

  function typeMessageTarget(kind) {
    return kind === 'base' ? element.baseMessage : kind === 'background' ? element.backgroundMessage : kind === 'logo' ? element.logoMessage : element.artworkMessage;
  }

  function sourceMessage(kind) {
    return kind === 'base' ? 'phôi' : kind === 'background' ? 'nền' : kind === 'logo' ? 'logo' : 'artwork';
  }

  async function workspaceRecord() {
    const maskBlob = await getMaskBlob();
    return {
      version: 2,
      savedAt: Date.now(),
      draft: Core.serializeDraft(scene),
      viewport: workspaceView,
      assets: {
        base: fileBlobs.base,
        background: fileBlobs.background,
        logo: fileBlobs.logo,
      },
      artworkAssets: { ...artworkBlobs },
      mask: maskBlob,
    };
  }

  function formatSavedTime() {
    return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date());
  }

  function scheduleAutoSave() {
    if (!DraftStore) return;
    window.clearTimeout(autoSaveTimer);
    autoSaveTimer = window.setTimeout(() => {
      autoSaveTimer = 0;
      void persistWorkspace({ silent: true, revision: workspaceRevision });
    }, AUTO_SAVE_DELAY);
  }

  function flushAutoSave() {
    if (!draftDirty) return;
    window.clearTimeout(autoSaveTimer);
    autoSaveTimer = 0;
    void persistWorkspace({ silent: true, revision: workspaceRevision });
  }

  async function persistWorkspace({ silent = false, revision = workspaceRevision } = {}) {
    if (!DraftStore) {
      if (!silent) showToast('Bộ nhớ cục bộ chưa sẵn sàng trên trình duyệt này.', 'error');
      return false;
    }
    if (!silent) element.saveDraft.disabled = true;
    try {
      await DraftStore.save(await workspaceRecord());
      if (revision !== workspaceRevision) {
        scheduleAutoSave();
        return false;
      }
      draftDirty = false;
      const time = formatSavedTime();
      stampDraft(`${silent ? 'ĐÃ TỰ LƯU' : 'ĐÃ LƯU'} ${time}`);
      if (!silent) {
        setStatus('Đã lưu tại máy');
        showToast('Đã lưu phôi, nền, logo và artwork vào bộ nhớ của trình duyệt này.');
      }
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể lưu bản nháp.';
      draftDirty = true;
      stampDraft('CHƯA LƯU');
      if (!silent) {
        setStatus('Không thể lưu bản nháp', 'error');
        showToast(message, 'error');
      }
      return false;
    } finally {
      if (!silent) element.saveDraft.disabled = false;
    }
  }

  async function saveWorkspace() {
    window.clearTimeout(autoSaveTimer);
    autoSaveTimer = 0;
    await persistWorkspace();
  }

  async function clearWorkspace() {
    if (!DraftStore) return;
    try {
      window.clearTimeout(autoSaveTimer);
      autoSaveTimer = 0;
      workspaceRevision += 1;
      await DraftStore.clear();
      draftDirty = false;
      stampDraft('ĐÃ XÓA BẢN LƯU');
      showToast('Đã xóa bản nháp và ảnh đã lưu khỏi trình duyệt này. Preview hiện tại vẫn giữ nguyên.');
    } catch (error) {
      showToast('Không thể xóa bản nháp cục bộ.', 'error');
    }
  }

  async function restoreAsset(key, asset) {
    if (!asset?.blob || !asset.name) return null;
    const url = toObjectUrl(key, asset.blob);
    return { ...asset, src: url };
  }

  async function restoreWorkspace() {
    if (!DraftStore) return;
    try {
      const stored = await DraftStore.load();
      if (!stored || (stored.version !== 1 && stored.version !== 2) || !stored.draft) return;
      const assets = stored.assets || {};
      const base = await restoreAsset('base', assets.base);
      const background = await restoreAsset('background', assets.background);
      const logo = await restoreAsset('logo', assets.logo);
      fileBlobs.base = assets.base || null;
      fileBlobs.background = assets.background || null;
      fileBlobs.logo = assets.logo || null;
      if (base) scene = Core.setBase(scene, { name: base.name, src: base.src, metadata: base.metadata });
      if (background) scene = Core.setBackground(scene, { kind: 'upload', name: background.name, src: background.src, metadata: background.metadata });
      if (logo) scene = Core.setLogo(scene, { name: logo.name, src: logo.src });
      scene = Core.applyDraft(scene, stored.draft);
      workspaceView = Core.normalizeWorkspaceView(stored.viewport);

      if (stored.version === 2 && stored.artworkAssets) {
        // v2: restore per-overlay artwork blobs
        const allOverlays = [...scene.overlays, ...scene.backOverlays];
        for (const ov of allOverlays) {
          const asset = stored.artworkAssets[ov.id];
          if (!asset?.blob) continue;
          const url = toArtworkObjectUrl(ov.id, asset.blob);
          artworkBlobs[ov.id] = asset;
          const isFront = scene.overlays.some(o => o.id === ov.id);
          scene = Core.selectView(scene, isFront ? 'front' : 'back');
          scene = Core.updateOverlay(scene, {
            artwork: { name: asset.name, src: url, metadata: asset.metadata, label: asset.name.replace(/\.[^/.]+$/, '').slice(0, 18).toUpperCase() },
          }, ov.id);
        }
      } else {
        // v1 compat: restore artworkFront/artworkBack
        const artworkFront = await restoreAsset('_artFront', assets.artworkFront);
        const artworkBack = await restoreAsset('_artBack', assets.artworkBack);
        if (artworkFront && scene.overlays[0]) {
          scene = Core.selectView(scene, 'front');
          scene = Core.updateOverlay(scene, { artwork: { name: artworkFront.name, src: artworkFront.src, metadata: artworkFront.metadata, label: artworkFront.name.replace(/\.[^/.]+$/, '').slice(0, 18).toUpperCase() } });
        }
        if (artworkBack && scene.backOverlays[0]) {
          scene = Core.selectView(scene, 'back');
          scene = Core.updateOverlay(scene, { artwork: { name: artworkBack.name, src: artworkBack.src, metadata: artworkBack.metadata, label: artworkBack.name.replace(/\.[^/.]+$/, '').slice(0, 18).toUpperCase() } });
        }
      }
      scene = Core.selectView(scene, stored.draft.view);
      draftDirty = false;
      const time = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(stored.savedAt));
      stampDraft(`ĐÃ KHÔI PHỤC ${time}`);
      render();
      // Defer mask restore: runFabricPreview will pick it up once artboard is sized
      if (stored.mask) {
        pendingMaskBlob = stored.mask;
      }
      setStatus('Đã khôi phục bản lưu tại máy');
      showToast('Đã khôi phục workspace cục bộ. Phôi vẫn được khóa.');
    } catch (error) {
      showToast('Không thể khôi phục bản lưu cục bộ; đang mở phôi mặc định.', 'error');
    }
  }

  async function uploadImage(file, kind) {
    const target = typeMessageTarget(kind);
    const validation = Core.validateImageFile(file);
    if (!validation.ok) {
      setMessage(target, validation.error, 'error');
      showToast(validation.error, 'error');
      return;
    }

    const revision = invalidatePending(kind);
    setMessage(target, `Đang kiểm tra ${sourceMessage(kind)}…`);
    setStatus(`Đang kiểm tra ${sourceMessage(kind)}…`);
    const url = URL.createObjectURL(file);

    try {
      const dimensions = await decodeImage(url);
      if (revision !== revisions[kind]) {
        URL.revokeObjectURL(url);
        return;
      }
      if (dimensions.width < 24 || dimensions.height < 24) throw new Error('Ảnh quá nhỏ để dùng trong studio.');
      if (dimensions.width * dimensions.height > 40_000_000) throw new Error('Ảnh vượt giới hạn 40 megapixel cho preview trong trình duyệt.');
      const metadata = { ...dimensions, size: file.size, type: file.type, fingerprint: await fingerprint(file) };
      if (revision !== revisions[kind]) {
        URL.revokeObjectURL(url);
        return;
      }

      if (kind === 'base') {
        scene = Core.setBase(scene, { name: file.name, src: url, metadata });
        replaceObjectUrl('base', url);
        fileBlobs.base = makeAsset(file, metadata);
        garmentDispCache = null; // invalidate displacement map when garment changes
        destroyMask();           // garment changed → mask no longer valid
        setMessage(target, `Phôi đã khóa · ${dimensions.width}×${dimensions.height} px`, 'success');
        setMessage(element.safeAreaMessage, 'Kéo khung vùng in lên phần áo, rồi bấm xác nhận.', 'error');
        showToast('Đã thay phôi. Hãy hiệu chỉnh vùng in trước khi đặt artwork.');
      } else if (kind === 'background') {
        scene = Core.setBackground(scene, { kind: 'upload', name: file.name, src: url, metadata });
        replaceObjectUrl('background', url);
        fileBlobs.background = makeAsset(file, metadata);
        setMessage(target, `Nền đã sẵn sàng · ${dimensions.width}×${dimensions.height} px`, 'success');
      } else if (kind === 'logo') {
        scene = Core.setLogo(scene, { name: file.name, src: url });
        replaceObjectUrl('logo', url);
        fileBlobs.logo = makeAsset(file, metadata);
        setMessage(target, 'Logo đã được đặt ở góc watermark.', 'success');
      } else {
        // Artwork upload: check if current active overlay has no artwork yet
        const currentActive = Core.getActiveOverlay(scene);
        const hasExistingArt = currentActive && currentActive.artwork?.src;
        if (hasExistingArt) {
          // Add a NEW overlay with this artwork
          scene = Core.addOverlay(scene);
        }
        const targetOverlay = Core.getActiveOverlay(scene);

        // Tự động khử nền xanh lá / nền đen nếu ảnh có.
        const keyed = await maybeRemoveBackground(file);
        let artSrc = url;
        let artBlob = file;
        let artName = file.name;
        if (keyed.removed) {
          URL.revokeObjectURL(url);              // bỏ URL ảnh gốc
          artSrc = URL.createObjectURL(keyed.blob);
          artBlob = keyed.blob;
          artName = keyed.name;
        }
        const artLabel = artName.replace(/\.[^/.]+$/, '').slice(0, 18).toUpperCase();
        const artwork = { name: artName, src: artSrc, metadata, label: artLabel };
        scene = Core.updateOverlay(scene, { artwork }, targetOverlay.id);
        artworkUrls[targetOverlay.id] = artSrc;
        artworkBlobs[targetOverlay.id] = { blob: artBlob, name: artName, metadata };
        artworkSelected = true;
        baseSelected = false;
        const total = Core.getOverlays(scene).length;
        const keyedMsg = keyed.removed ? ` · đã khử nền ${keyed.mode === 'black' ? 'đen' : 'xanh'}` : '';
        setMessage(target, `Artwork đã ${hasExistingArt ? 'thêm' : 'tải'} cho ${scene.view === 'front' ? 'mặt trước' : 'mặt sau'}${keyedMsg}${total > 1 ? `. Tổng ${total} artwork` : ''}.`, 'success');
      }

      markDirty();
      render();
      setStatus('Sẵn sàng render');
    } catch (error) {
      URL.revokeObjectURL(url);
      const message = error instanceof Error ? error.message : 'Không thể đọc ảnh này.';
      setMessage(target, message, 'error');
      setStatus('Cần chọn lại ảnh', 'error');
      showToast(message, 'error');
    }
  }

  function updateArtwork(patch) {
    scene = Core.updateOverlay(scene, patch);
    markDirty();
    render();
  }

  function resizeArtwork(scale) {
    scene = Core.resizeOverlay(scene, scale);
    markDirty();
    render();
  }

  function moveArtwork(position) {
    scene = Core.moveOverlay(scene, position);
    markDirty();
    render();
  }

  function rotateArtwork(rotation) {
    scene = Core.rotateOverlay(scene, rotation);
    markDirty();
    render();
  }

  function setWorkspaceView(patch) {
    workspaceView = Core.normalizeWorkspaceView({ ...workspaceView, ...patch });
    markDirty();
    render();
  }

  function zoomWorkspace(nextZoom, anchor) {
    const normalized = Core.normalizeWorkspaceView({ ...workspaceView, zoom: nextZoom });
    if (!anchor || normalized.zoom === workspaceView.zoom) {
      setWorkspaceView(normalized);
      return;
    }
    const rect = element.stageWell.getBoundingClientRect();
    const pointerX = anchor.clientX - rect.left - rect.width / 2;
    const pointerY = anchor.clientY - rect.top - rect.height / 2;
    const sourceX = (pointerX - workspaceView.panX) / workspaceView.zoom;
    const sourceY = (pointerY - workspaceView.panY) / workspaceView.zoom;
    setWorkspaceView({
      ...normalized,
      panX: pointerX - sourceX * normalized.zoom,
      panY: pointerY - sourceY * normalized.zoom,
    });
  }

  function attachWorkspaceNavigation() {
    let panning = null;
    const canPanTarget = (target) => target === element.stageWell || target === element.artboard
      || target === element.backgroundImage || target.classList?.contains('background-sun');

    element.stageWell.addEventListener('wheel', (event) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * .0015);
      zoomWorkspace(workspaceView.zoom * factor, event);
    }, { passive: false });

    element.stageWell.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !canPanTarget(event.target)) return;
      if (brushState.active) return; // brush takes over — no pan
      panning = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        panX: workspaceView.panX,
        panY: workspaceView.panY,
        moved: false,
      };
      element.stageWell.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    element.stageWell.addEventListener('pointermove', (event) => {
      if (!panning || panning.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - panning.startX;
      const deltaY = event.clientY - panning.startY;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) panning.moved = true;
      if (!panning.moved) return;
      element.stageWell.classList.add('panning');
      setWorkspaceView({ panX: panning.panX + deltaX, panY: panning.panY + deltaY });
    });
    const stopPan = (event) => {
      if (!panning || panning.pointerId !== event.pointerId) return;
      if (panning.moved) element.stageWell.dataset.panned = 'true';
      element.stageWell.classList.remove('panning');
      if (element.stageWell.hasPointerCapture(event.pointerId)) element.stageWell.releasePointerCapture(event.pointerId);
      panning = null;
    };
    element.stageWell.addEventListener('pointerup', stopPan);
    element.stageWell.addEventListener('pointercancel', stopPan);
    element.stageWell.addEventListener('click', (event) => {
      if (element.stageWell.dataset.panned !== 'true') return;
      delete element.stageWell.dataset.panned;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  function updatePercentField(field, updater) {
    const parsed = Number.parseFloat(field.value.replace(',', '.'));
    if (!Number.isFinite(parsed)) {
      render();
      return;
    }
    updater(parsed);
  }

  function setArtworkType(kind) {
    updateArtwork({ kind });
    setStatus(kind === 'print' ? 'Chế độ mực in' : 'Chế độ chỉ thêu');
  }

  function attachDrag(target, targetType) {
    let dragging = null;
    target.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (brushState.active) return; // brush mode takes over — no drag
      if (targetType === 'artwork' && event.target.closest('[data-artwork-handle], [data-artwork-rotate]')) return;
      if (targetType === 'artwork') {
        // Select this overlay by its ID
        const overlayId = Number(target.dataset.overlayId);
        if (overlayId && overlayId !== scene.activeOverlayId) {
          selectArtworkOverlay(overlayId);
        }
        artworkSelected = true;
        baseSelected = false;
        render();
        // If locked, allow selection but not dragging
        const activeOv = Core.getActiveOverlay(scene);
        if (activeOv?.locked) return;
      }
      const rect = element.artboard.getBoundingClientRect();
      const active = targetType === 'artwork' ? Core.getActiveOverlay(scene) : scene.logo;
      if (!active) return;
      dragging = { pointerId: event.pointerId, rect, startX: event.clientX, startY: event.clientY, x: active.x, y: active.y };
      target.setPointerCapture(event.pointerId);
      target.classList.add('dragging');
      event.preventDefault();
    });
    target.addEventListener('pointermove', (event) => {
      if (!dragging || dragging.pointerId !== event.pointerId) return;
      const x = dragging.x + ((event.clientX - dragging.startX) / dragging.rect.width) * 100;
      const y = dragging.y + ((event.clientY - dragging.startY) / dragging.rect.height) * 100;
      if (targetType === 'artwork') scene = Core.moveOverlay(scene, { x, y });
      else scene = Core.setLogo(scene, { x, y });
      markDirty();
      render();
    });
    const stop = (event) => {
      if (!dragging || dragging.pointerId !== event.pointerId) return;
      dragging = null;
      target.classList.remove('dragging');
      if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    };
    target.addEventListener('pointerup', stop);
    target.addEventListener('pointercancel', stop);
  }

  function attachArtworkTransform() {
    let transforming = null;
    const artboardPoint = (event, rect) => ({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    const overlayCenter = (rect) => {
      const overlay = Core.getActiveOverlay(scene);
      return { x: rect.width * overlay.x / 100, y: rect.height * overlay.y / 100 };
    };
    const selectArtwork = () => {
      artworkSelected = true;
      baseSelected = false;
      render();
    };

    element.artworkHandles.forEach((handle) => {
      handle.addEventListener('pointerdown', (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        if (brushState.active) return;
        const activeOv = Core.getActiveOverlay(scene);
        if (activeOv?.locked) return; // locked — no resize
        event.stopPropagation();
        selectArtwork();
        const rect = element.artboard.getBoundingClientRect();
        const point = artboardPoint(event, rect);
        const center = overlayCenter(rect);
        transforming = {
          type: 'resize',
          pointerId: event.pointerId,
          rect,
          center,
          startDistance: Math.max(12, Math.hypot(point.x - center.x, point.y - center.y)),
          scale: Core.getActiveOverlay(scene).scale,
        };
        handle.setPointerCapture(event.pointerId);
        event.preventDefault();
      });
      handle.addEventListener('pointermove', (event) => {
        if (!transforming || transforming.type !== 'resize' || transforming.pointerId !== event.pointerId) return;
        const point = artboardPoint(event, transforming.rect);
        const distance = Math.max(12, Math.hypot(point.x - transforming.center.x, point.y - transforming.center.y));
        resizeArtwork(transforming.scale * distance / transforming.startDistance);
      });
      const stopResize = (event) => {
        if (!transforming || transforming.type !== 'resize' || transforming.pointerId !== event.pointerId) return;
        transforming = null;
        if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      };
      handle.addEventListener('pointerup', stopResize);
      handle.addEventListener('pointercancel', stopResize);
    });

    element.artworkRotate.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (brushState.active) return;
      const activeOv = Core.getActiveOverlay(scene);
      if (activeOv?.locked) return; // locked — no rotate
      event.stopPropagation();
      selectArtwork();
      const rect = element.artboard.getBoundingClientRect();
      const center = overlayCenter(rect);
      const point = artboardPoint(event, rect);
      transforming = {
        type: 'rotate',
        pointerId: event.pointerId,
        rect,
        center,
        startAngle: Math.atan2(point.y - center.y, point.x - center.x),
        rotation: Core.getActiveOverlay(scene).rotation,
      };
      element.artworkRotate.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    element.artworkRotate.addEventListener('pointermove', (event) => {
      if (!transforming || transforming.type !== 'rotate' || transforming.pointerId !== event.pointerId) return;
      const point = artboardPoint(event, transforming.rect);
      const angle = Math.atan2(point.y - transforming.center.y, point.x - transforming.center.x);
      rotateArtwork(transforming.rotation + (angle - transforming.startAngle) * 180 / Math.PI);
    });
    const stopRotate = (event) => {
      if (!transforming || transforming.type !== 'rotate' || transforming.pointerId !== event.pointerId) return;
      transforming = null;
      if (element.artworkRotate.hasPointerCapture(event.pointerId)) element.artworkRotate.releasePointerCapture(event.pointerId);
    };
    element.artworkRotate.addEventListener('pointerup', stopRotate);
    element.artworkRotate.addEventListener('pointercancel', stopRotate);
  }

  function attachSafeAreaDrag() {
    let dragging = null;
    element.safeArea.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      const rect = element.artboard.getBoundingClientRect();
      dragging = { pointerId: event.pointerId, rect, startX: event.clientX, startY: event.clientY, x: scene.safeArea.x, y: scene.safeArea.y };
      element.safeArea.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    element.safeArea.addEventListener('pointermove', (event) => {
      if (!dragging || dragging.pointerId !== event.pointerId) return;
      const x = dragging.x + ((event.clientX - dragging.startX) / dragging.rect.width) * 100;
      const y = dragging.y + ((event.clientY - dragging.startY) / dragging.rect.height) * 100;
      scene = Core.setSafeArea(scene, { ...scene.safeArea, x, y });
      markDirty();
      render();
    });
    const stop = (event) => {
      if (!dragging || dragging.pointerId !== event.pointerId) return;
      dragging = null;
      if (element.safeArea.hasPointerCapture(event.pointerId)) element.safeArea.releasePointerCapture(event.pointerId);
    };
    element.safeArea.addEventListener('pointerup', stop);
    element.safeArea.addEventListener('pointercancel', stop);
  }

  function attachBaseResize() {
    let resizing = null;
    let moving = null;

    const selectBase = () => {
      if (baseLocked) return; // locked — don't show resize handles
      baseSelected = true;
      artworkSelected = false;
      setStatus('Kéo một góc để căn chỉnh tỉ lệ phôi');
      render();
    };

    element.artboard.addEventListener('click', (event) => {
      if (event.target.closest('.artwork-overlay, .logo-overlay, .base-selection')) return;
      if (event.target === element.baseImage && element.baseImage.dataset.moved === 'true') {
        element.baseImage.dataset.moved = 'false';
        return;
      }
      selectBase();
    });

    element.baseImage.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (brushState.active) return;
      if (baseLocked) return; // locked — no drag
      const rect = element.artboard.getBoundingClientRect();
      moving = {
        pointerId: event.pointerId,
        rect,
        startX: event.clientX,
        startY: event.clientY,
        x: scene.baseTransform.x,
        y: scene.baseTransform.y,
        moved: false,
      };
      element.baseImage.setPointerCapture(event.pointerId);
      baseSelected = true;
      event.preventDefault();
    });

    element.baseImage.addEventListener('pointermove', (event) => {
      if (!moving || moving.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - moving.startX;
      const deltaY = event.clientY - moving.startY;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) moving.moved = true;
      if (!moving.moved) return;
      scene = Core.setBaseTransform(scene, {
        x: moving.x + deltaX / moving.rect.width * 100,
        y: moving.y + deltaY / moving.rect.height * 100,
      });
      markDirty();
      render();
    });

    const stopBaseMove = (event) => {
      if (!moving || moving.pointerId !== event.pointerId) return;
      if (element.baseImage.hasPointerCapture(event.pointerId)) element.baseImage.releasePointerCapture(event.pointerId);
      const didMove = moving.moved;
      moving = null;
      if (!didMove) return;
      element.baseImage.dataset.moved = 'true';
      setMessage(element.baseMessage, 'Đã đặt vị trí phôi. Kéo góc để đổi tỷ lệ.', 'success');
      setStatus('Đã đặt vị trí phôi');
    };
    element.baseImage.addEventListener('pointerup', stopBaseMove);
    element.baseImage.addEventListener('pointercancel', stopBaseMove);

    element.baseHandles.forEach((handle) => {
      handle.addEventListener('pointerdown', (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        if (baseLocked) return; // locked — no resize
        const rect = element.artboard.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.max(1, Math.hypot(event.clientX - centerX, event.clientY - centerY));
        resizing = { pointerId: event.pointerId, centerX, centerY, distance, scale: scene.baseTransform.scale };
        handle.setPointerCapture(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
      });

      handle.addEventListener('pointermove', (event) => {
        if (!resizing || resizing.pointerId !== event.pointerId) return;
        const distance = Math.max(1, Math.hypot(event.clientX - resizing.centerX, event.clientY - resizing.centerY));
        scene = Core.setBaseTransform(scene, { scale: resizing.scale * distance / resizing.distance });
        markDirty();
        render();
      });

      const stop = (event) => {
        if (!resizing || resizing.pointerId !== event.pointerId) return;
        if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
        resizing = null;
        setMessage(element.baseMessage, `Đã căn chỉnh tỷ lệ phôi ${Math.round(scene.baseTransform.scale * 100)}%.`, 'success');
        setStatus('Đã căn chỉnh tỷ lệ phôi');
      };
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
    });
  }

  function attachDropZones() {
    $$('[data-drop-target]').forEach((zone) => {
      const kind = zone.dataset.dropTarget;
      ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (event) => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
        zone.classList.add('drop-active');
      }));
      ['dragleave', 'drop'].forEach((type) => zone.addEventListener(type, (event) => {
        event.preventDefault();
        zone.classList.remove('drop-active');
      }));
      zone.addEventListener('drop', (event) => {
        const [file] = event.dataTransfer?.files || [];
        if (file) uploadImage(file, kind);
      });
    });
  }

  function drawPresetBackground(context, width, height, preset) {
    const gradients = {
      linen: ['#c9c4bc', '#d9d3ca', '#b9b3ac'],
      coast: ['#a9c8c2', '#d6e2d2', '#ead4bb'],
      studio: ['#e5e7e3', '#a5aca5', '#2e3832'],
      // Nền clean — gradient dịu, sạch, làm nổi bật chủ thể.
      snow: ['#ffffff', '#f6f7f8', '#e9ebec'],
      pearl: ['#f4f5f7', '#e8eaed', '#d5d9de'],
      blush: ['#fbeef0', '#f7e2e6', '#eecdd6'],
      sage: ['#eef3ec', '#e0ebe0', '#cbdcc9'],
      slate: ['#5c6b74', '#43525c', '#2c3941'],
    };
    // Nền "clean": dùng vignette mềm ở giữa thay cho vệt nắng chói.
    const cleanPresets = new Set(['snow', 'pearl', 'blush', 'sage', 'slate']);
    const colors = gradients[preset] || gradients.linen;
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(.52, colors[1]);
    gradient.addColorStop(1, colors[2]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    if (cleanPresets.has(preset)) {
      // Vignette radial nhẹ: sáng ở giữa (nơi đặt model), tối dần ra rìa.
      const isDark = preset === 'slate';
      const radial = context.createRadialGradient(
        width * .5, height * .42, Math.min(width, height) * .1,
        width * .5, height * .5, Math.max(width, height) * .72,
      );
      radial.addColorStop(0, isDark ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.28)');
      radial.addColorStop(1, isDark ? 'rgba(0,0,0,.22)' : 'rgba(0,0,0,.05)');
      context.fillStyle = radial;
      context.fillRect(0, 0, width, height);
    } else if (preset !== 'studio') {
      context.fillStyle = 'rgba(255,247,222,.42)';
      context.beginPath();
      context.arc(width * .94, height * .16, width * .25, 0, Math.PI * 2);
      context.fill();
    }
  }

  function drawImageCover(context, image, width, height) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  }

  function drawImageContain(context, image, width, height, presentation = {}) {
    const presentationScale = typeof presentation === 'number' ? presentation : presentation.scale;
    const positionX = Number.isFinite(Number(presentation.x)) ? Number(presentation.x) : 50;
    const positionY = Number.isFinite(Number(presentation.y)) ? Number(presentation.y) : 50;
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale * (Number(presentationScale) || 1);
    const drawHeight = image.naturalHeight * scale * (Number(presentationScale) || 1);
    context.drawImage(image, width * positionX / 100 - drawWidth / 2, height * positionY / 100 - drawHeight / 2, drawWidth, drawHeight);
  }

  function drawDefaultArtwork(context, size, kind, label) {
    const height = size / 1.19;
    const points = [[-.43, -.32], [0, -.5], [.45, -.31], [.35, .39], [-.22, .5], [-.5, .26]];
    context.beginPath();
    points.forEach(([x, y], index) => index ? context.lineTo(x * size, y * height) : context.moveTo(x * size, y * height));
    context.closePath();
    context.save();
    context.clip();
    context.fillStyle = kind === 'embroidery' ? '#245244' : '#c54a2e';
    context.fillRect(-size / 2, -height / 2, size, height);
    context.strokeStyle = kind === 'embroidery' ? 'rgba(216,234,222,.75)' : 'rgba(255,225,189,.8)';
    context.lineWidth = Math.max(2, size * .025);
    for (let point = -size; point < size * 1.5; point += size * .13) {
      context.beginPath();
      context.moveTo(point, height / 2);
      context.lineTo(point + height * .65, -height / 2);
      context.stroke();
    }
    context.restore();
    context.fillStyle = '#fce8c6';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `800 ${Math.max(16, size * .105)}px ui-monospace, monospace`;
    context.fillText(label, 0, 0, size * .85);
  }

  async function drawArtworkWithFabric(context, baseImage, width, height, overlay) {
    const artworkLayer = document.createElement('canvas');
    artworkLayer.width = width;
    artworkLayer.height = height;
    const artworkContext = artworkLayer.getContext('2d');
    const overlaySize = width * .205 * overlay.scale;
    artworkContext.imageSmoothingEnabled = true;
    artworkContext.imageSmoothingQuality = 'high';
    artworkContext.save();
    artworkContext.translate(width * overlay.x / 100, height * overlay.y / 100);
    artworkContext.rotate(overlay.rotation * Math.PI / 180);
    artworkContext.globalAlpha = overlay.opacity;
    if (overlay.kind === 'embroidery') {
      artworkContext.shadowColor = 'rgba(35,35,30,.28)';
      artworkContext.shadowBlur = overlaySize * .022;
      artworkContext.shadowOffsetY = overlaySize * .012;
    }
    let artworkHeight = overlaySize / 1.19;
    if (overlay.artwork?.src) {
      const artwork = await loadImage(overlay.artwork.src);
      artworkHeight = overlaySize * artwork.naturalHeight / artwork.naturalWidth;
      artworkContext.drawImage(artwork, -overlaySize / 2, -artworkHeight / 2, overlaySize, artworkHeight);
    } else {
      drawDefaultArtwork(artworkContext, overlaySize, overlay.kind, overlay.artwork?.label || 'ROUGE / 07');
    }
    artworkContext.restore();

    if (FabricEngine?.warpArtworkLayer) {
      const fabricCanvas = document.createElement('canvas');
      fabricCanvas.width = width;
      fabricCanvas.height = height;
      const fabricContext = fabricCanvas.getContext('2d', { willReadFrequently: true });
      drawImageContain(fabricContext, baseImage, width, height, scene.baseTransform);
      const angle = overlay.rotation * Math.PI / 180;
      const halfWidth = Math.abs(Math.cos(angle) * overlaySize / 2) + Math.abs(Math.sin(angle) * artworkHeight / 2) + 14;
      const halfHeight = Math.abs(Math.sin(angle) * overlaySize / 2) + Math.abs(Math.cos(angle) * artworkHeight / 2) + 14;
      const centerX = width * overlay.x / 100;
      const centerY = height * overlay.y / 100;
      const bounds = {
        x: Math.max(0, Math.floor(centerX - halfWidth)),
        y: Math.max(0, Math.floor(centerY - halfHeight)),
        width: Math.min(width, Math.ceil(centerX + halfWidth)) - Math.max(0, Math.floor(centerX - halfWidth)),
        height: Math.min(height, Math.ceil(centerY + halfHeight)) - Math.max(0, Math.floor(centerY - halfHeight)),
      };
      FabricEngine.warpArtworkLayer(artworkContext, fabricContext, bounds, {
        strength: blendParams.dispStrength / 8 * (overlay.kind === 'embroidery' ? 1.15 : 0.85),
        emboss: blendParams.emboss,
        edgeBlend: blendParams.edgeBlend,
      });
    }

    // Cloth grain pass — preserve fine texture after the fold warp
    const grainAlpha = typeof blendParams.grain === 'number' ? blendParams.grain : 0;
    if (grainAlpha > 0) {
      artworkContext.save();
      artworkContext.globalCompositeOperation = 'source-atop';
      artworkContext.globalAlpha = grainAlpha;
      drawImageContain(artworkContext, baseImage, width, height, scene.baseTransform);
      artworkContext.restore();
    }

    context.save();
    context.globalCompositeOperation = 'source-over';
    context.drawImage(artworkLayer, 0, 0);
    context.restore();
  }

  // ─── Live fabric preview ────────────────────────────────────────────────────
  // Pixel-level blend: displacement → emboss → overlay color → blur/contrast → edge blend
  // Same algorithm as garment-blend.html, runs on artboard display resolution.

  let fabricPreviewCanvas = null;
  let fabricPreviewCtx = null;
  let fabricPreviewPending = false;
  let fabricPreviewAbort = 0;
  let garmentDispCache = null; // { src, dispMap: {dx,dy,lum,W,H} }

  // ─── Mask canvas ──────────────────────────────────────────────────────────
  // Stores brush strokes as alpha: white=fully visible, black/transparent=erased.
  // Separate from fabricPreviewCanvas — never cleared by runFabricPreview.
  // maskOverlayCanvas: red tint showing erased areas when brush is active.

  let maskCanvas = null;
  let maskCtx = null;

  // ── Undo/redo stacks (each entry is an ImageData snapshot of maskCanvas)
  const maskUndoStack = [];
  const maskRedoStack = [];
  const MASK_UNDO_LIMIT = 30;

  function saveMaskSnapshot() {
    if (!maskCtx) return;
    const snap = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    maskUndoStack.push(snap);
    if (maskUndoStack.length > MASK_UNDO_LIMIT) maskUndoStack.shift();
    maskRedoStack.length = 0; // clear redo on new stroke
    updateUndoRedoUI();
  }

  function undoMask() {
    if (maskUndoStack.length === 0 || !maskCtx) return;
    // Save current state to redo
    maskRedoStack.push(maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
    const snap = maskUndoStack.pop();
    maskCtx.putImageData(snap, 0, 0);
    updateMaskOverlay();
    scheduleFabricPreview();
    updateUndoRedoUI();
    markDirty();
  }

  function redoMask() {
    if (maskRedoStack.length === 0 || !maskCtx) return;
    maskUndoStack.push(maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
    const snap = maskRedoStack.pop();
    maskCtx.putImageData(snap, 0, 0);
    updateMaskOverlay();
    scheduleFabricPreview();
    updateUndoRedoUI();
    markDirty();
  }

  function updateUndoRedoUI() {
    if (element.brushUndo) element.brushUndo.disabled = maskUndoStack.length === 0;
    if (element.brushRedo) element.brushRedo.disabled = maskRedoStack.length === 0;
  }

  function ensureMaskCanvas(W, H) {
    if (!maskCanvas) {
      maskCanvas = document.createElement('canvas');
      maskCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;display:none';
      element.artboard.appendChild(maskCanvas);
      maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
      maskCanvas.width = W;
      maskCanvas.height = H;
      maskCtx.fillStyle = '#fff';
      maskCtx.fillRect(0, 0, W, H);
    } else if (maskCanvas.width !== W || maskCanvas.height !== H) {
      // Resize: scale existing mask to new dimensions preserving alpha channel.
      // 1. Snapshot old mask at its current size
      const tmp = document.createElement('canvas');
      tmp.width = maskCanvas.width; tmp.height = maskCanvas.height;
      tmp.getContext('2d').drawImage(maskCanvas, 0, 0);
      // 2. Resize mask canvas (clears to transparent)
      maskCanvas.width = W;
      maskCanvas.height = H;
      // 3. Fill with opaque white (pristine = show everything)
      maskCtx.fillStyle = '#fff';
      maskCtx.fillRect(0, 0, W, H);
      // 4. Draw old mask onto new canvas using 'copy' composite so alpha is
      //    transferred exactly, not blended with the white background
      maskCtx.globalCompositeOperation = 'copy';
      maskCtx.drawImage(tmp, 0, 0, W, H);
      maskCtx.globalCompositeOperation = 'source-over';
    }
  }

  function updateMaskOverlay() { /* removed — no overlay canvas */ }
  function showMaskOverlay() { /* removed */ }

  function resetMask() {
    if (!maskCanvas) return;
    maskCtx.fillStyle = '#fff';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    scheduleFabricPreview();
  }

  function destroyMask() {
    if (maskCanvas) { maskCanvas.remove(); maskCanvas = null; maskCtx = null; }
  }

  // ── Pending mask blob: set during workspace restore, consumed by runFabricPreview
  let pendingMaskBlob = null;

  // ── Export mask as PNG blob for persistence
  function getMaskBlob() {
    if (!maskCanvas || !maskCtx) return Promise.resolve(null);
    // Check if mask is pristine (all white = no strokes) — skip saving
    const data = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    let pristine = true;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 255) { pristine = false; break; }
    }
    if (pristine) return Promise.resolve(null);
    return new Promise(resolve => {
      maskCanvas.toBlob(blob => resolve(blob), 'image/png');
    });
  }

  // ── Restore mask from a saved PNG blob
  async function restoreMaskFromBlob(blob, width, height, { skipSchedule = false } = {}) {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
      ensureMaskCanvas(width || img.naturalWidth, height || img.naturalHeight);
      // Use 'copy' composite to replace mask content exactly, preserving alpha
      maskCtx.globalCompositeOperation = 'copy';
      maskCtx.drawImage(img, 0, 0, maskCanvas.width, maskCanvas.height);
      maskCtx.globalCompositeOperation = 'source-over';
      if (!skipSchedule) scheduleFabricPreview();
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function ensureFabricPreviewCanvas() {
    if (fabricPreviewCanvas) return;
    fabricPreviewCanvas = document.createElement('canvas');
    fabricPreviewCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:4';
    element.artboard.appendChild(fabricPreviewCanvas);
    fabricPreviewCtx = fabricPreviewCanvas.getContext('2d');
  }

  function clearFabricPreview() {
    if (!fabricPreviewCanvas) return;
    fabricPreviewCtx.clearRect(0, 0, fabricPreviewCanvas.width, fabricPreviewCanvas.height);
    element.artworkImage.style.visibility = '';
    element.artworkOverlay.querySelector('.artwork-default').style.visibility = '';
  }

  function scheduleFabricPreview() {
    if (fabricPreviewPending) return;
    fabricPreviewPending = true;
    requestAnimationFrame(runFabricPreview);
  }

  // Build Sobel displacement map from garment luminance (same as garment-blend.html)
  function buildDispMap(garmentCanvas) {
    const W = garmentCanvas.width, H = garmentCanvas.height;
    const tmpCtx = garmentCanvas.getContext('2d', { willReadFrequently: true });
    const idata = tmpCtx.getImageData(0, 0, W, H);
    const d = idata.data;
    const lum = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) {
      lum[i] = (0.299 * d[i*4] + 0.587 * d[i*4+1] + 0.114 * d[i*4+2]) / 255;
    }
    const dxArr = new Float32Array(W * H);
    const dyArr = new Float32Array(W * H);
    const gradMag = new Float32Array(W * H); // normalized 0..1 fold intensity
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const idx = y * W + x;
        const gx = (
          -lum[(y-1)*W+(x-1)] + lum[(y-1)*W+(x+1)]
          -2*lum[y*W+(x-1)]   + 2*lum[y*W+(x+1)]
          -lum[(y+1)*W+(x-1)] + lum[(y+1)*W+(x+1)]
        ) / 4;
        const gy = (
          -lum[(y-1)*W+(x-1)] - 2*lum[(y-1)*W+x] - lum[(y-1)*W+(x+1)]
          +lum[(y+1)*W+(x-1)] + 2*lum[(y+1)*W+x] + lum[(y+1)*W+(x+1)]
        ) / 4;
        dxArr[idx] = gx;
        dyArr[idx] = gy;
        gradMag[idx] = Math.min(1, Math.hypot(gx, gy) * 8); // 0=flat, 1=strong fold
      }
    }
    return { dx: dxArr, dy: dyArr, lum, gradMag, W, H };
  }

  async function runFabricPreview() {
    fabricPreviewPending = false;
    const overlay = Core.getActiveOverlay(scene);
    const artworkSrc = overlay?.artwork?.src;

    if (!artworkSrc || scene.base.kind === 'default') { clearFabricPreview(); return; }

    ensureFabricPreviewCanvas();

    const abortId = ++fabricPreviewAbort;
    const artboard = element.artboard;
    const W = artboard.clientWidth;
    const H = artboard.clientHeight;
    if (W < 2 || H < 2) return;

    // Always sync canvas pixel buffer to artboard display size.
    // Skipping the !== check matters: after a window resize or initial
    // layout reflow the artboard may have a different size than the
    // previous render even though the integer values happened to match
    // a stale cached state.  An incorrect canvas size causes the artwork
    // to appear stretched / squished until the next interaction triggers
    // a fresh render.
    if (fabricPreviewCanvas.width !== W || fabricPreviewCanvas.height !== H) {
      fabricPreviewCanvas.width = W;
      fabricPreviewCanvas.height = H;
      // Invalidate garment displacement cache — it was built at the old size.
      garmentDispCache = null;
    }

    try {
      const [baseImg, artImg] = await Promise.all([loadImage(scene.base.src), loadImage(artworkSrc)]);
      if (abortId !== fabricPreviewAbort) return;

      // ── 1. Draw garment to offscreen canvas at display size
      const garmentCanvas = document.createElement('canvas');
      garmentCanvas.width = W; garmentCanvas.height = H;
      const garmentCtx = garmentCanvas.getContext('2d', { willReadFrequently: true });
      drawImageContain(garmentCtx, baseImg, W, H, scene.baseTransform);

      // ── 2. Build or reuse displacement map (keyed on base src + display size)
      const dispKey = scene.base.src + W + H;
      if (!garmentDispCache || garmentDispCache.key !== dispKey) {
        garmentDispCache = { key: dispKey, dispMap: buildDispMap(garmentCanvas) };
      }
      const { dx, dy, lum, gradMag } = garmentDispCache.dispMap;

      // ── 3. Compute artwork placement in display coords
      const overlaySize = W * 0.205 * overlay.scale;
      const artH = overlaySize * artImg.naturalHeight / artImg.naturalWidth;
      const cx = W * overlay.x / 100;
      const cy = H * overlay.y / 100;
      const angle = overlay.rotation * Math.PI / 180;
      const cosA = Math.cos(angle), sinA = Math.sin(angle);

      // Bounding box of artwork in display coords
      const halfW = Math.abs(cosA * overlaySize / 2) + Math.abs(sinA * artH / 2) + 2;
      const halfH2 = Math.abs(sinA * overlaySize / 2) + Math.abs(cosA * artH / 2) + 2;
      const artX = Math.round(cx - halfW);
      const artY = Math.round(cy - halfH2);
      const bW = Math.round(halfW * 2);
      const bH = Math.round(halfH2 * 2);

      // ── 4. Rasterise artwork into a small canvas at exact bounding box
      const artCanvas = document.createElement('canvas');
      artCanvas.width = bW; artCanvas.height = bH;
      const artCtx = artCanvas.getContext('2d', { willReadFrequently: true });
      artCtx.save();
      artCtx.translate(bW / 2, bH / 2);
      artCtx.rotate(angle);
      artCtx.drawImage(artImg, -overlaySize / 2, -artH / 2, overlaySize, artH);
      artCtx.restore();

      // ── 5. Displacement + fold-aware emboss per pixel
      const artData = artCtx.getImageData(0, 0, bW, bH);
      const srcD = new Uint8ClampedArray(artData.data); // copy source
      const dstD = artData.data;
      const strength = blendParams.dispStrength;
      const emboss = blendParams.emboss;

      for (let py = 0; py < bH; py++) {
        for (let px = 0; px < bW; px++) {
          const gx = artX + px;
          const gy = artY + py;
          const dIdx = (py * bW + px) * 4;

          if (gx < 0 || gx >= W || gy < 0 || gy >= H) continue;
          const gIdx = gy * W + gx;

          // ── Displacement: warp source sample by fabric gradient
          const offX = Math.round(dx[gIdx] * strength);
          const offY = Math.round(dy[gIdx] * strength);
          const sx = Math.max(0, Math.min(bW - 1, px - offX));
          const sy = Math.max(0, Math.min(bH - 1, py - offY));
          const sIdx = (sy * bW + sx) * 4;

          dstD[dIdx]   = srcD[sIdx];
          dstD[dIdx+1] = srcD[sIdx+1];
          dstD[dIdx+2] = srcD[sIdx+2];
          dstD[dIdx+3] = srcD[sIdx+3];

          if (dstD[dIdx+3] < 4) continue; // transparent pixel — skip

          // ── Fold intensity at this pixel (0 = flat fabric, 1 = deep fold)
          const fold = gradMag[gIdx]; // 0..1

          // ── Emboss: darken/lighten ONLY proportional to fold depth
          // At fold=0 (flat), factor=1 → no change.
          // At fold=1 (deep fold), factor varies with lum.
          if (emboss > 0 && fold > 0.01) {
            const gLum = lum[gIdx];
            // deviation from mid-grey, weighted by fold depth
            const deviation = (gLum - 0.5) * fold * emboss * 1.4;
            const factor = 1 + deviation;
            dstD[dIdx]   = Math.min(255, Math.max(0, dstD[dIdx]   * factor));
            dstD[dIdx+1] = Math.min(255, Math.max(0, dstD[dIdx+1] * factor));
            dstD[dIdx+2] = Math.min(255, Math.max(0, dstD[dIdx+2] * factor));
            // Also fade alpha at deep dark folds (artwork dips into crease)
            if (gLum < 0.35) {
              const fadeAmount = (0.35 - gLum) / 0.35 * fold * emboss;
              dstD[dIdx+3] = Math.round(dstD[dIdx+3] * (1 - fadeAmount * 0.7));
            }
          }
        }
      }
      artCtx.putImageData(artData, 0, 0);

      // ── 6. Overlay color tint
      if (blendParams.overlayColor !== 'none') {
        artCtx.globalCompositeOperation = 'multiply';
        artCtx.fillStyle = blendParams.overlayColor;
        artCtx.fillRect(0, 0, bW, bH);
        artCtx.globalCompositeOperation = 'source-over';
      }

      // ── 6a. Restore pending mask from saved workspace (once, first preview after restore)
      if (pendingMaskBlob) {
        const blob = pendingMaskBlob;
        pendingMaskBlob = null;
        await restoreMaskFromBlob(blob, W, H, { skipSchedule: true });
        if (abortId !== fabricPreviewAbort) return;
      }

      // ── 6b. Apply brush mask into artCanvas alpha
      if (maskCanvas && maskCanvas.width > 0) {
        // Ensure mask matches current artboard size (handles window resize between sessions)
        if (maskCanvas.width !== W || maskCanvas.height !== H) {
          ensureMaskCanvas(W, H);
        }
        const artImg = artCtx.getImageData(0, 0, bW, bH);
        const ad = artImg.data;
        const maskImg = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const md = maskImg.data;
        const mW = maskCanvas.width, mH = maskCanvas.height;
        for (let py = 0; py < bH; py++) {
          for (let px = 0; px < bW; px++) {
            const dispX = Math.round(artX + px);
            const dispY = Math.round(artY + py);
            if (dispX < 0 || dispX >= mW || dispY < 0 || dispY >= mH) continue;
            const maskAlpha = md[(dispY * mW + dispX) * 4 + 3];
            if (maskAlpha < 255) {
              const ai = (py * bW + px) * 4;
              ad[ai + 3] = Math.round(ad[ai + 3] * maskAlpha / 255);
            }
          }
        }
        artCtx.putImageData(artImg, 0, 0);
      }

      // ── 7. Composite artwork onto preview canvas with blend mode + filter
      const ctx = fabricPreviewCtx;
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      if (blendParams.blurRadius > 0) {
        ctx.filter = `blur(${blendParams.blurRadius}px) contrast(${blendParams.contrast}%)`;
      } else if (blendParams.contrast !== 100) {
        ctx.filter = `contrast(${blendParams.contrast}%)`;
      }
      ctx.globalAlpha = blendParams.opacity;
      ctx.globalCompositeOperation = blendParams.mode;
      ctx.drawImage(artCanvas, artX, artY, bW, bH);
      ctx.restore();

      // ── 8. Edge blend (radial vignette softens artwork edges into fabric)
      if (blendParams.edgeBlend > 0.05) {
        const vCtx = artCtx;
        const vCanvas = document.createElement('canvas');
        vCanvas.width = bW; vCanvas.height = bH;
        const vc = vCanvas.getContext('2d');
        const grd = vc.createRadialGradient(
          bW/2, bH/2, Math.min(bW,bH)*0.3,
          bW/2, bH/2, Math.max(bW,bH)*0.7
        );
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(1, `rgba(0,0,0,${blendParams.edgeBlend * 0.6})`);
        vc.fillStyle = grd;
        vc.fillRect(0, 0, bW, bH);
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.7;
        ctx.drawImage(vCanvas, artX, artY, bW, bH);
        ctx.restore();
      }

      // ── 9. Hide CSS artwork layer, show canvas result
      element.artworkImage.style.visibility = 'hidden';
      element.artworkOverlay.querySelector('.artwork-default').style.visibility = 'hidden';

    } catch {
      clearFabricPreview();
    }
  }

  // ── Live watermark preview (canvas) ──────────────────────────────────────
  let _wmPreviewToken = 0;
  async function renderWatermarkPreview() {
    const canvas = element.watermarkCanvas;
    if (!canvas) return;
    const token = ++_wmPreviewToken;

    // Size the backing store to the artboard's displayed pixels (DPR-aware).
    const rect = element.artboard.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(rect.width * dpr));
    const H = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (!scene.logo.enabled) { ctx.clearRect(0, 0, W, H); return; }

    // Draw to an offscreen buffer first so an in-flight image load can't leave
    // a half-painted frame on screen, then blit only if still the latest render.
    const buffer = document.createElement('canvas');
    buffer.width = W; buffer.height = H;
    await drawWatermark(buffer.getContext('2d'), W, H, scene.logo);
    if (token !== _wmPreviewToken) return; // a newer render superseded us
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(buffer, 0, 0);
  }

  // ── Watermark grid renderer ──────────────────────────────────────────────
  // REFERENCE_WM_WIDTH: chiều rộng canvas tham chiếu (px) mà textSize/logoSizePx được
  // thiết kế cho. Khi canvas lớn hơn (export 4096px), kích thước được scale tỷ lệ.
  const REFERENCE_WM_WIDTH = 400;

  // Đảm bảo web font đã sẵn sàng trước khi vẽ lên canvas. Nếu không, lúc reload
  // canvas vẽ text bằng font fallback → chữ bị méo/sai hình dạng cho tới lần
  // render kế tiếp. Ngoài document.fonts.load, còn vẽ thử chuỗi thật vào một
  // canvas nháp để ép Chromium rasterize glyph của font (kể cả font local).
  const _fontProbeCanvas = document.createElement('canvas').getContext('2d');
  async function ensureFont(fontStr, sampleText = 'QH Clothes© FORM') {
    if (document.fonts?.load) {
      try {
        await document.fonts.load(fontStr, sampleText);
        await document.fonts.ready;
      } catch {}
    }
    // Chạm glyph: buộc trình duyệt nạp/rasterize font trước lần vẽ thật.
    try {
      _fontProbeCanvas.font = fontStr;
      _fontProbeCanvas.fillText(sampleText, -9999, -9999);
    } catch {}
  }

  async function drawWatermark(ctx, W, H, logo) {
    const logoImgEl = logo.src ? await loadImage(logo.src) : null;
    // k: hệ số scale từ reference width → canvas thực. Đảm bảo watermark
    // xuất hiện cùng tỷ lệ trên mọi canvas (preview nhỏ lẫn export 4096px).
    const k = W / REFERENCE_WM_WIDTH;
    const ts = Math.max(1, (logo.textSize || 32) * k);
    const ls = Math.max(1, (logo.logoSizePx || 80) * k);
    const fontStr = `${logo.textStyle || 'normal'} ${ts}px "${logo.textFont || 'Arial'}", sans-serif`;
    const wmType = logo.wmType || 'logo';

    // Nạp sẵn font trước khi vẽ bất kỳ text watermark nào (single lẫn grid).
    if (wmType === 'text' || wmType === 'both' || (wmType === 'logo' && !logoImgEl)) {
      const sample = (logo.textContent || '© FORM') + (logo.name || 'FORM');
      await ensureFont(fontStr, sample);
    }

    // ── GRID LINES (drawn before watermarks, on the base alpha) ──
    if (logo.mode === 'grid' && logo.showGridLines) {
      ctx.save();
      ctx.globalAlpha = logo.gridLineOpacity != null ? logo.gridLineOpacity : 0.2;
      ctx.strokeStyle = logo.gridLineColor || '#ffffff';
      ctx.lineWidth = (logo.gridLineWidth || 1) * k;
      if (logo.gridLineStyle === 'dashed') ctx.setLineDash([8 * k, 8 * k]);
      else if (logo.gridLineStyle === 'dotted') ctx.setLineDash([2 * k, 6 * k]);
      else ctx.setLineDash([]);
      const cols = logo.gridCols || 4, rows = logo.gridRows || 4;
      const cellW = W / cols, cellH = H / rows;
      for (let c = 1; c < cols; c++) { ctx.beginPath(); ctx.moveTo(c * cellW, 0); ctx.lineTo(c * cellW, H); ctx.stroke(); }
      for (let r = 1; r < rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * cellH); ctx.lineTo(W, r * cellH); ctx.stroke(); }
      ctx.restore();
    }

    // ── WATERMARK ──
    ctx.save();
    ctx.globalAlpha = logo.opacity;
    ctx.globalCompositeOperation = logo.blendMode || 'source-over';

    // Draw one watermark item centered at (cx, cy). Rotation applied by caller when needed.
    const drawSingle = (cx, cy) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((logo.rotation || 0) * Math.PI / 180);

      const showText = wmType === 'text' || wmType === 'both';
      const showLogo = (wmType === 'logo' || wmType === 'both') && logoImgEl;

      if (showText) {
        ctx.font = fontStr;
        ctx.fillStyle = logo.textColor || '#ffffff';
        if ((logo.shadowBlur || 0) > 0) {
          ctx.shadowBlur = logo.shadowBlur * k;
          ctx.shadowColor = logo.shadowColor || '#000000';
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(logo.textContent || '© FORM', 0, (wmType === 'both' && logoImgEl) ? ts * 0.7 : 0);
        ctx.shadowBlur = 0;
      } else if (wmType === 'logo' && !logoImgEl) {
        // fallback text when 'logo' selected but none uploaded
        ctx.font = fontStr;
        ctx.fillStyle = logo.textColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(logo.name || 'FORM', 0, 0);
      }

      if (showLogo) {
        const offsetY = (wmType === 'both') ? -ls * 0.55 : 0;
        ctx.drawImage(logoImgEl, -ls / 2, -ls / 2 + offsetY, ls, ls);
      }

      ctx.restore();
    };

    if (logo.mode === 'grid') {
      const cols = logo.gridCols || 4, rows = logo.gridRows || 4;
      const cellW = W / cols, cellH = H / rows;
      const extraSpH = (logo.spacingH || 0) * k;
      const extraSpV = (logo.spacingV || 0) * k;
      const sCellW = cellW + extraSpH;
      const sCellH = cellH + extraSpV;
      const pattern = logo.gridType || 'diagonal';

      if (pattern === 'diagonal') {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            drawSingle((c + 0.5) * sCellW - extraSpH * cols / 2, (r + 0.5) * sCellH - extraSpV * rows / 2);
          }
        }
      } else if (pattern === 'straight') {
        ctx.save();
        ctx.translate(W / 2, H / 2);
        for (let r = -rows; r <= rows; r++) {
          for (let c = -cols; c <= cols; c++) {
            drawSingle(c * sCellW, r * sCellH);
          }
        }
        ctx.restore();
      } else if (pattern === 'brick') {
        for (let r = 0; r < rows * 2; r++) {
          const offset = (r % 2 === 1) ? sCellW * 0.5 : 0;
          for (let c = 0; c < cols; c++) {
            const cx = c * sCellW + offset + sCellW * 0.5;
            const cy = r * (sCellH * 0.5) + sCellH * 0.25;
            if (cx < W + sCellW && cy < H + sCellH && cx > -sCellW && cy > -sCellH) drawSingle(cx, cy);
          }
        }
      } else if (pattern === 'radial') {
        const angles = [0, 60, 120, 180, 240, 300];
        const maxR = Math.sqrt(W * W + H * H) / 2;
        const numRings = Math.max(rows, cols);
        const ringStep = maxR / numRings;
        angles.forEach(angleDeg => {
          for (let ring = 0; ring < numRings; ring++) {
            const r = (ring + 0.5) * ringStep;
            const rad = angleDeg * Math.PI / 180;
            drawSingle(W / 2 + r * Math.cos(rad), H / 2 + r * Math.sin(rad));
          }
        });
      } else if (pattern === 'scatter') {
        const lcg = (s) => (s * 1664525 + 1013904223) % 4294967296;
        let s = 42;
        const total = rows * cols;
        for (let i = 0; i < total; i++) {
          s = lcg(s); const nx = s / 4294967296;
          s = lcg(s); const ny = s / 4294967296;
          s = lcg(s); const na = s / 4294967296;
          const cx = nx * W, cy = ny * H;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((na * 120 - 60) * Math.PI / 180);
          ctx.translate(-cx, -cy);
          drawSingle(cx, cy);
          ctx.restore();
        }
      } else if (pattern === 'cross') {
        for (let r = 0; r < rows * 2; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = (c + 0.5) * sCellW;
            const cy = (r + 0.5) * (sCellH * 0.5);
            if (cx < W + sCellW && cy < H + sCellH) {
              drawSingle(cx, cy);
              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(Math.PI / 2);
              ctx.translate(-cx, -cy);
              drawSingle(cx, cy);
              ctx.restore();
            }
          }
        }
      }
    } else {
      // single mode — position by percentage; the single-mode "Tỷ lệ" slider (logo.scale)
      // multiplies the base sizes so that control stays meaningful.
      const mult = logo.scale || 1;
      const singleFont = `${logo.textStyle || 'normal'} ${ts * mult}px "${logo.textFont || 'Arial'}", sans-serif`;
      const cx = W * logo.x / 100, cy = H * logo.y / 100;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((logo.rotation || 0) * Math.PI / 180);
      const showText = wmType === 'text' || wmType === 'both';
      const showLogo = (wmType === 'logo' || wmType === 'both') && logoImgEl;
      const lsm = ls * mult;
      if (showText) {
        ctx.font = singleFont;
        ctx.fillStyle = logo.textColor || '#ffffff';
        if ((logo.shadowBlur || 0) > 0) { ctx.shadowBlur = logo.shadowBlur * k; ctx.shadowColor = logo.shadowColor || '#000000'; }
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(logo.textContent || '© FORM', 0, (wmType === 'both' && logoImgEl) ? ts * mult * 0.7 : 0);
        ctx.shadowBlur = 0;
      } else if (wmType === 'logo' && !logoImgEl) {
        ctx.font = singleFont;
        ctx.fillStyle = logo.textColor || '#ffffff';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(logo.name || 'FORM', 0, 0);
      }
      if (showLogo) {
        const offsetY = (wmType === 'both') ? -lsm * 0.55 : 0;
        ctx.drawImage(logoImgEl, -lsm / 2, -lsm / 2 + offsetY, lsm, lsm);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // Test hook: expose the watermark renderer for automated parity checks.
  if (typeof window !== 'undefined') window.__drawWatermarkTest = drawWatermark;

  const _imageCache = new Map();
  function loadImage(src) {
    const cached = _imageCache.get(src);
    if (cached) return cached;
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => { _imageCache.delete(src); reject(new Error('Không thể nạp ảnh để xuất.')); };
      image.src = src;
    });
    _imageCache.set(src, promise);
    return promise;
  }

  async function exportPng() {
    element.exportButton.disabled = true;
    const { width, height, ratio, scale } = Core.getExportDimensionsScaled(scene, exportParams.scale);
    const isJpg = exportParams.format === 'jpg';
    const fmtLabel = isJpg ? 'JPG' : 'PNG';
    const ratioLabel = ratio === 'square' ? '1:1' : '9:16';
    setStatus(`Đang dựng ${fmtLabel} ${scale}x…`);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { alpha: false });
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      if (scene.background.kind === 'upload') {
        drawImageCover(context, await loadImage(scene.background.src), width, height);
      } else {
        drawPresetBackground(context, width, height, scene.background.value);
      }
      const baseImage = await loadImage(scene.base.src);
      drawImageContain(context, baseImage, width, height, scene.baseTransform);

      // Draw ALL overlays for the current view
      const currentOverlays = Core.getOverlays(scene);
      for (const ov of currentOverlays) {
        await drawArtworkWithFabric(context, baseImage, width, height, ov);
      }

      if (scene.logo.enabled) {
        // Vẽ watermark vào canvas tạm có alpha để blend mode & opacity hoạt động
        // đúng trên mọi loại (single/grid, logo/text/both) trước khi blit lên canvas export.
        const wmBuffer = document.createElement('canvas');
        wmBuffer.width = width;
        wmBuffer.height = height;
        const wmCtx = wmBuffer.getContext('2d');
        await drawWatermark(wmCtx, width, height, scene.logo);
        // Reset composite before blit so wmBuffer pixels are stamped as-is
        context.save();
        context.globalCompositeOperation = 'source-over';
        context.globalAlpha = 1;
        context.drawImage(wmBuffer, 0, 0);
        context.restore();
      }

      const mime = isJpg ? 'image/jpeg' : 'image/png';
      const quality = isJpg ? 0.92 : undefined;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
      if (!blob) throw new Error(`Trình duyệt không thể tạo file ${fmtLabel}.`);
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = Core.getExportFileName(scene, isJpg ? 'jpg' : 'png');
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(href), 1000);
      setStatus(`Bản ${fmtLabel} ${scale}x đã sẵn sàng`);
      showToast(`Đã xuất ${fmtLabel} ${ratioLabel} ${width}×${height}; phôi được giữ nguyên tỉ lệ.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xuất file.';
      setStatus('Không thể xuất ảnh', 'error');
      showToast(message, 'error');
    } finally {
      element.exportButton.disabled = false;
    }
  }

  element.baseFile.addEventListener('change', () => {
    const [file] = element.baseFile.files;
    if (file) uploadImage(file, 'base');
    element.baseFile.value = '';
  });
  element.baseFileTrigger.addEventListener('click', () => element.baseFile.click());
  element.backgroundFile.addEventListener('change', () => {
    const [file] = element.backgroundFile.files;
    if (file) uploadImage(file, 'background');
    element.backgroundFile.value = '';
  });
  element.backgroundFileTrigger.addEventListener('click', () => element.backgroundFile.click());
  element.logoFile.addEventListener('change', () => {
    const [file] = element.logoFile.files;
    if (file) uploadImage(file, 'logo');
    element.logoFile.value = '';
  });
  element.logoFileTrigger.addEventListener('click', () => element.logoFile.click());
  // Track whether next artwork file input should replace vs add
  let _artworkReplaceMode = false;

  element.artworkFile.addEventListener('change', () => {
    const [file] = element.artworkFile.files;
    if (file) {
      if (_artworkReplaceMode) {
        replaceArtworkImage(file);
      } else {
        uploadImage(file, 'artwork');
      }
    }
    element.artworkFile.value = '';
    _artworkReplaceMode = false;
  });
  element.artworkFileTrigger.addEventListener('click', () => {
    _artworkReplaceMode = false;
    element.artworkFile.click();
  });
  element.artworkReplaceTrigger.addEventListener('click', () => {
    _artworkReplaceMode = true;
    element.artworkFile.click();
  });

  async function replaceArtworkImage(file) {
    const activeOverlay = Core.getActiveOverlay(scene);
    if (!activeOverlay) return;
    const target = element.artworkMessage;
    const validation = Core.validateImageFile(file);
    if (!validation.ok) {
      setMessage(target, validation.error, 'error');
      showToast(validation.error, 'error');
      return;
    }
    const revision = invalidatePending('artwork');
    setMessage(target, 'Đang kiểm tra artwork…');
    const url = URL.createObjectURL(file);
    try {
      const dimensions = await decodeImage(url);
      if (revision !== revisions.artwork) { URL.revokeObjectURL(url); return; }
      if (dimensions.width < 24 || dimensions.height < 24) throw new Error('Ảnh quá nhỏ.');
      if (dimensions.width * dimensions.height > 40_000_000) throw new Error('Ảnh vượt 40MP.');
      const metadata = { ...dimensions, size: file.size, type: file.type, fingerprint: await fingerprint(file) };
      if (revision !== revisions.artwork) { URL.revokeObjectURL(url); return; }

      // Tự động khử nền xanh lá / nền đen nếu ảnh có.
      const keyed = await maybeRemoveBackground(file);
      if (revision !== revisions.artwork) {
        URL.revokeObjectURL(url);
        return;
      }
      let artSrc = url;
      let artBlob = file;
      let artName = file.name;
      if (keyed.removed) {
        URL.revokeObjectURL(url);
        artSrc = URL.createObjectURL(keyed.blob);
        artBlob = keyed.blob;
        artName = keyed.name;
      }
      const artLabel = artName.replace(/\.[^/.]+$/, '').slice(0, 18).toUpperCase();
      const artwork = { name: artName, src: artSrc, metadata, label: artLabel };
      scene = Core.updateOverlay(scene, { artwork }, activeOverlay.id);
      // Replace blob/url tracking
      if (artworkUrls[activeOverlay.id] && artworkUrls[activeOverlay.id] !== artSrc) URL.revokeObjectURL(artworkUrls[activeOverlay.id]);
      artworkUrls[activeOverlay.id] = artSrc;
      artworkBlobs[activeOverlay.id] = { blob: artBlob, name: artName, metadata };
      markDirty();
      render();
      setMessage(target, keyed.removed ? `Đã thay ảnh artwork · đã khử nền ${keyed.mode === 'black' ? 'đen' : 'xanh'}.` : 'Đã thay ảnh artwork.', 'success');
      setStatus('Sẵn sàng render');
    } catch (error) {
      URL.revokeObjectURL(url);
      const message = error instanceof Error ? error.message : 'Không thể đọc ảnh.';
      setMessage(target, message, 'error');
      showToast(message, 'error');
    }
  }

  // Khử nền xanh/đen thủ công cho artwork đang chọn (áp cả ảnh cũ từ draft).
  async function applyChromaKeyToActive(mode) {
    const active = Core.getActiveOverlay(scene);
    const label = mode === 'black' ? 'đen' : 'xanh';
    if (!active || !active.artwork?.src) {
      setMessage(element.chromaMessage, 'Chưa có ảnh artwork để khử nền.', 'error');
      return;
    }
    if (!ChromaKey?.processBlob) {
      setMessage(element.chromaMessage, 'Trình duyệt không hỗ trợ khử nền.', 'error');
      return;
    }
    const asset = artworkBlobs[active.id];
    const sourceBlob = asset?.blob;
    if (!sourceBlob) {
      setMessage(element.chromaMessage, 'Không tìm thấy ảnh gốc để khử nền.', 'error');
      return;
    }
    element.artworkChromaKey.disabled = true;
    element.artworkChromaBlack.disabled = true;
    setMessage(element.chromaMessage, `Đang khử nền ${label}…`);
    try {
      // force: ép khử theo màu nền viền dù ngưỡng tự động không đạt.
      const { blob, changed } = await ChromaKey.processBlob(sourceBlob, { mode, force: true });
      if (!changed) {
        setMessage(element.chromaMessage, `Không phát hiện nền ${label} rõ ràng trên ảnh này.`, 'error');
        return;
      }
      const newSrc = URL.createObjectURL(blob);
      const prevSrc = artworkUrls[active.id];
      const newName = (asset.name || 'artwork').replace(/\.[^/.]+$/, '') + '.png';
      const newLabel = newName.replace(/\.[^/.]+$/, '').slice(0, 18).toUpperCase();
      scene = Core.updateOverlay(scene, {
        artwork: { name: newName, src: newSrc, metadata: asset.metadata, label: newLabel },
      }, active.id);
      artworkUrls[active.id] = newSrc;
      artworkBlobs[active.id] = { blob, name: newName, metadata: asset.metadata };
      if (prevSrc && prevSrc !== newSrc) URL.revokeObjectURL(prevSrc);
      // Xoá cache ảnh để preview/warp nạp lại bản mới.
      if (prevSrc) _imageCache.delete(prevSrc);
      markDirty();
      render();
      setMessage(element.chromaMessage, `Đã khử nền ${label} cho artwork.`, 'success');
      showToast(`Đã khử nền ${label} cho artwork đang chọn.`);
    } catch {
      setMessage(element.chromaMessage, `Không thể khử nền ${label} cho ảnh này.`, 'error');
    } finally {
      element.artworkChromaKey.disabled = false;
      element.artworkChromaBlack.disabled = false;
    }
  }
  if (element.artworkChromaKey) {
    element.artworkChromaKey.addEventListener('click', () => applyChromaKeyToActive('green'));
  }
  if (element.artworkChromaBlack) {
    element.artworkChromaBlack.addEventListener('click', () => applyChromaKeyToActive('black'));
  }

  element.baseLockToggle.addEventListener('click', () => {
    baseLocked = !baseLocked;
    if (baseLocked) {
      baseSelected = false;
      showToast('Đã khóa phôi — không thể di chuyển hoặc đổi tỷ lệ.');
    } else {
      showToast('Đã mở khóa phôi — có thể kéo và đổi tỷ lệ.');
    }
    render();
  });

  element.resetBase.addEventListener('click', () => {
    invalidatePending('base');
    if (fileUrls.base) URL.revokeObjectURL(fileUrls.base);
    fileUrls.base = null;
    fileBlobs.base = null;
    garmentDispCache = null;
    destroyMask();
    scene = Core.resetBase(scene);
    baseSelected = false;
    markDirty();
    setMessage(element.baseMessage, 'Đã khôi phục phôi trơn mặc định.', 'success');
    setStatus('Đang dùng phôi mặc định');
    render();
  });

  element.printType.addEventListener('click', () => setArtworkType('print'));
  element.embroideryType.addEventListener('click', () => setArtworkType('embroidery'));
  element.inkOption.addEventListener('click', () => setArtworkType('print'));
  element.threadOption.addEventListener('click', () => setArtworkType('embroidery'));
  element.sizeRange.addEventListener('input', () => resizeArtwork(element.sizeRange.value));
  element.rotationRange.addEventListener('input', () => rotateArtwork(element.rotationRange.value));
  element.opacityRange.addEventListener('input', () => updateArtwork({ opacity: element.opacityRange.value }));
  element.artworkX.addEventListener('change', () => updatePercentField(element.artworkX, (x) => moveArtwork({ x })));
  element.artworkY.addEventListener('change', () => updatePercentField(element.artworkY, (y) => moveArtwork({ y })));

  $$('.swatch').forEach((swatch) => swatch.addEventListener('click', () => {
    const value = swatch.dataset.background;
    invalidatePending('background');
    if (fileUrls.background) URL.revokeObjectURL(fileUrls.background);
    fileUrls.background = null;
    fileBlobs.background = null;
    scene = Core.setBackground(scene, { kind: 'preset', value, name: presetNames[value] });
    markDirty();
    setMessage(element.backgroundMessage, `${presetNames[value]} đang được dùng.`, 'success');
    setStatus('Đã đổi phông nền');
    render();
  }));

  [element.ratioSquare, element.ratioPortrait].forEach((button) => button.addEventListener('click', () => {
    const nextRatio = button === element.ratioSquare ? 'square' : 'portrait';
    if (scene.canvasRatio === nextRatio) return;
    scene = Core.setCanvasRatio(scene, nextRatio);
    markDirty();
    const dimensions = Core.getExportDimensions(scene);
    setMessage(element.backgroundMessage, `Khung nền và PNG xuất đã đổi sang ${nextRatio === 'square' ? '1:1' : '9:16'} · ${dimensions.width}×${dimensions.height}. Hãy hiệu chỉnh lại vùng in theo phôi.`, 'success');
    setStatus(`Đang dùng khung ${nextRatio === 'square' ? '1:1' : '9:16'}`);
    render();
  }));

  element.logoEnabled.addEventListener('change', () => {
    scene = Core.setLogo(scene, { enabled: element.logoEnabled.checked });
    markDirty();
    setStatus(scene.logo.enabled ? 'Đã bật watermark' : 'Đã tắt watermark');
    render();
  });
  element.logoX.addEventListener('change', () => updatePercentField(element.logoX, (x) => { scene = Core.setLogo(scene, { x }); markDirty(); render(); }));
  element.logoY.addEventListener('change', () => updatePercentField(element.logoY, (y) => { scene = Core.setLogo(scene, { y }); markDirty(); render(); }));
  element.logoOpacity.addEventListener('input', () => { scene = Core.setLogo(scene, { opacity: element.logoOpacity.value }); markDirty(); render(); });

  // ── Watermark grid event listeners ─────────────────────────────────────
  // Mode toggle
  [element.wmModeSingle, element.wmModeGrid].forEach(btn => {
    btn.addEventListener('click', () => {
      scene = Core.setLogo(scene, { mode: btn.dataset.mode });
      markDirty(); render();
    });
  });

  // wmType buttons
  [element.wmTypeLogo, element.wmTypeText, element.wmTypeBoth].forEach(btn => {
    btn.addEventListener('click', () => {
      scene = Core.setLogo(scene, { wmType: btn.dataset.wmtype });
      markDirty(); render();
    });
  });

  // Logo size range (maps 2–40 → scale factor: pct/9 / scale-factor mapping)
  if (element.logoSizeRange) {
    element.logoSizeRange.addEventListener('input', () => {
      const px = Number(element.logoSizeRange.value);
      element.logoSizeOutput.textContent = px + 'px';
      scene = Core.setLogo(scene, { logoSizePx: px });
      markDirty(); render();
    });
  }

  // Text controls
  if (element.wmTextContent) {
    element.wmTextContent.addEventListener('input', () => { scene = Core.setLogo(scene, { textContent: element.wmTextContent.value }); markDirty(); render(); });
  }
  if (element.wmFontSelect) {
    element.wmFontSelect.addEventListener('change', () => { scene = Core.setLogo(scene, { textFont: element.wmFontSelect.value }); markDirty(); render(); });
  }
  if (element.wmTextSizeRange) {
    element.wmTextSizeRange.addEventListener('input', () => {
      const v = Number(element.wmTextSizeRange.value);
      element.wmTextSizeOutput.textContent = v + 'px';
      scene = Core.setLogo(scene, { textSize: v });
      markDirty(); render();
    });
  }
  if (element.wmTextColorPicker) {
    element.wmTextColorPicker.addEventListener('input', () => {
      element.wmTextColorHex.value = element.wmTextColorPicker.value;
      scene = Core.setLogo(scene, { textColor: element.wmTextColorPicker.value });
      markDirty(); render();
    });
    element.wmTextColorHex.addEventListener('change', () => {
      const v = element.wmTextColorHex.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        element.wmTextColorPicker.value = v;
        scene = Core.setLogo(scene, { textColor: v });
        markDirty(); render();
      }
    });
  }

  // Text style buttons
  document.querySelectorAll('.wm-style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wm-style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      scene = Core.setLogo(scene, { textStyle: btn.dataset.style });
      markDirty(); render();
    });
  });

  // Single mode scale
  if (element.logoScale) {
    element.logoScale.addEventListener('input', () => {
      const v = Number(element.logoScale.value) / 100;
      element.logoScaleOutput.textContent = element.logoScale.value + '%';
      scene = Core.setLogo(scene, { scale: v });
      markDirty(); render();
    });
  }

  // Grid pattern buttons
  document.querySelectorAll('.wm-gp').forEach(btn => {
    btn.addEventListener('click', () => {
      scene = Core.setLogo(scene, { gridType: btn.dataset.gp });
      markDirty(); render();
    });
  });

  // Grid cols/rows/rotation/spacing
  if (element.wmGridCols) {
    element.wmGridCols.addEventListener('input', () => { element.wmGridColsOut.textContent = element.wmGridCols.value; scene = Core.setLogo(scene, { gridCols: Number(element.wmGridCols.value) }); markDirty(); render(); });
  }
  if (element.wmGridRows) {
    element.wmGridRows.addEventListener('input', () => { element.wmGridRowsOut.textContent = element.wmGridRows.value; scene = Core.setLogo(scene, { gridRows: Number(element.wmGridRows.value) }); markDirty(); render(); });
  }
  if (element.wmRotation) {
    element.wmRotation.addEventListener('input', () => {
      const v = Number(element.wmRotation.value);
      element.wmRotationOut.textContent = (v >= 0 ? '' : '−') + Math.abs(v) + '°';
      scene = Core.setLogo(scene, { rotation: v }); markDirty(); render();
    });
  }
  if (element.wmSpacingH) {
    element.wmSpacingH.addEventListener('input', () => { element.wmSpacingHOut.textContent = element.wmSpacingH.value; scene = Core.setLogo(scene, { spacingH: Number(element.wmSpacingH.value) }); markDirty(); render(); });
  }
  if (element.wmSpacingV) {
    element.wmSpacingV.addEventListener('input', () => { element.wmSpacingVOut.textContent = element.wmSpacingV.value; scene = Core.setLogo(scene, { spacingV: Number(element.wmSpacingV.value) }); markDirty(); render(); });
  }

  // Grid lines toggle
  if (element.wmShowGridLines) {
    element.wmShowGridLines.addEventListener('change', () => {
      element.gridLineControls.style.display = element.wmShowGridLines.checked ? '' : 'none';
      scene = Core.setLogo(scene, { showGridLines: element.wmShowGridLines.checked });
      markDirty(); render();
    });
  }
  if (element.wmGridLineWidth) {
    element.wmGridLineWidth.addEventListener('input', () => {
      element.wmGridLineWidthOut.textContent = element.wmGridLineWidth.value + 'px';
      scene = Core.setLogo(scene, { gridLineWidth: Number(element.wmGridLineWidth.value) });
      markDirty(); render();
    });
  }
  if (element.wmGridLineColor) {
    element.wmGridLineColor.addEventListener('input', () => {
      element.wmGridLineColorHex.value = element.wmGridLineColor.value;
      scene = Core.setLogo(scene, { gridLineColor: element.wmGridLineColor.value });
      markDirty(); render();
    });
    element.wmGridLineColorHex.addEventListener('change', () => {
      const v = element.wmGridLineColorHex.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        element.wmGridLineColor.value = v;
        scene = Core.setLogo(scene, { gridLineColor: v });
        markDirty(); render();
      }
    });
  }
  if (element.wmGridLineOpacity) {
    element.wmGridLineOpacity.addEventListener('input', () => {
      const pct = Number(element.wmGridLineOpacity.value);
      element.wmGridLineOpacityOut.textContent = pct + '%';
      scene = Core.setLogo(scene, { gridLineOpacity: pct / 100 });
      markDirty(); render();
    });
  }

  // Grid line style buttons
  document.querySelectorAll('.wm-ls-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wm-ls-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      scene = Core.setLogo(scene, { gridLineStyle: btn.dataset.ls });
      markDirty(); render();
    });
  });

  // Blend mode
  if (element.wmBlendMode) {
    element.wmBlendMode.addEventListener('change', () => { scene = Core.setLogo(scene, { blendMode: element.wmBlendMode.value }); markDirty(); render(); });
  }

  // Text shadow controls
  if (element.wmShadowBlur) {
    element.wmShadowBlur.addEventListener('input', () => {
      const v = Number(element.wmShadowBlur.value);
      element.wmShadowBlurOut.textContent = v + 'px';
      scene = Core.setLogo(scene, { shadowBlur: v });
      markDirty(); render();
    });
  }
  if (element.wmShadowColor) {
    element.wmShadowColor.addEventListener('input', () => {
      element.wmShadowColorHex.value = element.wmShadowColor.value;
      scene = Core.setLogo(scene, { shadowColor: element.wmShadowColor.value });
      markDirty(); render();
    });
    element.wmShadowColorHex.addEventListener('change', () => {
      const v = element.wmShadowColorHex.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        element.wmShadowColor.value = v;
        scene = Core.setLogo(scene, { shadowColor: v });
        markDirty(); render();
      }
    });
  }



  $$('.view-switch button').forEach((button) => button.addEventListener('click', () => {
    scene = Core.selectView(scene, button.dataset.view);
    setMessage(element.artworkMessage, `Đang chỉnh ${scene.view === 'front' ? 'mặt trước' : 'mặt sau'} với artwork riêng.`, 'success');
    setStatus(`Đang chỉnh ${scene.view === 'front' ? 'mặt trước' : 'mặt sau'}`);
    render();
  }));
  element.zoomIn.addEventListener('click', () => zoomWorkspace(Math.round((workspaceView.zoom + .09) * 100) / 100));
  element.zoomOut.addEventListener('click', () => zoomWorkspace(Math.round((workspaceView.zoom - .09) * 100) / 100));
  function updateSafeAreaFromFields() {
    const value = (field, fallback) => {
      const parsed = Number.parseFloat(field.value.replace(',', '.'));
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    scene = Core.setSafeArea(scene, {
      x: value(element.safeX, scene.safeArea.x),
      y: value(element.safeY, scene.safeArea.y),
      width: value(element.safeWidth, scene.safeArea.width),
      height: value(element.safeHeight, scene.safeArea.height),
    });
    markDirty();
    setMessage(element.safeAreaMessage, 'Đã hiệu chỉnh vùng in. Artwork được giới hạn trong khung này.', 'success');
    setStatus('Đã hiệu chỉnh vùng in');
    render();
  }
  [element.safeX, element.safeY, element.safeWidth, element.safeHeight].forEach((field) => field.addEventListener('change', updateSafeAreaFromFields));
  element.confirmSafeArea.addEventListener('click', updateSafeAreaFromFields);
  element.exportButton.addEventListener('click', exportPng);

  // Export format + scale controls
  function setExportFormat(format) {
    exportParams.format = format === 'jpg' ? 'jpg' : 'png';
    saveSettings();
    render();
  }
  function setExportScale(scale) {
    exportParams.scale = [1, 2, 4].includes(Number(scale)) ? Number(scale) : 1;
    saveSettings();
    render();
  }
  if (element.fmtPng) element.fmtPng.addEventListener('click', () => setExportFormat('png'));
  if (element.fmtJpg) element.fmtJpg.addEventListener('click', () => setExportFormat('jpg'));
  if (element.scale1x) element.scale1x.addEventListener('click', () => setExportScale(1));
  if (element.scale2x) element.scale2x.addEventListener('click', () => setExportScale(2));
  if (element.scale4x) element.scale4x.addEventListener('click', () => setExportScale(4));

  element.saveDraft.addEventListener('click', saveWorkspace);
  element.clearDraft.addEventListener('click', clearWorkspace);

  // ─── Brush UI sync (restore saved brush prefs into sliders) ──────────────
  function syncBrushUI() {
    element.brushSizeRange.value = brushState.size;
    element.brushSizeOutput.textContent = `${brushState.size}px`;
    element.brushOpacityRange.value = Math.round(brushState.opacity * 100);
    element.brushOpacityOutput.textContent = `${Math.round(brushState.opacity * 100)}%`;
    element.brushHardnessRange.value = Math.round(brushState.hardness * 100);
    element.brushHardnessOutput.textContent = `${Math.round(brushState.hardness * 100)}%`;
    // Restore active brush mode button
    [element.brushErase, element.brushBlur, element.brushRestore].forEach(btn => btn.classList.remove('active'));
    ({ erase: element.brushErase, blur: element.brushBlur, restore: element.brushRestore })[brushState.mode].classList.add('active');
  }
  syncBrushUI();

  // ─── Blend controls ───────────────────────────────────────────────────────
  function syncBlendUI() {
    element.blendModeSelect.value = blendParams.mode;
    element.blendOpacityRange.value  = Math.round(blendParams.opacity * 100);
    element.blendOpacityOutput.textContent = `${Math.round(blendParams.opacity * 100)}%`;
    element.dispStrengthRange.value  = blendParams.dispStrength;
    element.dispStrengthOutput.textContent = `${blendParams.dispStrength}`;
    element.blurRadiusRange.value    = blendParams.blurRadius;
    element.blurRadiusOutput.textContent = `${blendParams.blurRadius}`;
    element.contrastRange.value      = blendParams.contrast;
    element.contrastOutput.textContent = `${blendParams.contrast}%`;
    element.embossRange.value        = Math.round(blendParams.emboss * 100);
    element.embossOutput.textContent = `${Math.round(blendParams.emboss * 100)}%`;
    element.edgeBlendRange.value     = Math.round(blendParams.edgeBlend * 100);
    element.edgeBlendOutput.textContent = `${Math.round(blendParams.edgeBlend * 100)}%`;
    // Overlay color chips
    $$('.blend-chip').forEach(c => c.classList.toggle('active', c.dataset.color === blendParams.overlayColor));
  }
  syncBlendUI();

  element.blendModeSelect.addEventListener('change', () => {
    blendParams.mode = element.blendModeSelect.value;
    saveSettings();
    scheduleFabricPreview();
  });

  function bindBlendSlider(rangeEl, outputEl, key, scale, suffix) {
    rangeEl.addEventListener('input', () => {
      const raw = Number(rangeEl.value);
      blendParams[key] = raw / scale;
      outputEl.textContent = suffix === '%' ? `${raw}%` : `${raw}`;
      saveSettings();
      scheduleFabricPreview();
    });
  }

  bindBlendSlider(element.blendOpacityRange,  element.blendOpacityOutput,  'opacity',      100, '%');
  bindBlendSlider(element.dispStrengthRange,   element.dispStrengthOutput,  'dispStrength', 1,   '');
  bindBlendSlider(element.blurRadiusRange,     element.blurRadiusOutput,    'blurRadius',   1,   '');
  bindBlendSlider(element.contrastRange,       element.contrastOutput,      'contrast',     1,   '%');
  bindBlendSlider(element.embossRange,         element.embossOutput,        'emboss',       100, '%');
  bindBlendSlider(element.edgeBlendRange,      element.edgeBlendOutput,     'edgeBlend',    100, '%');

  $$('.blend-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.blend-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      blendParams.overlayColor = chip.dataset.color;
      saveSettings();
      scheduleFabricPreview();
    });
  });

  // ─── Inspector accordion: mỗi panel gập lại, mặc định đóng cho gọn ─────────
  const ACCORDION_STATE_KEY = 'form_accordion_open_v1';
  const CARET_SVG = '<span class="panel-caret" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M6 4l4 4-4 4"/></svg></span>';

  function readAccordionState() {
    try {
      const raw = localStorage.getItem(ACCORDION_STATE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }
  function writeAccordionState(state) {
    try { localStorage.setItem(ACCORDION_STATE_KEY, JSON.stringify(state)); } catch {}
  }

  function initAccordions() {
    const inspector = document.querySelector('.inspector');
    if (!inspector) return;

    // Dời "Cọ xoá / Mờ" (#brushPanel) lên ngay trước panel "Phông nền".
    const brushPanel = inspector.querySelector('#brushPanel');
    const bgPanel = [...inspector.querySelectorAll(':scope > .panel')]
      .find(p => /Phông nền/.test(p.querySelector(':scope > .panel-heading h2')?.textContent || ''));
    if (brushPanel && bgPanel && brushPanel !== bgPanel.previousElementSibling) {
      inspector.insertBefore(brushPanel, bgPanel);
    }

    const openState = readAccordionState();
    const panels = [...inspector.querySelectorAll(':scope > .panel')];

    panels.forEach((panel, index) => {
      const heading = panel.querySelector(':scope > .panel-heading');
      if (!heading || panel.dataset.accordion === 'ready') return;
      // Panel "Vùng in an toàn" tự quản display qua JS — bỏ qua để không xung đột.
      if (panel.getAttribute('aria-labelledby') === 'safeAreaTitle') return;

      // Gom mọi phần tử sau heading vào .panel-body
      const body = document.createElement('div');
      body.className = 'panel-body';
      let node = heading.nextSibling;
      while (node) {
        const next = node.nextSibling;
        body.appendChild(node);
        node = next;
      }
      panel.appendChild(body);

      // Thêm mũi tên vào heading, biến heading thành nút toggle
      heading.insertAdjacentHTML('beforeend', CARET_SVG);
      panel.classList.add('collapsible');
      panel.dataset.accordion = 'ready';

      // Khóa mở/đóng: ưu tiên trạng thái đã lưu; mặc định panel đầu (Hình in /
      // Hình thêu) mở sẵn, các panel còn lại đóng cho gọn.
      const key = panel.id || `panel-${index}`;
      panel.dataset.accordionKey = key;
      const defaultOpen = index === 0;
      const isOpen = Object.prototype.hasOwnProperty.call(openState, key) ? openState[key] : defaultOpen;
      if (isOpen) panel.classList.add('open');

      heading.setAttribute('role', 'button');
      heading.setAttribute('tabindex', '0');
      const toggle = () => {
        const isOpen = panel.classList.toggle('open');
        heading.setAttribute('aria-expanded', String(isOpen));
        const state = readAccordionState();
        state[key] = isOpen;
        writeAccordionState(state);
      };
      heading.setAttribute('aria-expanded', String(panel.classList.contains('open')));
      heading.addEventListener('click', (e) => {
        // Không toggle khi bấm vào nút/điều khiển vô tình nằm trong heading
        if (e.target.closest('button:not(.panel-heading), input, select, a')) return;
        toggle();
      });
      heading.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  attachDrag(element.artworkOverlay, 'artwork');
  attachDrag(element.logoOverlay, 'logo');
  attachArtworkTransform();
  attachBaseResize();
  attachSafeAreaDrag();
  attachWorkspaceNavigation();
  attachDropZones();
  initAccordions();
  window.addEventListener('pointerup', flushAutoSave);
  window.addEventListener('pagehide', () => {
    flushAutoSave();
    Object.values(fileUrls).filter(Boolean).forEach((url) => URL.revokeObjectURL(url));
    Object.values(artworkUrls).filter(Boolean).forEach((url) => URL.revokeObjectURL(url));
  });

  render();

  // Warm-up font + khôi phục workspace theo đúng thứ tự: lần vẽ canvas đầu tiên
  // (nhất là sau reload) có thể dùng font fallback nếu glyph của font chưa được
  // nạp → chữ watermark bị méo/sai hình. Nạp trước mọi font, restore, rồi vẽ lại.
  async function preloadWatermarkFonts() {
    if (!document.fonts?.load) return;
    const fonts = new Set(['Arial', 'Georgia', 'Times New Roman', 'Courier New',
      'Verdana', 'Trebuchet MS', 'Impact', 'Palatino Linotype']);
    if (scene.logo?.textFont) fonts.add(scene.logo.textFont);
    const styles = ['normal', 'italic', 'bold', 'bold italic'];
    const jobs = [];
    for (const f of fonts) {
      for (const st of styles) {
        jobs.push(document.fonts.load(`${st} 32px "${f}", sans-serif`, 'QH Clothes© FORM').catch(() => {}));
      }
    }
    try { await Promise.all(jobs); await document.fonts.ready; } catch {}
  }

  (async () => {
    await restoreWorkspace();
    await preloadWatermarkFonts();
    // Vẽ lại watermark bằng scene đã khôi phục + font đã sẵn sàng.
    // Font local trong Chromium đôi khi chỉ rasterize đúng ở lần vẽ canvas
    // kế tiếp (glyph nạp bất đồng bộ), nên frame đầu sau reload có thể vẫn
    // dùng fallback → chữ méo. Vẽ lại nhiều lần theo mốc thời gian trễ dần
    // để chắc chắn bắt được khi glyph đã sẵn sàng.
    [0, 50, 150, 300, 600, 1000].forEach((ms) => {
      setTimeout(() => renderWatermarkPreview(), ms);
    });
    // Và vẽ lại mỗi khi trình duyệt báo có font vừa nạp xong.
    if (document.fonts?.addEventListener) {
      document.fonts.addEventListener('loadingdone', () => renderWatermarkPreview());
    }
  })();

  // Re-run fabric preview whenever the artboard changes size (window resize,
  // first layout, zoom transitions).  Without this the preview canvas keeps a
  // stale pixel size and the artwork appears shrunken / skewed until the next
  // user interaction triggers a fresh render.
  new ResizeObserver(() => {
    const hasArtwork = Core.getOverlays(scene).some(o => o.artwork?.src)
      && scene.base.kind !== 'default';
    if (hasArtwork) scheduleFabricPreview();
  }).observe(element.artboard);

  // ─── Brush system ──────────────────────────────────────────────────────────
  // The mask is a separate canvas (same px size as fabricPreviewCanvas).
  // It starts fully white (= show everything). Painting black/transparent into
  // it hides those pixels of the artwork; painting white restores them.
  // The artwork pixels themselves are NEVER modified — only the mask changes.
  // runFabricPreview re-renders fresh artwork each time, then applies the mask.

  let brushPainting = false;
  let brushLastX = 0, brushLastY = 0;

  // ── Cursor preview canvas (z-index 10, pointer-events:none, always on top)
  let cursorCanvas = null;
  let cursorCtx = null;

  function ensureCursorCanvas() {
    if (cursorCanvas) return;
    cursorCanvas = document.createElement('canvas');
    cursorCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:10';
    element.artboard.appendChild(cursorCanvas);
    cursorCtx = cursorCanvas.getContext('2d');
  }

  function drawCursorPreview(x, y) {
    if (!cursorCanvas || !cursorCtx) return;
    const W = cursorCanvas.width, H = cursorCanvas.height;
    cursorCtx.clearRect(0, 0, W, H);
    if (!brushState.active) return;
    const r = brushState.size;
    // Outer circle
    cursorCtx.beginPath();
    cursorCtx.arc(x, y, r, 0, Math.PI * 2);
    cursorCtx.strokeStyle = 'rgba(255,255,255,0.9)';
    cursorCtx.lineWidth = 1.5;
    cursorCtx.stroke();
    // Inner dark ring for contrast
    cursorCtx.beginPath();
    cursorCtx.arc(x, y, r, 0, Math.PI * 2);
    cursorCtx.strokeStyle = 'rgba(0,0,0,0.5)';
    cursorCtx.lineWidth = 0.75;
    cursorCtx.stroke();
    // Crosshair dot at center
    cursorCtx.beginPath();
    cursorCtx.arc(x, y, 1.5, 0, Math.PI * 2);
    cursorCtx.fillStyle = 'rgba(255,255,255,0.9)';
    cursorCtx.fill();
    // Soft brush preview: show hardness as inner filled circle
    const hardR = r * brushState.hardness;
    if (hardR > 1) {
      cursorCtx.beginPath();
      cursorCtx.arc(x, y, hardR, 0, Math.PI * 2);
      cursorCtx.strokeStyle = 'rgba(255,255,255,0.35)';
      cursorCtx.lineWidth = 1;
      cursorCtx.stroke();
    }
  }

  function clearCursorPreview() {
    if (cursorCtx && cursorCanvas) cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
  }

  // ── Coordinate mapping: pointer event → canvas pixel coords
  // Convert pointer event → canvas pixel coords
  // Always use artboard's bounding rect (maskCanvas may be display:none)
  function toCanvasCoords(event, canvas) {
    const rect = element.artboard.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width  / rect.width),
      y: (event.clientY - rect.top)  * (canvas.height / rect.height),
    };
  }

  // ── Paint one brush stamp into the mask at (x, y)
  function paintBrushAt(x, y) {
    if (!maskCtx || !maskCanvas) return;
    const r = Math.max(1, brushState.size);
    const innerR = r * Math.min(0.99, brushState.hardness);
    const alpha = brushState.opacity;

    maskCtx.save();
    if (brushState.mode === 'restore') {
      maskCtx.globalCompositeOperation = 'source-over';
      const grd = maskCtx.createRadialGradient(x, y, innerR, x, y, r);
      grd.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      maskCtx.fillStyle = grd;
    } else {
      // erase or blur — remove alpha from mask so artwork becomes transparent there
      maskCtx.globalCompositeOperation = 'destination-out';
      const grd = maskCtx.createRadialGradient(x, y, innerR, x, y, r);
      grd.addColorStop(0, `rgba(0,0,0,${alpha})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      maskCtx.fillStyle = grd;
    }
    maskCtx.beginPath();
    maskCtx.arc(x, y, r, 0, Math.PI * 2);
    maskCtx.fill();
    maskCtx.restore();
  }

  // ── Interpolated stroke: fill gaps between pointer samples
  function paintStroke(x1, y1, x2, y2) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const step = Math.max(1, brushState.size * 0.2);
    const steps = Math.ceil(dist / step);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      paintBrushAt(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    }
    updateMaskOverlay();
    scheduleFabricPreview();
  }

  // ── Activate / deactivate brush mode
  function setBrushActive(active) {
    brushState.active = active;
    element.brushToggle.classList.toggle('active', active);
    element.brushToggle.querySelector('span').textContent = active ? 'Tắt cọ vẽ' : 'Bật cọ vẽ';
    element.artboard.classList.toggle('brush-active', active);
    if (active) {
      artworkSelected = false;
      baseSelected = false;
      // Force remove selection class and hide transform handles directly
      element.artworkOverlay.classList.remove('selected');
      element.baseSelection.classList.remove('visible');
      render();
    }
    if (!active) clearCursorPreview();
    saveSettings();
  }

  // ── Wire pointer events onto the ARTBOARD (not maskCanvas) so brush works
  // even before maskCanvas is created, and coordinates are always consistent.
  (function attachBrushToArtboard() {
    // pointermove on stageWell (parent) to catch events even when pointer drifts outside artboard
    element.stageWell.addEventListener('pointermove', (event) => {
      if (!brushState.active) return;
      // Sync cursor canvas size if needed
      if (cursorCanvas) {
        if (cursorCanvas.width !== element.artboard.clientWidth) cursorCanvas.width = element.artboard.clientWidth;
        if (cursorCanvas.height !== element.artboard.clientHeight) cursorCanvas.height = element.artboard.clientHeight;
        const { x, y } = toCanvasCoords(event, cursorCanvas);
        drawCursorPreview(x, y);
      }

      if (brushPainting && maskCanvas) {
        const mc = toCanvasCoords(event, maskCanvas);
        paintStroke(brushLastX, brushLastY, mc.x, mc.y);
        brushLastX = mc.x; brushLastY = mc.y;
      }
    });

    element.artboard.addEventListener('pointerdown', (event) => {
      if (!brushState.active || event.button !== 0) return;
      // Create mask at artboard display size — independent of fabricPreviewCanvas
      const W = element.artboard.clientWidth;
      const H = element.artboard.clientHeight;
      if (W < 2 || H < 2) return;
      ensureMaskCanvas(W, H);
      if (!maskCanvas) return;
      brushPainting = true;
      element.artboard.setPointerCapture(event.pointerId);
      saveMaskSnapshot(); // save before stroke for undo
      const mc = toCanvasCoords(event, maskCanvas);
      brushLastX = mc.x; brushLastY = mc.y;
      paintBrushAt(mc.x, mc.y);
      updateMaskOverlay();
      scheduleFabricPreview();
      event.preventDefault();
      event.stopPropagation();
    });

    const stopBrush = (event) => {
      if (!brushPainting) return;
      brushPainting = false;
      if (element.artboard.hasPointerCapture(event.pointerId)) element.artboard.releasePointerCapture(event.pointerId);
      markDirty(); // persist mask changes via auto-save
    };
    element.artboard.addEventListener('pointerup', stopBrush);
    element.artboard.addEventListener('pointercancel', stopBrush);

    element.stageWell.addEventListener('pointerleave', () => {
      clearCursorPreview();
    });
  })();

  // ── Brush UI controls
  element.brushToggle.addEventListener('click', () => {
    const nowActive = !brushState.active;
    if (nowActive) {
      ensureCursorCanvas();
      cursorCanvas.width  = element.artboard.clientWidth;
      cursorCanvas.height = element.artboard.clientHeight;
      // Pre-create mask so overlay is available immediately
      if (fabricPreviewCanvas && fabricPreviewCanvas.width > 0) {
        ensureMaskCanvas(fabricPreviewCanvas.width, fabricPreviewCanvas.height);
      }
    }
    setBrushActive(nowActive);
  });

  // ── Restore brush active state from saved settings
  if (brushState.active) {
    ensureCursorCanvas();
    cursorCanvas.width  = element.artboard.clientWidth;
    cursorCanvas.height = element.artboard.clientHeight;
    if (fabricPreviewCanvas && fabricPreviewCanvas.width > 0) {
      ensureMaskCanvas(fabricPreviewCanvas.width, fabricPreviewCanvas.height);
    }
    setBrushActive(true);
  }

  function setBrushMode(mode) {
    brushState.mode = mode;
    [element.brushErase, element.brushBlur, element.brushRestore].forEach(btn => btn.classList.remove('active'));
    ({ erase: element.brushErase, blur: element.brushBlur, restore: element.brushRestore })[mode].classList.add('active');
    saveSettings();
  }
  element.brushErase.addEventListener('click',   () => setBrushMode('erase'));
  element.brushBlur.addEventListener('click',    () => setBrushMode('blur'));
  element.brushRestore.addEventListener('click', () => setBrushMode('restore'));

  element.brushSizeRange.addEventListener('input', () => {
    brushState.size = Number(element.brushSizeRange.value);
    element.brushSizeOutput.textContent = `${brushState.size}px`;
    saveSettings();
  });
  element.brushOpacityRange.addEventListener('input', () => {
    brushState.opacity = Number(element.brushOpacityRange.value) / 100;
    element.brushOpacityOutput.textContent = `${element.brushOpacityRange.value}%`;
    saveSettings();
  });
  element.brushHardnessRange.addEventListener('input', () => {
    brushState.hardness = Number(element.brushHardnessRange.value) / 100;
    element.brushHardnessOutput.textContent = `${element.brushHardnessRange.value}%`;
    saveSettings();
  });
  element.brushResetMask.addEventListener('click', () => {
    if (maskCtx) saveMaskSnapshot();
    resetMask();
    markDirty(); // persist cleared mask via auto-save
    setStatus('Đã xoá toàn bộ mask');
    showToast('Đã xoá mask — artwork hiển thị đầy đủ.');
  });
  element.brushUndo.addEventListener('click', undoMask);
  element.brushRedo.addEventListener('click', redoMask);

  // Keyboard undo/redo (Ctrl+Z / Ctrl+Shift+Z) when brush is active
  window.addEventListener('keydown', (e) => {
    if (!brushState.active) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undoMask(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redoMask(); }
  });
})();
