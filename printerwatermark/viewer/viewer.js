'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

const FONT_LIST = ['Arial', 'Segoe UI', 'Tahoma', 'Verdana', 'Times New Roman', 'Georgia', 'Courier New', 'Impact'];

let pdfDoc = null;
let docName = '';
let pages = [];
let zoom = 'fit';
let editing = false;
let cfg = { enabled: true, layers: [] };
let skipArchive = false;

const imgCache = new Map();
let drag = null;
let redrawQueued = false;
let saveTimer = null;
let currentImgLayerId = null;

const uid = () => 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const clampPct = v => Math.round(clamp(v, 0, 100) * 10) / 10;

function defaultCfg() {
  return { enabled: true, layers: [], zoom: 'fit', thermal: false };
}

function newTextLayer() {
  return {
    id: uid(), type: 'text',
    text: 'ĐÃ XỬ LÝ ĐƠN HÀNG',
    fontFamily: 'Arial', fontSize: 22, bold: true, italic: false,
    color: '#e11d48', opacity: 45, rotation: -30,
    x: 50, y: 45, repeat: 'none', tileX: 45, tileY: 30
  };
}

function newImageLayer() {
  return {
    id: uid(), type: 'image', dataUrl: '',
    width: 28, opacity: 60, rotation: 0,
    x: 50, y: 12, repeat: 'none', tileX: 45, tileY: 30
  };
}

pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdfjs/pdf.worker.min.js');

// ---------- config ----------
async function loadCfg() {
  try {
    const o = await chrome.storage.local.get({ wmConfig: null });
    if (o.wmConfig && Array.isArray(o.wmConfig.layers)) {
      cfg = Object.assign(defaultCfg(), o.wmConfig);
    }
  } catch (e) { /* ignore */ }
}

function saveCfg() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { chrome.storage.local.set({ wmConfig: cfg }); } catch (e) { /* ignore */ }
  }, 250);
}

window.addEventListener('pagehide', () => {
  clearTimeout(saveTimer);
  try { chrome.storage.local.set({ wmConfig: cfg }); } catch (e) { /* ignore */ }
});

// ---------- busy / toast ----------
function setBusy(text) {
  const b = $('#busy');
  if (!text) { b.classList.add('hidden'); return; }
  $('#busyText').textContent = text;
  b.classList.remove('hidden');
}

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2600);
}

