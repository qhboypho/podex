(() => {
  'use strict';
  function rectangle(a, b, square = false) {
    let dx = b.x - a.x, dy = b.y - a.y;
    if (square) { const size = Math.max(Math.abs(dx), Math.abs(dy)); dx = Math.sign(dx || 1) * size; dy = Math.sign(dy || 1) * size; }
    return { left: Math.min(a.x, a.x + dx), top: Math.min(a.y, a.y + dy), right: Math.max(a.x, a.x + dx), bottom: Math.max(a.y, a.y + dy) };
  }
  function contains(outer, inner) {
    return inner.left >= outer.left && inner.right <= outer.right && inner.top >= outer.top && inner.bottom <= outer.bottom;
  }
  function union(boxes) {
    if (!boxes.length) return null;
    return {left:Math.min(...boxes.map(b=>b.left)),right:Math.max(...boxes.map(b=>b.right)),top:Math.min(...boxes.map(b=>b.top)),bottom:Math.max(...boxes.map(b=>b.bottom))};
  }
  function resize(box, corner, point, limits = {min:.01,max:100}) {
    const anchor = {x: corner.includes('w') ? box.right : box.left, y: corner.includes('n') ? box.bottom : box.top};
    const vx = (corner.includes('w') ? box.left : box.right) - anchor.x;
    const vy = (corner.includes('n') ? box.top : box.bottom) - anchor.y;
    const projected = ((point.x-anchor.x)*vx+(point.y-anchor.y)*vy)/Math.max(1e-9,vx*vx+vy*vy);
    return {anchor, scale: Math.max(limits.min,Math.min(limits.max,projected))};
  }
  function pointerMode(tool, space, brush) {
    if(space || tool==='hand') return 'pan';
    if(brush) return 'brush';
    return tool==='marquee'?'marquee':'select';
  }
  function toggleSelection(current, targets) {
    const result=new Set(current), keys=[...new Set(targets)];
    const remove=keys.length>0 && keys.every(key=>result.has(key));
    keys.forEach(key=>remove?result.delete(key):result.add(key));
    return result;
  }
  globalThis.FormSelectionGeometry = {rectangle,contains,union,resize,pointerMode,toggleSelection};
})();
