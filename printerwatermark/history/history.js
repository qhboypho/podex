'use strict';

const $ = (s, el = document) => el.querySelector(s);
let all = [];

function fmtSize(n) {
  if (!n) return '';
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(1) + ' MB';
}

function safePdfName(name) {
  const s = String(name || 'don-hang.pdf').replace(/[\\/:*?"<>|]+/g, '-').trim();
  return /\.pdf$/i.test(s) ? s : s + '.pdf';
}

function dayKey(t) {
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function sameLocalDay(t, ref) {
  return dayKey(t) === dayKey(ref);
}

function fmtDay(t) {
  try {
    const d = new Date(t);
    const today = dayKey(Date.now()) === dayKey(t);
    return (today ? 'Hôm nay · ' : '') + d.toLocaleDateString('vi-VN');
  } catch (e) { return ''; }
}

function fmtClock(t) {
  try { return new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; }
}

function matchQ(m, q) {
  return (
    (m.name || '').toLowerCase().includes(q) ||
    (m.url || '').toLowerCase().includes(q) ||
    (m.code || '').toLowerCase().includes(q) ||
    (m.file || '').toLowerCase().includes(q) ||
    (m.prod || '').toLowerCase().includes(q) ||
    (m.shop || '').toLowerCase().includes(q)
  );
}

function filtered() {
  const q = $('#q').value.trim().toLowerCase();
  if (q) return all.filter(m => matchQ(m, q));
  const range = $('#range').value;
  if (range === 'all') return all.slice();
  if (range === '7') return all.filter(m => (m.savedAt || 0) >= Date.now() - 7 * 86400000);
  if (range === '30') return all.filter(m => (m.savedAt || 0) >= Date.now() - 30 * 86400000);
  if (range === 'day') {
    const pick = $('#dayPick').value;
    if (!pick) return all.slice();
    const [y, mo, d] = pick.split('-').map(Number);
    const t = new Date(y, mo - 1, d).getTime();
    return all.filter(m => sameLocalDay(m.savedAt || 0, t));
  }
  return all.filter(m => sameLocalDay(m.savedAt || 0, Date.now()));
}

function showError(msg) {
  const box = $('#pageError');
  if (!msg) {
    box.classList.add('hidden');
    box.textContent = '';
    return;
  }
  box.textContent = msg;
  box.classList.remove('hidden');
}

function buildItem(m) {
  const item = document.createElement('div');
  item.className = 'item';
  item.title = 'Bấm để mở lại & in: ' + (m.name || 'don-hang.pdf');
  item.onclick = () => openRecord(m.id);

  const info = document.createElement('div');
  info.className = 'info';
  const name = document.createElement('div');
  name.className = 'name';
  const nameText = document.createElement('span');
  nameText.textContent = m.name || 'don-hang.pdf';
  name.append(nameText);
  if (m.count > 0) {
    const badge = document.createElement('span');
    badge.className = 'count';
    badge.textContent = String(m.count);
    badge.title = m.count + ' đơn trong file này';
    name.append(badge);
  }
  const meta = document.createElement('div');
  meta.className = 'meta';
  const bits = [
    { cls: 'time', text: fmtClock(m.savedAt) },
    { cls: 'shop', text: m.shop || '' },
    { cls: 'file', text: (m.file && m.file !== m.name) ? ('file: ' + m.file) : '' },
    { cls: 'size', text: fmtSize(m.size) },
    { cls: 'prod', text: m.prod || '' }
  ].filter(b => b.text);
  for (const b of bits) {
    const span = document.createElement('span');
    span.className = b.cls;
    span.textContent = b.text;
    if (b.cls === 'prod') span.title = b.text;
    meta.append(span);
  }
  info.append(name, meta);

  const actions = document.createElement('div');
  actions.className = 'actions';

  const btnOpen = document.createElement('button');
  btnOpen.className = 'mini';
  btnOpen.textContent = 'Xem & In';
  btnOpen.onclick = e => { e.stopPropagation(); openRecord(m.id); };

  const btnDl = document.createElement('button');
  btnDl.className = 'mini';
  btnDl.textContent = 'Tải PDF';
  btnDl.onclick = e => { e.stopPropagation(); downloadItem(m, btnDl); };

  const btnDel = document.createElement('button');
  btnDel.className = 'mini danger';
  btnDel.textContent = 'Xoá';
  btnDel.onclick = async e => {
    e.stopPropagation();
    if (!confirm('Xoá đơn "' + (m.name || 'don-hang.pdf') + '" khỏi lịch sử?')) return;
    try { await PWArchive.remove(m.id); } catch (err) { }
    all = all.filter(x => x.id !== m.id);
    render();
    updateStats();
  };

  actions.append(btnOpen, btnDl, btnDel);
  item.append(info, actions);
  return item;
}

function render() {
  const list = filtered();
  const box = $('#list');
  box.textContent = '';
  $('#empty').classList.toggle('hidden', all.length > 0);

  let lastKey = '';
  for (const m of list) {
    const key = dayKey(m.savedAt || 0);
    if (key !== lastKey) {
      lastKey = key;
      const group = list.filter(x => dayKey(x.savedAt || 0) === key);
      const orders = group.reduce((s, x) => s + (x.count || 0), 0);
      const head = document.createElement('div');
      head.className = 'day-head';
      head.textContent = fmtDay(m.savedAt) + ' — ' + group.length + ' file' +
        (orders ? ' · ' + orders + ' đơn' : '');
      box.append(head);
    }
    box.append(buildItem(m));
  }

  if (all.length > 0 && list.length === 0) {
    const p = document.createElement('p');
    p.style.cssText = 'text-align:center;color:#5f6368;font-size:13.5px';
    p.textContent = 'Không có file nào khớp bộ lọc.';
    box.append(p);
  }
}

function openRecord(id) {
  chrome.tabs.create({
    url: chrome.runtime.getURL('viewer/viewer.html?src=archive&id=' + encodeURIComponent(id))
  });
}

async function downloadItem(m, btn) {
  btn.disabled = true;
  btn.textContent = '...';
  try {
    const rec = await PWArchive.getFull(m.id);
    if (!rec || !rec.data) throw new Error('Không đọc được file từ lịch sử');
    const blob = await (await fetch(rec.data)).blob();
    const url = URL.createObjectURL(blob);
    const dl = await chrome.downloads.download({ url, filename: safePdfName(m.name), saveAs: false });
    if (dl) {
      chrome.downloads.onChanged.addListener(function listener(ev) {
        if (ev.id === dl && (ev.state && (ev.state.current === 'complete' || ev.state.current === 'interrupted'))) {
          chrome.downloads.onChanged.removeListener(listener);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
      });
    }
  } catch (e) {
    alert('Lỗi khi tải: ' + (e && e.message || e));
  }
  btn.disabled = false;
  btn.textContent = 'Tải PDF';
}

async function updateStats() {
  const total = all.reduce((s, m) => s + (m.size || 0), 0);
  const todayCount = all.filter(m => sameLocalDay(m.savedAt || 0, Date.now())).length;
  const parts = [
    all.length + ' đơn đã lưu' + (todayCount ? (' · hôm nay ' + todayCount) : '')
  ];
  if (total) parts.push('dùng ' + fmtSize(total));
  try {
    const cfg = await chrome.storage.sync.get({ archiveDays: 30 });
    parts.push('giữ ' + cfg.archiveDays + ' ngày rồi tự xoá');
  } catch (e) { }
  $('#stats').textContent = parts.join(' · ');
}

async function load() {
  $('#stats').textContent = 'Đang tải...';
  showError('');
  try {
    await PWArchive.maybeSweep();
    all = await PWArchive.list();
    render();
  } catch (e) {
    all = [];
    render();
    showError('Không đọc được lịch sử: ' + (e && e.message || e) +
      '. Thử bấm Làm mới; nếu vẫn lỗi, vào chrome://extensions bấm Reload (⟳) trên extension.');
  }
  updateStats();
}

let toastTimer = null;
function toastMsg(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3500);
}

async function importPdf(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  try {
    const bytes = new Uint8Array(await f.arrayBuffer());
    if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
      toastMsg('File này không phải PDF.');
      return;
    }
    let bin = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    const dataUrl = 'data:application/pdf;base64,' + btoa(bin);
    const r = await PWArchive.save(dataUrl, f.name, '', '', f.name);
    if (r && r.ok) toastMsg('Đã thêm vào lịch sử: ' + f.name);
    else toastMsg('Không lưu được: ' + (r && r.error || 'lỗi không rõ'));
    await load();
  } catch (err) {
    showError('Không thêm được PDF: ' + (err && err.message || err));
  }
}

async function exportBackup() {
  if (!all.length) {
    toastMsg('Chưa có gì để backup.');
    return;
  }
  toastMsg('Đang tạo file backup...');
  try {
    const records = [];
    for (const m of all) {
      const rec = await PWArchive.getFull(m.id);
      if (rec && rec.data) {
        records.push({
          id: rec.id, savedAt: rec.savedAt, expiresAt: rec.expiresAt,
          name: rec.name, file: rec.file, url: rec.url, code: rec.code,
          prod: rec.prod, shop: rec.shop, prefix: rec.prefix, seq: rec.seq,
          size: rec.size, data: rec.data
        });
      }
    }
    const payload = {
      app: 'watermark-in-don',
      version: 1,
      exportedAt: new Date().toISOString(),
      records
    };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const d = new Date();
    const fname = 'pw-backup-' + dayKey(Date.now()).replace(/-/g, '') + '-' +
      String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + '.json';
    const dl = await chrome.downloads.download({ url, filename: fname, saveAs: true });
    if (dl) {
      chrome.downloads.onChanged.addListener(function listener(ev) {
        if (ev.id === dl && (ev.state && (ev.state.current === 'complete' || ev.state.current === 'interrupted'))) {
          chrome.downloads.onChanged.removeListener(listener);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
      });
    }
    toastMsg('Đã xuất backup: ' + fname);
  } catch (err) {
    showError('Xuất backup lỗi: ' + (err && err.message || err));
  }
}

async function importBackup(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  try {
    const parsed = JSON.parse(await f.text());
    const records = parsed && Array.isArray(parsed.records) ? parsed.records : null;
    if (!records) {
      toastMsg('File backup không hợp lệ.');
      return;
    }
    toastMsg('Đang nhập ' + records.length + ' file...');
    const r = await PWArchive.importRecords(records);
    toastMsg('Đã nhập ' + r.added + ' file, bỏ qua ' + r.skipped + ' file (trùng hoặc không hợp lệ).');
    await load();
  } catch (err) {
    showError('Nhập backup lỗi: ' + (err && err.message || err));
  }
}

async function openTgModal() {
  try {
    const { tg } = await chrome.storage.local.get({ tg: null });
    $('#tgEnabled').checked = !!(tg && tg.enabled);
    $('#tgToken').value = (tg && tg.botToken) || '';
    $('#tgChatId').value = (tg && tg.chatId) || '';
  } catch (e) { }
  $('#tgModal').classList.remove('hidden');
}

async function saveTg() {
  const botToken = $('#tgToken').value.trim();
  const chatId = $('#tgChatId').value.trim();
  const enabled = $('#tgEnabled').checked;
  if (enabled && (!botToken || !chatId)) {
    toastMsg('Cần đủ Bot token và Chat ID.');
    return;
  }
  await chrome.storage.local.set({ tg: { enabled, botToken, chatId } });
  if (enabled) {
    const cfg = await chrome.storage.sync.get({ archiveDays: 30 });
    const r = await PWArchive.tgSetAutoDelete(cfg.archiveDays);
    if (r && r.ok) {
      toastMsg('Đã lưu. Telegram sẽ tự xoá file sau ' + cfg.archiveDays + ' ngày.');
      $('#tgModal').classList.add('hidden');
    } else {
      toastMsg('Đã lưu nhưng chưa set tự xoá: ' + (r && r.error || 'lỗi không rõ'));
    }
  } else {
    toastMsg('Đã lưu cấu hình Telegram.');
    $('#tgModal').classList.add('hidden');
  }
}

async function testTg() {
  const botToken = $('#tgToken').value.trim();
  const chatId = $('#tgChatId').value.trim();
  if (!botToken || !chatId) {
    toastMsg('Nhập Bot token và Chat ID trước đã.');
    return;
  }
  const r = await PWArchive.tgTest(botToken, chatId);
  toastMsg(r && r.ok ? 'Kết nối OK — mở group Telegram kiểm tra tin nhắn.' : 'Lỗi: ' + (r && r.error || 'không rõ'));
}

async function detectTgChatId() {
  const botToken = $('#tgToken').value.trim();
  if (!botToken) {
    toastMsg('Nhập Bot token trước đã.');
    return;
  }
  const r = await PWArchive.tgGetChatIds(botToken);
  if (!r || !r.ok) {
    toastMsg('Lỗi: ' + (r && r.error || 'không rõ'));
    return;
  }
  if (!r.chats.length) {
    toastMsg('Chưa thấy chat nào — gửi 1 tin nhắn bất kỳ trong group rồi bấm Dò lại.');
    return;
  }
  $('#tgChatId').value = r.chats[0].id;
  toastMsg('Thấy ' + r.chats.length + ' chat: ' + r.chats.map(c => c.title + ' (' + c.id + ')').join(', ') + ' — đã điền chat đầu tiên.');
}

function wire() {
  $('#q').addEventListener('input', render);
  const range = $('#range');
  range.addEventListener('change', () => {
    const isDay = range.value === 'day';
    $('#dayPick').classList.toggle('hidden', !isDay);
    if (isDay && !$('#dayPick').value) {
      const d = new Date();
      $('#dayPick').value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    render();
  });
  $('#dayPick').addEventListener('change', render);
  $('#refresh').onclick = load;
  $('#addPdf').onclick = () => { $('#pdfInput').value = ''; $('#pdfInput').click(); };
  $('#pdfInput').addEventListener('change', importPdf);
  $('#exportBtn').onclick = exportBackup;
  $('#importBtn').onclick = () => { $('#importInput').value = ''; $('#importInput').click(); };
  $('#importInput').addEventListener('change', importBackup);
  $('#tgConfig').onclick = openTgModal;
  $('#tgClose').onclick = () => $('#tgModal').classList.add('hidden');
  $('#tgSave').onclick = saveTg;
  $('#tgTest').onclick = testTg;
  $('#tgDetect').onclick = detectTgChatId;
  $('#clearAll').onclick = async () => {
    if (!all.length) return;
    if (!confirm('Xoá TOÀN BỘ ' + all.length + ' đơn đã lưu? Không thể hoàn tác.')) return;
    try { await PWArchive.clear(); } catch (e) { }
    all = [];
    render();
    updateStats();
  };
}

wire();
load();
