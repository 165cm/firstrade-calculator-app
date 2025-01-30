// src/hooks/useServiceWorker.ts
import { useEffect } from 'react';

export const useServiceWorker = () => {
 useEffect(() => {
   if (
     typeof window !== 'undefined' &&
     'serviceWorker' in navigator
   ) {
     // 直接Service Workerを登録
     navigator.serviceWorker
       .register('/service-worker.js')
       .then(registration => {
         console.log('Service Worker registered with scope:', registration.scope);
         
         // 新しいService Workerが見つかった時
         registration.addEventListener('controllerchange', () => {
           if (window.confirm('新しいバージョンが利用可能です。更新しますか？')) {
             window.location.reload();
           }
         });
       })
       .catch(error => {
         console.error('Service Worker registration failed:', error);
       });
   }
 }, []);

 // オフライン状態のテスト用
 useEffect(() => {
   if (process.env.NODE_ENV === 'development') {
     const handleOffline = () => {
       console.log('アプリケーションがオフラインモードに移行');
     };

     const handleOnline = () => {
       console.log('アプリケーションがオンラインモードに復帰');
     };

     window.addEventListener('offline', handleOffline);
     window.addEventListener('online', handleOnline);

     // クリーンアップ関数
     return () => {
       window.removeEventListener('offline', handleOffline);
       window.removeEventListener('online', handleOnline);
     };
   }
 }, []);
};