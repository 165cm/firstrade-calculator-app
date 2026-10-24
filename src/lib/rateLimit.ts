// src/lib/rateLimit.ts
// インスタンス内メモリで動作する簡易レートリミッター
// ※ Cloud Run の複数インスタンス間では共有されない。厳密な制御が必要な場合は Redis 等を使用すること
import type { NextRequest } from 'next/server';

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetIn: number;
}

/**
 * クライアントIPを取得
 * X-Forwarded-For の先頭はクライアントが自由に書き換えられるため、
 * 信頼できるプロキシが付与した末尾側の値を使う。
 * Cloud Run 直結なら 1（既定値）、外部HTTPS LB 経由なら 2 を TRUSTED_PROXY_COUNT に設定する。
 */
export function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const ips = forwarded.split(',').map(ip => ip.trim()).filter(Boolean);
        const trustedCount = Math.max(1, Number(process.env.TRUSTED_PROXY_COUNT) || 1);
        const index = Math.max(0, ips.length - trustedCount);
        if (ips[index]) {
            return ips[index];
        }
    }
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP.trim();
    }
    return 'unknown';
}

/**
 * 固定ウィンドウ方式のレートリミッターを生成
 */
export function createRateLimiter(options: { windowMs: number; max: number; maxKeys?: number }) {
    const { windowMs, max, maxKeys = 10000 } = options;
    const store = new Map<string, { count: number; resetTime: number }>();

    const cleanup = (now: number) => {
        for (const [key, record] of store.entries()) {
            if (now > record.resetTime) {
                store.delete(key);
            }
        }
    };

    return function check(key: string): RateLimitResult {
        const now = Date.now();

        // メモリ肥大化の防止
        if (store.size >= maxKeys) {
            cleanup(now);
        }

        const record = store.get(key);

        if (!record || now > record.resetTime) {
            store.set(key, { count: 1, resetTime: now + windowMs });
            return { allowed: true, remaining: max - 1, resetIn: windowMs };
        }

        if (record.count >= max) {
            return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
        }

        record.count++;
        return { allowed: true, remaining: max - record.count, resetIn: record.resetTime - now };
    };
}