// ---------- load pdf ----------
function dataUrlToBytes(dataUrl) {
  const b64 = dataUrl.split(',')[1];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function guessNameFromUrl(url) {
  try {
    const p = new URL(decodeURIComponent(url)).pathname.split('/').pop();
    return p || 'don-hang.pdf';
  } catch (e) { return 'don-hang.pdf'; }
}

async function loadPdfBytes(bytes, name) {
  setBusy('Đang mở PDF...');
  let ok = false;
  try {
    pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
    docName = name || 'don-hang.pdf';
    await renderAllPages();
    ok = true;
  } catch (e) {
    showDropzone(true);
    toast('Không mở được file PDF này.');
  }
  setBusy(null);
  return ok;
}

async function extractOrderCode() {
  try {
    let text = '';
    const max = Math.min(2, pdfDoc.numPages || 1);
    for (let i = 1; i <= max; i++) {
      const page = await pdfDoc.getPage(i);
      const tc = await page.getTextContent();
      text += tc.items.map(it => it.str || '').join(' ') + '\n';
    }
    const patterns = [
      /order[\s_-]*id[:\s#]*([0-9]{8,25})/i,
      /\b(spx[a-z0-9]{6,25}|ghn\d{8,20}|ghtk\d{8,20}|jv\d{8,20}|jt\d{10,22})\b/i,
      /\b([0-9]{12,22})\b/
    ];
    for (const re of patterns) {
      const m = text.match(re);
      if (m) return m[1];
    }
    return '';
  } catch (e) {
    return '';
  }
}

async function loadPdfDataUrl(dataUrl, name, srcUrl) {
  const ok = await loadPdfBytes(dataUrlToBytes(dataUrl), name);
  if (!ok || skipArchive || !dataUrl) return;
  try {
    const code = await extractOrderCode();
    const archiveName = code ? ('Đơn ' + code + '.pdf') : (name || docName);
    PWArchive.save(dataUrl, archiveName, srcUrl || '', code)
      .then(r => {
        if (r && r.ok && !r.dup) toast('Đã lưu vào lịch sử đơn đã in.');
      })
      .catch(() => { });
  } catch (e) { /* ignore */ }
}

let lastFailedUrl = '';

function showLoadError(url, msg) {
  lastFailedUrl = url;
  showDropzone(true);
  $('#loadError').classList.remove('hidden');
  $('#loadErrorMsg').textContent = msg || 'Lỗi không rõ';
}

async function loadPdfUrl(url) {
  $('#loadError').classList.add('hidden');
  setBusy('Đang tải PDF...');
  try {
    const resp = await chrome.runtime.sendMessage({ type: 'PW_FETCH_PDF', url });
    if (resp && resp.ok) {
      await loadPdfDataUrl(resp.data, guessNameFromUrl(url), url);
    } else {
      showLoadError(url, (resp && resp.error) || 'Lỗi không rõ');
    }
  } catch (e) {
    showLoadError(url, String(e && e.message || e));
  }
  setBusy(null);
}

async function loadPdfFile(file) {
  if (!file) return;
  const buf = await file.arrayBuffer();
  await loadPdfBytes(new Uint8Array(buf), file.name);
}

async function initFromParams() {
  const q = new URLSearchParams(location.search);
  const src = q.get('src');
  if (src === 'data') {
    const id = q.get('id');
    try {
      const resp = await chrome.runtime.sendMessage({ type: 'PW_GET_PDF', id });
      if (resp && resp.ok && resp.payload && resp.payload.data) {
        await loadPdfDataUrl(resp.payload.data, resp.payload.name, resp.payload.url || '');
        chrome.runtime.sendMessage({ type: 'PW_CLEAN_PDF', id }).catch(() => { });
        return;
      }
    } catch (e) { /* ignore */ }
  } else if (src === 'archive') {
    const id = q.get('id');
    if (id) {
      try {
        const rec = await PWArchive.getFull(id);
        if (rec && rec.data) {
          skipArchive = true;
          await loadPdfBytes(dataUrlToBytes(rec.data), rec.name);
          return;
        }
        showLoadError('', 'Không tìm thấy đơn trong lịch sử (có thể đã bị xoá)');
      } catch (e) {
        showLoadError('', String(e && e.message || e));
      }
    }
  } else if (src === 'url') {
    const id = q.get('id');
    if (id) {
      try {
        const resp = await chrome.runtime.sendMessage({ type: 'PW_GET_PDF_URL', id });
        if (resp && resp.ok && resp.url) {
          await loadPdfUrl(resp.url);
          return;
        }
      } catch (e) { /* ignore */ }
    }
    const url = q.get('url') || '';
    if (url) { await loadPdfUrl(decodeURIComponent(url)); return; }
  }
  showDropzone(true);
}

// ---------- render ----------
function showDropzone(show) {
  $('#dropzone').classList.toggle('hidden', !show);
  $('#pages').classList.toggle('hidden', show);
  if (!show) {
    $('#dropzone').classList.add('hidden');
    $('#loadError').classList.add('hidden');
  }
  if (show) {
    $('#docName').textContent = 'Chưa có file PDF';
    $('#docPages').textContent = '';
  }
}

async function renderAllPages() {
  const container = $('#pages');
  container.innerHTML = '';
  pages = [];
  const targetW = 1500;

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const vp1 = page.getViewport({ scale: 1 });
    const scale = targetW / vp1.width;
    const vp = page.getViewport({ scale });

    const base = document.createElement('canvas');
    base.width = Math.floor(vp.width);
    base.height = Math.floor(vp.height);
    await page.render({ canvasContext: base.getContext('2d'), viewport: vp }).promise;

    const ovl = document.createElement('canvas');
    ovl.className = 'overlay';
    ovl.width = base.width;
    ovl.height = base.height;

    const pageEl = document.createElement('div');
    pageEl.className = 'page';
    pageEl.dataset.page = i;
    pageEl.append(base, ovl);
    container.append(pageEl);

    pages.push({ index: i, el: pageEl, base, ovl, ptW: vp1.width, ptH: vp1.height, scale });
  }

  showDropzone(false);
  $('#docName').textContent = docName;
  $('#docPages').textContent = pdfDoc.numPages + ' trang';
  applyZoom();
  drawOverlays();
  buildHandles();
  preparePrintStyle();
}

function applyZoom() {
  if (!pages.length) return;
  const stage = $('#stage');
  const fitW = Math.max(280, stage.clientWidth - 48);
  for (const p of pages) {
    p.el.style.width = zoom === 'fit'
      ? Math.min(fitW, 860) + 'px'
      : Math.round(fitW * zoom / 100) + 'px';
  }
  $('#zoomLabel').textContent = zoom === 'fit' ? 'Vừa khung' : zoom + '%';
}

function preparePrintStyle() {
  if (!pages.length) return;
  const p0 = pages[0];
  $('#pageStyle').textContent = '@page { size: ' + p0.ptW + 'pt ' + p0.ptH + 'pt; margin: 0; }';
}

// ---------- watermark drawing ----------
function getImage(dataUrl) {
  if (!dataUrl) return Promise.resolve(null);
  if (imgCache.has(dataUrl)) return imgCache.get(dataUrl);
  const entry = { ok: false, img: null, w: 0, h: 0 };
  const p = new Promise(res => {
    const img = new Image();
    img.onload = () => {
      entry.ok = true;
      entry.img = img;
      entry.w = img.naturalWidth;
      entry.h = img.naturalHeight;
      res(entry);
    };
    img.onerror = () => res(entry);
    img.src = dataUrl;
  });
  p.entry = entry;
  imgCache.set(dataUrl, p);
  return p;
}

function getCachedImage(dataUrl) {
  if (!dataUrl) return null;
  const p = imgCache.get(dataUrl);
  return (p && p.entry) || null;
}

function positionsFor(layer, W, H) {
  const cx = (layer.x / 100) * W;
  const cy = (layer.y / 100) * H;
  if (layer.repeat !== 'tile') return [[cx, cy]];
  const sx = Math.max(24, layer.tileX || 45) / 100 * W;
  const sy = Math.max(24, layer.tileY || 30) / 100 * H;
  const nx = Math.ceil(W / sx) + 1;
  const ny = Math.ceil(H / sy) + 1;
  const out = [];
  const m = 260;
  for (let i = -nx; i <= nx; i++) {
    for (let j = -ny; j <= ny; j++) {
      const x = cx + i * sx;
      const y = cy + j * sy;
      if (x < -m || x > W + m || y < -m || y > H + m) continue;
      out.push([x, y]);
    }
  }
  return out;
}

function drawLayerSync(ctx, layer, ptW, ptH, scale, imgEnt) {
  const W = ptW * scale;
  const H = ptH * scale;
  const thermal = !!cfg.thermal;

  if (layer.type === 'text') {
    const text = String(layer.text || '');
    if (!text.trim()) return;
    ctx.save();
    const baseAlpha = clamp((layer.opacity || 0) / 100, 0.02, 1);
    ctx.globalAlpha = thermal ? Math.min(1, baseAlpha + 0.45) : baseAlpha;
    ctx.fillStyle = thermal ? '#000000' : (layer.color || '#000');
    const fs = (layer.fontSize || 20) * scale;
    ctx.font = (layer.italic ? 'italic ' : '') + (layer.bold ? '700 ' : '400 ') + fs + 'px "' + (layer.fontFamily || 'Arial') + '", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = text.split(/\r?\n/);
    const lh = fs * 1.25;
    const rot = (layer.rotation || 0) * Math.PI / 180;
    for (const [cx, cy] of positionsFor(layer, W, H)) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      const y0 = -((lines.length - 1) * lh) / 2;
      for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], 0, y0 + i * lh);
      ctx.restore();
    }
    ctx.restore();
  } else if (layer.type === 'image') {
    if (!imgEnt || !imgEnt.ok) return;
    ctx.save();
    const baseAlpha = clamp((layer.opacity || 0) / 100, 0.02, 1);
    ctx.globalAlpha = thermal ? Math.min(1, baseAlpha + 0.45) : baseAlpha;
    const w = (layer.width || 20) / 100 * W;
    const h = w * (imgEnt.h / imgEnt.w);
    const rot = (layer.rotation || 0) * Math.PI / 180;
    for (const [cx, cy] of positionsFor(layer, W, H)) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.drawImage(imgEnt.img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    ctx.restore();
  }
}

