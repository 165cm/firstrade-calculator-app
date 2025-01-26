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
  ConvertedDividendRecord  // 追加
} from '@/types/dividend';
import { ExportButton } from '@/components/common/ExportButton';
import { exportDividendToCsv, downloadCsv } from '@/utils/export/csvExport';

interface Props {
  data: ProcessedDividendData;
}

const calculateMonthlyTotal = (dividends: ConvertedDividendRecord[], interest: ConvertedDividendRecord[]) => {
  const records = [...dividends, ...interest];
  return records.reduce((sum, record) => ({
    usd: sum.usd + record.Amount,
    jpy: sum.jpy + record.amountJPY
  }), { usd: 0, jpy: 0 });
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
      
      return {
        dividends: processedRecords.filter(r => r.Action.toUpperCase() === 'DIVIDEND'),
        interest: processedRecords.filter(r => r.Action.toUpperCase() === 'INTEREST'),
        other: processedRecords.filter(r => {
          const action = r.Action.toUpperCase();
          return action !== 'DIVIDEND' && 
                 action !== 'INTEREST' &&
                 action !== 'BUY' &&
                 action !== 'SELL';
        })
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
      const csvContent = exportDividendToCsv([
        ...data.dividends,
        ...data.interest,
        ...data.other
      ]);
      downloadCsv(csvContent, `配当金明細_${timestamp}.csv`);
    };
    // 年間・月間の集計
    const summary = useMemo(() => {
      const calculateTotal = (records: ConvertedDividendRecord[]) => records.reduce((sum, record) => {
        return {
          usd: sum.usd + record.Amount,
          jpy: sum.jpy + record.amountJPY  // すでに計算済みの値を使用
        };
      }, { usd: 0, jpy: 0 });
  
      const dividendTotal = calculateTotal(data.dividends);
      const interestTotal = calculateTotal(data.interest);
  
    const grandTotal = {
      usd: dividendTotal.usd + interestTotal.usd,
      jpy: dividendTotal.jpy + interestTotal.jpy
    };

    const monthlyAverage = {
      usd: grandTotal.usd / 12,
      jpy: grandTotal.jpy / 12
    };

    return {
      dividend: dividendTotal,
      interest: interestTotal,
      total: grandTotal,
      monthly: monthlyAverage
    };
  }, [data]);

  // 月次データの集計
  const monthlyData = useMemo(() => {
    const monthly = new Map<string, { dividend: number; interest: number }>();
    
    // 配当金の集計
    data.dividends.forEach(record => {
      const month = record.TradeDate.substring(0, 7);
      const current = monthly.get(month) || { dividend: 0, interest: 0 };
      monthly.set(month, {
        ...current,
        dividend: current.dividend + record.amountJPY
      });
    });

    // 利子の集計
    data.interest.forEach(record => {
      const month = record.TradeDate.substring(0, 7);
      const current = monthly.get(month) || { dividend: 0, interest: 0 };
      monthly.set(month, {
        ...current,
        interest: current.interest + record.amountJPY
      });
    });
  
    return Array.from(monthly.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, values]) => ({
        month: month.substring(5),
        dividend: Math.round(values.dividend),
        interest: Math.round(values.interest)
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
    </div>
  
    {/* 月次推移グラフ */}
      <div className="bg-white rounded-lg shadow p-6 w-full">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-gray-500">月次推移</h3>
            <div className="text-right">
            <p className="text-sm text-gray-500">月平均</p>
            <p className="text-lg font-semibold text-gray-700">
                ¥{Math.floor(summary.monthly.jpy).toLocaleString()}
            </p>
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
                tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                axisLine={true}
                tickLine={true}
              />
              <Tooltip 
                formatter={(value: number) => `¥${Math.floor(value).toLocaleString()}`}
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

      {/* 明細アコーディオン */}
      <div className="bg-white rounded-lg shadow">
        <Accordion type="single" defaultValue="">
          {Array.from({length: 12}, (_, i) => {
            const month = String(i + 1).padStart(2, '0');
            const monthlyDividends = groupRecordsByMonth(data.dividends).get(month) || [];
            const monthlyInterest = groupRecordsByMonth(data.interest).get(month) || [];
            const totalRecords = monthlyDividends.length + monthlyInterest.length;
            const monthlyTotal = calculateMonthlyTotal(monthlyDividends, monthlyInterest);

            if (totalRecords === 0) return null;

            return (
              <AccordionItem key={month} value={month}>
                <AccordionTrigger className="text-sm font-semibold">
                <div className="flex justify-between items-center w-full">
                  <span className="text-gray-700">
                    {`${Number(month)}月の明細 (${totalRecords}件)`}
                  </span>
                  {totalRecords > 0 && (
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end">
                        <span className="text-xs text-gray-500 mr-2">USD</span>
                        <span className="text-base font-bold text-indigo-600">
                          ${monthlyTotal.usd.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span className="text-xs text-gray-500 mr-2">JPY</span>
                        <span className="text-sm text-gray-600">
                          ¥{Math.floor(monthlyTotal.jpy).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                </AccordionTrigger>
                <AccordionContent>
                  {monthlyDividends.length > 0 && (
                    <>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">配当金</h4>
                      {renderTable(monthlyDividends)}
                    </>
                  )}
                  {monthlyInterest.length > 0 && (
                    <>
                      <h4 className="text-sm font-medium text-gray-500 mt-4 mb-2">利子</h4>
                      {renderTable(monthlyInterest)}
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}

          {data.other.length > 0 && (
            <AccordionItem value="other">
              <AccordionTrigger className="text-sm font-semibold">
                その他 ({data.other.length}件)
              </AccordionTrigger>
              <AccordionContent>
                {renderTable(data.other)}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
}