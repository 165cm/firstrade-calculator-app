// src/components/portfolio/PortfolioAnalysis.tsx
'use client';

import React, { useState } from 'react';
import type { TargetAllocation, PortfolioSummary as PortfolioSummaryType, Holding } from '@/types/portfolio';
import { DEFAULT_TARGET_ALLOCATIONS, ALLOCATION_PRESETS } from '@/types/portfolio';
import { parsePositionText, buildPortfolioFromPositions } from '@/utils/portfolio/parsePosition';
import {
  calculateAllocationStatus,
  generateSuggestions,
  calculateRiskIndicators,
  calculateSectorBreakdown
} from '@/utils/portfolio/processPortfolio';
import { PositionInput } from './PositionInput';
import { TargetAllocationSettings } from './TargetAllocationSettings';
import { PortfolioSummaryComponent } from './PortfolioSummary';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export const PortfolioAnalysis: React.FC = () => {
  const [targetAllocations, setTargetAllocations] = useState<TargetAllocation[]>(
    DEFAULT_TARGET_ALLOCATIONS
  );
  const [summary, setSummary] = useState<PortfolioSummaryType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputCollapsed, setInputCollapsed] = useState(false);

  const handleSubmit = (text: string, cashAmount: number) => {
    setError(null);
    try {
      const holdings = parsePositionText(text);

      if (holdings.length === 0) {
        setError('有効なポジションデータが見つかりませんでした。フォーマットを確認してください。');
        return;
      }

      // 現金を追加
      const allHoldings: Holding[] = [...holdings];
      if (cashAmount > 0) {
        allHoldings.push({
          symbol: 'CASH',
          quantity: 1,
          averageCost: cashAmount,
          totalCost: cashAmount,
          currentPrice: cashAmount,
          currentValue: cashAmount,
          gainLoss: 0,
          gainLossPercent: 0,
          sector: 'Other',
          assetClass: 'Cash'
        });
      }

      const portfolio = buildPortfolioFromPositions(allHoldings);
      const allocationStatus = calculateAllocationStatus(portfolio, targetAllocations);
      const suggestions = generateSuggestions(portfolio, allocationStatus);
      const riskIndicators = calculateRiskIndicators(portfolio);
      const sectorBreakdown = calculateSectorBreakdown(portfolio);

      setSummary({
        portfolio,
        allocationStatus,
        suggestions,
        riskIndicators,
        sectorBreakdown
      });

      // 分析後は入力を折りたたむ
      setInputCollapsed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析中にエラーが発生しました');
    }
  };

  const handleError = (message: string) => {
    setError(message);
  };

  const handleAllocationUpdate = (allocations: TargetAllocation[]) => {
    setTargetAllocations(allocations);
  };

  const handlePresetChange = (presetKey: keyof typeof ALLOCATION_PRESETS) => {
    setTargetAllocations([...ALLOCATION_PRESETS[presetKey].allocations]);
  };

  return (
    <div className="space-y-4">
      {/* ベータ版バナー */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTitle className="text-yellow-800 text-sm">ベータ版</AlertTitle>
        <AlertDescription className="text-yellow-700 text-xs">
          Firstradeのポジション画面からコピペしてポートフォリオを分析できます。
        </AlertDescription>
      </Alert>

      {/* 分析結果（入力より先に表示） */}
      {summary && <PortfolioSummaryComponent summary={summary} />}

      {/* テキスト入力（分析後は折りたたみ） */}
      <PositionInput
        onSubmit={handleSubmit}
        onError={handleError}
        isCollapsed={inputCollapsed}
        onToggle={() => setInputCollapsed(!inputCollapsed)}
      />

      {/* 目標配分設定 */}
      <TargetAllocationSettings
        allocations={targetAllocations}
        onUpdate={handleAllocationUpdate}
        onPresetChange={handlePresetChange}
      />

      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
