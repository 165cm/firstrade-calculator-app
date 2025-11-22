// src/components/common/ProgressIndicator.tsx
'use client';

export interface ProgressState {
  phase: string;
  current: number;
  total: number;
  percentage: number;
}

interface ProgressIndicatorProps {
  progress: ProgressState;
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-md mx-auto py-8">
      <div className="space-y-3">
        {/* フェーズ表示 */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700">{progress.phase}</span>
          <span className="text-gray-500">{progress.percentage}%</span>
        </div>

        {/* プログレスバー */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        {/* 件数表示 */}
        {progress.total > 0 && (
          <p className="text-xs text-gray-500 text-center">
            {progress.current} / {progress.total} 件処理中
          </p>
        )}
      </div>
    </div>
  );
}

export function createInitialProgress(): ProgressState {
  return {
    phase: '準備中...',
    current: 0,
    total: 0,
    percentage: 0
  };
}
