// 阅川书城 Service Worker - 优化版
const CACHE_NAME = 'yuechuan-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 安装时缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 缓存策略：
// 1. 同源HTML/静态资源：网络优先，缓存兜底
// 2. 跨域CDN/字体：缓存优先，网络兜底
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isCrossOrigin = url.origin !== location.origin;

  // API请求（Supabase）不缓存，每次都拿最新数据
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      // 跨域资源（CDN、字体）：缓存优先
      if (isCrossOrigin && cached) {
        return cached;
      }
      // 同源资源：网络优先
      return fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) return response;
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // 网络失败，用缓存兜底
          if (cached) return cached;
        });
    })
  );
});

// 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});
