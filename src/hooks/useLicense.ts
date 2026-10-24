// src/hooks/useLicense.ts
import { useState, useEffect, useCallback } from 'react';

const LICENSE_KEY_STORAGE = 'gumroad_license_key';
// 旧バージョンで使用していたフラグ（改ざん可能なため現在は判定に使わない）
const LICENSE_VERIFIED_STORAGE = 'gumroad_license_verified';
const LICENSE_EXPIRY_STORAGE = 'gumroad_license_expiry';
// サーバーが発行した署名付きトークン
const LICENSE_TOKEN_STORAGE = 'gumroad_license_token';

interface UseLicenseReturn {
  isVerified: boolean;
  licenseKey: string | null;
  expiryDate: string | null;
  isLoading: boolean;
  error: string | null;
  verifyLicense: (key: string) => Promise<boolean>;
  clearLicense: () => void;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // ストレージが使えない環境では無視
  }
}

interface VerifyResponse {
  success: boolean;
  message?: string;
  expiryDate?: string;
  token?: string;
}

async function requestVerify(key: string): Promise<VerifyResponse> {
  const response = await fetch('/api/license/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey: key }),
  });
  return response.json();
}

async function requestSession(token: string): Promise<{ valid: boolean; expiryDate?: string | null }> {
  const response = await fetch('/api/license/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) return { valid: false };
  return response.json();
}

export function useLicense(): UseLicenseReturn {
  const [isVerified, setIsVerified] = useState(false);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyVerified = useCallback((key: string, token: string, expiry?: string | null) => {
    writeStorage(LICENSE_KEY_STORAGE, key);
    writeStorage(LICENSE_TOKEN_STORAGE, token);
    writeStorage(LICENSE_EXPIRY_STORAGE, expiry ?? null);
    writeStorage(LICENSE_VERIFIED_STORAGE, null);
    setLicenseKey(key);
    setExpiryDate(expiry ?? null);
    setIsVerified(true);
  }, []);

  // 初期化時に保存済みトークンをサーバーで検証
  // トークンがない・期限切れの場合は保存済みキーで自動的に再認証する（旧バージョンからの移行を含む）
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const storedKey = readStorage(LICENSE_KEY_STORAGE);
      const storedToken = readStorage(LICENSE_TOKEN_STORAGE);

      if (!storedKey) return;

      try {
        if (storedToken) {
          const session = await requestSession(storedToken);
          if (cancelled) return;
          if (session.valid) {
            setLicenseKey(storedKey);
            setExpiryDate(session.expiryDate ?? null);
            setIsVerified(true);
            return;
          }
        }

        const data = await requestVerify(storedKey);
        if (cancelled) return;
        if (data.success && data.token) {
          applyVerified(storedKey, data.token, data.expiryDate);
        } else {
          writeStorage(LICENSE_TOKEN_STORAGE, null);
          writeStorage(LICENSE_VERIFIED_STORAGE, null);
        }
      } catch (err) {
        console.error('License restore error:', err);
      }
    };

    restore().finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [applyVerified]);

  // ライセンスキーを検証
  // isLoading は初期復元専用（ここで立てると全画面が「読み込み中」扱いになるため変更しない）
  const verifyLicense = useCallback(async (key: string): Promise<boolean> => {
    setError(null);

    try {
      const data = await requestVerify(key);

      if (data.success && data.token) {
        applyVerified(key, data.token, data.expiryDate);
        return true;
      } else {
        setError(data.message || 'ライセンスキーが正しくありません');
        return false;
      }
    } catch (err) {
      console.error('License verification error:', err);
      setError('検証中にエラーが発生しました');
      return false;
    }
  }, [applyVerified]);

  // ライセンスをクリア
  const clearLicense = useCallback(() => {
    writeStorage(LICENSE_KEY_STORAGE, null);
    writeStorage(LICENSE_VERIFIED_STORAGE, null);
    writeStorage(LICENSE_EXPIRY_STORAGE, null);
    writeStorage(LICENSE_TOKEN_STORAGE, null);
    setLicenseKey(null);
    setIsVerified(false);
    setExpiryDate(null);
    setError(null);
  }, []);

  return {
    isVerified,
    licenseKey,
    expiryDate,
    isLoading,
    error,
    verifyLicense,
    clearLicense,
  };
}
