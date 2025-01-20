// src/app/page.tsx
'use client';

import { useState } from 'react';
import DividendPage from './dividend/page';
import GainLossPage from './gainloss/page';

type TabType = 'dividend' | 'gainloss';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dividend');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Firstrade証券取引分析ツール</h1>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex -mb-px">
          <button
            className={`py-2 px-4 font-semibold ${
              activeTab === 'dividend'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('dividend')}
          >
            配当金明細
          </button>
          <button
            className={`py-2 px-4 font-semibold ${
              activeTab === 'gainloss'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('gainloss')}
          >
            損益計算書
          </button>
        </div>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'dividend' ? <DividendPage /> : <GainLossPage />}
    </div>
  );
}