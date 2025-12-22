// src/app/portfolio/page.tsx
'use client';

import { useRef, useState } from 'react';
import { PortfolioAnalysis, PortfolioHandle } from '@/components/portfolio/PortfolioAnalysis';
import { ExportButton } from '@/components/common/ExportButton';


export default function PortfolioPage() {
  const analysisRef = useRef<PortfolioHandle>(null);
  const [hasData, setHasData] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ポートフォリオ分析</h1>
          <p className="text-sm text-slate-500 mt-1">保有銘柄の資産配分を可視化し、理想的なリバランス案を提案</p>
        </div>
        <div className="flex gap-3">
          {hasData && (
            <>
              <ExportButton onClick={() => analysisRef.current?.downloadCSV()} />
              <button
                onClick={() => analysisRef.current?.clear()}
                className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                入力データをリセット
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <PortfolioAnalysis
          ref={analysisRef}
          onDataStatusChange={setHasData}
        />
      </div>


    </div>
  );
}
