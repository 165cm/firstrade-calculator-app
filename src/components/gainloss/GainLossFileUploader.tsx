// src/components/gainloss/GainLossFileUploader.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa, { ParseResult, ParseConfig } from 'papaparse';
import { preprocessCsv } from '@/utils/gainloss/preprocessCsv';
import type { RawGainLossData } from '@/types/gainloss';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HEADER_MAPPINGS } from '@/types/gainloss';

interface Props {
  onUpload: (data: RawGainLossData[]) => void;
  onError: (message: string) => void;
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

      // パースの設定を定義
      const parseConfig: ParseConfig<RawGainLossData> = {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // ヘッダーの正規化
          const normalizedHeader = header.replace(/"/g, '').trim().toLowerCase();
          console.log('Normalizing header:', header, '->', normalizedHeader);
          
          // マッピングを検索
          for (const [standardKey, aliases] of Object.entries(HEADER_MAPPINGS)) {
            if (aliases.some(alias => alias.toLowerCase() === normalizedHeader)) {
              console.log(`Mapped ${normalizedHeader} to ${standardKey}`);
              return standardKey;
            }
          }
          
          console.log(`No mapping found for: ${normalizedHeader}`);
          return header;
        },
        complete: (results: ParseResult<RawGainLossData>) => {
          try {
            const rawData = results.data;
            
            if (!rawData || rawData.length === 0) {
              throw new Error('データが空です');
            }

            // デバッグ用：検出されたヘッダーを出力
            console.log('Detected headers:', Object.keys(rawData[0]));

            // 必須フィールドの存在確認
            const firstRow = rawData[0];
            const requiredFields = [
              'Symbol', 'TradeDate', 'PurchaseDate', 
              'Quantity', 'Proceeds', 'Cost', 'Amount'
            ] as const;
            
            const missingFields = requiredFields.filter(field => !(field in firstRow));

            if (missingFields.length > 0) {
              throw new Error(
                `必須フィールドが不足しています: ${missingFields.join(', ')}\n` +
                `検出されたヘッダー: ${Object.keys(firstRow).join(', ')}`
              );
            }

            // 数値フィールドの変換
            const processedData = rawData.map(row => ({
              ...row,
              Quantity: Number(row.Quantity),
              Proceeds: Number(row.Proceeds),
              Cost: Number(row.Cost),
              Amount: Number(row.Amount)
            }));

            onUpload(processedData);
          } catch (err) {
            onError(err instanceof Error ? err.message : 'データの処理中にエラーが発生しました');
          }
        }
      };

      // CSVのパース実行
      Papa.parse(preprocessResult.data!, parseConfig);
    };

    reader.onerror = () => {
      onError('ファイルの読み込み中にエラーが発生しました');
    };

    reader.readAsText(file);
  }, [onUpload, onError]);  // 依存配列を追加

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    onDrop
  });

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          Firstradeの損益計算書CSVをアップロードしてください。
          <br />
          ※ 単一年度のGain/Loss Reportのみ対応しています
        </AlertDescription>
      </Alert>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <p>CSVファイルをドロップ、または<br />クリックしてファイルを選択</p>
        <p className="text-sm text-gray-500 mt-2">
          対応フォーマット: Firstrade Gain/Loss Report
        </p>
      </div>
    </div>
  );
};