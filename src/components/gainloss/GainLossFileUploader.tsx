// src/components/gainloss/GainLossFileUploader.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa, { ParseResult, ParseConfig } from 'papaparse';
import { preprocessCsv } from '@/utils/gainloss/preprocessCsv';
import type { RawGainLossData } from '@/types/gainloss';
import { HelpTooltip } from '@/components/common/Tooltip';

interface Props {
  onUpload: (data: RawGainLossData[]) => void;
  onError: (message: string) => void;
}

function safeParseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;
  const cleaned = value.toString().replace(/[,\s$¥]/g, '');
  const num = Number(cleaned);
  if (isNaN(num)) return 0;
  return num;
}

export const GainLossFileUploader: React.FC<Props> = ({ onUpload, onError }) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target?.result;
      if (typeof csvData !== 'string') {
        onError('ファイルの読み込みに失敗しました');
        return;
      }

      const preprocessResult = preprocessCsv(csvData);
      if (!preprocessResult.success) {
        onError(preprocessResult.error || 'CSV前処理中にエラーが発生しました');
        return;
      }

      const parseConfig: ParseConfig<RawGainLossData> = {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (results: ParseResult<RawGainLossData>) => {
          try {
            const rawData = results.data;
            if (!rawData || rawData.length === 0) {
              // 売却0件（ヘッダーのみ）のCSVの場合、空配列として正常処理
              onUpload([]);
              return;
            }

            const firstRow = rawData[0];
            const requiredFields = ['Symbol', 'TradeDate', 'PurchaseDate', 'Quantity', 'Proceeds', 'Cost', 'Amount'] as const;

            const missingFields = requiredFields.filter(field => !(field in firstRow));
            if (missingFields.length > 0) {
              throw new Error(`必須フィールドが不足しています: ${missingFields.join(', ')}`);
            }

            // 文字列のクリーニング関数
            const cleanString = (val: string | undefined): string => {
              if (!val) return '';
              return val.replace(/['"]+/g, '').trim();
            };

            const processedData = rawData.map((row) => ({
              ...row,
              Symbol: cleanString(row.Symbol),
              TradeDate: cleanString(row.TradeDate),
              PurchaseDate: cleanString(row.PurchaseDate),
              Quantity: safeParseNumber(row.Quantity),
              Proceeds: safeParseNumber(row.Proceeds),
              Cost: safeParseNumber(row.Cost),
              Amount: safeParseNumber(row.Amount),
              WashSale: safeParseNumber(row.WashSale)
            }));

            onUpload(processedData);
          } catch (err) {
            console.error('データ処理エラー:', err);
            onError(err instanceof Error ? err.message : 'データの処理中にエラーが発生しました');
          }
        }
      };

      Papa.parse(preprocessResult.data!, parseConfig);
    };

    reader.onerror = () => onError('ファイルの読み込み中にエラーが発生しました');
    reader.readAsText(file);
  }, [onUpload, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    onDrop
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
        `}
      >
        <input {...getInputProps()} />

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
              FT_GainLoss_(口座番号).csvのみ対応
            </span>

            <div
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>CSVの入手方法</span>
              <HelpTooltip text="Firstrade管理画面 ＞ Gain/Loss ＞ Download CSV から該当年のデータをダウンロードしてください。" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};