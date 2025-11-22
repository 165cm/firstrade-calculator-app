// src/components/portfolio/PortfolioAnalysis.tsx
'use client';

import React, { useState } from 'react';
import type { TargetAllocation, PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio';
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

  const handleSubmit = (text: string) => {
    setError(null);
    try {
      const holdings = parsePositionText(text);

      if (holdings.length === 0) {
        setError('有効なポジションデータが見つかりませんでした。フォーマットを確認してください。');
        return;
      }

      const portfolio = buildPortfolioFromPositions(holdings);
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
    <div className="space-y-6">
      {/* ベータ版バナー */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTitle className="text-yellow-800">ベータ版</AlertTitle>
        <AlertDescription className="text-yellow-700">
          この機能は開発中です。Firstradeのポジション画面からコピペしてポートフォリオを分析できます。
        </AlertDescription>
      </Alert>

      {/* テキスト入力 */}
      <PositionInput onSubmit={handleSubmit} onError={handleError} />

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

      {/* 分析結果 */}
      {summary && <PortfolioSummaryComponent summary={summary} />}
    </div>
  );
};
