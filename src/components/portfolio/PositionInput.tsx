// src/components/portfolio/PositionInput.tsx
'use client';

import React, { useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Props {
  onSubmit: (text: string, cashAmount: number) => void;
  onError: (message: string) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const PositionInput: React.FC<Props> = ({ onSubmit, onError, isCollapsed, onToggle }) => {
  const [text, setText] = useState('');
  const [cashAmount, setCashAmount] = useState<string>('');

  const handleSubmit = () => {
    if (!text.trim()) {
      onError('ポジションデータを入力してください');
      return;
    }
    // $, カンマを除去して数値に変換
    const cash = parseFloat(cashAmount.replace(/[$,]/g, '')) || 0;
    onSubmit(text, cash);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setText(pastedText);
    }
  };

  if (isCollapsed) {
    return (
      <Card>
        <CardHeader className="py-3">
          <button
            onClick={onToggle}
            className="w-full flex justify-between items-center text-left"
          >
            <CardTitle className="text-sm">データ入力</CardTitle>
            <span className="text-gray-400 text-xs">▼ 展開</span>
          </button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">データ入力</CardTitle>
          {onToggle && (
            <button onClick={onToggle} className="text-gray-400 text-xs">
              ▲ 閉じる
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* ポジションデータ */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            ポジション（Firstrade画面からコピペ）
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            placeholder="Symbol  Quantity  Last  ...をコピペ"
            className="w-full h-32 p-2 border rounded text-xs font-mono resize-y focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 現金入力 */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
            現金残高
          </label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">$</span>
            <input
              type="text"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder="0"
              className="w-24 px-2 py-1 border rounded text-xs text-right focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-gray-400">
            (Balances &gt; Cash Balance)
          </span>
        </div>

        {/* ボタン */}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            分析する
          </button>
          <button
            onClick={() => { setText(''); setCashAmount(''); }}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            クリア
          </button>
        </div>

        <Alert>
          <AlertDescription className="text-xs text-gray-500">
            Positions &gt; Stocks のテーブルをコピペ。現金は Balances で確認できます。
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
