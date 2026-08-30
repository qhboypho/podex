'use strict';

const $ = (s, el = document) => el.querySelector(s);
let all = [];

function fmtTime(t) {
  try { return new Date(t).toLocaleString('vi-VN'); } catch (e) { return ''; }
}

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

function extractCode(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    for (const [k, v] of u.searchParams.entries()) {
      if (/(awb|order|tracking|parcel|sn)/i.test(k) && /^[A-Za-z0-9._-]{6,60}$/.test(v)) return v;
    }
    const seg = u.pathname.split('/').filter(Boolean).pop() || '';
    const m = seg.match(/^[A-Z0-9]{8,}$/);
    return m ? m[0] : '';
  } catch (e) {
    return '';
  }
}

function timeFloor(days) {
  const now = new Date();
  if (days === 1) {
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }
  return Date.now() - days * 86400000;
}

function filtered() {
  const q = $('#q').value.trim().toLowerCase();
  const days = Number($('#days').value) || 0;
  const from = days ? timeFloor(days) : 0;
  return all.filter(m => {
    if (from && (m.savedAt || 0) < from) return false;
    if (!q) return true;
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.url || '').toLowerCase().includes(q) ||
      (m.shop || '').toLowerCase().includes(q)
    );
  });
}

function render() {
  const list = filtered();
  const box = $('#list');
  box.textContent = '';
  $('#empty').classList.toggle('hidden', all.length > 0);

  for (const m of list) {
    const item = document.createElement('div');
    item.className = 'item';

    const info = document.createElement('div');
    info.className = 'info';
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = m.name || 'don-hang.pdf';
    name.title = m.name || '';
    const meta = document.createElement('div');
    meta.className = 'meta';
    const bits = [
      { cls: 'time', text: fmtTime(m.savedAt) },
      { cls: 'shop', text: m.shop || '' },
      { cls: 'code', text: extractCode(m.url) },
      { cls: 'size', text: fmtSize(m.size) }
    ].filter(b => b.text);
    for (const b of bits) {
      const span = document.createElement('span');
      span.className = b.cls;
      span.textContent = b.text;
      meta.append(span);
    }
    info.append(name, meta);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const btnOpen = document.createElement('button');
    btnOpen.className = 'mini';
    btnOpen.textContent = 'Xem & In';
    btnOpen.onclick = () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL('viewer/viewer.html?src=archive&id=' + encodeURIComponent(m.id))
      });
    };

    const btnDl = document.createElement('button');
    btnDl.className = 'mini';
    btnDl.textContent = 'Tải PDF';
    btnDl.onclick = () => downloadItem(m, btnDl);

    const btnDel = document.createElement('button');
    btnDel.className = 'mini danger';
    btnDel.textContent = 'Xoá';
    btnDel.onclick = async () => {
      if (!confirm('Xoá đơn "' + (m.name || 'don-hang.pdf') + '" khỏi lịch sử?')) return;
      try { await chrome.runtime.sendMessage({ type: 'PW_ARCHIVE_DELETE', id: m.id }); } catch (e) { }
      all = all.filter(x => x.id !== m.id);
      render();
      updateStats();
    };

    actions.append(btnOpen, btnDl, btnDel);
    item.append(info, actions);
    box.append(item);
  }

  if (all.length > 0 && list.length === 0) {
    const p = document.createElement('p');
    p.style.cssText = 'text-align:center;color:#5f6368;font-size:13.5px';
    p.textContent = 'Không có đơn nào khớp bộ lọc.';
    box.append(p);
  }
}

async function downloadItem(m, btn) {
  btn.disabled = true;
  btn.textContent = '...';
  try {
    const resp = await chrome.runtime.sendMessage({ type: 'PW_ARCHIVE_GET', id: m.id });
    if (!resp || !resp.ok || !resp.record || !resp.record.data) {
      throw new Error((resp && resp.error) || 'Không đọc được file');
    }
    const blob = await (await fetch(resp.record.data)).blob();
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
  let usage = 0;
  try {
    const est = await navigator.storage.estimate();
    usage = est.usage || 0;
  } catch (e) { }
  const parts = [all.length + ' đơn đã lưu'];
  if (usage) parts.push('dùng ' + fmtSize(usage));
  try {
    const cfg = await chrome.storage.sync.get({ archiveDays: 30 });
    parts.push('giữ ' + cfg.archiveDays + ' ngày rồi tự xoá');
  } catch (e) { }
  $('#stats').textContent = parts.join(' · ');
}

async function load() {
  $('#stats').textContent = 'Đang tải...';
  let resp = null;
  try { resp = await chrome.runtime.sendMessage({ type: 'PW_ARCHIVE_LIST' }); } catch (e) { }
  all = (resp && resp.list) || [];
  render();
  updateStats();
}

function wire() {
  $('#q').addEventListener('input', render);
  $('#days').addEventListener('change', render);
  $('#refresh').onclick = load;
  $('#clearAll').onclick = async () => {
    if (!all.length) return;
    if (!confirm('Xoá TOÀN BỘ ' + all.length + ' đơn đã lưu? Không thể hoàn tác.')) return;
    try { await chrome.runtime.sendMessage({ type: 'PW_ARCHIVE_CLEAR' }); } catch (e) { }
    all = [];
    render();
    updateStats();
  };
}

wire();
load();
