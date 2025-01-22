export class NotificationService {
    async notifyError(error) {
        const errorInfo = {
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
    getErrorCode(error) {
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
    async sendEmailNotification(errorInfo) {
        // メール送信の実装
        // TODO: 実際のメール送信処理を実装
        console.log('メール通知を送信:', JSON.stringify(errorInfo));
    }
}
