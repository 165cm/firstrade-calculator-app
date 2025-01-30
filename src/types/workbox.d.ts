// src/types/workbox.d.ts
interface Workbox {
    register(): Promise<void>;
    addEventListener(event: string, callback: () => void): void;
  }
  
  declare global {
    interface Window {
      workbox?: Workbox;
    }
  }
  
  export {};