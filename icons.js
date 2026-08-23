(() => {
// Thư viện icon vector dựng sẵn cho mockup. Mỗi icon là danh sách hình cơ bản
// (path/circle/line/rect/polyline) trên viewBox 0 0 24 24, vẽ nét (stroke),
// màu được truyền vào lúc build data URI nên có thể đổi màu tự do.
const ICONS = [
  {
    id: 'heart', name: 'Tim', el: [
      { t: 'path', d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
    ],
  },
  {
    id: 'star', name: 'Ngôi sao', el: [
      { t: 'polygon', points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' },
    ],
  },
  {
    id: 'bolt', name: 'Tia sét', el: [
      { t: 'polygon', points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' },
    ],
  },
  {
    id: 'flame', name: 'Ngọn lửa', el: [
      { t: 'path', d: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' },
    ],
  },
  {
    id: 'skull', name: 'Đầu lâu', el: [
      { t: 'path', d: 'M12 2a8 8 0 0 0-8 8c0 2.6 1.3 4.7 3 5.8V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4.2c1.7-1.1 3-3.2 3-5.8a8 8 0 0 0-8-8Z' },
      { t: 'circle', cx: 9, cy: 10.5, r: 1.4 },
      { t: 'circle', cx: 15, cy: 10.5, r: 1.4 },
      { t: 'path', d: 'M10 21v-2.2M14 21v-2.2' },
    ],
  },
  {
    id: 'crown', name: 'Vương miện', el: [
      { t: 'path', d: 'M3 18h18l-1.5-9-4.5 3.5L12 5l-3 7.5L4.5 9 3 18Zm1.5 3h15' },
    ],
  },
  {
    id: 'gem', name: 'Kim cương', el: [
      { t: 'path', d: 'M6 3h12l4 6-10 12L2 9l4-6Z' },
      { t: 'path', d: 'M2 9h20M6 3l3 6 3-6 3 6 3-6M9 9l3 12 3-12' },
    ],
  },
  {
    id: 'smile', name: 'Cười', el: [
      { t: 'circle', cx: 12, cy: 12, r: 9 },
      { t: 'path', d: 'M8 14s1.5 2.2 4 2.2 4-2.2 4-2.2' },
      { t: 'line', x1: 9, y1: 9, x2: 9.01, y2: 9 },
      { t: 'line', x1: 15, y1: 9, x2: 15.01, y2: 9 },
    ],
  },
  {
    id: 'ghost', name: 'Con ma', el: [
      { t: 'path', d: 'M12 2a8 8 0 0 0-8 8v12l2.7-2 2.6 2 2.7-2 2.7 2 2.6-2 2.7 2V10a8 8 0 0 0-8-8Z' },
      { t: 'circle', cx: 9, cy: 10, r: 1.2 },
      { t: 'circle', cx: 15, cy: 10, r: 1.2 },
    ],
  },
  {
    id: 'peace', name: 'Hòa bình', el: [
      { t: 'circle', cx: 12, cy: 12, r: 9 },
      { t: 'path', d: 'M12 3v18M12 12l-6.4 6.4M12 12l6.4 6.4' },
    ],
  },
  {
    id: 'moon', name: 'Trăng khuyết', el: [
      { t: 'path', d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z' },
    ],
  },
  {
    id: 'sun', name: 'Mặt trời', el: [
      { t: 'circle', cx: 12, cy: 12, r: 4.5 },
      { t: 'path', d: 'M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8' },
    ],
  },
  {
    id: 'cloud', name: 'Mây', el: [
      { t: 'path', d: 'M17.5 19a4.5 4.5 0 0 0 .42-8.98 7 7 0 0 0-13.36 2.2A4 4 0 0 0 6 19h11.5Z' },
    ],
  },
  {
    id: 'flower', name: 'Bông hoa', el: [
      { t: 'circle', cx: 12, cy: 12, r: 2.4 },
      { t: 'path', d: 'M12 2.5a3 3 0 0 1 3 3c0 1.6-1.3 3-3 4.5-1.7-1.5-3-2.9-3-4.5a3 3 0 0 1 3-3ZM12 21.5a3 3 0 0 1-3-3c0-1.6 1.3-3 3-4.5 1.7 1.5 3 2.9 3 4.5a3 3 0 0 1-3 3ZM2.5 12a3 3 0 0 1 3-3c1.6 0 3 1.3 4.5 3-1.5 1.7-2.9 3-4.5 3a3 3 0 0 1-3-3ZM21.5 12a3 3 0 0 1-3 3c-1.6 0-3-1.3-4.5-3 1.5-1.7 2.9-3 4.5-3a3 3 0 0 1 3 3Z' },
    ],
  },
  {
    id: 'eye', name: 'Con mắt', el: [
      { t: 'path', d: 'M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z' },
      { t: 'circle', cx: 12, cy: 12, r: 3 },
    ],
  },
  {
    id: 'anchor', name: 'Mỏ neo', el: [
      { t: 'circle', cx: 12, cy: 5, r: 2.5 },
      { t: 'path', d: 'M12 7.5V22M12 22a9 9 0 0 0 9-9M12 22a9 9 0 0 1-9-9M8 11h8' },
    ],
  },
  {
    id: 'music', name: 'Nốt nhạc', el: [
      { t: 'path', d: 'M9 18V5l12-2v13' },
      { t: 'circle', cx: 6, cy: 18, r: 3 },
      { t: 'circle', cx: 18, cy: 16, r: 3 },
    ],
  },
  {
    id: 'camera', name: 'Máy ảnh', el: [
      { t: 'path', d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11Z' },
      { t: 'circle', cx: 12, cy: 13, r: 4 },
    ],
  },
  {
    id: 'plane', name: 'Máy giấy', el: [
      { t: 'path', d: 'M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z' },
    ],
  },
  {
    id: 'arrow-up', name: 'Mũi tên lên', el: [
      { t: 'path', d: 'M12 21V4M4.5 11.5 12 4l7.5 7.5' },
    ],
  },
  {
    id: 'cat', name: 'Mèo', el: [
      { t: 'path', d: 'M4 9.5 4.8 3l5 3.2a9.3 9.3 0 0 1 4.4 0l5-3.2L20 9.5a8.6 8.6 0 0 1 .8 3.7c0 4.9-3.9 8.8-8.8 8.8s-8.8-3.9-8.8-8.8A8.6 8.6 0 0 1 4 9.5Z' },
      { t: 'path', d: 'M9 12v1.5M15 12v1.5M9.5 17.5c.7.8 1.5 1.2 2.5 1.2s1.8-.4 2.5-1.2' },
    ],
  },
  {
    id: 'cross', name: 'Cộng', el: [
      { t: 'circle', cx: 12, cy: 12, r: 9 },
      { t: 'path', d: 'M12 8v8M8 12h8' },
    ],
  },
  {
    id: 'check', name: 'Check', el: [
      { t: 'circle', cx: 12, cy: 12, r: 9 },
      { t: 'path', d: 'M7.5 12.5 10.5 15.5 16.5 9' },
    ],
  },
  {
    id: 'wave', name: 'Sóng', el: [
      { t: 'path', d: 'M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 3.5-3 5-1' },
      { t: 'path', d: 'M2 18c2.5-4 5-4 7.5 0s5 4 7.5 0 3.5-3 5-1M2 6c2.5-4 5-4 7.5 0' },
    ],
  },
];

const DEFAULT_COLOR = '#17211e';
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const _uriCache = new Map();

function sanitizeColor(color) {
  return typeof color === 'string' && COLOR_RE.test(color) ? color : null;
}

function markup(icon, color) {
  const stroke = sanitizeColor(color) || DEFAULT_COLOR;
  const parts = icon.el.map((shape) => {
    if (shape.t === 'path') return `<path d="${shape.d}"/>`;
    if (shape.t === 'circle') return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}"/>`;
    if (shape.t === 'line') return `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}"/>`;
    if (shape.t === 'polygon') return `<polygon points="${shape.points}"/>`;
    return '';
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${parts}</svg>`;
}

globalThis.FormIcons = {
  list() {
    return ICONS.map(({ id, name }) => ({ id, name }));
  },
  has(id) {
    return ICONS.some((icon) => icon.id === id);
  },
  // Data URI để dùng trực tiếp trong <img> hoặc canvas drawImage.
  getSrc(id, color) {
    const icon = ICONS.find((entry) => entry.id === id);
    if (!icon) return null;
    const stroke = sanitizeColor(color) || DEFAULT_COLOR;
    const key = `${id}|${stroke}`;
    let uri = _uriCache.get(key);
    if (!uri) {
      uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup(icon, stroke))}`;
      _uriCache.set(key, uri);
    }
    return uri;
  },
};
})();
