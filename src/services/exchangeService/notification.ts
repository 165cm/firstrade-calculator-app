// src/services/exchangeService/notification.ts
import type { ErrorInfo } from '@/types/exchange';

export class NotificationService {
  async notifyError(error: Error): Promise<void> {
    const errorInfo: ErrorInfo = {
      severity: 'ERROR',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      service: 'exchange-rate-updater',
      environment: process.env.NODE_ENV,
      errorType: error.name,
      errorCode: this.getErrorCode(error)
    };

    // 構造化ログ出力
    console.error(JSON.stringify(errorInfo, null, 2));

    // メール通知の実装
    if (process.env.NOTIFICATION_EMAIL) {
      await this.sendEmailNotification(errorInfo);
    }
  }

  private getErrorCode(error: Error): string {
    // エラータイプに基づいてコードを返す
    switch (error.name) {
      case 'FetchError':
        return 'API_FETCH_ERROR';
      case 'ValidationError':
        return 'DATA_VALIDATION_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  private async sendEmailNotification(errorInfo: ErrorInfo): Promise<void> {
    // メール送信の実装
    // TODO: 実際のメール送信処理を実装
    console.log('メール通知を送信:', JSON.stringify(errorInfo));
  }
}