// src/components/portfolio/PortfolioSummary.tsx
'use client';

import React from 'react';
import type { PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Props {
  summary: PortfolioSummaryType;
}

export const PortfolioSummaryComponent: React.FC<Props> = ({ summary }) => {
  const { portfolio, allocationStatus, suggestions, riskIndicators } = summary;

  return (
    <div className="space-y-6">
      {/* 概要 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ポートフォリオ概要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">保有銘柄数</div>
              <div className="text-xl font-semibold">{portfolio.holdings.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">時価総額</div>
              <div className="text-xl font-semibold">
                ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">総取得価額</div>
              <div className="text-xl font-semibold">
                ${portfolio.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">含み損益</div>
              <div className={`text-xl font-semibold ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolio.totalGainLoss >= 0 ? '+' : ''}${portfolio.totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">分散スコア</div>
              <div className="text-xl font-semibold">{riskIndicators.diversificationScore}/100</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">集中リスク</div>
              <div className={`text-xl font-semibold ${riskIndicators.concentrationRisk > 20 ? 'text-red-500' : ''}`}>
                {riskIndicators.concentrationRisk.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 保有銘柄一覧 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">保有銘柄</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">銘柄</th>
                  <th className="text-right py-2">数量</th>
                  <th className="text-right py-2">現在価格</th>
                  <th className="text-right py-2">時価</th>
                  <th className="text-right py-2">損益</th>
                  <th className="text-right py-2">割合</th>
                  <th className="text-left py-2 pl-4">分類</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((holding) => {
                  const percent = portfolio.totalValue > 0
                    ? ((holding.currentValue || 0) / portfolio.totalValue) * 100
                    : 0;
                  return (
                    <tr key={holding.symbol} className="border-b">
                      <td className="py-2 font-medium">{holding.symbol}</td>
                      <td className="text-right py-2">{holding.quantity.toFixed(2)}</td>
                      <td className="text-right py-2">${(holding.currentPrice || 0).toFixed(2)}</td>
                      <td className="text-right py-2">${(holding.currentValue || 0).toFixed(2)}</td>
                      <td className={`text-right py-2 ${(holding.gainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(holding.gainLoss || 0) >= 0 ? '+' : ''}{(holding.gainLossPercent || 0).toFixed(1)}%
                      </td>
                      <td className="text-right py-2">{percent.toFixed(1)}%</td>
                      <td className="text-left py-2 pl-4 text-gray-500">{holding.assetClass}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 配分状況 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">配分状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allocationStatus.map((status) => (
              <div key={status.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{status.name}</span>
                  <span className={
                    status.status === 'overweight' ? 'text-red-500' :
                    status.status === 'underweight' ? 'text-blue-500' :
                    'text-green-500'
                  }>
                    {status.currentPercent.toFixed(1)}% / {status.targetPercent}%
                    {status.status === 'overweight' && ' (超過)'}
                    {status.status === 'underweight' && ' (不足)'}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded overflow-hidden">
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
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">リバランス提案</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 rounded text-sm ${
                    suggestion.action === 'sell' ? 'bg-red-50 border border-red-200' :
                    suggestion.action === 'buy' ? 'bg-blue-50 border border-blue-200' :
                    'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      suggestion.action === 'sell' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {suggestion.action === 'sell' ? '売却検討' : '追加検討'}
                    </span>
                    <span className="font-medium">{suggestion.symbol}</span>
                  </div>
                  <div className="text-gray-600 mt-1">{suggestion.reason}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* リスク指標 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">リスク指標</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">最大銘柄集中度</span>
              <span className={riskIndicators.concentrationRisk > 20 ? 'text-red-500 font-medium' : ''}>
                {riskIndicators.concentrationRisk.toFixed(1)}%
                {riskIndicators.concentrationRisk > 20 && ' ⚠️'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最大セクター集中度</span>
              <span className={riskIndicators.sectorConcentration > 30 ? 'text-yellow-600 font-medium' : ''}>
                {riskIndicators.sectorConcentration.toFixed(1)}%
                {riskIndicators.sectorConcentration > 30 && ' ⚠️'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">分散スコア</span>
              <span className={riskIndicators.diversificationScore < 50 ? 'text-yellow-600' : 'text-green-600'}>
                {riskIndicators.diversificationScore}/100
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
