// public/service-worker.js
// インストール時の処理
self.addEventListener('install', () => {
  // 新しいService Workerをすぐにアクティブにする
  self.skipWaiting();
});

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  // 古いキャッシュを削除
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => caches.delete(key))
      );
    })
  );
  
  // 新しいService Workerをすぐに制御下に置く
  event.waitUntil(clients.claim());
});

// フェッチ時の処理
self.addEventListener('fetch', (event) => {
  // 通常のネットワークリクエストを実行
  event.respondWith(fetch(event.request));
});