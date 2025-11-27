// src/components/dividend/DividendYieldCalculator.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { StockDividendInfo } from '@/utils/dividend/calculateYield';
import {
  calculateDividendYield,
  getDividendYieldLevel,
  saveStockPrice,
  removeStockPrice,
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

interface Props {
  stockDividends: StockDividendInfo[];
}

export function DividendYieldCalculator({ stockDividends }: Props) {
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [portfolioLastUpdated, setPortfolioLastUpdated] = useState<string | null>(null);

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

  // 株価と配当利回りを計算したデータ
  const enrichedData = useMemo(() => {
    return stockDividends.map(stock => {
      const stockPrice = stockPrices[stock.symbol];
      const dividendYield = stockPrice
        ? calculateDividendYield(stock.annualDividendUSD, stockPrice)
        : undefined;

      return {
        ...stock,
        stockPrice,
        dividendYield
      };
    });
  }, [stockDividends, stockPrices]);

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

  // 株価を削除
  const handleRemove = (symbol: string) => {
    removeStockPrice(symbol);
    setStockPrices(prev => {
      const newPrices = { ...prev };
      delete newPrices[symbol];
      return newPrices;
    });
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
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">
                配当利回り計算（オプション）
              </h3>
              <HelpTooltip text="銘柄別の年間配当金を表示します。ポートフォリオ分析ツールで入力したデータがあれば自動で株価が反映されます。" />
            </div>
            <span className="text-sm text-gray-500">
              {hasPortfolio ? '📊 ポートフォリオ連携済み' : '💡 クリックして展開'}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          {/* ポートフォリオ連携メッセージ */}
          {hasPortfolio && portfolioLastUpdated && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>📊 ポートフォリオ分析ツールと連携中</strong>
                <br />
                ポートフォリオページで入力したデータから株価を自動取得しました。
                <span className="text-xs text-blue-700 ml-2">
                  （最終更新: {new Date(portfolioLastUpdated).toLocaleString('ja-JP')}）
                </span>
              </p>
            </div>
          )}

          {!hasPortfolio && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>💡 ヒント</strong>
                <br />
                <a href="/portfolio" className="text-blue-600 hover:underline">
                  ポートフォリオ分析ツール
                </a>
                で保有銘柄を登録すると、株価が自動的に反映されます。
              </p>
            </div>
          )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                銘柄
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                年間配当金
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                株価 (USD)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                配当利回り
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
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

                  {/* 年間配当金 */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${stock.annualDividendUSD.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ¥{Math.round(stock.annualDividendJPY).toLocaleString()}
                    </div>
                  </td>

                  {/* 株価入力 */}
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

                  {/* 操作ボタン */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {isEditing ? (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleSave(stock.symbol)}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          保存
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-xs px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : stock.stockPrice ? (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(stock.symbol, stock.stockPrice)}
                          className="text-xs px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleRemove(stock.symbol)}
                          className="text-xs px-3 py-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(stock.symbol)}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        株価を入力
                      </button>
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