async function drawLayer(ctx, layer, ptW, ptH, scale) {
  let imgEnt = null;
  if (layer.type === 'image' && layer.dataUrl) {
    imgEnt = await getImage(layer.dataUrl);
  }
  drawLayerSync(ctx, layer, ptW, ptH, scale, imgEnt);
}

function scheduleRedraw() {
  if (redrawQueued) return;
  redrawQueued = true;
  requestAnimationFrame(() => {
    redrawQueued = false;
    drawOverlays();
  });
}

async function drawOverlays() {
  const tasks = [];
  for (const p of pages) {
    const ctx = p.ovl.getContext('2d');
    ctx.clearRect(0, 0, p.ovl.width, p.ovl.height);
    if (!cfg.enabled) continue;
    for (const layer of cfg.layers) {
      tasks.push(drawLayer(ctx, layer, p.ptW, p.ptH, p.scale));
    }
  }
  await Promise.all(tasks);
}

// ---------- handles & drag ----------
function buildHandles() {
  $$('.wm-handle').forEach(h => h.remove());
  if (!editing || !pages.length) return;
  for (const p of pages) {
    for (const layer of cfg.layers) {
      const h = document.createElement('div');
      h.className = 'wm-handle' + (cfg.enabled ? '' : ' off');
      h.dataset.layer = layer.id;
      h.style.left = layer.x + '%';
      h.style.top = layer.y + '%';
      h.title = layer.type === 'text' ? (layer.text || 'Chữ') : 'Logo';
      p.el.append(h);
    }
  }
}

