(() => {
  if (window.__pwPdfHookInstalled) return;
  window.__pwPdfHookInstalled = true;

  const EXT_ORIGIN = 'chrome-extension://' + chrome.runtime.id;

  function isEnabled() {
    return chrome.storage.sync.get({ interceptEnabled: true })
      .then(cfg => cfg.interceptEnabled !== false)
      .catch(() => true);
  }

  function isPdfUrl(u) {
    if (!u) return false;
    return /^blob:/i.test(u) || /\.pdf(\?|#|$)/i.test(u);
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
  }

  async function isPdfBlob(blob) {
    if (blob && blob.type && /pdf/i.test(blob.type)) return true;
    if (!blob || !blob.size) return false;
    try {
      const buf = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
      return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
    } catch (e) {
      return false;
    }
  }

  async function intercept(rawUrl, nameHint) {
    if (!rawUrl) return false;
    if (!(await isEnabled())) return false;
    if (!isPdfUrl(rawUrl)) return false;

    try {
      const resp = await fetch(rawUrl);
      const blob = await resp.blob();
      if (!(await isPdfBlob(blob))) return false;

      const data = await blobToBase64(blob);
      const name = String(nameHint || 'don-hang').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80);
      chrome.runtime.sendMessage({ type: 'PW_OPEN_PDF', data, name });
      return true;
    } catch (e) {
      return false;
    }
  }

  const nativeOpen = window.open.bind(window);
  function hookedOpen(url, target, features) {
    try {
      if (url && !String(url).startsWith(EXT_ORIGIN)) {
        intercept(String(url)).then(blocked => {
          if (!blocked) nativeOpen(url, target, features);
        });
        return {
          closed: false,
          opener: window,
          focus() {},
          blur() {},
          close() { this.closed = true; },
          print() {},
          location: { href: url, reload() {}, replace() {} },
          postMessage() {},
          addEventListener() {},
          removeEventListener() {},
          document: { write() {}, open() {}, close() {} }
        };
      }
    } catch (e) {
    }
    return nativeOpen(url, target, features);
  }
  hookedOpen.__pwNative = nativeOpen;
  try {
    Object.defineProperty(window, 'open', { value: hookedOpen, writable: true, configurable: true });
  } catch (e) {
  }

  document.addEventListener('click', (ev) => {
    try {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      const a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith(EXT_ORIGIN)) return;
      if (!isPdfUrl(href)) return;

      ev.stopPropagation();
      ev.preventDefault();
      intercept(href, a.download || a.textContent || '').then(blocked => {
        if (!blocked) {
          const w = nativeOpen(href, a.target || '_blank');
          if (w && w.focus) w.focus();
        }
      });
    } catch (e) {
    }
  }, true);
})();
