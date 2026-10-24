// src/lib/licenseToken.ts
// ライセンス認証済みであることを示す署名付きトークン（サーバーサイド専用）
import crypto from 'crypto';

export interface LicenseTokenPayload {
  v: 1;
  /** ライセンスキーのハッシュ（キーそのものは含めない） */
  sub: string;
  kind: 'gumroad' | 'coupon';
  /** トークンの有効期限（UNIXミリ秒） */
  exp: number;
  /** 画面表示用のライセンス有効期限（YYYY-MM-DD） */
  licenseExpiry?: string;
}

// トークンの最大有効期間。期限切れ後は保存済みキーで自動的に再認証される
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

let devSecret: string | null = null;

function getSecret(): string | null {
  const secret = process.env.LICENSE_TOKEN_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }
  if (process.env.NODE_ENV !== 'production') {
    // 開発環境ではプロセスごとのランダム値で代用
    if (!devSecret) {
      devSecret = crypto.randomBytes(32).toString('hex');
      console.warn('LICENSE_TOKEN_SECRET が未設定のため、開発用の一時シークレットを使用します');
    }
    return devSecret;
  }
  console.error('LICENSE_TOKEN_SECRET is not configured (32文字以上が必要)');
  return null;
}

function sign(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

export function hashLicenseKey(licenseKey: string): string {
  return crypto.createHash('sha256').update(licenseKey).digest('hex').slice(0, 32);
}

export function isTokenSecretConfigured(): boolean {
  return getSecret() !== null;
}

/**
 * トークンを発行
 * @param licenseExpiry ライセンス有効期限（YYYY-MM-DD）。指定時はトークン期限もこれを超えない
 */
export function issueLicenseToken(
  licenseKey: string,
  kind: LicenseTokenPayload['kind'],
  licenseExpiry?: string
): string | null {
  const secret = getSecret();
  if (!secret) return null;

  let exp = Date.now() + TOKEN_TTL_MS;
  if (licenseExpiry) {
    const expiryTime = new Date(licenseExpiry).getTime();
    if (!isNaN(expiryTime)) {
      exp = Math.min(exp, expiryTime);
    }
  }

  const payload: LicenseTokenPayload = {
    v: 1,
    sub: hashLicenseKey(licenseKey.trim()),
    kind,
    exp,
    ...(licenseExpiry ? { licenseExpiry } : {}),
  };

  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body, secret)}`;
}

/**
 * トークンを検証し、有効ならペイロードを返す
 */
export function verifyLicenseToken(token: unknown): LicenseTokenPayload | null {
  if (typeof token !== 'string' || token.length > 2048) return null;

  const secret = getSecret();
  if (!secret) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, signature] = parts;

  const expected = Buffer.from(sign(body, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as LicenseTokenPayload;
    if (payload.v !== 1 || typeof payload.exp !== 'number' || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