function syncLayerInputs(layer) {
  const card = $('[data-layer-card="' + layer.id + '"]');
  if (!card) return;
  const x = card.querySelector('.f-x');
  const y = card.querySelector('.f-y');
  if (x) x.value = layer.x;
  if (y) y.value = layer.y;
}

$('#pages').addEventListener('pointerdown', e => {
  const h = e.target.closest('.wm-handle');
  if (!h) return;
  const layer = cfg.layers.find(l => l.id === h.dataset.layer);
  if (!layer) return;
  const pageEl = h.closest('.page');
  drag = { layer, pageEl };
  e.preventDefault();
});

window.addEventListener('pointermove', e => {
  if (!drag) return;
  const r = drag.pageEl.getBoundingClientRect();
  drag.layer.x = clampPct((e.clientX - r.left) / r.width * 100);
  drag.layer.y = clampPct((e.clientY - r.top) / r.height * 100);
  $$('.wm-handle[data-layer="' + drag.layer.id + '"]').forEach(hh => {
    hh.style.left = drag.layer.x + '%';
    hh.style.top = drag.layer.y + '%';
  });
  syncLayerInputs(drag.layer);
  scheduleRedraw();
});

window.addEventListener('pointerup', () => {
  if (drag) { drag = null; saveCfg(); }
});

// ---------- sidebar ----------
function fontOptions(selected) {
  return FONT_LIST.map(f => '<option value="' + f + '"' + (f === selected ? ' selected' : '') + '>' + f + '</option>').join('');
}

function renderSidebar() {
  $('#wmEnabled').checked = !!cfg.enabled;
  $('#thermalMode').checked = !!cfg.thermal;
  const list = $('#layerList');
  list.innerHTML = '';

  if (!cfg.layers.length) {
    const d = document.createElement('div');
    d.className = 'empty-layers';
    d.innerHTML = 'Chưa có watermark nào.<br>Bấm <b>+ Thêm chữ</b> hoặc <b>+ Thêm logo</b> bên dưới.';
    list.append(d);
    return;
  }

  for (const layer of cfg.layers) {
    list.append(layer.type === 'text' ? buildTextCard(layer) : buildImageCard(layer));
  }
}

