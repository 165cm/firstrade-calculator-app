// src/components/portfolio/PortfolioFileUploader.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Alert, AlertDescription } from '../ui/alert';
import { cleanNumber } from '@/utils/common/numberUtils';
import { logger } from '@/utils/common/logger';

interface RawTradeData {
  Symbol: string;
  TradeDate: string;
  Action: string;
  Quantity: string | number;
  Price: string | number;
  Amount: string | number;
}

interface Props {
  onUpload: (data: RawTradeData[]) => void;
  onError: (message: string) => void;
}

export const PortfolioFileUploader: React.FC<Props> = ({ onUpload, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        try {
          logger.log('ポートフォリオCSV読み込み完了:', {
            行数: results.data.length
          });

          const processedData = (results.data as Record<string, string>[]).map((row) => {
            const record: RawTradeData = {
              Symbol: row.Symbol || '',
              TradeDate: row.TradeDate || '',
              Action: row.Action || '',
              Quantity: cleanNumber(row.Quantity),
              Price: cleanNumber(row.Price),
              Amount: cleanNumber(row.Amount)
            };
            return record;
          });

          // BUY/SELL取引のみフィルタ
          const trades = processedData.filter(r =>
            r.Action.toUpperCase() === 'BUY' || r.Action.toUpperCase() === 'SELL'
          );

          logger.log(`取引データ抽出: ${trades.length}件`);
          onUpload(processedData);
        } catch (err) {
          logger.error('ポートフォリオデータ処理エラー:', err);
          onError(err instanceof Error ? err.message : 'データの処理中にエラーが発生しました');
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error: Error) => {
        logger.error('CSV解析エラー:', error);
        onError(`CSVの解析に失敗しました: ${error.message}`);
        setIsProcessing(false);
      }
    });
  }, [onUpload, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <p className="text-gray-500">処理中...</p>
        ) : isDragActive ? (
          <p className="text-blue-500">ファイルをドロップしてください</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Firstrade取引履歴CSVをドラッグ＆ドロップ
            </p>
            <p className="text-sm text-gray-400">
              またはクリックしてファイルを選択
            </p>
          </div>
        )}
      </div>

      <Alert>
        <AlertDescription className="text-sm text-gray-600">
          配当金明細と同じCSVファイルを使用できます。BUY/SELL取引から現在の保有状況を計算します。
        </AlertDescription>
      </Alert>
    </div>
  );
};
