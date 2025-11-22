// src/components/dividend/DividendFileUploader.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import type { RawDividendData } from '@/types/dividend';
import { Alert, AlertDescription } from '../ui/alert';
import { cleanNumber } from '@/utils/common/numberUtils';
import { logger } from '@/utils/common/logger';

interface Props {
  onUpload: (data: RawDividendData[]) => void;
  onError: (message: string) => void;
}

export const DividendFileUploader: React.FC<Props> = ({ onUpload, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    setIsProcessing(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // 自動型変換を無効化して文字列として読み込む
      dynamicTyping: false,
      complete: (results) => {
        try {
          logger.log('CSV読み込み完了:', {
            行数: results.data.length,
            サンプル: results.data.length > 0 ? results.data[0] : {}
          });

          // 数値フィールドのクリーニングと変換を行う
          const processedData = (results.data as Record<string, string>[]).map((row, index) => {
            // デバッグログ（最初の3行のみ）
            if (index < 3) {
              logger.debug(`行 ${index + 1} の処理:`, row);
            }

            // Amount値の数値変換
            const amount = cleanNumber(row.Amount);

            // 変換結果をログ出力（最初の3行のみ）
            if (index < 3) {
              logger.debug(`数値変換: "${row.Amount}" -> ${amount}`);
            }
            
            // ActionTypeとして有効な値かチェック
            const action = row.Action || '';
            const validActions = ['DIVIDEND', 'INTEREST', 'OTHER', 'BUY', 'SELL'];
            const normalizedAction = validActions.includes(action.toUpperCase())
              ? action.toUpperCase()
              : 'OTHER';

            const record: RawDividendData = {
              Symbol: row.Symbol || '',
              TradeDate: row.TradeDate || '',
              Amount: amount,
              Action: normalizedAction as RawDividendData['Action'],
              Description: row.Description || '',
              RecordType: row.RecordType || ''
            };
            return record;
          });
          
          logger.log(`処理完了: ${processedData.length}件のデータを処理`);
          onUpload(processedData);
        } catch (err) {
          logger.error('配当データ処理エラー:', err);
          onError(err instanceof Error ? err.message : '配当データの処理中にエラーが発生しました');
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
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    onDrop,
    disabled: isProcessing
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-[3fr_2fr] gap-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer transition-colors h-32 flex flex-col justify-center
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {isProcessing ? (
            <p>処理中...<br />しばらくお待ちください</p>
          ) : (
            <>
              <p>Firstradeの配当金明細CSVをドロップ、<br />またはクリックしてファイルを選択</p>
              <p className="text-sm text-gray-500 mt-2">
                ※FT_CSV_(口座番号).csvのみ対応
              </p>
            </>
          )}
        </div>
        <Alert className="h-32 flex items-center">
          <AlertDescription>
            CSVの入手方法：<br />
            Firstrade管理画面 ＞ Tax Center ＞ Download Account Information
            から期間を指定してダウンロード
            </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};