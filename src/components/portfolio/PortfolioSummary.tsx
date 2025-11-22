// src/components/portfolio/PortfolioSummary.tsx
'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { HelpTooltip } from '../common/Tooltip';

interface Props {
  summary: PortfolioSummaryType;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export const PortfolioSummaryComponent: React.FC<Props> = ({ summary }) => {
  const { portfolio, allocationStatus, suggestions, riskIndicators, sectorBreakdown } = summary;
  const [showDetails, setShowDetails] = useState(false);

  const gainLossPercent = portfolio.totalCost > 0
    ? ((portfolio.totalGainLoss / portfolio.totalCost) * 100)
    : 0;

  // 円グラフ用データ
  const allocationData = allocationStatus.map(s => ({
    name: s.name,
    value: s.currentValue,
    percent: s.currentPercent
  })).filter(d => d.value > 0);

  const sectorData = sectorBreakdown?.map(s => ({
    name: s.sector,
    value: s.value,
    percent: s.percent
  })).filter(d => d.value > 0) || [];

  // リバランス提案をシンボルでマップ
  const suggestionMap = new Map(suggestions.map(s => [s.symbol, s]));

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
              <div className="text-xs text-gray-500">
                含み損益
                <HelpTooltip text="(時価総額 - 取得価額) / 取得価額" />
              </div>
              <div className={`text-lg font-bold ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">
                分散
                <HelpTooltip text="銘柄数×5 + セクター数×10（最大100）" />
              </div>
              <div className={`text-lg font-bold ${riskIndicators.diversificationScore >= 60 ? 'text-green-600' : riskIndicators.diversificationScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {riskIndicators.diversificationScore}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">
                集中度
                <HelpTooltip text="最大銘柄の時価 / 総時価（15%以下推奨）" />
              </div>
              <div className={`text-lg font-bold ${riskIndicators.concentrationRisk > 25 ? 'text-red-600' : riskIndicators.concentrationRisk > 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                {riskIndicators.concentrationRisk.toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">
                セクター集中
                <HelpTooltip text="最大セクターの時価 / 総時価（40%以下推奨）" />
              </div>
              <div className={`text-lg font-bold ${riskIndicators.sectorConcentration > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                {riskIndicators.sectorConcentration.toFixed(0)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 円グラフエリア：資産配分 + セクター内訳 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 資産配分 円グラフ */}
        <Card>
          <CardHeader className="py-3 pb-2">
            <CardTitle className="text-sm">資産配分</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocationData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(0)}`, '']}
                    labelFormatter={(name) => name}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 mt-2">
              {allocationStatus.map((status, index) => (
                <div key={status.name} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{status.name}</span>
                  <span className={
                    status.status === 'overweight' ? 'text-red-600' :
                    status.status === 'underweight' ? 'text-blue-600' :
                    'text-green-600'
                  }>
                    {status.currentPercent.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* セクター内訳 円グラフ */}
        {sectorData.length > 0 && (
          <Card>
            <CardHeader className="py-3 pb-2">
              <CardTitle className="text-sm">セクター内訳</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sectorData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(0)}`, '']}
                      labelFormatter={(name) => name}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {sectorData.slice(0, 4).map((sector, index) => (
                  <div key={sector.name} className="flex items-center gap-1 text-xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate max-w-16">{sector.name}</span>
                    <span>{sector.percent.toFixed(0)}%</span>
                  </div>
                ))}
                {sectorData.length > 4 && (
                  <span className="text-xs text-gray-400">+{sectorData.length - 4}</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
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

      {/* 保有銘柄詳細（リバランス提案含む） */}
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
                {suggestions.length > 0 && ` / 提案${suggestions.length}件`}
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
                    <th className="text-left py-1.5 pl-2">提案</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => {
                    const percent = portfolio.totalValue > 0
                      ? ((holding.currentValue || 0) / portfolio.totalValue) * 100
                      : 0;
                    const suggestion = suggestionMap.get(holding.symbol);
                    return (
                      <tr key={holding.symbol} className="border-b border-gray-100">
                        <td className="py-1.5 font-medium">{holding.symbol}</td>
                        <td className="text-right py-1.5">${(holding.currentValue || 0).toFixed(0)}</td>
                        <td className={`text-right py-1.5 ${(holding.gainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(holding.gainLoss || 0) >= 0 ? '+' : ''}{(holding.gainLossPercent || 0).toFixed(1)}%
                        </td>
                        <td className="text-right py-1.5">{percent.toFixed(1)}%</td>
                        <td className="text-left py-1.5 pl-2">
                          {suggestion && (
                            <span className={`${suggestion.action === 'sell' ? 'text-red-600' : 'text-blue-600'}`}>
                              {suggestion.action === 'sell' ? '↓売却検討' : '↑追加検討'}
                            </span>
                          )}
                        </td>
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
