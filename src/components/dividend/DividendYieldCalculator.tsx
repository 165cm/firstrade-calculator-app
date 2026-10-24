// src/components/dividend/DividendYieldCalculator.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { StockDividendInfo } from '@/utils/dividend/calculateYield';
import type { Holding } from '@/types/portfolio';
import {
  calculateDividendYield,
  getDividendYieldLevel,
  saveStockPrice,
  getStoredStockPrices
} from '@/utils/dividend/calculateYield';
import {
  getStockPrices,
  hasPortfolioData,
  getLastUpdatedTime
} from '@/utils/storage/portfolioStorage';
import { HelpTooltip } from '@/components/common/Tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { fetchStockPrices, getSuccessfulPrices } from '@/utils/stockPrice/yahooFinance';

interface Props {
  stockDividends: StockDividendInfo[];
  holdings?: Holding[];
}

export function DividendYieldCalculator({ stockDividends, holdings = [] }: Props) {
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [portfolioLastUpdated, setPortfolioLastUpdated] = useState<string | null>(null);

  // Yahoo Finance fetch states
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [failedSymbols, setFailedSymbols] = useState<string[]>([]);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  // LocalStorageから株価を読み込む（個別入力 + ポートフォリオデータ）
  useEffect(() => {
    // 個別入力された株価
    const manualPrices = getStoredStockPrices();

    // ポートフォリオデータから株価を取得
    const symbols = stockDividends.map(s => s.symbol);
    const portfolioPrices = getStockPrices(symbols);

    // ポートフォリオデータを優先的に使用（新しいデータ）
    const mergedPrices = { ...manualPrices, ...portfolioPrices };
    setStockPrices(mergedPrices);

    // ポートフォリオデータの有無を確認
    setHasPortfolio(hasPortfolioData());
    setPortfolioLastUpdated(getLastUpdatedTime());
  }, [stockDividends]);

  // Yahoo Financeから株価を自動取得
  const handleFetchPrices = async () => {
    const symbols = stockDividends.map(s => s.symbol);
    if (symbols.length === 0) return;

    setIsFetching(true);
    setFetchError(null);
    setFailedSymbols([]);

    const result = await fetchStockPrices(symbols);

    if (!result.success) {
      setFetchError(result.error || '株価の取得に失敗しました');
      setIsFetching(false);
      return;
    }

    if (result.data) {
      const successfulPrices = getSuccessfulPrices(result.data);

      // Update state and save to localStorage
      // Normalize keys to uppercase for consistency
      const normalizedPrices: Record<string, number> = {};
      Object.entries(successfulPrices).forEach(([symbol, price]) => {
        normalizedPrices[symbol.toUpperCase()] = price;
        saveStockPrice(symbol.toUpperCase(), price);
      });

      setStockPrices(prev => {
        const newPrices = { ...prev, ...normalizedPrices };
        return newPrices;
      });

      // Track failed symbols
      if (result.data.errors && result.data.errors.length > 0) {
        setFailedSymbols(result.data.errors);
      }

      setLastFetched(result.data.fetchedAt);
    }

    setIsFetching(false);
  };

  // 株価と配当利回りを計算したデータ
  const enrichedData = useMemo(() => {
    // holdingsをシンボルで検索できるようMapに変換
    const holdingsMap = new Map(
      holdings.map(h => [h.symbol.toUpperCase().trim(), h])
    );

    return stockDividends.map(stock => {
      // Trim symbol to handle whitespace from CSV parsing
      const trimmedSymbol = stock.symbol.trim();
      const upperSymbol = trimmedSymbol.toUpperCase();

      // Try both original case and uppercase for matching
      const stockPrice = stockPrices[trimmedSymbol] || stockPrices[upperSymbol];
      // ポートフォリオから数量と時価を取得
      const holding = holdingsMap.get(upperSymbol);
      const quantity = holding?.quantity;

      // Calculate yield based on quantity if available
      let dividendYield: number | undefined;

      if (stockPrice && quantity && quantity > 0) {
        // 保有している場合: (年間受取配当総額 / (株価 * 数量)) * 100
        const currentMarketValue = stockPrice * quantity;
        dividendYield = (stock.annualDividendUSD / currentMarketValue) * 100;
      } else if (stockPrice) {
        // 数量不明の場合は従来の計算（参考値、ただし不正確な可能性大）
        dividendYield = calculateDividendYield(stock.annualDividendUSD, stockPrice);
      }

      // 時価評価額（株価があれば株価ベース、なければポートフォリオの値を参照）
      const marketValue = (stockPrice && quantity)
        ? stockPrice * quantity
        : holding?.currentValue;

      return {
        ...stock,
        stockPrice,
        dividendYield,
        quantity,
        marketValue
      };
    });
  }, [stockDividends, stockPrices, holdings]);

  // 編集開始
  const handleEdit = (symbol: string, currentPrice?: number) => {
    setEditingSymbol(symbol);
    setTempPrice(currentPrice?.toString() || '');
  };

  // 株価を保存
  const handleSave = (symbol: string) => {
    const price = parseFloat(tempPrice);
    if (price > 0) {
      saveStockPrice(symbol, price);
      setStockPrices(prev => ({ ...prev, [symbol]: price }));
    }
    setEditingSymbol(null);
    setTempPrice('');
  };

  // キャンセル
  const handleCancel = () => {
    setEditingSymbol(null);
    setTempPrice('');
  };

  // Enterキーで保存
  const handleKeyPress = (e: React.KeyboardEvent, symbol: string) => {
    if (e.key === 'Enter') {
      handleSave(symbol);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Accordion type="single" collapsible className="bg-white rounded-lg shadow">
      <AccordionItem value="dividend-yield" className="border-none">
        <AccordionTrigger className="px-6 py-4 hover:no-underline">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                年間配当利回り（概算）
              </h2>
              <HelpTooltip text="保有数量と直近12ヶ月の配当実績に基づいた概算の年間利回りです。将来の利回りを保証するものではありません。" />
            </div>
            <span className="text-sm text-gray-500">
              {hasPortfolio ? '📊 ポートフォリオ連携済み' : '💡 クリックして展開'}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
            {/* ポートフォリオ連携ステータス */}
            {hasPortfolio && portfolioLastUpdated ? (
              <div className="flex items-center gap-2 text-blue-900">
                <span className="font-semibold">📊 ポートフォリオ分析ツールと連携中</span>
                <span className="text-xs text-gray-500">
                  (最終更新: {new Date(portfolioLastUpdated).toLocaleString('ja-JP')})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-900">
                <span className="font-semibold">💡 ヒント</span>
                <a href="/portfolio" className="text-blue-600 hover:underline">
                  ポートフォリオで保有銘柄を管理
                </a>
              </div>
            )}

            <div className="h-4 w-px bg-gray-300 mx-2 hidden sm:block"></div>

            {/* Yahoo Finance 自動取得ボタン */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleFetchPrices}
                disabled={isFetching || stockDividends.length === 0}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2
                  ${isFetching
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                  }`}
              >
                {isFetching ? '取得中...' : '📊 株価を自動取得 (Beta)'}
              </button>
              {lastFetched && !fetchError && failedSymbols.length === 0 && (
                <span className="text-xs text-green-600">
                  ✓ {new Date(lastFetched).toLocaleTimeString('ja-JP')} に取得完了
                </span>
              )}
            </div>
          </div>

          {/* エラー表示 */}
          {fetchError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-red-800 font-medium">⚠️ 株価の取得に失敗しました</p>
                  <p className="text-xs text-red-600 mt-1">{fetchError}</p>
                </div>
                <button
                  onClick={() => setFetchError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 一部取得失敗 */}
          {failedSymbols.length > 0 && !fetchError && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-amber-800 font-medium">
                    ⚠️ 一部の銘柄の株価を取得できませんでした
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    取得失敗: {failedSymbols.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => setFailedSymbols([])}
                  className="text-amber-400 hover:text-amber-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    銘柄
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    株価 (USD)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    時価評価額
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    年間配当金
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    配当利回り
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrichedData.map((stock) => {
                  const isEditing = editingSymbol === stock.symbol;
                  const yieldInfo = stock.dividendYield
                    ? getDividendYieldLevel(stock.dividendYield)
                    : null;

                  return (
                    <tr key={stock.symbol} className="hover:bg-gray-50">
                      {/* 銘柄 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {stock.symbol}
                          </div>
                          <div className="text-xs text-gray-500">
                            {stock.recordCount}回支払
                          </div>
                        </div>
                      </td>

                      {/* 株価 (USD) */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, stock.symbol)}
                            className="w-24 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                            placeholder="株価"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => handleEdit(stock.symbol, stock.stockPrice)}
                            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                          >
                            {stock.stockPrice ? (
                              <span className="text-sm font-medium text-gray-900">
                                ${stock.stockPrice.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 italic">
                                クリックして入力
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 時価評価額 */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {stock.marketValue
                          ? `$${Math.round(stock.marketValue).toLocaleString()}`
                          : '-'
                        }
                      </td>

                      {/* 年間配当金 */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${stock.annualDividendUSD.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ¥{Math.round(stock.annualDividendJPY).toLocaleString()}
                        </div>
                      </td>

                      {/* 配当利回り */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {stock.dividendYield && yieldInfo ? (
                          <div>
                            <div className={`text-2xl font-bold ${yieldInfo.color}`}>
                              {stock.dividendYield.toFixed(2)}%
                            </div>
                            <div className={`text-xs ${yieldInfo.color} font-medium`}>
                              {yieldInfo.label}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 配当利回りの目安 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">配当利回りの目安</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm text-gray-600">1.5%未満: 低配当</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">1.5-3%: 中配当</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">3-5%: 高配当</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600">5%以上: 超高配当</span>
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>💡 使い方：</strong> 「株価」列をクリックして現在の株価を入力してください。
              配当利回りが自動で計算され、ブラウザに保存されます。Enterキーで保存、Escキーでキャンセルできます。
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
