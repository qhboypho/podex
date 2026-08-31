'use strict';

// Lưu trữ lịch sử đơn đã in — chạy trong trang extension (viewer/history),
// KHÔNG chạy trong service worker để tránh treo IndexedDB khi SW ngủ.
const PWArchive = (() => {
  const DB = 'pw_archive';
  const META = 'meta';
  const DATA = 'data';
  const MAX_BYTES = 500 * 1024 * 1024;
  const DEDUPE_MS = 2 * 60 * 1000;
  const SWEEP_KEY = 'pwLastSweep';
  const SWEEP_MIN_MS = 60 * 60 * 1000;
  let dbP = null;

  function open() {
    if (dbP) return dbP;
    dbP = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(META)) {
          const st = db.createObjectStore(META, { keyPath: 'id' });
          st.createIndex('savedAt', 'savedAt');
          st.createIndex('url', 'url');
        }
        if (!db.objectStoreNames.contains(DATA)) {
          db.createObjectStore(DATA, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Khong mo duoc IndexedDB'));
      req.onblocked = () => reject(new Error('IndexedDB dang bi block boi tab khac'));
    });
    dbP.catch(() => { dbP = null; });
    return dbP;
  }

  function done(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('IndexedDB loi'));
      tx.onabort = () => reject(tx.error || new Error('IndexedDB abort'));
    });
  }

  async function config() {
    try {
      const c = await chrome.storage.sync.get({ archiveEnabled: true, archiveDays: 30 });
      return {
        enabled: c.archiveEnabled !== false,
        days: Math.max(1, Math.min(365, Number(c.archiveDays) || 30))
      };
    } catch (e) {
      return { enabled: true, days: 30 };
    }
  }

  function shopFromUrl(u) {
    try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }

  function shopPrefix(url) {
    try {
      const h = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
      const brands = ['tiktok', 'shopee', 'lazada', 'tiki', 'sendo', 'amazon', 'ebay', 'etsy'];
      for (const b of brands) {
        if (h.indexOf(b) !== -1) return b;
      }
      const skip = new Set(['seller', 'banhang', 'marketplace', 'center', 'www', 'com', 'vn', 'net', 'shop']);
      for (const part of h.split('.')) {
        for (const seg of part.split('-')) {
          if (seg && !skip.has(seg)) return seg;
        }
      }
      return 'pdf';
    } catch (e) {
      return 'pdf';
    }
  }

  function sameLocalDay(a, b) {
    const da = new Date(a);
    const db = new Date(b);
    return da.getFullYear() === db.getFullYear() &&
      da.getMonth() === db.getMonth() &&
      da.getDate() === db.getDate();
  }

  function nextNameFrom(metas, url, now) {
    const d = new Date(now);
    const stamp =
      String(d.getDate()).padStart(2, '0') +
      String(d.getMonth() + 1).padStart(2, '0') +
      d.getFullYear();
    const prefix = shopPrefix(url);
    let seq = 1;
    for (const m of metas) {
      if (m.prefix === prefix && sameLocalDay(m.savedAt, now)) {
        seq = Math.max(seq, (m.seq || 0) + 1);
      }
    }
    return {
      name: prefix + stamp + '-' + String(seq).padStart(2, '0') + '.pdf',
      prefix,
      seq
    };
  }

  async function sha256Hex(data) {
    try {
      const buf = await (await fetch(data)).arrayBuffer();
      const dig = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(dig)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return '';
    }
  }

  async function save(data, name, url, code, origName, prod, count) {
    if (!data || typeof data !== 'string' || data.indexOf('data:application/pdf') !== 0) {
      return { ok: false, error: 'Du lieu PDF khong hop le' };
    }
    const cfg = await config();
    if (!cfg.enabled) return { ok: false, error: 'disabled' };
    url = url || '';
    const now = Date.now();
    const b64 = data.slice(data.indexOf(',') + 1);
    const size = Math.floor(b64.length * 3 / 4);
    const hash = await sha256Hex(data);
    const codes = String(code || '').trim().split(/\s+/).filter(Boolean);
    const primary = codes[0] || '';
    let metas = [];
    try { metas = await list(); } catch (e) { }

    // Chống lưu trùng: trùng hash (file giống hệt) > trùng URL gần đây
    // > cùng sàn + cùng dung lượng + cùng mã đơn chính trong cùng ngày
    // (file sàn regenerate có timestamp mới nên hash khác, nhưng nội dung như nhau).
    const dup = metas.find(m =>
      (hash && m.hash === hash) ||
      (url && m.url === url && now - (m.savedAt || 0) < DEDUPE_MS) ||
      (url && primary && sameLocalDay(m.savedAt || 0, now) &&
        m.prefix === shopPrefix(url) && (m.size || 0) === size &&
        ((m.code || '').trim().split(/\s+/)[0] || '') === primary)
    );
    if (dup) return { ok: true, id: dup.id, dup: true, name: dup.name };

    const id = 'a' + now.toString(36) + Math.random().toString(36).slice(2, 8);
    let finalName = name || 'don-hang.pdf';
    let prefix = '';
    let seq = 0;
    if (url) {
      const nm = nextNameFrom(metas, url, now);
      finalName = nm.name;
      prefix = nm.prefix;
      seq = nm.seq;
    }
    const meta = {
      id,
      savedAt: now,
      expiresAt: now + cfg.days * 86400000,
      name: finalName,
      file: origName || '',
      url,
      code: code || '',
      prod: prod || '',
      shop: shopFromUrl(url),
      prefix,
      seq,
      count: Math.max(0, Number(count) || 0),
      size,
      hash
    };
    const db = await open();
    const tx = db.transaction([META, DATA], 'readwrite');
    tx.objectStore(META).put(meta);
    tx.objectStore(DATA).put({ id, data });
    await done(tx);
    maybeSweep();
    tgUpload(meta, data);
    return { ok: true, id, name: meta.name };
  }

  async function list() {
    const db = await open();
    const metas = await new Promise((resolve, reject) => {
      const tx = db.transaction(META, 'readonly');
      const rq = tx.objectStore(META).getAll();
      rq.onsuccess = () => resolve(rq.result || []);
      rq.onerror = () => reject(rq.error);
    });
    metas.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    return metas;
  }

  async function getFull(id) {
    const db = await open();
    return new Promise((resolve) => {
      const tx = db.transaction([META, DATA], 'readonly');
      const r1 = tx.objectStore(META).get(id);
      const r2 = tx.objectStore(DATA).get(id);
      tx.oncomplete = () => {
        resolve(r1.result && r2.result ? Object.assign(r1.result, { data: r2.result.data }) : null);
      };
      tx.onerror = () => resolve(null);
      tx.onabort = () => resolve(null);
    });
  }

  async function remove(id) {
    const db = await open();
    const tx = db.transaction([META, DATA], 'readwrite');
    tx.objectStore(META).delete(id);
    tx.objectStore(DATA).delete(id);
    await done(tx);
  }

  async function clear() {
    const db = await open();
    const tx = db.transaction([META, DATA], 'readwrite');
    tx.objectStore(META).clear();
    tx.objectStore(DATA).clear();
    await done(tx);
  }

  async function importRecords(records) {
    if (!Array.isArray(records)) return { added: 0, skipped: 0 };
    const db = await open();
    let added = 0;
    let skipped = 0;
    for (const r of records) {
      if (!r || !r.id || typeof r.data !== 'string' || r.data.indexOf('data:application/pdf') !== 0) {
        skipped++;
        continue;
      }
      const savedAt = r.savedAt || Date.now();
      const meta = {
        id: r.id,
        savedAt,
        expiresAt: r.expiresAt || savedAt + 30 * 86400000,
        name: r.name || 'don-hang.pdf',
        file: r.file || '',
        url: r.url || '',
        code: r.code || '',
        prod: r.prod || '',
        shop: r.shop || '',
        count: Math.max(0, Number(r.count) || 0),
        prefix: r.prefix || '',
        seq: r.seq || 0,
        size: r.size || Math.floor((r.data.length - r.data.indexOf(',') - 1) * 3 / 4)
      };
      try {
        const tx = db.transaction([META, DATA], 'readwrite');
        tx.objectStore(META).put(meta);
        tx.objectStore(DATA).put({ id: r.id, data: r.data });
        await done(tx);
        added++;
      } catch (e) {
        skipped++;
      }
    }
    maybeSweep();
    return { added, skipped };
  }

  async function sweep() {
    const cfg = await config();
    const cutoff = Date.now() - cfg.days * 86400000;
    const metas = await list();
    const dead = metas.filter(m => (m.savedAt || 0) < cutoff);
    for (const m of dead) {
      try { await remove(m.id); } catch (e) { }
    }
    const alive = metas.filter(m => (m.savedAt || 0) >= cutoff);
    let total = alive.reduce((s, m) => s + (m.size || 0), 0);
    for (let i = alive.length - 1; i >= 0 && total > MAX_BYTES; i--) {
      try {
        await remove(alive[i].id);
        total -= (alive[i].size || 0);
      } catch (e) { }
    }
    return { removed: dead.length };
  }

  async function maybeSweep() {
    try {
      const o = await chrome.storage.local.get({ [SWEEP_KEY]: 0 });
      if (Date.now() - (o[SWEEP_KEY] || 0) < SWEEP_MIN_MS) return;
      await chrome.storage.local.set({ [SWEEP_KEY]: Date.now() });
      await sweep();
    } catch (e) { /* ignore */ }
  }

  // ---------- Telegram backup ----------
  function tgCaption(meta) {
    const lines = [
      meta.name || 'don-hang.pdf',
      meta.prod ? ('SP: ' + String(meta.prod).slice(0, 180)) : '',
      meta.shop ? ('Sàn: ' + meta.shop) : '',
      new Date(meta.savedAt).toLocaleString('vi-VN')
    ].filter(Boolean);
    return lines.join('\n').slice(0, 1000);
  }

  async function tgUpload(meta, dataUrl) {
    try {
      const { tg } = await chrome.storage.local.get({ tg: null });
      if (!tg || !tg.enabled || !tg.botToken || !tg.chatId) return;
      const blob = await (await fetch(dataUrl)).blob();
      const fd = new FormData();
      fd.append('chat_id', tg.chatId);
      fd.append('caption', tgCaption(meta));
      fd.append('document', blob, meta.name || 'don-hang.pdf');
      const r = await fetch('https://api.telegram.org/bot' + tg.botToken + '/sendDocument', {
        method: 'POST',
        body: fd
      });
      const j = await r.json();
      if (!j.ok) console.warn('[PW] Telegram backup thất bại:', j.description);
    } catch (e) {
      console.warn('[PW] Telegram backup lỗi:', e);
    }
  }

  async function tgCall(token, method, body) {
    const r = await fetch('https://api.telegram.org/bot' + token + '/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return r.json();
  }

  async function tgTest(token, chatId) {
    try {
      const j = await tgCall(token, 'sendMessage', { chat_id: chatId, text: '✅ Kết nối OK — backup đơn hàng từ extension Watermark In Đơn Hàng.' });
      return j.ok ? { ok: true } : { ok: false, error: j.description || 'lỗi Telegram' };
    } catch (e) {
      return { ok: false, error: String(e && e.message || e) };
    }
  }

  async function tgSetAutoDelete(days) {
    try {
      const { tg } = await chrome.storage.local.get({ tg: null });
      if (!tg || !tg.botToken || !tg.chatId) return { ok: false, error: 'chưa cấu hình bot' };
      const j = await tgCall(tg.botToken, 'setChatMessageAutoDeleteTime', {
        chat_id: tg.chatId,
        message_auto_delete_time: Math.max(3600, days * 86400)
      });
      return j.ok ? { ok: true } : { ok: false, error: j.description || 'lỗi Telegram' };
    } catch (e) {
      return { ok: false, error: String(e && e.message || e) };
    }
  }

  async function tgGetChatIds(token) {
    try {
      const j = await tgCall(token, 'getUpdates', {});
      if (!j.ok) return { ok: false, error: j.description || 'lỗi Telegram' };
      const map = {};
      for (const u of (j.result || [])) {
        const c = u.message && u.message.chat;
        if (c && (c.type === 'group' || c.type === 'supergroup' || c.type === 'private')) {
          map[c.id] = { id: String(c.id), title: c.title || c.username || c.first_name || String(c.id) };
        }
      }
      return { ok: true, chats: Object.values(map) };
    } catch (e) {
      return { ok: false, error: String(e && e.message || e) };
    }
  }

  return { save, list, getFull, remove, clear, sweep, maybeSweep, importRecords, tgTest, tgSetAutoDelete, tgGetChatIds };
})();
