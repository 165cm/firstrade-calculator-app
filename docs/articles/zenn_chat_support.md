---
title: "Next.js + Gemini AI で簡易チャットサポートを実装する【セキュリティ対策付き】"
emoji: "💬"
type: "tech"
topics: ["nextjs", "gemini", "react", "typescript", "api"]
published: false
---

# はじめに

Webサービスにチャットサポートを追加したいけど、外部サービスは高いし、自前で作るのも面倒...そんな悩みを解決するために、**Next.js + Gemini AI** でシンプルなチャットサポートを実装しました。

本記事では、以下の機能を持つチャットサポートの作り方を解説します：

- 🤖 **Gemini 2.0 Flash** による自動応答
- 💬 フローティングチャットUI
- 🔒 レートリミット・セキュリティ対策
- 🌙 ダークモード対応

## デモ

実際に動作するデモは [FirstScope](https://firstrade.nomadkazoku.com/) で確認できます。

# 技術スタック

| 項目           | 技術                    |
| -------------- | ----------------------- |
| フレームワーク | Next.js 14 (App Router) |
| AI API         | Gemini 2.0 Flash        |
| スタイリング   | Tailwind CSS            |
| アイコン       | Lucide React            |

# 実装手順

## 1. Gemini SDK のインストール

```bash
npm install @google/generative-ai
```

## 2. API ルートの作成

`src/app/api/chat/route.ts` を作成します。ポイントはセキュリティ対策です。

```typescript
// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// =============================================
// セキュリティ設定
// =============================================

// レートリミット設定
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1分
const RATE_LIMIT_MAX_REQUESTS = 5;       // 5リクエスト/分

// メッセージ長制限
const MAX_MESSAGE_LENGTH = 500;

// 許可するオリジン
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://your-production-domain.com',
];

// レートリミット用ストア
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// IPアドレス取得
function getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0].trim() 
        || request.headers.get('x-real-ip') 
        || 'unknown';
}

// レートリミットチェック
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
    }

    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

// リファラーチェック
function checkReferer(request: NextRequest): boolean {
    if (process.env.NODE_ENV === 'development') return true;
    
    const referer = request.headers.get('referer') || request.headers.get('origin');
    return ALLOWED_ORIGINS.some(origin => referer?.startsWith(origin));
}

// =============================================
// Gemini API
// =============================================

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `あなたはカスタマーサポートAIです。
簡潔で分かりやすい日本語で回答してください。
最大200文字程度で回答してください。`;

export async function POST(request: NextRequest) {
    // 1. リファラーチェック
    if (!checkReferer(request)) {
        return NextResponse.json({ error: '不正なリクエスト元です' }, { status: 403 });
    }

    // 2. レートリミットチェック
    const ip = getClientIP(request);
    const { allowed, remaining } = checkRateLimit(ip);
    
    if (!allowed) {
        return NextResponse.json(
            { error: 'リクエスト制限に達しました' },
            { status: 429 }
        );
    }

    // 3. リクエストボディの検証
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
        return NextResponse.json({ error: 'メッセージが必要です' }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json(
            { error: `${MAX_MESSAGE_LENGTH}文字以内にしてください` },
            { status: 400 }
        );
    }

    // 4. Gemini APIを呼び出し
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: SYSTEM_PROMPT,
        });

        const chat = model.startChat({
            history: history?.map((m: { type: string; content: string }) => ({
                role: m.type === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            })) || [],
            generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
        });

        const result = await chat.sendMessage(message);
        return NextResponse.json({ response: result.response.text() });

    } catch (error) {
        console.error('Gemini API error:', error);
        return NextResponse.json({ error: 'AIの応答に失敗しました' }, { status: 500 });
    }
}
```

## 3. チャットコンポーネントの作成

`src/components/ChatSupport.tsx` を作成します。

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface Message {
    id: string;
    type: 'bot' | 'user';
    content: string;
}

export function ChatSupport() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 'welcome',
                type: 'bot',
                content: 'こんにちは！ご質問をどうぞ。'
            }]);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async () => {
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
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: inputValue,
                    history: messages.map(m => ({ type: m.type, content: m.content }))
                }),
            });

            const data = await res.json();
            
            setMessages(prev => [...prev, {
                id: `bot-${Date.now()}`,
                type: 'bot',
                content: res.ok ? data.response : `エラー: ${data.error}`
            }]);
        } catch {
            setMessages(prev => [...prev, {
                id: `bot-${Date.now()}`,
                type: 'bot',
                content: '通信エラーが発生しました'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* フローティングボタン */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 
                           text-white shadow-lg hover:bg-blue-500 transition-all"
            >
                {isOpen ? <X className="w-6 h-6 m-auto" /> : <MessageCircle className="w-6 h-6 m-auto" />}
            </button>

            {/* チャットウィンドウ */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border">
                    {/* ヘッダー */}
                    <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
                        <h3 className="font-bold">チャットサポート</h3>
                    </div>

                    {/* メッセージ */}
                    <div className="h-80 overflow-y-auto p-4 space-y-3">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : ''}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    msg.type === 'user' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-100'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex">
                                <div className="bg-gray-100 p-3 rounded-2xl">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 入力欄 */}
                    <div className="p-4 border-t">
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="質問を入力..."
                                className="flex-1 px-4 py-2 border rounded-xl"
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
```

## 4. 環境変数の設定

```bash
# .env.local
GEMINI_API_KEY=your_api_key_here
```

APIキーは [Google AI Studio](https://aistudio.google.com/app/apikey) で取得できます。

## 5. ページに組み込み

```tsx
// app/page.tsx
import { ChatSupport } from '@/components/ChatSupport';

export default function Home() {
    return (
        <main>
            {/* ... */}
            <ChatSupport />
        </main>
    );
}
```

# セキュリティ対策のポイント

| 対策                   | 目的                            |
| ---------------------- | ------------------------------- |
| **レートリミット**     | API乱用・コスト爆発を防止       |
| **メッセージ長制限**   | トークン消費を抑制              |
| **リファラーチェック** | 外部からのAPI呼び出しをブロック |
| **エラーハンドリング** | 内部情報の漏洩を防止            |

# コスト目安

Gemini 2.0 Flash の料金：
- 入力: $0.10 / 100万トークン
- 出力: $0.40 / 100万トークン
- **無料枠**: 1分15リクエスト

月間1000回の会話（1会話5往復）でも **数ドル程度** で運用可能です。

# まとめ

Next.js + Gemini AI を使えば、セキュアで低コストなチャットサポートを簡単に実装できます。

外部サービスに依存せず、自前でカスタマイズできるのが大きなメリットです。

ぜひ試してみてください！

# 参考

- [Gemini API ドキュメント](https://ai.google.dev/docs)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [実装サンプル (GitHub)](https://github.com/165cm/firstrade-calculator-app)
