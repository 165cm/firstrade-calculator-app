// src/components/dividend/DividendFileUploader.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import type { RawDividendData } from '@/types/dividend';
import { cleanNumber } from '@/utils/common/numberUtils';
import { logger } from '@/utils/common/logger';
import { HelpTooltip } from '@/components/common/Tooltip';

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
      dynamicTyping: false,
      complete: (results) => {
        try {
          // 文字列のクリーニング関数（引用符と前後の空白を削除）
          const cleanString = (val: string | undefined): string => {
            if (!val) return '';
            return val.replace(/['"]+/g, '').trim();
          };

          // 数値フィールドのクリーニングと変換を行う
          const processedData = (results.data as Record<string, string>[]).map((row) => {
            const amount = cleanNumber(row.Amount);
            const rawAction = cleanString(row.Action);
            const validActions = ['DIVIDEND', 'INTEREST', 'OTHER', 'BUY', 'SELL'];
            const normalizedAction = validActions.includes(rawAction.toUpperCase())
              ? rawAction.toUpperCase()
              : 'OTHER';

            return {
              Symbol: cleanString(row.Symbol),
              TradeDate: cleanString(row.TradeDate),
              Amount: amount,
              Action: normalizedAction as RawDividendData['Action'],
              Description: cleanString(row.Description),
              RecordType: cleanString(row.RecordType)
            };
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
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          group relative border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out cursor-pointer h-48 flex flex-col items-center justify-center
          ${isDragActive
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-sm text-slate-600 font-medium">処理中...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-6 space-y-3">
            <div className={`
              p-3 rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600
            `}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-700">
                CSVファイルをドロップ
              </p>
              <p className="text-xs text-slate-500">
                またはクリックして選択
              </p>
            </div>

            <div className="pt-2 flex flex-col items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                FT_CSV_(口座番号).csvのみ対応
              </span>

              <div
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>CSVの入手方法</span>
                <HelpTooltip text="Firstrade管理画面 ＞ Tax Center ＞ Download Account Information から期間を指定してダウンロードしてください。" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};