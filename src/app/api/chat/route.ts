// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter, getClientIP } from '@/lib/rateLimit';

// =============================================
// セキュリティ設定
// =============================================

// レートリミット設定（IPごと: 1分あたり5リクエスト）
const checkRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 5 });

// コスト上限（インスタンス全体: 1日あたりのリクエスト数）
const DAILY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT) || 500;
const checkDailyLimit = createRateLimiter({ windowMs: 24 * 60 * 60 * 1000, max: DAILY_LIMIT });

// メッセージ長制限
const MAX_MESSAGE_LENGTH = 500;

// 会話履歴の制限（直近のみ送信し、トークン消費を抑える）
const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_MESSAGE_LENGTH = 1500;

// 許可するオリジン（本番環境では適切なドメインに変更）
// ※ Referer/Origin は偽装可能なため、ブラウザ以外からの悪用はレート制限で抑止する
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://firstrade.nomadkazoku.com',
    'https://www.nomadkazoku.com',
];

// =============================================
// ヘルパー関数
// =============================================

// リファラーチェック
function checkReferer(request: NextRequest): boolean {
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');

    // 開発環境では緩和
    if (process.env.NODE_ENV === 'development') {
        return true;
    }

    // リファラーまたはオリジンが許可リストに含まれているかチェック
    const checkUrl = origin || referer;
    if (!checkUrl) {
        return false;
    }

    try {
        const requestOrigin = new URL(checkUrl).origin;
        return ALLOWED_ORIGINS.includes(requestOrigin);
    } catch {
        return false;
    }
}

type ChatHistoryEntry = { role: 'user' | 'model'; parts: { text: string }[] };

// クライアントから受け取った会話履歴を検証・整形
function sanitizeHistory(history: unknown, currentMessage: string): ChatHistoryEntry[] {
    if (!Array.isArray(history)) return [];

    // 巨大な配列を処理しないよう、先に直近分だけに絞る
    const entries: ChatHistoryEntry[] = history
        .slice(-(MAX_HISTORY_MESSAGES + 1))
        .filter((msg): msg is { type: string; content: string } =>
            typeof msg === 'object' && msg !== null &&
            typeof (msg as { content?: unknown }).content === 'string' &&
            ((msg as { type?: unknown }).type === 'user' || (msg as { type?: unknown }).type === 'bot')
        )
        .map(msg => ({
            role: msg.type === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: msg.content.slice(0, MAX_HISTORY_MESSAGE_LENGTH) }],
        }));

    // 末尾が今回の質問と同じなら重複して送らない
    const last = entries[entries.length - 1];
    if (last && last.role === 'user' && last.parts[0].text === currentMessage) {
        entries.pop();
    }

    const recent = entries.slice(-MAX_HISTORY_MESSAGES);

    // Gemini の履歴は user から始まる必要がある
    while (recent.length > 0 && recent[0].role !== 'user') {
        recent.shift();
    }

    return recent;
}

// =============================================
// Gemini API設定
// =============================================

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `あなたはFirstScope（Firstrade証券の確定申告サポートツール）のカスタマーサポートAIアシスタントです。

【ツールの概要】
FirstScopeは以下の4つの機能を持つ非公式ツールです：
1. 配当金明細: Tax CenterのCSVから配当金・利子を円換算
2. 売却損益: Gain/LossのCSVから譲渡損益を計算
3. 損益シミュレーター: 売却タイミングの税金シミュレーション
4. ポートフォリオ分析: 保有銘柄の資産配分を可視化

【為替レート】
- Frankfurter API（欧州中央銀行のデータ）を使用
- 2019年以降のレートに対応
- 取得できない日はデフォルト値（約150円）を使用

【ライセンス】
- Gumroadで販売
- 2025年版は2026年末まで有効
- 配当金明細の計算は無料で試用可能
- CSVエクスポートは有料機能

【注意事項】
- 税務アドバイスは税理士法により禁止されているため、個別の税務相談には応じられません
- Firstrade公式ツールではなく、個人開発の非公式ツールです
- 源泉徴収額の自動取得率は約73%（CSVデータの制限による）

【回答のルール】
- 簡潔で分かりやすい日本語で回答
- 専門用語は必要に応じて説明を付ける
- 確定申告の具体的なやり方は「国税庁や税理士にご確認ください」と案内
- 不明な点は正直に「分かりません」と伝える
- 最大200文字程度で回答する`;

// =============================================
// APIハンドラー
// =============================================

export async function POST(request: NextRequest) {
    try {
        // 1. リファラーチェック
        if (!checkReferer(request)) {
            return NextResponse.json(
                { error: '不正なリクエスト元です' },
                { status: 403 }
            );
        }

        // 2. レートリミットチェック
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(clientIP);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: `リクエスト制限に達しました。${Math.ceil(rateLimit.resetIn / 1000)}秒後に再試行してください。`
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000))
                    }
                }
            );
        }

        // 3. APIキーの確認
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not configured');
            return NextResponse.json(
                { error: 'チャット機能は現在ご利用いただけません' },
                { status: 503 }
            );
        }

        // 全体の1日上限
        if (!checkDailyLimit('global').allowed) {
            return NextResponse.json(
                { error: '本日の利用上限に達しました。時間をおいて再度お試しください。' },
                { status: 429 }
            );
        }

        const { message, history } = await request.json();

        // 4. メッセージ存在チェック
        if (!message) {
            return NextResponse.json(
                { error: 'メッセージが必要です' },
                { status: 400 }
            );
        }

        // 5. メッセージ長チェック
        if (typeof message !== 'string' || message.length > MAX_MESSAGE_LENGTH) {
            return NextResponse.json(
                { error: `メッセージは${MAX_MESSAGE_LENGTH}文字以内にしてください` },
                { status: 400 }
            );
        }

        // 6. Gemini APIを呼び出し
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT,
        });

        const chatHistory = sanitizeHistory(history, message);

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        // レートリミット情報をヘッダーに含める
        return NextResponse.json(
            { response },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                    'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000))
                }
            }
        );

    } catch (error) {
        console.error('Gemini API error:', error instanceof Error ? error.message : error);

        // 内部エラーの詳細はクライアントに返さない
        return NextResponse.json(
            { error: '回答の生成中にエラーが発生しました。時間をおいて再度お試しください。' },
            { status: 500 }
        );
    }
}
