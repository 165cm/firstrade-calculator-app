// src/components/common/ChatSupport.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { FAQ_DATA, POPULAR_QUESTIONS, searchFAQ, type FAQItem } from '@/data/faqData';

interface Message {
    id: string;
    type: 'bot' | 'user';
    content: string;
    isQuestion?: boolean;
}

const MAX_EXCHANGES = 5;
const CONTACT_FORM_URL = 'https://www.notion.so/2d3e8c4088938053a31df1916c843dd0?pvs=106';

export function ChatSupport() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [exchangeCount, setExchangeCount] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [useAI, setUseAI] = useState(true); // AI応答を使用するかどうか
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 初期メッセージ
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    type: 'bot',
                    content: 'こんにちは！FirstScopeサポートです。\nご質問をお選びいただくか、自由にご質問ください。AIがお答えします。'
                }
            ]);
        }
    }, [isOpen, messages.length]);

    // 自動スクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // チャットを開いたときに入力欄にフォーカス
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // 人気の質問を取得
    const popularFAQs = POPULAR_QUESTIONS.map(id =>
        FAQ_DATA.find(item => item.id === id)
    ).filter((item): item is FAQItem => item !== undefined);

    // AI APIを呼び出す
    const callAI = useCallback(async (userMessage: string, history: Message[]): Promise<string> => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: history.filter(m => m.id !== 'welcome').map(m => ({
                        type: m.type,
                        content: m.content
                    }))
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'AI応答に失敗しました');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('AI API error:', error);
            // AIが失敗した場合はFAQ検索にフォールバック
            const faqResults = searchFAQ(userMessage);
            if (faqResults.length > 0) {
                return `${faqResults[0].answer}\n\n（※FAQ回答）`;
            }
            throw error;
        }
    }, []);

    // 5回会話後の処理
    const checkExchangeLimit = useCallback((newCount: number) => {
        if (newCount >= MAX_EXCHANGES) {
            setTimeout(() => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: `bot-summary-${Date.now()}`,
                        type: 'bot',
                        content: 'ご不明点が解消されない場合は、お問い合わせフォームからご連絡ください。\n\n会話内容を要約しましたので、コピーしてお問い合わせ時にご利用ください。'
                    }
                ]);
                setShowSummary(true);
            }, 500);
        }
    }, []);

    // FAQ質問への回答処理
    const handleAnswer = async (faq: FAQItem) => {
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            type: 'user',
            content: faq.question,
            isQuestion: true
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            let response: string;

            if (useAI) {
                // AIで回答を生成
                response = await callAI(faq.question, [...messages, userMessage]);
            } else {
                // FAQの固定回答
                response = faq.answer;
            }

            setMessages(prev => [
                ...prev,
                {
                    id: `bot-${Date.now()}`,
                    type: 'bot',
                    content: response
                }
            ]);
        } catch {
            // エラー時はFAQ回答を使用
            setMessages(prev => [
                ...prev,
                {
                    id: `bot-${Date.now()}`,
                    type: 'bot',
                    content: faq.answer
                }
            ]);
        } finally {
            setIsLoading(false);
            const newCount = exchangeCount + 1;
            setExchangeCount(newCount);
            checkExchangeLimit(newCount);
        }
    };

    // 自由入力での検索/AI応答
    const handleSearch = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            type: 'user',
            content: inputValue
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            let response: string;

            if (useAI) {
                // AIで回答を生成
                response = await callAI(inputValue, [...messages, userMessage]);
            } else {
                // FAQ検索フォールバック
                const results = searchFAQ(inputValue);
                if (results.length > 0) {
                    response = `「${results[0].question}」についてですね。\n\n${results[0].answer}`;
                } else {
                    response = '申し訳ございません。該当するFAQが見つかりませんでした。\n\n下記の「よくある質問」から選択いただくか、お問い合わせフォームからご連絡ください。';
                }
            }

            setMessages(prev => [
                ...prev,
                {
                    id: `bot-${Date.now()}`,
                    type: 'bot',
                    content: response
                }
            ]);
        } catch (error) {
            // エラー時のフォールバック
            const results = searchFAQ(inputValue);
            const fallbackMessage = results.length > 0
                ? `「${results[0].question}」についてですね。\n\n${results[0].answer}`
                : `申し訳ございません。現在AIサポートが利用できません。\n\nお問い合わせフォームからご連絡ください。\n\n（エラー: ${error instanceof Error ? error.message : '不明なエラー'}）`;

            setMessages(prev => [
                ...prev,
                {
                    id: `bot-${Date.now()}`,
                    type: 'bot',
                    content: fallbackMessage
                }
            ]);
        } finally {
            setIsLoading(false);
            const newCount = exchangeCount + 1;
            setExchangeCount(newCount);
            checkExchangeLimit(newCount);
        }
    };

    // 会話の要約を生成
    const generateSummary = (): string => {
        const userQuestions = messages
            .filter(m => m.type === 'user')
            .map(m => `・${m.content}`)
            .join('\n');

        return `【お問い合わせ内容】
以下の質問について、チャットサポートで解決できませんでした。

${userQuestions}

【補足情報】
・使用ブラウザ: 
・発生した問題の詳細: 
・エラーメッセージ（あれば）: 
`;
    };

    // 要約をコピー
    const handleCopySummary = async () => {
        const summary = generateSummary();
        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // フォールバック
            const textarea = document.createElement('textarea');
            textarea.value = summary;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // チャットをリセット
    const handleReset = () => {
        setMessages([]);
        setExchangeCount(0);
        setShowSummary(false);
        setInputValue('');
    };

    return (
        <>
            {/* フローティングボタン */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          flex items-center justify-center
          shadow-lg hover:shadow-xl
          transition-all duration-300 transform hover:scale-105
          ${isOpen
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-blue-600 hover:bg-blue-500'
                    }
        `}
                aria-label={isOpen ? 'チャットを閉じる' : 'チャットサポートを開く'}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* チャットウィンドウ */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* ヘッダー */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">AIチャットサポート</h3>
                                <p className="text-blue-100 text-xs">Gemini AIが回答します</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* AI切り替えトグル */}
                            <button
                                onClick={() => setUseAI(!useAI)}
                                className={`text-xs px-2 py-1 rounded-full transition-colors ${useAI
                                    ? 'bg-white/20 text-white'
                                    : 'bg-white/10 text-white/60'
                                    }`}
                                title={useAI ? 'AI応答ON' : 'AI応答OFF'}
                            >
                                AI {useAI ? 'ON' : 'OFF'}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition-colors p-1"
                                aria-label="閉じる"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* メッセージエリア */}
                    <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800">
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                    max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap
                    ${message.type === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-md'
                                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-bl-md shadow-sm'
                                        }
                  `}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {/* ローディング表示 */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                    <span className="text-sm text-slate-500 dark:text-slate-400">考え中...</span>
                                </div>
                            </div>
                        )}

                        {/* 要約エリア */}
                        {showSummary && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                                <p className="text-sm text-amber-800 font-medium">📋 会話内容の要約</p>
                                <pre className="text-xs text-amber-900 bg-amber-100/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                                    {generateSummary()}
                                </pre>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopySummary}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-500 transition-colors"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                コピーしました
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                要約をコピー
                                            </>
                                        )}
                                    </button>
                                    <a
                                        href={CONTACT_FORM_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        お問い合わせ
                                    </a>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* よくある質問ボタン（5回未満の場合のみ） */}
                    {!showSummary && exchangeCount < MAX_EXCHANGES && !isLoading && (
                        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">よくある質問:</p>
                            <div className="flex flex-wrap gap-2">
                                {popularFAQs.slice(0, 3).map(faq => (
                                    <button
                                        key={faq.id}
                                        onClick={() => handleAnswer(faq)}
                                        disabled={isLoading}
                                        className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-full transition-colors truncate max-w-full disabled:opacity-50"
                                    >
                                        {faq.question.slice(0, 15)}...
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 入力エリア */}
                    <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                        {showSummary ? (
                            <button
                                onClick={handleReset}
                                className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                最初からやり直す
                            </button>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSearch();
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="質問を入力..."
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2.5 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </form>
                        )}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
                            {showSummary
                                ? ''
                                : `会話回数: ${exchangeCount}/${MAX_EXCHANGES}`
                            }
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
