// src/utils/cache/cacheManager.ts
import { SessionCache } from './sessionCache';

export class CacheManager {
  static async clearAllCaches(): Promise<void> {
    // Service Workerキャッシュのクリア
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(registration => registration.unregister()));
    
    // LocalStorageのクリア
    localStorage.clear();
    
    // SessionStorageのクリア
    SessionCache.clearAll();
  }
  
  static async checkForUpdates(): Promise<boolean> {
    try {
      const response = await fetch('/api/version');
      const { version } = await response.json();
      
      const currentVersion = localStorage.getItem('app-version');
      if (version !== currentVersion) {
        await this.clearAllCaches();
        localStorage.setItem('app-version', version);
        return true;
      }
      return false;
    } catch (error) {
      console.error('バージョンチェックに失敗:', error);
      return false;
    }
  }
}