function cardHead(layer, label, img) {
  const head = document.createElement('div');
  head.className = 'card-head';
  const badge = document.createElement('span');
  badge.className = 'badge' + (img ? ' img' : '');
  badge.textContent = label;
  const spacer = document.createElement('div');
  spacer.className = 'spacer';
  const dup = document.createElement('button');
  dup.className = 'mini-btn';
  dup.textContent = 'Nhân bản';
  dup.onclick = () => {
    const copy = JSON.parse(JSON.stringify(layer));
    copy.id = uid();
    const idx = cfg.layers.findIndex(l => l.id === layer.id);
    cfg.layers.splice(idx + 1, 0, copy);
    saveCfg(); renderSidebar(); buildHandles(); drawOverlays();
  };
  const del = document.createElement('button');
  del.className = 'mini-btn del';
  del.textContent = 'Xóa';
  del.onclick = () => {
    cfg.layers = cfg.layers.filter(l => l.id !== layer.id);
    saveCfg(); renderSidebar(); buildHandles(); drawOverlays();
  };
  head.append(badge, spacer, dup, del);
  return head;
}

function fld(labelText, input, valueEl) {
  const l = document.createElement('label');
  l.className = 'fld';
  const s = document.createElement('span');
  s.className = 'lbl';
  s.textContent = labelText;
  l.append(s, input);
  if (valueEl) l.append(valueEl);
  return l;
}

function range(min, max, value) {
  const r = document.createElement('input');
  r.type = 'range';
  r.min = min; r.max = max; r.value = value;
  return r;
}

function num(value, min, max, step) {
  const n = document.createElement('input');
  n.type = 'number';
  n.value = value;
  if (min !== undefined) n.min = min;
  if (max !== undefined) n.max = max;
  if (step !== undefined) n.step = step;
  return n;
}

function bindCommon(layer, card) {
  const bind = (sel, key, transform) => {
    const el = card.querySelector(sel);
    if (!el) return;
    const ev = el.type === 'range' || el.type === 'color' ? 'input' : 'change';
    el.addEventListener(ev, () => {
      let v = el.type === 'checkbox' ? el.checked : el.value;
      if (transform) v = transform(v);
      layer[key] = v;
      if (key === 'x' || key === 'y') {
        $$('.wm-handle[data-layer="' + layer.id + '"]').forEach(hh => {
          hh.style.left = layer.x + '%';
          hh.style.top = layer.y + '%';
        });
      }
      saveCfg();
      scheduleRedraw();
    });
  };
  bind('.f-opacity', 'opacity', v => +v);
  bind('.f-rotation', 'rotation', v => +v);
  bind('.f-x', 'x', v => clampPct(+v));
  bind('.f-y', 'y', v => clampPct(+v));
  bind('.f-repeat', 'repeat');
  bind('.f-tileX', 'tileX', v => +v);
  bind('.f-tileY', 'tileY', v => +v);
}

