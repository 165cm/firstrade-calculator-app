'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FAQ_DATA, FAQ_CATEGORIES, searchFAQ, POPULAR_QUESTIONS } from '@/data/faqData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { ChatSupport } from '@/components/common/ChatSupport';

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // カテゴリごとのFAQデータを取得
    const filteredData = useMemo(() => {
        let data = FAQ_DATA;

        // 検索フィルタ
        if (searchQuery.trim()) {
            return searchFAQ(searchQuery);
        }

        // カテゴリフィルタ
        if (selectedCategory !== 'all') {
            data = data.filter(item => item.category === selectedCategory);
        }

        return data;
    }, [searchQuery, selectedCategory]);

    // 人気の質問データを取得
    const popularFAQs = useMemo(() => {
        return POPULAR_QUESTIONS.map(id => FAQ_DATA.find(item => item.id === id)).filter(Boolean);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl relative min-h-screen">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">よくある質問 (FAQ)</h1>
                <p className="text-gray-600">FirstScopeの使い方や、よく寄せられる質問をまとめました。</p>
            </div>

            {/* 検索バー */}
            <div className="mb-10 max-w-2xl mx-auto">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="キーワードを入力（例: 配当金, CSV, ライセンス）"
                        className="w-full px-5 py-3 pl-12 rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg
                        className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* 人気の質問（検索していない時のみ表示） */}
            {!searchQuery && selectedCategory === 'all' && (
                <div className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">🔥</span> 人気の質問
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {popularFAQs.map((faq) => (
                            <div key={faq!.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                                <Link href={`#${faq!.id}`} className="block h-full" onClick={() => setSearchQuery(faq!.keywords[0] || faq!.question)}>
                                    <h3 className="text-sm font-medium text-blue-600 mb-2">{faq!.category}</h3>
                                    <p className="text-gray-800 font-medium">{faq!.question}</p>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* カテゴリタブ（検索していない時のみ表示） */}
            {!searchQuery && (
                <div className="mb-8 overflow-x-auto">
                    <div className="flex space-x-2 pb-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            すべて表示
                        </button>
                        {FAQ_CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* FAQリスト */}
            <div className="space-y-4 mb-20">
                {filteredData.length > 0 ? (
                    <Accordion type="single" className="space-y-4">
                        {filteredData.map((item) => (
                            <AccordionItem key={item.id} value={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline text-left">
                                    <div className="flex flex-col text-left w-full pr-4">
                                        <span className="text-xs font-semibold text-blue-600 mb-1">{item.category}</span>
                                        <span className="text-base font-medium text-gray-900">{item.question}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="bg-gray-50/50 px-6 py-4 text-gray-700 leading-relaxed whitespace-pre-line border-t border-gray-100">
                                    {item.answer.split(/(\[.*?\]\(.*?\))/g).map((part, index) => {
                                        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                                        if (linkMatch) {
                                            return (
                                                <Link key={index} href={linkMatch[2]} className="text-blue-600 hover:underline font-medium">
                                                    {linkMatch[1]}
                                                </Link>
                                            );
                                        }
                                        return part;
                                    })}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-2">検索結果が見つかりませんでした</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            すべての質問を表示する
                        </button>
                    </div>
                )}
            </div>

            {/* チャットボット */}
            <ChatSupport />
        </div>
    );
}
