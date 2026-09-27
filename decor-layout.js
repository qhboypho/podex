(() => {
  'use strict';
  function snap(box, targets, tx, ty) {
    const result = { dx: 0, dy: 0, v: null, h: null };
    for (const [start, end, tolerance, delta, guide] of [
      ['left', 'right', tx, 'dx', 'v'], ['top', 'bottom', ty, 'dy', 'h'],
    ]) {
      let nearest = tolerance + 1e-9;
      for (const target of targets) {
        for (const mark of [target[start], (target[start] + target[end]) / 2, target[end]]) {
          for (const edge of [box[start], (box[start] + box[end]) / 2, box[end]]) {
            const distance = Math.abs(mark - edge);
            if (distance < nearest) { nearest = distance; result[delta] = mark - edge; result[guide] = mark; }
          }
        }
      }
    }
    return result;
  }
  function gaps(box, targets) {
    const nearest = new Map();
    for (const target of targets) {
      for (const [axis, start, end, crossStart, crossEnd] of [
        ['x', 'left', 'right', 'top', 'bottom'], ['y', 'top', 'bottom', 'left', 'right'],
      ]) {
        const lo = Math.max(box[crossStart], target[crossStart]);
        const hi = Math.min(box[crossEnd], target[crossEnd]);
        if (lo > hi) continue;
        const before = target[end] <= box[start];
        if (!before && target[start] < box[end]) continue;
        const from = before ? target[end] : box[end], to = before ? box[start] : target[start];
        const key = axis + before, distance = to - from;
        if (!nearest.has(key) || distance < nearest.get(key).distance) nearest.set(key, {axis, from, to, cross: (lo + hi) / 2, distance});
      }
    }
    return [...nearest.values()];
  }
  // Input ordered along the requested axis; first item remains anchored.
  function space(boxes, axis, gap) {
    const start = axis === 'x' ? 'left' : 'top', end = axis === 'x' ? 'right' : 'bottom';
    let cursor = boxes[0]?.[start] || 0;
    return boxes.map((box) => { const size = box[end] - box[start]; const center = cursor + size / 2; cursor += size + gap; return center; });
  }
  function anchorTextLeft(item, previousWidth, nextWidth, aspectRatio = 1) {
    const shift = (nextWidth - previousWidth) / 2 / 4;
    const angle = (Number(item.rotation) || 0) * Math.PI / 180;
    return {
      x: item.x + shift * Math.cos(angle),
      y: item.y + shift * Math.sin(angle) * aspectRatio,
    };
  }
  globalThis.FormDecorLayout = { snap, gaps, space, anchorTextLeft };
})();
