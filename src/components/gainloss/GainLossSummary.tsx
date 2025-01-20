// src/components/gainloss/GainLossSummary.tsx
import React from 'react';
import type { GainLossSummary, SymbolSummary, TradeDetail } from '@/types/gainloss';

interface Props {
  summary: GainLossSummary;
}

const GainLossSummaryView: React.FC<Props> = ({ summary }) => {
  // 平均為替レートの計算
  const calculateWeightedAverageRate = (trades: TradeDetail[]): {
    purchaseRate: number;
    saleRate: number;
  } => {
    let totalPurchaseAmount = 0;
    let totalSaleAmount = 0;
    let weightedPurchaseRate = 0;
    let weightedSaleRate = 0;

    trades.forEach(trade => {
      const purchaseAmount = Math.abs(trade.cost);
      const saleAmount = Math.abs(trade.proceeds);

      weightedPurchaseRate += trade.purchaseRate * purchaseAmount;
      weightedSaleRate += trade.saleRate * saleAmount;

      totalPurchaseAmount += purchaseAmount;
      totalSaleAmount += saleAmount;
    });

    return {
      purchaseRate: totalPurchaseAmount ? weightedPurchaseRate / totalPurchaseAmount : 0,
      saleRate: totalSaleAmount ? weightedSaleRate / totalSaleAmount : 0
    };
  };

  // すべての取引から平均レートを計算
  const allTrades = summary.symbolSummary.flatMap(s => s.trades);
  const averageRates = calculateWeightedAverageRate(allTrades);
  
  // 総合損益率の計算（年間サマリー用）
  const totalSalesUSD = summary.symbolSummary.reduce((sum, symbol) => 
    sum + symbol.trades.reduce((acc, trade) => acc + trade.proceeds, 0), 0);
  const gainLossRateUSD = (summary.totalGainLossUSD / totalSalesUSD) * 100;

  const totalSalesJPY = summary.symbolSummary.reduce((sum, symbol) => 
    sum + symbol.trades.reduce((acc, trade) => acc + trade.proceedsJPY, 0), 0);
  const gainLossRateJPY = (summary.totalGainLossJPY / totalSalesJPY) * 100;

  return (
    <div className="space-y-8">
      {/* 損益サマリー（変更なし） */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">年間損益サマリー</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">米ドル建て損益</p>
            <p className="text-2xl font-bold">
              ${summary.totalGainLossUSD.toFixed(2)}
              <span className="text-sm ml-2">
                ({Math.round(gainLossRateUSD)}%)
              </span>
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">平均購入時レート:</p>
                <p className="text-2xl font-bold">¥{averageRates.purchaseRate.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">平均売却時レート:</p>
                <p className="text-2xl font-bold">¥{averageRates.saleRate.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">日本円換算損益</p>
            <p className="text-2xl font-bold">
              ¥{Math.round(summary.totalGainLossJPY).toLocaleString()}
              <span className="text-sm ml-2">
                ({Math.round(gainLossRateJPY)}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 銘柄別実績（詳細付き） */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">銘柄別実績</h2>
        <div className="space-y-4">
          {summary.symbolSummary.map((symbolData) => (
            <SymbolDetailsSection 
              key={symbolData.symbol}
              symbolData={symbolData}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const SymbolDetailsSection: React.FC<{
  symbolData: SymbolSummary;
}> = ({ symbolData }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // 銘柄全体の合計を計算
  const totalProceedsJPY = symbolData.trades.reduce((sum, trade) => 
    sum + (trade.proceeds * trade.saleRate), 0);  // exchangeRateをsaleRateに変更
  const totalCostJPY = symbolData.trades.reduce((sum, trade) => 
    sum + (trade.cost * trade.purchaseRate), 0);  // exchangeRateをpurchaseRateに変更
  
  const totalGainLossJPY = totalProceedsJPY - totalCostJPY;
  const totalGainLossRateJPY = ((totalProceedsJPY / totalCostJPY) - 1) * 100;

  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      {/* 銘柄サマリー行 */}
      <div 
        className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <span className="font-bold">{symbolData.symbol}</span>
          <span className="text-sm text-gray-600">取引回数: {symbolData.trades.length}</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-sm text-gray-600">米ドル建て</div>
            <div className={symbolData.gainLossUSD >= 0 ? "text-green-600" : "text-red-600"}>
              ${symbolData.gainLossUSD.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">円換算</div>
            <div className={totalGainLossJPY >= 0 ? "text-green-600" : "text-red-600"}>
              ¥{Math.round(totalGainLossJPY).toLocaleString()}
              <span className="text-sm ml-1">
                ({Math.round(totalGainLossRateJPY)}%)
              </span>
            </div>
          </div>
          <button
            className="ml-2 p-1 hover:bg-gray-200 rounded"
            aria-label={isExpanded ? "詳細を閉じる" : "詳細を表示"}
          >
            <ChevronIcon direction={isExpanded ? "up" : "down"} />
          </button>
        </div>
      </div>

      {/* 詳細テーブル */}
      {isExpanded && (
        <div className="p-4 overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="text-sm text-gray-600 border-b">
                <th className="px-4 py-2 text-left">購入日</th>
                <th className="px-4 py-2 text-right">購入時為替</th>
                <th className="px-4 py-2 text-left">売却日</th>
                <th className="px-4 py-2 text-right">売却時為替</th>
                <th className="px-4 py-2 text-right">数量</th>
                <th className="px-4 py-2 text-right">取得価格($)</th>
                <th className="px-4 py-2 text-right">売却価格($)</th>
                <th className="px-4 py-2 text-right">取得価格(¥)</th>
                <th className="px-4 py-2 text-right">売却価格(¥)</th>
                <th className="px-4 py-2 text-right">損益(¥)</th>
                <th className="px-4 py-2 text-right">損益率(¥)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {symbolData.trades.map((trade, index) => {
                // 日本円での取得価格と売却価格
                const costJPY = trade.cost * trade.purchaseRate;
                const proceedsJPY = trade.proceeds * trade.saleRate;

                // 損益(円)
                const gainLossJPY = proceedsJPY - costJPY;

                // 損益率(%)
                const gainLossRateJPY = (proceedsJPY / costJPY - 1) * 100;

                return (
                  <tr key={index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-2">{formatDate(trade.purchaseDate)}</td>
                    <td className="px-4 py-2 text-right">¥{trade.purchaseRate.toFixed(2)}</td>
                    <td className="px-4 py-2">{formatDate(trade.saleDate)}</td>
                    <td className="px-4 py-2 text-right">¥{trade.saleRate.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{trade.quantity.toFixed(4)}</td>
                    <td className="px-4 py-2 text-right">${trade.cost.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${trade.proceeds.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">¥{Math.round(costJPY).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">¥{Math.round(proceedsJPY).toLocaleString()}</td>
                    <td className={`px-4 py-2 text-right ${gainLossJPY >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ¥{Math.round(gainLossJPY).toLocaleString()}
                    </td>
                    <td className={`px-4 py-2 text-right ${gainLossRateJPY >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.round(gainLossRateJPY)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

const ChevronIcon: React.FC<{ direction: 'up' | 'down' }> = ({ direction }) => (
  <svg
    className={`w-5 h-5 transform ${direction === 'up' ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export default GainLossSummaryView;