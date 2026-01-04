// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// =============================================
// セキュリティ設定
// =============================================

// レートリミット設定（1分あたりのリクエスト数）
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1分
const RATE_LIMIT_MAX_REQUESTS = 5; // 1分あたり5リクエスト

// メッセージ長制限
const MAX_MESSAGE_LENGTH = 500;

// 許可するオリジン（本番環境では適切なドメインに変更）
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://firstrade.nomadkazoku.com',
    'https://www.nomadkazoku.com',
];

// レートリミット用のメモリストア（本番環境ではRedisなど推奨）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// =============================================
// ヘルパー関数
// =============================================

// IPアドレスを取得
function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }
    return 'unknown';
}

// レートリミットチェック
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
        // 新しいウィンドウを開始
        rateLimitStore.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW_MS
        });
        return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
    }

    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        // 制限超過
        return {
            allowed: false,
            remaining: 0,
            resetIn: record.resetTime - now
        };
    }

    // カウント増加
    record.count++;
    rateLimitStore.set(ip, record);
    return {
        allowed: true,
        remaining: RATE_LIMIT_MAX_REQUESTS - record.count,
        resetIn: record.resetTime - now
    };
}

// リファラーチェック
function checkReferer(request: NextRequest): boolean {
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');

    // 開発環境では緩和
    if (process.env.NODE_ENV === 'development') {
        return true;
    }

    // リファラーまたはオリジンが許可リストに含まれているかチェック
    const checkUrl = referer || origin;
    if (!checkUrl) {
        return false;
    }

    return ALLOWED_ORIGINS.some(allowed => checkUrl.startsWith(allowed));
}

// 古いレートリミットレコードをクリーンアップ（メモリリーク防止）
function cleanupRateLimitStore() {
    const now = Date.now();
    for (const [ip, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(ip);
        }
    }
}

// 定期的にクリーンアップ（5分ごと）
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

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
            return NextResponse.json(
                { error: 'Gemini APIキーが設定されていません' },
                { status: 500 }
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
            model: 'gemini-2.0-flash-exp',
            systemInstruction: SYSTEM_PROMPT,
        });

        const chatHistory = history?.map((msg: { type: string; content: string }) => ({
            role: msg.type === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        })) || [];

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
        console.error('Gemini API error:', error);

        const errorMessage = error instanceof Error
            ? error.message
            : '予期しないエラーが発生しました';

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
