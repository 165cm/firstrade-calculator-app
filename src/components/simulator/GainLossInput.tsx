// src/components/simulator/GainLossInput.tsx
'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Props {
    onSubmit: (text: string) => void;
    onError: (message: string) => void;
    isCollapsed?: boolean;
    onToggle?: () => void;
    isLoading?: boolean;
}

export interface GainLossInputHandle {
    loadData: (text: string) => void;
    clear: () => void;
}

export const GainLossInput = React.forwardRef<GainLossInputHandle, Props>(({ onSubmit, onError, isCollapsed, onToggle, isLoading }, ref) => {
    const [shortTerm, setShortTerm] = useState<TermSection>({ pages: [''] });
    const [longTerm, setLongTerm] = useState<TermSection>({ pages: [''] });
    const [isInitialized, setIsInitialized] = useState(false);

    // 外部からデータをロードするためのハンドラ
    useImperativeHandle(ref, () => ({
        clear: handleClear,
        loadData: (text: string) => {
            // テキストをShort/Longに分割してセット
            const lines = text.split('\n');
            const shortTermLines: string[] = [];
            const longTermLines: string[] = [];
            let currentTerm = 'short';

            for (const line of lines) {
                if (line.includes('Short Term')) {
                    currentTerm = 'short';
                    continue; // ヘッダーは含めない（handleSubmitで付与されるため）ただしデモデータの構造による
                }
                if (line.includes('Long Term')) {
                    currentTerm = 'long';
                    continue;
                }
                if (!line.trim()) continue;

                if (currentTerm === 'short') {
                    shortTermLines.push(line);
                } else {
                    longTermLines.push(line);
                }
            }

            setShortTerm({ pages: [shortTermLines.join('\n')] });
            setLongTerm({ pages: [longTermLines.join('\n')] });
        }
    }));


    // localStorageから復元
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.shortTerm?.pages) {
                    setShortTerm(data.shortTerm);
                }
                if (data.longTerm?.pages) {
                    setLongTerm(data.longTerm);
                }
            }
        } catch (e) {
            console.warn('Failed to restore from localStorage:', e);
        }
        setIsInitialized(true);
    }, []);

    // localStorageに保存
    useEffect(() => {
        if (!isInitialized) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ shortTerm, longTerm }));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }, [shortTerm, longTerm, isInitialized]);

    const handleSubmit = () => {
        // Short Term と Long Term のデータを結合
        const shortTermText = shortTerm.pages.filter(p => p.trim()).join('\n');
        const longTermText = longTerm.pages.filter(p => p.trim()).join('\n');

        if (!shortTermText && !longTermText) {
            onError('損益データを入力してください');
            return;
        }

        // ヘッダーを付けて結合
        let combinedText = '';
        if (shortTermText) {
            // Short Termヘッダーがなければ追加
            if (!shortTermText.includes('Short Term')) {
                combinedText += 'Total Short Term Realized Gain/Loss\n';
            }
            combinedText += shortTermText + '\n';
        }
        if (longTermText) {
            // Long Termヘッダーがなければ追加
            if (!longTermText.includes('Long Term')) {
                combinedText += 'Total Long Term Realized Gain/Loss\n';
            }
            combinedText += longTermText;
        }

        onSubmit(combinedText);
    };

    const addPage = (term: 'short' | 'long') => {
        if (term === 'short') {
            setShortTerm(prev => ({ pages: [...prev.pages, ''] }));
        } else {
            setLongTerm(prev => ({ pages: [...prev.pages, ''] }));
        }
    };

    const removePage = (term: 'short' | 'long', index: number) => {
        if (term === 'short') {
            setShortTerm(prev => ({ pages: prev.pages.filter((_, i) => i !== index) }));
        } else {
            setLongTerm(prev => ({ pages: prev.pages.filter((_, i) => i !== index) }));
        }
    };

    const updatePage = (term: 'short' | 'long', index: number, value: string) => {
        if (term === 'short') {
            setShortTerm(prev => ({
                pages: prev.pages.map((p, i) => i === index ? value : p)
            }));
        } else {
            setLongTerm(prev => ({
                pages: prev.pages.map((p, i) => i === index ? value : p)
            }));
        }
    };

    const handlePaste = (term: 'short' | 'long', index: number, e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        if (pastedText) {
            updatePage(term, index, pastedText);
        }
    };

    const handleClear = () => {
        setShortTerm({ pages: [''] });
        setLongTerm({ pages: [''] });
        // localStorageもクリア
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Failed to clear localStorage:', e);
        }
    };

    const totalPages = shortTerm.pages.filter(p => p.trim()).length + longTerm.pages.filter(p => p.trim()).length;

    if (isCollapsed) {
        return (
            <Card>
                <CardHeader className="py-3">
                    <button
                        onClick={onToggle}
                        className="w-full flex justify-between items-center text-left"
                    >
                        <CardTitle className="text-sm">損益データ入力</CardTitle>
                        <span className="text-gray-400 text-xs">▼ 展開</span>
                    </button>
                </CardHeader>
            </Card>
        );
    }

    const renderTermSection = (
        title: string,
        bgColor: string,
        borderColor: string,
        term: 'short' | 'long',
        termData: TermSection
    ) => (
        <div className={`p-3 rounded-lg border ${borderColor} ${bgColor}`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">{title}</h4>
                <span className="text-xs text-gray-500">
                    {termData.pages.filter(p => p.trim()).length > 0 &&
                        `${termData.pages.filter(p => p.trim()).length}ページ入力済み`
                    }
                </span>
            </div>

            {termData.pages.map((page, index) => (
                <div key={index} className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">
                            {termData.pages.length > 1 ? `ページ ${index + 1}` : 'データ'}
                        </span>
                        {termData.pages.length > 1 && (
                            <button
                                onClick={() => removePage(term, index)}
                                className="text-xs text-red-500 hover:text-red-700"
                            >
                                ✕ 削除
                            </button>
                        )}
                    </div>
                    <textarea
                        value={page}
                        onChange={(e) => updatePage(term, index, e.target.value)}
                        onPaste={(e) => handlePaste(term, index, e)}
                        placeholder={index === 0
                            ? `Firstrade の ${title} テーブルをコピペ`
                            : `${index + 1}ページ目のデータをコピペ`
                        }
                        className="w-full h-24 p-2 border rounded text-xs font-mono resize-y focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                </div>
            ))}

            <button
                onClick={() => addPage(term)}
                className="w-full py-1.5 text-xs border-2 border-dashed border-gray-300 rounded hover:border-gray-400 hover:bg-gray-50 transition-colors text-gray-500 flex items-center justify-center gap-1"
            >
                <span className="text-lg leading-none">+</span>
                ページを追加（200行超の場合）
            </button>
        </div>
    );

    return (
        <Card>
            <CardHeader className="py-3 pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">
                        損益データ入力
                        {totalPages > 0 && (
                            <span className="ml-2 text-xs text-green-600 font-normal">
                                ({totalPages}ページ分のデータ)
                            </span>
                        )}
                    </CardTitle>
                    {onToggle && (
                        <button onClick={onToggle} className="text-gray-400 text-xs">
                            ▲ 閉じる
                        </button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
                {/* 説明 */}
                <Alert>
                    <AlertDescription className="text-xs text-gray-600">
                        Firstrade の <strong>Account → Gain/Loss</strong> 画面から、Short Term と Long Term のテーブルをそれぞれコピペしてください。
                        <span className="block mt-1 text-gray-400">💾 入力データは自動保存されます</span>
                    </AlertDescription>
                </Alert>

                {/* Short Term セクション */}
                {renderTermSection(
                    'Short Term（短期譲渡）',
                    'bg-blue-50',
                    'border-blue-200',
                    'short',
                    shortTerm
                )}

                {/* Long Term セクション */}
                {renderTermSection(
                    'Long Term（長期譲渡）',
                    'bg-green-50',
                    'border-green-200',
                    'long',
                    longTerm
                )}

                {/* ボタン */}
                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={totalPages === 0 || isLoading}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                計算中...
                            </>
                        ) : (
                            '計算する'
                        )}
                    </button>
                    <button
                        onClick={handleClear}
                        className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        title="入力データと保存データをクリア"
                    >
                        🗑️ クリア
                    </button>
                </div>
            </CardContent>
        </Card>
    );
});

GainLossInput.displayName = 'GainLossInput';
