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
    const intValue = Math.round(value);
    const updated = allocations.map(a =>
      a.id === id && !a.isLocked ? { ...a, targetPercent: intValue } : a
    );
    onUpdate(updated);
  };

  const toggleLock = (id: string) => {
    const updated = allocations.map(a =>
      a.id === id ? { ...a, isLocked: !a.isLocked } : a
    );
    onUpdate(updated);
  };

  const total = allocations.reduce((sum, a) => sum + a.targetPercent, 0);
  const isValid = Math.abs(total - 100) < 0.1; // 整数なので === 100 でも良いが念のため

  return (
    <Card>
      <CardHeader className="py-4 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">目標配分設定</CardTitle>
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
      <CardContent className="pt-2 space-y-4">
        {allocations.map((allocation) => (
          <div key={allocation.id} className="flex items-center gap-4">
            <label className="w-16 text-sm text-gray-700">
              {allocation.name}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={allocation.targetPercent}
              onChange={(e) => handlePercentChange(allocation.id, Number(e.target.value))}
              className="flex-1 h-2 cursor-pointer"
              disabled={allocation.isLocked}
            />
            <div className="w-16 flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={allocation.targetPercent}
                onChange={(e) => handlePercentChange(allocation.id, Number(e.target.value))}
                className={`w-12 text-sm border rounded px-1.5 py-1 text-right ${allocation.isLocked ? 'bg-gray-100 text-gray-500' : ''}`}
                disabled={allocation.isLocked}
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            <button
              onClick={() => toggleLock(allocation.id)}
              className={`p-1.5 rounded-md transition-all ${allocation.isLocked ? 'text-blue-600 bg-blue-50 ring-1 ring-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title={allocation.isLocked ? "ロック解除" : "固定する"}
            >
              {allocation.isLocked ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        ))}

        <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-100 mt-4">
          <span className={`${isValid ? 'text-gray-700' : 'text-red-500 font-bold'}`}>
            合計: {total}%
          </span>
          {!isValid && (
            <button
              onClick={() => {
                const lockedItems = allocations.filter(a => a.isLocked);
                const unlockedItems = allocations.filter(a => !a.isLocked);

                // 全てロックされている場合は何もしない
                if (unlockedItems.length === 0) return;

                const lockedTotal = lockedItems.reduce((sum, a) => sum + a.targetPercent, 0);

                // ロックされた合計が100%以上の場合は調整不可（もしくは残りを0にする）
                if (lockedTotal >= 100) {
                  const updated = allocations.map(a =>
                    a.isLocked ? a : { ...a, targetPercent: 0 }
                  );
                  onUpdate(updated);
                  return;
                }

                const remainingToDistribute = 100 - lockedTotal;
                const currentUnlockedTotal = unlockedItems.reduce((sum, a) => sum + a.targetPercent, 0);

                let updated = allocations.map(a => ({ ...a }));

                if (currentUnlockedTotal <= 0) {
                  // 現在の未ロック合計が0以下の場合は均等配分
                  const share = Math.floor(remainingToDistribute / unlockedItems.length);
                  updated = updated.map(a =>
                    a.isLocked ? a : { ...a, targetPercent: share }
                  );
                } else {
                  // 比率を維持して配分 (整数に丸める)
                  const factor = remainingToDistribute / currentUnlockedTotal;
                  updated = updated.map(a =>
                    a.isLocked ? a : { ...a, targetPercent: Math.round(a.targetPercent * factor) }
                  );
                }

                // 丸め誤差の調整（最後の未ロック項目で吸収）
                const newTotal = updated.reduce((sum, a) => sum + a.targetPercent, 0);
                const diff = 100 - newTotal; // 整数同士の計算

                if (diff !== 0) {
                  // 最後の未ロック要素を探す
                  for (let i = updated.length - 1; i >= 0; i--) {
                    if (!updated[i].isLocked) {
                      updated[i].targetPercent = updated[i].targetPercent + diff;
                      break;
                    }
                  }
                }

                onUpdate(updated);
              }}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
            >
              未固定項目を自動調整して100%にする
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