function buildTextCard(layer) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.layerCard = layer.id;
  card.append(cardHead(layer, 'Chữ', false));

  const ta = document.createElement('textarea');
  ta.className = 'f-text';
  ta.rows = 2;
  ta.value = layer.text || '';
  ta.placeholder = 'Nhập nội dung watermark...';
  ta.addEventListener('input', () => {
    layer.text = ta.value;
    const h = $('.wm-handle[data-layer="' + layer.id + '"]');
    if (h) h.title = ta.value || 'Chữ';
    saveCfg(); scheduleRedraw();
  });
  card.append(ta);

  const row1 = document.createElement('div');
  row1.className = 'row';
  const font = document.createElement('select');
  font.className = 'f-font';
  font.innerHTML = fontOptions(layer.fontFamily);
  font.addEventListener('change', () => { layer.fontFamily = font.value; saveCfg(); scheduleRedraw(); });
  const size = num(layer.fontSize, 6, 300, 1);
  size.style.maxWidth = '84px';
  size.addEventListener('change', () => { layer.fontSize = clamp(+size.value || 20, 6, 300); size.value = layer.fontSize; saveCfg(); scheduleRedraw(); });
  row1.append(font, size);
  card.append(row1);

  const row2 = document.createElement('div');
  row2.className = 'row';
  const color = document.createElement('input');
  color.type = 'color';
  color.className = 'f-color';
  color.value = layer.color || '#e11d48';
  color.style.flex = '0 0 40px';
  color.style.height = '30px';
  color.style.padding = '2px';
  color.style.border = '1px solid var(--border)';
  color.style.borderRadius = '6px';
  color.addEventListener('input', () => { layer.color = color.value; saveCfg(); scheduleRedraw(); });
  const lblBold = document.createElement('label');
  const cbBold = document.createElement('input');
  cbBold.type = 'checkbox';
  cbBold.className = 'f-bold';
  cbBold.checked = !!layer.bold;
  cbBold.addEventListener('change', () => { layer.bold = cbBold.checked; saveCfg(); scheduleRedraw(); });
  lblBold.append(cbBold, document.createTextNode(' Đậm'));
  const lblItalic = document.createElement('label');
  const cbItalic = document.createElement('input');
  cbItalic.type = 'checkbox';
  cbItalic.className = 'f-italic';
  cbItalic.checked = !!layer.italic;
  cbItalic.addEventListener('change', () => { layer.italic = cbItalic.checked; saveCfg(); scheduleRedraw(); });
  lblItalic.append(cbItalic, document.createTextNode(' Nghiêng'));
  row2.append(color, lblBold, lblItalic);
  card.append(row2);

  const opV = document.createElement('span');
  opV.className = 'v';
  opV.textContent = layer.opacity + '%';
  const op = range(5, 100, layer.opacity);
  op.className = 'f-opacity';
  op.addEventListener('input', () => { opV.textContent = op.value + '%'; });
  card.append(fld('Độ mờ', op, opV));

  const rotV = document.createElement('span');
  rotV.className = 'v';
  rotV.textContent = layer.rotation + '°';
  const rot = range(-180, 180, layer.rotation);
  rot.className = 'f-rotation';
  rot.addEventListener('input', () => { rotV.textContent = rot.value + '°'; });
  card.append(fld('Xoay', rot, rotV));

  const rowPos = document.createElement('div');
  rowPos.className = 'row';
  const lx = document.createElement('label');
  lx.append(document.createTextNode('X % '));
  const inX = num(layer.x, 0, 100, 0.5);
  inX.className = 'f-x';
  lx.append(inX);
  const ly = document.createElement('label');
  ly.append(document.createTextNode('Y % '));
  const inY = num(layer.y, 0, 100, 0.5);
  inY.className = 'f-y';
  ly.append(inY);
  rowPos.append(lx, ly);
  card.append(rowPos);

  const rep = document.createElement('select');
  rep.className = 'f-repeat';
  rep.innerHTML = '<option value="none">Không lặp - 1 dấu</option><option value="tile">Lặp kín trang</option>';
  rep.value = layer.repeat || 'none';
  card.append(fld('Chế độ', rep));

  const rowTile = document.createElement('div');
  rowTile.className = 'row';
  const ltx = document.createElement('label');
  ltx.append(document.createTextNode('Cách X % '));
  const inTx = num(layer.tileX, 24, 100, 1);
  inTx.className = 'f-tileX';
  ltx.append(inTx);
  const lty = document.createElement('label');
  lty.append(document.createTextNode('Cách Y % '));
  const inTy = num(layer.tileY, 24, 100, 1);
  inTy.className = 'f-tileY';
  lty.append(inTy);
  rowTile.append(ltx, lty);
  card.append(rowTile);

  bindCommon(layer, card);
  return card;
}

