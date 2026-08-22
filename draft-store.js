(() => {
  'use strict';

  const DATABASE_NAME = 'form-fashion-compositor';
  const DATABASE_VERSION = 1;
  const STORE_NAME = 'workspaces';
  const WORKSPACE_ID = 'current';

  function requestAsPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Không thể truy cập bộ nhớ cục bộ.'));
    });
  }

  function transactionAsPromise(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Không thể hoàn tất thao tác lưu.'));
      transaction.onabort = () => reject(transaction.error || new Error('Thao tác lưu đã bị hủy.'));
    });
  }

  async function openDatabase() {
    if (!globalThis.indexedDB) throw new Error('Trình duyệt này không hỗ trợ lưu bản nháp cục bộ.');
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    return requestAsPromise(request);
  }

  async function save(workspace) {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put({ ...workspace, id: WORKSPACE_ID });
      await transactionAsPromise(transaction);
    } finally {
      database.close();
    }
  }

  async function load() {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const record = await requestAsPromise(transaction.objectStore(STORE_NAME).get(WORKSPACE_ID));
      await transactionAsPromise(transaction);
      return record || null;
    } finally {
      database.close();
    }
  }

  async function clear() {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(WORKSPACE_ID);
      await transactionAsPromise(transaction);
    } finally {
      database.close();
    }
  }

  globalThis.FormDraftStore = { clear, load, save };
})();
