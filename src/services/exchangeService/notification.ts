// src/services/exchangeService/notification.ts
export class NotificationService {
    async notifyError(error: Error): Promise<void> {
      // エラー情報を構造化して出力
      console.error(JSON.stringify({
        severity: 'ERROR',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        service: 'exchange-rate-updater'
      }, null, 2));
    }
  }