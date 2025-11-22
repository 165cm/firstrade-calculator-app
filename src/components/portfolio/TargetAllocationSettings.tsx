// src/components/portfolio/TargetAllocationSettings.tsx
'use client';

import React from 'react';
import type { TargetAllocation } from '@/types/portfolio';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Props {
  allocations: TargetAllocation[];
  onUpdate: (allocations: TargetAllocation[]) => void;
}

export const TargetAllocationSettings: React.FC<Props> = ({ allocations, onUpdate }) => {
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
      <CardHeader className="pb-3">
        <CardTitle className="text-base">目標配分設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allocations.map((allocation) => (
          <div key={allocation.id} className="flex items-center gap-3">
            <label className="w-20 text-sm text-gray-600">
              {allocation.name}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={allocation.targetPercent}
              onChange={(e) => handlePercentChange(allocation.id, Number(e.target.value))}
              className="flex-1"
            />
            <div className="w-16 flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={allocation.targetPercent}
                onChange={(e) => handlePercentChange(allocation.id, Number(e.target.value))}
                className="w-12 text-sm border rounded px-1 py-0.5 text-right"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
        ))}

        <div className={`text-sm pt-2 border-t ${isValid ? 'text-gray-500' : 'text-red-500'}`}>
          合計: {total}%
          {!isValid && ' (100%になるように調整してください)'}
        </div>
      </CardContent>
    </Card>
  );
};
