// src/components/portfolio/PortfolioSummary.tsx
'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { HelpTooltip } from '../common/Tooltip';


interface Props {
  summary: PortfolioSummaryType;
  children?: React.ReactNode;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export const PortfolioSummaryComponent: React.FC<Props> = ({ summary, children }) => {
  const { portfolio, allocationStatus, suggestions, riskIndicators, sectorBreakdown } = summary;
  const [showDetails, setShowDetails] = useState(true);

  const gainLossPercent = portfolio.totalCost > 0
    ? ((portfolio.totalGainLoss / portfolio.totalCost) * 100)
    : 0;

  // 色の一貫性を保つため、AllocationStatus全体の順序に基づいて色を決定
  const allocationWithColors = allocationStatus.map((s, index) => ({
    ...s,
    color: COLORS[index % COLORS.length]
  }));

  // 円グラフ用データ（現在）
  const currentAllocationData = allocationWithColors
    .filter(s => s.currentValue > 0)
    .map(s => ({
      name: s.name,
      value: s.currentValue,
      percent: s.currentPercent,
      color: s.color,
      type: 'current'
    }));

  // 円グラフ用データ（目標）
  const targetAllocationData = allocationWithColors
    .filter(s => s.targetPercent > 0)
    .map(s => ({
      name: s.name,
      value: s.targetPercent,
      color: s.color,
      type: 'target'
    }));

  const sectorData = sectorBreakdown?.map(s => ({
    name: s.sector,
    value: s.value,
    percent: s.percent
  })).filter(d => d.value > 0) || [];

  // リバランス提案をシンボルでマップ
  const suggestionMap = new Map(suggestions.map(s => [s.symbol, s]));

  // 含み損銘柄
  const losers = portfolio.holdings
    .filter(h => (h.gainLoss || 0) < 0)
    .sort((a, b) => (a.gainLoss || 0) - (b.gainLoss || 0));

  return (
    <div className="space-y-3">
      {/* メインサマリー - コンパクト版 */}
      <Card>
        <CardContent className="py-3">
          {/* 指標グリッド */}
          <div className="grid grid-cols-6 gap-2 text-center">
            <div>
              <div className="text-[10px] text-gray-500">銘柄</div>
              <div className="text-lg font-bold">{portfolio.holdings.length}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500">時価総額</div>
              <div className="text-lg font-bold">${(portfolio.totalValue / 1000).toFixed(1)}k</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 flex items-center justify-center gap-0.5">
                含み損益<HelpTooltip text="(時価-取得費)/取得費" />
              </div>
              <div className={`text-lg font-bold ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 flex items-center justify-center gap-0.5">
                分散<HelpTooltip text="銘柄×5+セクター×10 (max100)" />
              </div>
              <div className={`text-lg font-bold ${riskIndicators.diversificationScore >= 60 ? 'text-green-600' : riskIndicators.diversificationScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {riskIndicators.diversificationScore}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 flex items-center justify-center gap-0.5">
                集中度<HelpTooltip text="最大銘柄比率(15%以下推奨)" />
              </div>
              <div className={`text-lg font-bold ${riskIndicators.concentrationRisk > 25 ? 'text-red-600' : riskIndicators.concentrationRisk > 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                {riskIndicators.concentrationRisk.toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 flex items-center justify-center gap-0.5">
                セクター<HelpTooltip text="最大セクター比率(40%以下推奨)" />
              </div>
              <div className={`text-lg font-bold ${riskIndicators.sectorConcentration > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                {riskIndicators.sectorConcentration.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* 追加情報行 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-2 border-t text-xs">
            <span className="text-gray-500">
              取得: <span className="font-medium text-gray-700">${portfolio.totalCost.toLocaleString()}</span>
            </span>
            <span className="text-gray-500">
              損益: <span className={`font-medium ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolio.totalGainLoss >= 0 ? '+' : ''}${portfolio.totalGainLoss.toLocaleString()}
              </span>
            </span>
            {losers.length > 0 && (
              <span className="text-red-600">
                含み損: {losers.length}銘柄 (${Math.abs(losers.reduce((sum, h) => sum + (h.gainLoss || 0), 0)).toFixed(0)})
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 配分チャート - 左右分割 */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* 資産配分 */}
        <Card>
          <CardContent className="py-3">
            <div className="text-xs font-medium text-gray-600 mb-2">資産配分 (外側:目標 / 内側:現在)</div>
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/* 外側の円：目標配分（半透明） */}
                    <Pie
                      data={targetAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={65}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      opacity={0.5}
                      stroke="none"
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {targetAllocationData.map((entry, index) => (
                        <Cell key={`cell-target-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* 内側の円：現在配分 */}
                    <Pie
                      data={currentAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {currentAllocationData.map((entry, index) => (
                        <Cell key={`cell-current-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => {
                        if (props.payload.type === 'target') return [`${value.toFixed(1)}%`, `${name} (目標)`];
                        return [`$${value.toFixed(0)}`, name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                {allocationStatus.map((status, index) => (
                  <div key={status.name} className="flex items-center gap-1">
                    <span className="font-bold w-10 text-right" style={{ color: COLORS[index % COLORS.length] }}>
                      {status.currentPercent.toFixed(0)}%
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-gray-700">{status.name}</span>
                    <span className="text-gray-400 text-[10px]">({status.targetPercent}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* セクター内訳 */}
        {sectorData.length > 0 && (
          <Card>
            <CardContent className="py-3">
              <div className="text-xs font-medium text-gray-600 mb-2">セクター内訳</div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sectorData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270}>
                        {sectorData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toFixed(0)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-0.5 text-xs">
                  {sectorData.slice(0, 8).map((sector, index) => (
                    <div key={sector.name} className="flex items-center gap-1">
                      <span className="font-medium w-7 text-right" style={{ color: COLORS[index % COLORS.length] }}>{sector.percent.toFixed(0)}%</span>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-gray-600 truncate">{sector.name}</span>
                    </div>
                  ))}
                  {sectorData.length > 8 && (
                    <span className="text-gray-400 text-[10px]">+{sectorData.length - 8} more</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* 目標配分設定（Childrenとして挿入） */}
      {children}

      {/* 含み損銘柄（あれば表示） */}
      {losers.length > 0 && (
        <Card className="bg-red-50/50">
          <CardContent className="py-2">
            <div className="flex items-center gap-4">
              <div className="text-xs font-medium text-red-700 whitespace-nowrap">含み損銘柄（損出し候補）</div>
              <div className="flex flex-wrap gap-1.5">
                {losers.map(h => (
                  <div key={h.symbol} className="px-1.5 py-0.5 bg-white rounded border border-red-200 text-xs flex items-center gap-1">
                    <span className="font-medium">{h.symbol}</span>
                    <span className="text-red-600">{(h.gainLossPercent || 0).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* 保有銘柄詳細 - 常時表示・スクロール可能 */}
      <Card>
        <CardHeader className="py-2 pb-1">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex justify-between items-center text-left"
          >
            <CardTitle className="text-sm">
              保有銘柄
              <span className="ml-2 text-xs font-normal text-gray-500">
                {portfolio.holdings.length}銘柄
                {suggestions.length > 0 && <span className="text-orange-600"> / 提案{suggestions.length}件</span>}
              </span>
            </CardTitle>
            <span className="text-gray-400 text-xs">{showDetails ? '▲' : '▼'}</span>
          </button>
        </CardHeader>
        {showDetails && (
          <CardContent className="pt-0 pb-2">
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr className="text-gray-600">
                    <th className="text-left py-1.5 px-1.5 w-16">銘柄</th>
                    <th className="text-right py-1.5 px-1">数量</th>
                    <th className="text-right py-1.5 px-1">取得単価</th>
                    <th className="text-right py-1.5 px-1 cursor-help" title="データ入力時の価格">価格*</th>
                    <th className="text-right py-1.5 px-1">時価</th>
                    <th className="text-right py-1.5 px-1">損益</th>
                    <th className="text-right py-1.5 px-1">割合</th>
                    <th className="text-left py-1.5 px-1 w-16">提案</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => {
                    const percent = portfolio.totalValue > 0
                      ? ((holding.currentValue || 0) / portfolio.totalValue) * 100
                      : 0;
                    const suggestion = suggestionMap.get(holding.symbol);
                    const gainLoss = holding.gainLoss || 0;
                    return (
                      <tr key={holding.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-1 px-1.5 font-medium">{holding.symbol}</td>
                        <td className="py-1 px-1 text-right tabular-nums">{holding.quantity.toFixed(2)}</td>
                        <td className="py-1 px-1 text-right tabular-nums">${holding.averageCost.toFixed(2)}</td>
                        <td className="py-1 px-1 text-right tabular-nums">${(holding.currentPrice || 0).toFixed(2)}</td>
                        <td className="py-1 px-1 text-right tabular-nums">${(holding.currentValue || 0).toFixed(0)}</td>
                        <td className={`py-1 px-1 text-right tabular-nums font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainLoss >= 0 ? '+' : ''}{(holding.gainLossPercent || 0).toFixed(1)}%
                        </td>
                        <td className="py-1 px-1 text-right tabular-nums">{percent.toFixed(1)}%</td>
                        <td className="py-1 px-1 text-left">
                          {suggestion && (
                            <span
                              className={`text-[10px] px-1 py-0.5 rounded cursor-help ${suggestion.action === 'sell' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                              title={`${suggestion.reason}${suggestion.suggestedAmount ? ` (目安: $${suggestion.suggestedAmount.toFixed(0)})` : ''}`}
                            >
                              {suggestion.action === 'sell' ? '売却' : '追加'}
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
