'use strict';

const checkbox = document.getElementById('intercept');

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
