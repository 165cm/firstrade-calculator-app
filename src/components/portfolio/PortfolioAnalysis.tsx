// src/components/portfolio/PortfolioAnalysis.tsx
'use client';

import React, { useState, useEffect, useImperativeHandle } from 'react';
import type { TargetAllocation, PortfolioSummary as PortfolioSummaryType, Holding } from '@/types/portfolio';
import { DEFAULT_TARGET_ALLOCATIONS, ALLOCATION_PRESETS } from '@/types/portfolio';
import { parsePositionText, buildPortfolioFromPositions } from '@/utils/portfolio/parsePosition';
import {
  calculateAllocationStatus,
  generateSuggestions,
  calculateRiskIndicators,
  calculateSectorBreakdown
} from '@/utils/portfolio/processPortfolio';
import { savePortfolioHoldings } from '@/utils/storage/portfolioStorage';
import { exportPortfolioToCsv, downloadCsv } from '@/utils/export/csvExport';
import { PositionInput } from './PositionInput';
import { TargetAllocationSettings } from './TargetAllocationSettings';
import { PortfolioSummaryComponent } from './PortfolioSummary';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { DividendYieldCalculator } from '@/components/dividend/DividendYieldCalculator';
import { aggregateDividendsBySymbol } from '@/utils/dividend/calculateYield';
import type { ProcessedDividendData } from '@/types/dividend';

const SUMMARY_STORAGE_KEY = 'portfolio-beta-summary';
const DIVIDEND_STORAGE_KEY = 'dividend_data';

export interface PortfolioHandle {
  clear: () => void;
  downloadCSV: () => void;
}

interface Props {
  onDataStatusChange?: (hasData: boolean) => void;
}

export const PortfolioAnalysis = React.forwardRef<PortfolioHandle, Props>(({ onDataStatusChange }, ref) => {
  const [targetAllocations, setTargetAllocations] = useState<TargetAllocation[]>(
    DEFAULT_TARGET_ALLOCATIONS
  );
  const [summary, setSummary] = useState<PortfolioSummaryType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputCollapsed, setInputCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [stockDividends, setStockDividends] = useState<ReturnType<typeof aggregateDividendsBySymbol>>([]);

  // localStorageから分析結果を復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SUMMARY_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.summary) {
          setSummary(data.summary);
          setInputCollapsed(true);
        }
        if (data.targetAllocations) {
          setTargetAllocations(data.targetAllocations);
        }
      }
    } catch (e) {
      console.warn('Failed to restore summary from localStorage:', e);
    }
    setIsInitialized(true);
  }, []);

  // 配当データをlocalStorageから読み込む（保有中の銘柄のみ）
  useEffect(() => {
    try {
      const dividendData = localStorage.getItem(DIVIDEND_STORAGE_KEY);
      if (dividendData) {
        const parsed: ProcessedDividendData = JSON.parse(dividendData);
        if (parsed.dividends && parsed.dividends.length > 0) {
          const aggregated = aggregateDividendsBySymbol(parsed.dividends);

          // ポートフォリオに保有している銘柄のみにフィルタリング
          if (summary?.portfolio?.holdings) {
            const holdingSymbols = new Set(
              summary.portfolio.holdings
                .filter(h => h.symbol !== 'CASH')
                .map(h => h.symbol.toUpperCase().trim())
            );
            const filtered = aggregated.filter(d =>
              holdingSymbols.has(d.symbol.toUpperCase().trim())
            );
            setStockDividends(filtered);
          } else {
            // ポートフォリオがない場合は全て表示
            setStockDividends(aggregated);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load dividend data from localStorage:', e);
    }
  }, [summary]); // summaryが更新されたときにも再読み込み

  // データの状態変更を親に通知
  useEffect(() => {
    if (isInitialized) {
      onDataStatusChange?.(!!summary);
    }
  }, [summary, isInitialized, onDataStatusChange]);

  // localStorageに分析結果を保存
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (summary) {
        localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify({
          summary,
          targetAllocations
        }));
      } else {
        localStorage.removeItem(SUMMARY_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save summary to localStorage:', e);
    }
  }, [summary, targetAllocations, isInitialized]);

  const handleClearResults = () => {
    setSummary(null);
    setInputCollapsed(false);
    try {
      localStorage.removeItem(SUMMARY_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear summary from localStorage:', e);
    }
  };

  useImperativeHandle(ref, () => ({
    clear: handleClearResults,
    downloadCSV: () => {
      if (!summary) return;
      try {
        const timestamp = new Date().toISOString().split('T')[0];
        const csvContent = exportPortfolioToCsv(summary.portfolio.holdings);
        downloadCsv(csvContent, `ポートフォリオ分析(Beta)_${timestamp}.csv`);
      } catch (error) {
        console.error('Export error:', error);
      }
    }
  }));

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

      // ポートフォリオデータをLocalStorageに保存（配当ページで利用）
      savePortfolioHoldings(allHoldings.filter(h => h.symbol !== 'CASH'));

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

      {summary && (
        <div className="space-y-4">
          <PortfolioSummaryComponent summary={summary}>
            {/* 目標配分設定: ポートフォリオ概要内の適切な位置に挿入される */}
            <TargetAllocationSettings
              allocations={targetAllocations}
              onUpdate={handleAllocationUpdate}
              onPresetChange={handlePresetChange}
            />
          </PortfolioSummaryComponent>
        </div>
      )}

      {/* 配当利回り計算（ポートフォリオと配当データがある場合） */}
      {stockDividends.length > 0 && (
        <DividendYieldCalculator
          stockDividends={stockDividends}
          holdings={summary?.portfolio?.holdings}
        />
      )}

      {/* テキスト入力（分析後は折りたたみ） */}
      <PositionInput
        onSubmit={handleSubmit}
        onError={handleError}
        isCollapsed={inputCollapsed}
        onToggle={() => setInputCollapsed(!inputCollapsed)}
      />



      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
});

PortfolioAnalysis.displayName = 'PortfolioAnalysis';
