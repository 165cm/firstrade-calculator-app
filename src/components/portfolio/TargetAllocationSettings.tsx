// src/components/portfolio/TargetAllocationSettings.tsx
'use client';

import React from 'react';
import type { TargetAllocation } from '@/types/portfolio';
import { ALLOCATION_PRESETS } from '@/types/portfolio';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Props {
  allocations: TargetAllocation[];
  onUpdate: (allocations: TargetAllocation[]) => void;
  onPresetChange?: (preset: keyof typeof ALLOCATION_PRESETS) => void;
}

export const TargetAllocationSettings: React.FC<Props> = ({ allocations, onUpdate, onPresetChange }) => {
  const handlePercentChange = (id: string, value: number) => {
    const updated = allocations.map(a =>
      a.id === id ? { ...a, targetPercent: value } : a
    );
    onUpdate(updated);
  };

  const total = allocations.reduce((sum, a) => sum + a.targetPercent, 0);
  const isValid = Math.abs(total - 100) < 0.1;

  return (
    <Card>
      <CardHeader className="py-3 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">目標配分設定</CardTitle>
          {onPresetChange && (
            <div className="flex gap-1">
              {(Object.keys(ALLOCATION_PRESETS) as Array<keyof typeof ALLOCATION_PRESETS>).map((key) => (
                <button
                  key={key}
                  onClick={() => onPresetChange(key)}
                  className="px-2 py-0.5 text-xs rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  {ALLOCATION_PRESETS[key].name}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {allocations.map((allocation) => (
          <div key={allocation.id} className="flex items-center gap-2">
            <label className="w-12 text-xs text-gray-600">
              {allocation.name}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={allocation.targetPercent}
              onChange={(e) => handlePercentChange(allocation.id, Number(e.target.value))}
              className="flex-1 h-1"
            />
            <div className="w-12 flex items-center gap-0.5">
              <input
                type="number"
                min="0"
                max="100"
                value={allocation.targetPercent}
                onChange={(e) => handlePercentChange(allocation.id, Number(e.target.value))}
                className="w-10 text-xs border rounded px-1 py-0.5 text-right"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center text-xs pt-2 border-t mt-2">
          <span className={`${isValid ? 'text-gray-600' : 'text-red-500 font-bold'}`}>
            合計: {total.toFixed(1)}%
          </span>
          {!isValid && (
            <button
              onClick={() => {
                if (total === 0) return;
                const factor = 100 / total;
                const updated = allocations.map(a => ({
                  ...a,
                  targetPercent: Number((a.targetPercent * factor).toFixed(1))
                }));

                // 丸め誤差の調整（最後の項目で吸収）
                const newTotal = updated.reduce((sum, a) => sum + a.targetPercent, 0);
                const diff = Number((100 - newTotal).toFixed(1));
                if (diff !== 0 && updated.length > 0) {
                  updated[updated.length - 1].targetPercent = Number((updated[updated.length - 1].targetPercent + diff).toFixed(1));
                }

                onUpdate(updated);
              }}
              className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-xs font-medium"
            >
              数値を自動調整して100%にする
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
