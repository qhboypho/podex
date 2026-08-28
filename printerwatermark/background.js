const memoryStore = new Map();
const pdfTabs = new Map();
const urlMem = new Map();
const ruleMem = new Map();
const bypassOpen = new Map();
const PDF_EXT_RE = /\.pdf(\?|#|$)/i;

function isBypassed(url) {
  const t = bypassOpen.get(url);
  if (!t) return false;
  if (Date.now() - t > 2 * 60 * 1000) {
    bypassOpen.delete(url);
    return false;
  }
  return true;
}

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

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function removeRedirectRule(shortId) {
  let ruleId = ruleMem.get(shortId);
  ruleMem.delete(shortId);
  urlMem.delete(shortId);
  if (ruleId === undefined) {
    try {
      const key = 'pw_pdfurl_' + shortId;
      const obj = await chrome.storage.session.get(key);
      if (obj && obj[key]) {
        ruleId = obj[key].ruleId;
        await chrome.storage.session.remove(key);
      }
    } catch (e) {
    }
  }
  if (ruleId !== undefined) {
    try { await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [ruleId] }); } catch (e) {
    }
  }
}

async function addRedirectRule(pdfUrl) {
  const id = Math.floor(Math.random() * 2000000000) + 1;
  const shortId = 'r' + id.toString(36);
  const redirectUrl = viewerUrl({ src: 'url', id: shortId });
  if (redirectUrl.length > 250) throw new Error('redirect url too long');
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [id],
    addRules: [
      {
        id,
        priority: 1,
        condition: {
          regexFilter: '^' + escapeRegex(pdfUrl) + '$',
          resourceTypes: ['main_frame']
        },
        action: { type: 'redirect', redirect: { url: redirectUrl } }
      }
    ]
  });
  ruleMem.set(shortId, id);
  urlMem.set(shortId, { url: pdfUrl, ruleId: id, t: Date.now() });
  try {
    await chrome.storage.session.set({ ['pw_pdfurl_' + shortId]: { url: pdfUrl, ruleId: id, t: Date.now() } });
  } catch (e) {
  }
  setTimeout(() => removeRedirectRule(shortId), 3 * 60 * 1000);
  return shortId;
}

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.type !== 'main_frame' || details.tabId < 0) return;
    let isPdf = false;
    let isSniffable = false;
    let isAttachment = false;
    for (const h of details.responseHeaders || []) {
      const n = (h.name || '').toLowerCase();
      const v = (h.value || '').trim();
      if (n === 'content-type') {
        if (/application\/(x-)?pdf|application\/acrobat|text\/pdf/i.test(v)) isPdf = true;
        else if (/application\/(octet-stream|force-download|binary|download|x-download)/i.test(v)) isSniffable = true;
      } else if (n === 'content-disposition' && /attachment/i.test(v)) {
        isAttachment = true;
      }
    }
    if (!isPdf && !isSniffable) return;
    if (isBypassed(details.url)) return;
    rememberPdfTab(details.tabId, details.url);
    if (isAttachment) return;
    isInterceptEnabled().then(async enabled => {
      if (!enabled) return;
      try {
        await addRedirectRule(details.url);
        await chrome.tabs.update(details.tabId, { url: details.url });
      } catch (e) {
        await redirectToViewer(details.tabId, details.url);
      }
    });
  },
  { urls: ['http://*/*', 'https://*/*'], types: ['main_frame'] },
  ['responseHeaders']
);

const retryStamp = new Map();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  const url = changeInfo.url || tab.url;
  if (!url || !/^https?:/i.test(url)) return;
  (async () => {
    const info = await lookupPdfTab(tabId, url);
    if (!info) return;
    const key = tabId + '|' + url;
    if (retryStamp.has(key)) return;
    if (!(await isInterceptEnabled())) return;
    retryStamp.set(key, true);
    setTimeout(() => retryStamp.delete(key), 60 * 1000);
    try {
      await addRedirectRule(url);
      await chrome.tabs.update(tabId, { url });
    } catch (e) {
      await redirectToViewer(tabId, url);
    }
  })();
});

async function fetchPdfBinary(url) {
  const attempts = [{ credentials: 'include' }, { credentials: 'omit' }];
  let lastErr = '';
  for (const opts of attempts) {
    try {
      const resp = await fetch(url, opts);
      if (!resp.ok) {
        lastErr = 'HTTP ' + resp.status;
        continue;
      }
      const buf = await resp.arrayBuffer();
      const bytes = new Uint8Array(buf);
      if (bytes.length < 5) {
        lastErr = 'File rong (0 byte)';
        continue;
      }
      if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
        lastErr = 'Server tra ve HTML/loi, khong phai file PDF (co the link da het han)';
        continue;
      }
      let bin = '';
      const CHUNK = 0x8000;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
      }
      return { ok: true, data: 'data:application/pdf;base64,' + btoa(bin) };
    } catch (e) {
      lastErr = String(e && e.message || e);
    }
  }
  return { ok: false, error: lastErr };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
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

      if (msg.type === 'PW_GET_PDF_URL') {
        const key = 'pw_pdfurl_' + msg.id;
        let info = urlMem.get(msg.id) || null;
        if (!info) {
          try {
            const obj = await chrome.storage.session.get(key);
            if (obj && obj[key]) info = obj[key];
          } catch (e) {
          }
        }
        if (info) sendResponse({ ok: true, url: info.url });
        else sendResponse({ ok: false, error: 'Link da het han, hay in lai don' });
        return;
      }

      if (msg.type === 'PW_FETCH_PDF') {
        sendResponse(await fetchPdfBinary(msg.url));
        return;
      }

      if (msg.type === 'PW_CLEAN_PDF') {
        await dropPending(msg.id);
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === 'PW_OPEN_NORMAL') {
        const url = String(msg.url || '');
        if (url && /^https?:/i.test(url)) {
          for (const [k, t] of bypassOpen) {
            if (Date.now() - t > 2 * 60 * 1000) bypassOpen.delete(k);
          }
          bypassOpen.set(url, Date.now());
          await chrome.tabs.create({ url });
        }
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
    } catch (e) {
      try { sendResponse({ ok: false, error: String(e && e.message || e) }); } catch (e2) {
      }
    }
  })();
  return true;
});
