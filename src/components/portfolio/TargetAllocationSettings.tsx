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

        <div className={`text-xs pt-1 border-t ${isValid ? 'text-gray-400' : 'text-red-500'}`}>
          合計: {total}%
          {!isValid && ' (100%に調整)'}
        </div>
      </CardContent>
    </Card>
  );
};
