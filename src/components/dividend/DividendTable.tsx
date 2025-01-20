// src/components/dividend/DividendTable.tsx
import React from 'react';
import type { ConvertedDividendRecord, ProcessedDividendData } from '@/types/dividend';

interface Props {
  data: ProcessedDividendData;
  onDownload: () => void;
}

export const DividendTable: React.FC<Props> = ({ data, onDownload }) => {
  const renderTable = (records: ConvertedDividendRecord[], title: string) => {
    if (records.length === 0) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">銘柄</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支払日</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">USD金額</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">為替レート</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">円換算額</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record, index) => (
                <tr key={`${record.Symbol}-${record.TradeDate}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.Symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.TradeDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${record.Amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ¥{record.exchangeRate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ¥{record.amountJPY.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {renderTable(data.dividends, "配当金")}
      {renderTable(data.interest, "利子")}
      {renderTable(data.other, "その他")}

      <div className="mt-4">
        <button
          onClick={onDownload}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          CSVダウンロード
        </button>
      </div>
    </div>
  );
};