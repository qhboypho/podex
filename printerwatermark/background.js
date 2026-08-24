const memoryStore = new Map();

async function putPending(id, payload) {
  memoryStore.set(id, payload);
  try {
    await chrome.storage.session.set({ ['pw_pdf_' + id]: payload });
  } catch (e) {
  }
}

async function getPending(id) {
  try {
    const obj = await chrome.storage.session.get('pw_pdf_' + id);
    if (obj && obj['pw_pdf_' + id]) return obj['pw_pdf_' + id];
  } catch (e) {
  }
  return memoryStore.get(id) || null;
}

async function dropPending(id) {
  memoryStore.delete(id);
  try { await chrome.storage.session.remove('pw_pdf_' + id); } catch (e) {
  }
}

function viewerUrl(params) {
  const u = new URL(chrome.runtime.getURL('viewer/viewer.html'));
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.href;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'PW_OPEN_PDF') {
      const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      await putPending(id, { data: msg.data, name: msg.name || 'don-hang.pdf' });
      const tab = await chrome.tabs.create({ url: viewerUrl({ src: 'data', id }) });
      setTimeout(() => dropPending(id), 10 * 60 * 1000);
      sendResponse({ ok: true, tabId: tab.id });
      return;
    }

    if (msg.type === 'PW_GET_PDF') {
      const payload = await getPending(msg.id);
      sendResponse({ ok: !!payload, payload });
      return;
    }

    if (msg.type === 'PW_FETCH_PDF') {
      try {
        const resp = await fetch(msg.url, { credentials: 'include' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const buf = await resp.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let bin = '';
        const CHUNK = 0x8000;
        for (let i = 0; i < bytes.length; i += CHUNK) {
          bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
        }
        sendResponse({ ok: true, data: 'data:application/pdf;base64,' + btoa(bin) });
      } catch (e) {
        sendResponse({ ok: false, error: String(e && e.message || e) });
      }
      return;
    }

    if (msg.type === 'PW_CLEAN_PDF') {
      await dropPending(msg.id);
      sendResponse({ ok: true });
      return;
    }
  })();
  return true;
});

const PDF_URL_RE = /\.pdf(\?|#|$)/i;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const url = changeInfo.url || tab.url;
  if (!url || url.startsWith('chrome-extension://')) return;
  if (!PDF_URL_RE.test(url)) return;

  let cfg = { interceptEnabled: true };
  try { cfg = await chrome.storage.sync.get({ interceptEnabled: true }); } catch (e) {
  }
  if (cfg.interceptEnabled === false) return;

  try {
    await chrome.tabs.update(tabId, { url: viewerUrl({ src: 'url', url: encodeURIComponent(url) }) });
  } catch (e) {
  }
});