function buildImageCard(layer) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.layerCard = layer.id;
  card.append(cardHead(layer, 'Logo', true));

  const wrap = document.createElement('div');
  wrap.className = 'thumb-wrap';
  const thumb = document.createElement('img');
  if (layer.dataUrl) thumb.src = layer.dataUrl;
  const btn = document.createElement('button');
  btn.className = 'tb-btn';
  btn.textContent = layer.dataUrl ? 'Đổi ảnh' : 'Chọn ảnh logo';
  btn.onclick = () => {
    currentImgLayerId = layer.id;
    $('#imgInput').value = '';
    $('#imgInput').click();
  };
  wrap.append(thumb, btn);
  card.append(wrap);

  const wV = document.createElement('span');
  wV.className = 'v';
  wV.textContent = layer.width + '%';
  const w = range(2, 100, layer.width);
  w.className = 'f-width';
  w.addEventListener('input', () => {
    layer.width = +w.value;
    wV.textContent = w.value + '%';
    saveCfg(); scheduleRedraw();
  });
  card.append(fld('Rộng', w, wV));

  const opV = document.createElement('span');
  opV.className = 'v';
  opV.textContent = layer.opacity + '%';
  const op = range(5, 100, layer.opacity);
  op.className = 'f-opacity';
  op.addEventListener('input', () => { opV.textContent = op.value + '%'; });
  card.append(fld('Độ mờ', op, opV));

  const rotV = document.createElement('span');
  rotV.className = 'v';
  rotV.textContent = layer.rotation + '°';
  const rot = range(-180, 180, layer.rotation);
  rot.className = 'f-rotation';
  rot.addEventListener('input', () => { rotV.textContent = rot.value + '°'; });
  card.append(fld('Xoay', rot, rotV));

  const rowPos = document.createElement('div');
  rowPos.className = 'row';
  const lx = document.createElement('label');
  lx.append(document.createTextNode('X % '));
  const inX = num(layer.x, 0, 100, 0.5);
  inX.className = 'f-x';
  lx.append(inX);
  const ly = document.createElement('label');
  ly.append(document.createTextNode('Y % '));
  const inY = num(layer.y, 0, 100, 0.5);
  inY.className = 'f-y';
  ly.append(inY);
  rowPos.append(lx, ly);
  card.append(rowPos);

  const rep = document.createElement('select');
  rep.className = 'f-repeat';
  rep.innerHTML = '<option value="none">Không lặp - 1 dấu</option><option value="tile">Lặp kín trang</option>';
  rep.value = layer.repeat || 'none';
  card.append(fld('Chế độ', rep));

  const rowTile = document.createElement('div');
  rowTile.className = 'row';
  const ltx = document.createElement('label');
  ltx.append(document.createTextNode('Cách X % '));
  const inTx = num(layer.tileX, 24, 100, 1);
  inTx.className = 'f-tileX';
  ltx.append(inTx);
  const lty = document.createElement('label');
  lty.append(document.createTextNode('Cách Y % '));
  const inTy = num(layer.tileY, 24, 100, 1);
  inTy.className = 'f-tileY';
  lty.append(inTy);
  rowTile.append(ltx, lty);
  card.append(rowTile);

  bindCommon(layer, card);
  return card;
}

// ---------- print / download ----------
function composePageCanvas(p) {
  const tmp = document.createElement('canvas');
  tmp.width = p.base.width;
  tmp.height = p.base.height;
  const c = tmp.getContext('2d');
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, tmp.width, tmp.height);
  c.drawImage(p.base, 0, 0);
  if (cfg.enabled) {
    for (const layer of cfg.layers) {
      const ent = layer.type === 'image' ? getCachedImage(layer.dataUrl) : null;
      drawLayerSync(c, layer, p.ptW, p.ptH, p.scale, ent);
    }
  }
  return tmp;
}

function preparePrintRoot(force) {
  const existing = $('#printRoot');
  if (existing && !force) return;
  if (existing) existing.remove();
  if (!pages.length) return;
  const root = document.createElement('div');
  root.id = 'printRoot';
  for (const p of pages) {
    const wrap = document.createElement('div');
    wrap.className = 'print-page';
    wrap.style.width = p.ptW + 'pt';
    wrap.style.height = p.ptH + 'pt';
    const img = document.createElement('img');
    img.src = composePageCanvas(p).toDataURL('image/jpeg', 0.92);
    wrap.append(img);
    root.append(wrap);
  }
  document.body.append(root);
}

async function printPdf() {
  if (!pages.length) { toast('Chưa có file PDF để in.'); return; }
  setBusy('Đang chuẩn bị in...');
  for (const layer of cfg.layers) {
    if (layer.type === 'image' && layer.dataUrl) await getImage(layer.dataUrl);
  }
  await drawOverlays();
  preparePrintStyle();
  preparePrintRoot(true);
  setBusy(null);
  setTimeout(() => window.print(), 60);
}

async function downloadPdf() {
  if (!pages.length) { toast('Chưa có file PDF để tải.'); return; }
  setBusy('Đang tạo PDF...');
  try {
    const { PDFDocument } = PDFLib;
    const out = await PDFDocument.create();
    for (const p of pages) {
      const jpg = composePageCanvas(p).toDataURL('image/jpeg', 0.92);
      const img = await out.embedJpg(jpg);
      const page = out.addPage([p.ptW, p.ptH]);
      page.drawImage(img, { x: 0, y: 0, width: p.ptW, height: p.ptH });
    }
    const bytes = await out.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docName.replace(/\.pdf$/i, '') + '-watermark.pdf';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast('Đã tạo PDF có watermark.');
  } catch (e) {
    toast('Lỗi khi tạo PDF: ' + (e && e.message || e));
  }
  setBusy(null);
}

