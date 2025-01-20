// src/components/dividend/DividendFileUploader.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import type { RawDividendData } from '@/types/dividend';
import { Alert, AlertDescription } from '../ui/alert';

interface Props {
  onUpload: (data: RawDividendData[]) => void;
  onError: (message: string) => void;
}

export const DividendFileUploader: React.FC<Props> = ({ onUpload, onError }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // CSVデータをRawDividendDataとして処理
          const rawData = results.data as RawDividendData[];
          onUpload(rawData);
        } catch (err) {
          onError(err instanceof Error ? err.message : '配当データの処理中にエラーが発生しました');
        }
      },
      error: (error: Error) => {
        onError(`CSVの解析に失敗しました: ${error.message}`);
      }
    });
  }, [onUpload, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    onDrop
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <p>Firstradeの配当金明細CSVをドロップ、または<br />クリックしてファイルを選択</p>
        <p className="text-sm text-gray-500 mt-2">
          ※Dividend Reportのみ対応
        </p>
      </div>
      <Alert className="mt-4">
        <AlertDescription>
          配当金明細（Dividend Report）のCSVファイルをアップロードしてください。
          為替レートは各支払日の実勢レートを使用します。
        </AlertDescription>
      </Alert>
    </div>
  );
};