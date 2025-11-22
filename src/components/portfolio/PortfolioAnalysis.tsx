// src/components/portfolio/PortfolioAnalysis.tsx
'use client';

import React, { useState } from 'react';
import type { TargetAllocation, PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio';
import { DEFAULT_TARGET_ALLOCATIONS } from '@/types/portfolio';
import { analyzePortfolio } from '@/utils/portfolio/processPortfolio';
import { PortfolioFileUploader } from './PortfolioFileUploader';
import { TargetAllocationSettings } from './TargetAllocationSettings';
import { PortfolioSummaryComponent } from './PortfolioSummary';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface RawTradeData {
  Symbol: string;
  TradeDate: string;
  Action: string;
  Quantity: string | number;
  Price: string | number;
  Amount: string | number;
}

export const PortfolioAnalysis: React.FC = () => {
  const [targetAllocations, setTargetAllocations] = useState<TargetAllocation[]>(
    DEFAULT_TARGET_ALLOCATIONS
  );
  const [summary, setSummary] = useState<PortfolioSummaryType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (data: RawTradeData[]) => {
    setError(null);
    try {
      const result = analyzePortfolio(data, targetAllocations);

      if (result.portfolio.holdings.length === 0) {
        setError('BUY/SELL取引が見つかりませんでした。CSVファイルを確認してください。');
        return;
      }

      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析中にエラーが発生しました');
    }
  };

  const handleError = (message: string) => {
    setError(message);
  };

  const handleAllocationUpdate = (allocations: TargetAllocation[]) => {
    setTargetAllocations(allocations);

    // 既にデータがある場合は再計算
    if (summary) {
      // 元のデータを保持していないので、UIのみ更新
      // 実際の再計算は次回のアップロード時
    }
  };

  return (
    <div className="space-y-6">
      {/* ベータ版バナー */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTitle className="text-yellow-800">ベータ版</AlertTitle>
        <AlertDescription className="text-yellow-700">
          この機能は開発中です。現在価格の取得には対応していないため、取得価額ベースで分析を行います。
        </AlertDescription>
      </Alert>

      {/* ファイルアップロード */}
      <PortfolioFileUploader onUpload={handleUpload} onError={handleError} />

      {/* 目標配分設定 */}
      <TargetAllocationSettings
        allocations={targetAllocations}
        onUpdate={handleAllocationUpdate}
      />

      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 分析結果 */}
      {summary && <PortfolioSummaryComponent summary={summary} />}
    </div>
  );
};