// ---------- events ----------
function wireEvents() {
  $('#btnPrint').onclick = printPdf;
  $('#btnDownload').onclick = downloadPdf;

  $('#btnOpenFile').onclick = () => { $('#fileInput').value = ''; $('#fileInput').click(); };
  $('#fileInput').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) loadPdfFile(f);
  });

  $('#imgInput').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f || !currentImgLayerId) return;
    const layer = cfg.layers.find(l => l.id === currentImgLayerId);
    if (!layer) return;
    const r = new FileReader();
    r.onload = () => {
      layer.dataUrl = String(r.result);
      saveCfg();
      renderSidebar();
      drawOverlays();
      toast('Đã thêm logo.');
    };
    r.readAsDataURL(f);
  });

  $('#btnToggleWm').onclick = () => {
    editing = !editing;
    $('#sidebar').classList.toggle('hidden', !editing);
    $('#btnToggleWm').classList.toggle('primary', editing);
    renderSidebar();
    buildHandles();
    if (editing) applyZoom();
  };
  $('#sbClose').onclick = () => {
    editing = false;
    $('#sidebar').classList.add('hidden');
    $('#btnToggleWm').classList.remove('primary');
    buildHandles();
    applyZoom();
  };

  $('#wmEnabled').addEventListener('change', e => {
    cfg.enabled = e.target.checked;
    saveCfg();
    drawOverlays();
    buildHandles();
  });

  $('#thermalMode').addEventListener('change', e => {
    cfg.thermal = e.target.checked;
    saveCfg();
    drawOverlays();
  });

  $('#addText').onclick = () => {
    cfg.layers.push(newTextLayer());
    saveCfg(); renderSidebar(); buildHandles(); drawOverlays();
  };
  $('#addLogo').onclick = () => {
    const l = newImageLayer();
    cfg.layers.push(l);
    saveCfg(); renderSidebar(); buildHandles(); drawOverlays();
    currentImgLayerId = l.id;
    $('#imgInput').value = '';
    $('#imgInput').click();
  };
  $('#resetAll').onclick = () => {
    if (!confirm('Xóa toàn bộ watermark đã cấu hình?')) return;
    cfg = defaultCfg();
    saveCfg(); renderSidebar(); buildHandles(); drawOverlays();
  };

  $('#zoomIn').onclick = () => {
    zoom = zoom === 'fit' ? 100 : Math.min(300, zoom + 25);
    cfg.zoom = zoom;
    saveCfg();
    applyZoom();
  };
  $('#zoomOut').onclick = () => {
    zoom = zoom === 'fit' ? 75 : Math.max(25, zoom - 25);
    cfg.zoom = zoom;
    saveCfg();
    applyZoom();
  };
  $('#zoomFit').onclick = () => {
    zoom = 'fit';
    cfg.zoom = 'fit';
    saveCfg();
    applyZoom();
  };

  window.addEventListener('resize', () => { if (zoom === 'fit') applyZoom(); });

  $('#btnRetry').addEventListener('click', () => {
    if (lastFailedUrl) loadPdfUrl(lastFailedUrl);
  });
  $('#btnOpenNormal').addEventListener('click', async () => {
    if (!lastFailedUrl) return;
    try {
      await chrome.runtime.sendMessage({ type: 'PW_OPEN_NORMAL', url: lastFailedUrl });
    } catch (e) {
      chrome.tabs.create({ url: lastFailedUrl });
    }
  });

  const stage = $('#stage');
  stage.addEventListener('dragover', e => { e.preventDefault(); stage.classList.add('dragover'); });
  stage.addEventListener('dragleave', () => stage.classList.remove('dragover'));
  stage.addEventListener('drop', e => {
    e.preventDefault();
    stage.classList.remove('dragover');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) loadPdfFile(f);
  });

  window.addEventListener('beforeprint', () => {
    drawOverlays();
    preparePrintStyle();
    preparePrintRoot(false);
  });
  window.addEventListener('afterprint', () => {
    const r = $('#printRoot');
    if (r) r.remove();
  });
}

// ---------- init ----------
(async function init() {
  await loadCfg();
  zoom = cfg.zoom || 'fit';
  renderSidebar();
  wireEvents();
  await initFromParams();
})();
