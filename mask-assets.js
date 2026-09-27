(() => {
  'use strict';

  function positiveDimension(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.round(number) : 0;
  }

  function createMaskAsset(blob, width, height) {
    if (!blob) return null;
    return {
      blob,
      width: positiveDimension(width),
      height: positiveDimension(height),
    };
  }

  function normalizeMaskAsset(asset) {
    if (!asset) return null;
    // Bản lưu trước đây dùng Blob trực tiếp. Giữ tương thích khi khôi phục.
    if (typeof Blob !== 'undefined' && asset instanceof Blob) return createMaskAsset(asset, 0, 0);
    if (!asset.blob) return null;
    return createMaskAsset(asset.blob, asset.width, asset.height);
  }

  function normalizeMaskAssetMap(assets) {
    if (!assets || typeof assets !== 'object') return {};
    return Object.entries(assets).reduce((result, [overlayId, asset]) => {
      const normalized = normalizeMaskAsset(asset);
      if (normalized) result[overlayId] = normalized;
      return result;
    }, {});
  }

  globalThis.FormMaskAssets = { createMaskAsset, normalizeMaskAsset, normalizeMaskAssetMap };
})();
