'use strict';

const checkbox = document.getElementById('intercept');
const pdfAction = document.getElementById('pdfAction');
const stampBtn = document.getElementById('stampTab');

chrome.storage.sync.get({ interceptEnabled: true })
  .then(cfg => { checkbox.checked = cfg.interceptEnabled !== false; })
  .catch(() => { checkbox.checked = true; });

checkbox.addEventListener('change', () => {
  chrome.storage.sync.set({ interceptEnabled: checkbox.checked });
});

document.getElementById('openViewer').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('viewer/viewer.html') });
  window.close();
});

(async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !/^https?:/i.test(tab.url || '')) return;
    const resp = await chrome.runtime.sendMessage({ type: 'PW_IS_PDF_TAB', tabId: tab.id, url: tab.url });
    if (resp && resp.ok && resp.isPdf) {
      pdfAction.classList.remove('hidden');
      stampBtn.addEventListener('click', async () => {
        stampBtn.disabled = true;
        stampBtn.textContent = 'Đang mở...';
        try {
          await chrome.runtime.sendMessage({ type: 'PW_STAMP_TAB', tabId: tab.id, url: resp.url || tab.url });
          window.close();
        } catch (e) {
          stampBtn.textContent = 'Lỗi: ' + (e && e.message || 'thử lại');
          stampBtn.disabled = false;
        }
      });
    }
  } catch (e) {
  }
})();
