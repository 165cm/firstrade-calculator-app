// src/components/portfolio/PortfolioSummary.tsx
'use client';

import React, { useState } from 'react';
import type { PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Props {
  summary: PortfolioSummaryType;
}

export const PortfolioSummaryComponent: React.FC<Props> = ({ summary }) => {
  const { portfolio, allocationStatus, suggestions, riskIndicators } = summary;
  const [showDetails, setShowDetails] = useState(false);

  const gainLossPercent = portfolio.totalCost > 0
    ? ((portfolio.totalGainLoss / portfolio.totalCost) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* 概要 - コンパクト版 */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
            <div>
              <div className="text-xs text-gray-500">銘柄数</div>
              <div className="text-lg font-bold">{portfolio.holdings.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">時価総額</div>
              <div className="text-lg font-bold">${(portfolio.totalValue / 1000).toFixed(1)}k</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">含み損益</div>
              <div className={`text-lg font-bold ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">分散</div>
              <div className={`text-lg font-bold ${riskIndicators.diversificationScore >= 60 ? 'text-green-600' : riskIndicators.diversificationScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {riskIndicators.diversificationScore}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">集中度</div>
              <div className={`text-lg font-bold ${riskIndicators.concentrationRisk > 25 ? 'text-red-600' : riskIndicators.concentrationRisk > 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                {riskIndicators.concentrationRisk.toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">セクター集中</div>
              <div className={`text-lg font-bold ${riskIndicators.sectorConcentration > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                {riskIndicators.sectorConcentration.toFixed(0)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メインエリア：配分状況 + リバランス提案 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 配分状況 */}
        <Card>
          <CardHeader className="py-3 pb-2">
            <CardTitle className="text-sm">資産配分</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {allocationStatus.map((status) => (
                <div key={status.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{status.name}</span>
                    <span className={
                      status.status === 'overweight' ? 'text-red-600' :
                      status.status === 'underweight' ? 'text-blue-600' :
                      'text-green-600'
                    }>
                      {status.currentPercent.toFixed(1)}%
                      <span className="text-gray-400 ml-1">/ {status.targetPercent}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded overflow-hidden relative">
                    {/* 目標ライン */}
                    <div
                      className="absolute h-full w-0.5 bg-gray-400"
                      style={{ left: `${status.targetPercent}%` }}
                    />
                    {/* 現在値バー */}
                    <div
                      className={`h-full ${
                        status.status === 'overweight' ? 'bg-red-400' :
                        status.status === 'underweight' ? 'bg-blue-400' :
                        'bg-green-400'
                      }`}
                      style={{ width: `${Math.min(100, status.currentPercent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* リバランス提案 */}
        <Card>
          <CardHeader className="py-3 pb-2">
            <CardTitle className="text-sm">
              リバランス提案
              {suggestions.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-500">
                  {suggestions.length}件
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {suggestions.length === 0 ? (
              <div className="text-xs text-gray-500 py-2">
                現在の配分は目標に近い状態です
              </div>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-xs ${
                      suggestion.action === 'sell' ? 'bg-red-50' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold ${
                        suggestion.action === 'sell' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {suggestion.action === 'sell' ? '↓' : '↑'}
                      </span>
                      <span className="font-medium">{suggestion.symbol}</span>
                      <span className="text-gray-600 truncate">{suggestion.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 含み損銘柄（Tax-Loss Harvesting候補）*/}
      {portfolio.holdings.some(h => (h.gainLoss || 0) < 0) && (
        <Card>
          <CardHeader className="py-3 pb-2">
            <CardTitle className="text-sm">
              含み損銘柄
              <span className="ml-2 text-xs font-normal text-gray-500">損出し候補</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {portfolio.holdings
                .filter(h => (h.gainLoss || 0) < 0)
                .sort((a, b) => (a.gainLoss || 0) - (b.gainLoss || 0))
                .map(holding => (
                  <div
                    key={holding.symbol}
                    className="px-2 py-1 bg-red-50 rounded text-xs"
                  >
                    <span className="font-medium">{holding.symbol}</span>
                    <span className="text-red-600 ml-1">
                      {(holding.gainLossPercent || 0).toFixed(1)}%
                    </span>
                    <span className="text-gray-500 ml-1">
                      (${Math.abs(holding.gainLoss || 0).toFixed(0)})
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 保有銘柄詳細（折りたたみ） */}
      <Card>
        <CardHeader className="py-3 pb-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex justify-between items-center text-left"
          >
            <CardTitle className="text-sm">
              保有銘柄詳細
              <span className="ml-2 text-xs font-normal text-gray-500">
                {portfolio.holdings.length}銘柄
              </span>
            </CardTitle>
            <span className="text-gray-400 text-xs">
              {showDetails ? '▲ 閉じる' : '▼ 展開'}
            </span>
          </button>
        </CardHeader>
        {showDetails && (
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-1.5">銘柄</th>
                    <th className="text-right py-1.5">時価</th>
                    <th className="text-right py-1.5">損益</th>
                    <th className="text-right py-1.5">割合</th>
                    <th className="text-left py-1.5 pl-2">分類</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => {
                    const percent = portfolio.totalValue > 0
                      ? ((holding.currentValue || 0) / portfolio.totalValue) * 100
                      : 0;
                    return (
                      <tr key={holding.symbol} className="border-b border-gray-100">
                        <td className="py-1.5 font-medium">{holding.symbol}</td>
                        <td className="text-right py-1.5">${(holding.currentValue || 0).toFixed(0)}</td>
                        <td className={`text-right py-1.5 ${(holding.gainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(holding.gainLoss || 0) >= 0 ? '+' : ''}{(holding.gainLossPercent || 0).toFixed(1)}%
                        </td>
                        <td className="text-right py-1.5">{percent.toFixed(1)}%</td>
                        <td className="text-left py-1.5 pl-2 text-gray-500">{holding.assetClass}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
