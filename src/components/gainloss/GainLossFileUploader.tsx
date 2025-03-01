// src/components/gainloss/GainLossFileUploader.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa, { ParseResult, ParseConfig } from 'papaparse';
import { preprocessCsv } from '@/utils/gainloss/preprocessCsv';
import type { RawGainLossData } from '@/types/gainloss';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  onUpload: (data: RawGainLossData[]) => void;
  onError: (message: string) => void;
}

/**
 * 文字列や数値を安全に数値に変換する関数
 */
function safeParseNumber(value: string | number): number {
  // すでに数値の場合はそのまま返す
  if (typeof value === 'number') return value;
  
  // 空の値は0として扱う
  if (!value || value === '') return 0;
  
  // カンマや通貨記号を取り除く（もしpreprocessCsvで処理されていない場合の保険）
  const cleaned = value.toString().replace(/[,\s$¥]/g, '');
  const num = Number(cleaned);
  
  // NaNチェック
  if (isNaN(num)) {
    console.warn(`数値変換失敗: "${value}" -> NaN`);
    return 0;
  }
  
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

      // デバッグログ
      console.log(`CSVファイル読み込み: ${file.name}, サイズ: ${file.size}バイト`);
      
      // preprocessCsvでCSVデータを前処理
      const preprocessResult = preprocessCsv(csvData);
      if (!preprocessResult.success) {
        onError(preprocessResult.error || 'CSV前処理中にエラーが発生しました');
        return;
      }

      // パースの設定を定義
      const parseConfig: ParseConfig<RawGainLossData> = {
        header: true,
        skipEmptyLines: true,
        // dynamicTypingをfalseに設定 - 自動変換を無効化
        dynamicTyping: false,
        complete: (results: ParseResult<RawGainLossData>) => {
          try {
            const rawData = results.data;
            
            if (!rawData || rawData.length === 0) {
              throw new Error('データが空です');
            }

            // デバッグ用：検出されたヘッダーを出力
            console.log('検出されたヘッダー:', Object.keys(rawData[0]));
            console.log('データサンプル (最初の行):', rawData[0]);

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

            // 数値フィールドの変換（safeParseNumber関数を使用）
            const processedData = rawData.map((row, index) => {
              // 行データのサンプルをログに出力（最初の3行のみ）
              if (index < 3) {
                console.log(`行 ${index + 1} の処理:`, row);
              }
              
              // 数値変換を行い、新しいオブジェクトを返す
              const processed = {
                ...row,
                Quantity: safeParseNumber(row.Quantity),
                Proceeds: safeParseNumber(row.Proceeds),
                Cost: safeParseNumber(row.Cost),
                Amount: safeParseNumber(row.Amount)
              };
              
              // 変換結果をログに出力（最初の3行のみ）
              if (index < 3) {
                console.log(`変換結果 (行 ${index + 1}):`, {
                  Symbol: processed.Symbol,
                  Quantity: processed.Quantity,
                  Proceeds: processed.Proceeds,
                  Cost: processed.Cost,
                  Amount: processed.Amount
                });
              }
              
              return processed;
            });

            // 最終的なデータサイズをログに出力
            console.log(`処理完了: ${processedData.length}件のデータを処理`);
            
            onUpload(processedData);
          } catch (err) {
            console.error('データ処理エラー:', err);
            onError(err instanceof Error ? err.message : 'データの処理中にエラーが発生しました');
          }
        }
        // エラーハンドラは ParseConfig の型に合わせて修正
        // error: (error: Error) => { ... } は削除
      };

      // CSVのパース実行
      Papa.parse(preprocessResult.data!, parseConfig);
      
      // 代わりにエラーハンドリングを追加
      // エラーはPromiseのcatchで捕捉
      reader.onerror = (error) => {
        console.error('ファイル読み込みエラー:', error);
        onError('ファイルの読み込み中にエラーが発生しました');
      };
    };

    reader.onerror = (error) => {
      console.error('ファイル読み込みエラー:', error);
      onError('ファイルの読み込み中にエラーが発生しました');
    };

    reader.readAsText(file);
  }, [onUpload, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    onDrop
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-[3fr_2fr] gap-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer transition-colors h-32 flex flex-col justify-center
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          <p>Firstradeの損益計算書CSVをドロップ、<br />またはクリックしてファイルを選択</p>
          <p className="text-sm text-gray-500 mt-2">
            ※FT_GainLoss_(口座番号).csvのみ対応
          </p>
        </div>

        <Alert className="h-32 flex items-center">
         <AlertDescription>
          CSVの入手方法：<br />
          Firstrade管理画面 ＞ Gain/Loss ＞ Download CSV
          から該当年のデータをダウンロード
        </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};