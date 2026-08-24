const memoryStore = new Map();
const pdfTabs = new Map();
const PDF_EXT_RE = /\.pdf(\?|#|$)/i;

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

async function rememberPdfTab(tabId, url) {
  const info = { url, t: Date.now() };
  pdfTabs.set(tabId, info);
  try {
    const obj = await chrome.storage.session.get({ pwPdfTabs: {} });
    const m = obj.pwPdfTabs || {};
    m[tabId] = info;
    for (const k of Object.keys(m)) {
      if (Date.now() - m[k].t > 15 * 60 * 1000) delete m[k];
    }
    await chrome.storage.session.set({ pwPdfTabs: m });
  } catch (e) {
  }
}

async function lookupPdfTab(tabId, url) {
  let info = pdfTabs.get(tabId) || null;
  if (!info) {
    try {
      const obj = await chrome.storage.session.get('pwPdfTabs');
      const m = (obj && obj.pwPdfTabs) || {};
      if (m[tabId]) {
        info = m[tabId];
        pdfTabs.set(tabId, info);
      }
    } catch (e) {
    }
  }
  if (info && Date.now() - info.t > 15 * 60 * 1000) info = null;
  if (info && url && info.url !== url) info = null;
  return info;
}

async function isInterceptEnabled() {
  try {
    const cfg = await chrome.storage.sync.get({ interceptEnabled: true });
    return cfg.interceptEnabled !== false;
  } catch (e) {
    return true;
  }
}

async function redirectToViewer(tabId, url) {
  try {
    await chrome.tabs.update(tabId, { url: viewerUrl({ src: 'url', url: encodeURIComponent(url) }) });
  } catch (e) {
  }
}

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.type !== 'main_frame' || details.tabId < 0) return;
    let isPdf = false;
    let isAttachment = false;
    for (const h of details.responseHeaders || []) {
      const n = (h.name || '').toLowerCase();
      if (n === 'content-type' && /application\/pdf/i.test(h.value || '')) isPdf = true;
      else if (n === 'content-disposition' && /attachment/i.test(h.value || '')) isAttachment = true;
    }
    if (!isPdf || isAttachment) return;
    rememberPdfTab(details.tabId, details.url);
    isInterceptEnabled().then(enabled => {
      if (enabled) redirectToViewer(details.tabId, details.url);
    });
  },
  { urls: ['http://*/*', 'https://*/*'], types: ['main_frame'] },
  ['responseHeaders']
);

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

    if (msg.type === 'PW_IS_PDF_TAB') {
      const byExt = PDF_EXT_RE.test(msg.url || '');
      const info = await lookupPdfTab(msg.tabId, byExt ? null : msg.url);
      sendResponse({ ok: true, isPdf: !!info || byExt, url: (info && info.url) || msg.url });
      return;
    }

    if (msg.type === 'PW_STAMP_TAB') {
      const info = await lookupPdfTab(msg.tabId, null);
      const url = (info && info.url) || msg.url;
      if (!url) {
        sendResponse({ ok: false, error: 'Khong tim thay URL PDF' });
        return;
      }
      await redirectToViewer(msg.tabId, url);
      sendResponse({ ok: true });
      return;
    }
  })();
  return true;
});
