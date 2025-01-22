// src/services/exchangeService/scheduler.ts
import type { Request, Response } from 'express';
import { FrankfurterAPI } from './api/frankfurter.js';
import { ExchangeStorageService } from './storage.js';
import { ExchangeRateUpdater } from './updater.js';
import { NotificationService } from './notification.js';

export const handleScheduledUpdate = async (req: Request, res: Response) => {
  // Cloud Scheduler からのリクエストであることを確認
  if (!isValidSchedulerRequest(req)) {
    return res.status(403).json({ error: 'Unauthorized request' });
  }

  const notificationService = new NotificationService();

  try {
    const api = new FrankfurterAPI();
    const storage = new ExchangeStorageService();
    const updater = new ExchangeRateUpdater(api, storage);

    console.log('為替レート更新を開始します...');
    await updater.updateDaily();
    console.log('為替レート更新が完了しました');

    res.status(200).json({ status: 'success' });
  } catch (error) {
    if (error instanceof Error) {
      await notificationService.notifyError(error);
    }
    res.status(500).json({ error: 'Update failed' });
  }
};

function isValidSchedulerRequest(req: Request): boolean {
  // Cloud Scheduler からのリクエストヘッダーを検証
  const userAgent = req.headers['user-agent'] || '';
  return userAgent.includes('Google-Cloud-Scheduler');
}