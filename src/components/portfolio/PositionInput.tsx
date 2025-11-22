// src/components/portfolio/PositionInput.tsx
'use client';

import React, { useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';

interface Props {
  onSubmit: (text: string) => void;
  onError: (message: string) => void;
}

export const PositionInput: React.FC<Props> = ({ onSubmit, onError }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) {
      onError('ポジションデータを入力してください');
      return;
    }
    onSubmit(text);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setText(pastedText);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Firstradeポジション画面からコピペ
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          placeholder={`Symbol\tQuantity\tLast\tChange($)\tChange(%)\tMarket Value\tUnit Cost\tTotal Cost\tGain/Loss($)\tGain/Loss(%)\nVOO\t21.51174\t607.14\t+7.18\t+1.20\t13,060.64\t304.72802\t6,555.23\t+6,505.41\t+99.24`}
          className="w-full h-48 p-3 border rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          分析する
        </button>
        <button
          onClick={() => setText('')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          クリア
        </button>
      </div>

      <Alert>
        <AlertDescription className="text-sm text-gray-600">
          Firstrade &gt; Positions &gt; Stocks セクションのテーブルを選択してコピー＆ペーストしてください。
          ヘッダー行も含めてOKです。
        </AlertDescription>
      </Alert>
    </div>
  );
};
