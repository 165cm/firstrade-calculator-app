// src/components/CacheDebugger.tsx
'use client';
import { useState, useEffect } from 'react';

export default function CacheDebugger() {
  const [cacheInfo, setCacheInfo] = useState<{
    isActive: boolean;
    cachedUrls: string[];
  }>({
    isActive: false,
    cachedUrls: [],
  });

  useEffect(() => {
    async function checkCache() {
      try {
        // Service Worker の状態確認
        const registration = await navigator.serviceWorker.getRegistration();
        const isActive = !!registration?.active;

        // キャッシュされているURLの取得
        const cache = await caches.open('firstrade-calculator-app-v1');
        const keys = await cache.keys();
        const cachedUrls = keys.map(req => req.url);

        setCacheInfo({
          isActive,
          cachedUrls,
        });
      } catch (error) {
        console.error('Cache check failed:', error);
      }
    }

    checkCache();
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white shadow-lg rounded-lg border max-w-md">
      <h3 className="font-bold mb-2">キャッシュデバッグ情報</h3>
      <div className="space-y-2 text-sm">
        <p>
          Service Worker: 
          <span className={cacheInfo.isActive ? 'text-green-600' : 'text-red-600'}>
            {cacheInfo.isActive ? '有効' : '無効'}
          </span>
        </p>
        <div>
          <p className="mb-1">キャッシュされているURL:</p>
          <ul className="list-disc pl-4 max-h-40 overflow-y-auto">
            {cacheInfo.cachedUrls.map((url, index) => (
              <li key={index} className="truncate">
                {url}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}