// src/utils/dividend/DividendSummary.tsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { getExchangeRate } from '@/data/exchangeRates';
import type { 
  DividendRecord, 
  ProcessedDividendData,
  ConvertedDividendRecord
} from '@/types/dividend';
import { ExportButton } from '@/components/common/ExportButton';
import { HelpTooltip } from '@/components/common/Tooltip';
import { exportDividendToCsv, downloadCsv } from '@/utils/export/csvExport';
import { calculateTotalWithholding, extractWithholdingAmount } from '../withholding';

interface Props {
  data: ProcessedDividendData;
}

// 月次集計カードのコンポーネント
const MonthlyTotalCard = ({ 
  data, 
  month,
  recordCount
}: { 
  data: {
    dividend: number;
    interest: number;
    withholding: number;
  };
  month: string;
  recordCount: number;
}) => {
  const totalIncome = data.dividend + data.interest;
  // withholdingは既にマイナス値なので、そのまま表示
  const withholding = data.withholding;

  return (
    <div className="flex justify-between items-center w-full py-4 px-2">
      <div className="flex items-center space-x-2">
        <span className="text-base text-gray-600 min-w-[2rem]">{Number(month)}月</span>
        <span className="text-sm text-gray-400">({recordCount}件)</span>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <span className="text-base text-gray-600 mr-3">配当所得</span>
          <span className="text-xl font-semibold text-gray-900 tabular-nums">
            ${totalIncome.toFixed(2)}
          </span>
        </div>
        {withholding !== 0 && (
          <div className="flex items-center">
            <span className="text-base text-gray-600 mr-3">
              源泉徴収(抜粋)
              <HelpTooltip text="米国で源泉徴収された税金。CSVのDescriptionに記載がある分のみ集計。外国税額控除の申請に使用します。" />
            </span>
            <span className="text-xl font-semibold text-red-600 tabular-nums">
              ${withholding.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// サマリーカードの部分を修正
const SummaryCard = ({ title, amountUSD, amountJPY, color }: {
  title: string;
  amountUSD: number;
  amountJPY: number;
  color: string;
}) => (
  <div className="bg-white rounded-lg shadow p-6 w-full">
    <h3 className="text-sm font-semibold text-gray-500 mb-3">{title}</h3>
    <div className="space-y-2">
      <p className={`text-3xl font-bold text-right ${color}`}>
        ${Math.floor(amountUSD).toLocaleString()}
      </p>
      <p className="text-xl text-gray-600 text-right">
        ¥{Math.floor(amountJPY).toLocaleString()}
      </p>
    </div>
  </div>
);
  
const groupRecordsByMonth = (records: ConvertedDividendRecord[]) => {
  const monthlyGroups = new Map<string, ConvertedDividendRecord[]>();
  
  records.forEach(record => {
    const month = record.TradeDate.substring(5, 7);
    const currentGroup = monthlyGroups.get(month) || [];
    monthlyGroups.set(month, [...currentGroup, record]);
  });
  
  return monthlyGroups;
};  

export async function processDividendData(records: DividendRecord[]): Promise<ProcessedDividendData> {
  try {
    const processPromises = records.map(async record => {
      const exchangeRate = await getExchangeRate(record.TradeDate);
      return {
        ...record,
        exchangeRate,
        amountJPY: record.Amount * exchangeRate
      };
    });

    const processedRecords = await Promise.all(processPromises);
  
    // withholdingRecordsの抽出を改善
    const withholdingRecords = processedRecords.filter(r => {
      // Description内の"WITHHELD"文字列を確認
      if (!r.Description.includes('WITHHELD')) return false;
      
      // 金額の抽出
      const match = r.Description.match(/WITHHELD\s+\$(\d+\.\d+)/);
      if (!match) return false;
      
      // 金額を検証
      const amount = -parseFloat(match[1]); // マイナス値として設定
      
      console.log('源泉徴収レコード判定:', {
        銘柄: r.Symbol,
        Description: r.Description,
        抽出金額: amount,
        元の金額: r.Amount
      });
      
      return true;
    });

    return {
      dividends: processedRecords.filter(r => r.Action.toUpperCase() === 'DIVIDEND'),
      interest: processedRecords.filter(r => r.Action.toUpperCase() === 'INTEREST'),
      other: processedRecords.filter(r => {
        const action = r.Action.toUpperCase();
        return action !== 'DIVIDEND' && 
               action !== 'INTEREST' &&
               action !== 'BUY' &&
               action !== 'SELL';
      }),
      withholding: withholdingRecords
    };
  } catch (error) {
    console.error('配当データの処理中にエラーが発生:', error);
    throw new Error('配当データの処理中にエラーが発生しました。サポートへお問い合わせください。');
  }
}

export function DividendSummary({ data }: Props) {
  // handleExport関数をコンポーネントのトップレベルに移動
  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // エクスポート用にデータを加工
    const exportData = [
      ...data.dividends,
      ...data.interest,
      ...data.other
    ];
  
    const csvContent = exportDividendToCsv(exportData);
    downloadCsv(csvContent, `配当金明細_${timestamp}.csv`);
  };
  
  // 年間・月間の集計
  const summary = useMemo(() => {
    const calculateTotal = (records: ConvertedDividendRecord[]) => records.reduce((sum, record) => {
      return {
        usd: sum.usd + record.Amount,
        jpy: sum.jpy + record.amountJPY
      };
    }, { usd: 0, jpy: 0 });

    const dividendTotal = calculateTotal(data.dividends);
    const interestTotal = calculateTotal(data.interest);
    const grandTotal = {
      usd: dividendTotal.usd + interestTotal.usd,
      jpy: dividendTotal.jpy + interestTotal.jpy
    };

    // すべてのレコード（配当と利子）から源泉徴収額を計算
    const withholdingTotal = calculateTotalWithholding([
      ...data.dividends,
      ...data.interest,
      ...data.other
    ]);

    const monthlyAverage = {
      usd: grandTotal.usd / 12,
      jpy: grandTotal.jpy / 12
    };

    return {
      dividend: dividendTotal,
      interest: interestTotal,
      withholding: withholdingTotal,
      total: grandTotal,
      monthly: monthlyAverage
    };
  }, [data]);

  // 月次データの更新
  const monthlyData = useMemo(() => {
    const monthly = new Map<string, {
      dividend: number;
      interest: number;
      withholding: number;
    }>();
    
    // 配当・利子の処理
    const processIncome = (records: ConvertedDividendRecord[], type: 'dividend' | 'interest') => {
      records.forEach(record => {
        const month = record.TradeDate.substring(5, 7);
        const current = monthly.get(month) || {
          dividend: 0,
          interest: 0,
          withholding: 0
        };
        
        monthly.set(month, {
          ...current,
          [type]: current[type] + record.Amount
        });

        // 源泉徴収額も同時に処理
        const withholdingAmount = extractWithholdingAmount(record);
        if (withholdingAmount) {
          const updatedCurrent = monthly.get(month) || {
            dividend: 0,
            interest: 0,
            withholding: 0
          };
          monthly.set(month, {
            ...updatedCurrent,
            withholding: updatedCurrent.withholding - withholdingAmount // マイナス値として設定
          });
        }
      });
    };

    // 配当・利子の処理を実行
    processIncome(data.dividends, 'dividend');
    processIncome(data.interest, 'interest');

    // 月次データをソートして返却
    return Array.from(monthly.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, values]) => ({
        month,
        dividend: values.dividend,
        interest: values.interest,
        withholding: values.withholding
      }));
  }, [data]);

  const renderTable = (records: ConvertedDividendRecord[]) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                支払日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                銘柄
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                USD金額
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                為替レート
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                円換算額
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records
              .sort((a, b) => new Date(a.TradeDate).getTime() - new Date(b.TradeDate).getTime())
              .map((record, index) => (
                <tr key={`${record.Symbol}-${record.TradeDate}-${index}`}
                    className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.TradeDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.Symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${record.Amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ¥{record.exchangeRate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ¥{Math.round(record.amountJPY).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">配当金明細</h3>
        <ExportButton onClick={handleExport} />
      </div>
      {/* サマリーカード */}
      <div className="flex flex-row gap-4 w-full">
        <SummaryCard
          title="年間配当金"
          amountUSD={summary.dividend.usd}
          amountJPY={summary.dividend.jpy}
          color="text-indigo-600"
        />
        <SummaryCard
          title="年間利子"
          amountUSD={summary.interest.usd}
          amountJPY={summary.interest.jpy}
          color="text-indigo-600"
        />
        <SummaryCard
          title="総合計"
          amountUSD={summary.total.usd}
          amountJPY={summary.total.jpy}
          color="text-indigo-600"
        />
        <SummaryCard
          title="源泉徴収額(抜粋)"
          amountUSD={summary.withholding.usd}
          amountJPY={summary.withholding.jpy}
          color="text-red-600"
        />
      </div>
    
      {/* 月次推移グラフ */}
      <div className="bg-white rounded-lg shadow p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-semibold text-gray-500">月次推移</h3>
          <div className="text-right">
            <p className="text-sm text-gray-500">月平均</p>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">
                ${Math.floor(summary.monthly.usd).toLocaleString()}
              </p>
              <p className="text-xl text-gray-600">
                ¥{Math.floor(summary.monthly.jpy).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                dataKey="month"
                axisLine={true}
                tickLine={true}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value).toFixed(0)}`}
                axisLine={true}
                tickLine={true}
              />
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                labelFormatter={(label) => `${label}月`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
              />
              <Bar 
                dataKey="dividend" 
                name="配当金" 
                stackId="a" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="interest" 
                name="利子" 
                stackId="a" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 源泉徴収に関する注釈 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          ※ 源泉徴収額はCSV内のDescriptionに記載がある場合のみ自動集計ができます。現状不記載の源泉徴収(約3割)は手動での集計が必要です。
        </p>
      </div>

      {/* 明細アコーディオン */}
      <div className="bg-white rounded-lg shadow">
        <Accordion type="single">
          {Array.from({length: 12}, (_, i) => {
            const month = String(i + 1).padStart(2, '0');
            const monthlyDividends = groupRecordsByMonth(data.dividends).get(month) || [];
            const monthlyInterest = groupRecordsByMonth(data.interest).get(month) || [];
            
            const recordCount = monthlyDividends.length + monthlyInterest.length;
            if (recordCount === 0) return null;

            // 配当と利子の合計を計算
            const monthlyTotal = {
              dividend: monthlyDividends.reduce((sum, r) => sum + r.Amount, 0),
              interest: monthlyInterest.reduce((sum, r) => sum + r.Amount, 0),
              withholding: 0
            };

            // 源泉徴収額を計算
            [...monthlyDividends, ...monthlyInterest].forEach(record => {
              const withholdingAmount = extractWithholdingAmount(record);
              if (withholdingAmount) {
                monthlyTotal.withholding -= withholdingAmount;
              }
            });

            return (
              <AccordionItem key={month} value={month}>
                <AccordionTrigger className="w-full hover:no-underline">
                  <MonthlyTotalCard 
                    data={monthlyTotal}
                    month={month}
                    recordCount={recordCount}
                  />
                </AccordionTrigger>
                <AccordionContent>
                  {monthlyDividends.length > 0 && (
                    <div className="px-4 pt-2 pb-4">
                      {renderTable(monthlyDividends)}
                    </div>
                  )}
                  {monthlyInterest.length > 0 && (
                    <div className="px-4 pt-2 pb-4">
                      {renderTable(monthlyInterest)}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}