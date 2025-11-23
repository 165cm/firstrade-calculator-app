// src/hooks/useLicense.ts
import { useState, useEffect, useCallback } from 'react';

const LICENSE_KEY_STORAGE = 'gumroad_license_key';
const LICENSE_VERIFIED_STORAGE = 'gumroad_license_verified';

interface UseLicenseReturn {
  isVerified: boolean;
  licenseKey: string | null;
  isLoading: boolean;
  error: string | null;
  verifyLicense: (key: string) => Promise<boolean>;
  clearLicense: () => void;
}

export function useLicense(): UseLicenseReturn {
  const [isVerified, setIsVerified] = useState(false);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期化時にローカルストレージから読み込み
  useEffect(() => {
    const storedKey = localStorage.getItem(LICENSE_KEY_STORAGE);
    const storedVerified = localStorage.getItem(LICENSE_VERIFIED_STORAGE);

    if (storedKey && storedVerified === 'true') {
      setLicenseKey(storedKey);
      setIsVerified(true);
    }
    setIsLoading(false);
  }, []);

  // ライセンスキーを検証
  const verifyLicense = useCallback(async (key: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/license/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licenseKey: key }),
      });

      const data = await response.json();

      if (data.success) {
        // ローカルストレージに保存
        localStorage.setItem(LICENSE_KEY_STORAGE, key);
        localStorage.setItem(LICENSE_VERIFIED_STORAGE, 'true');
        setLicenseKey(key);
        setIsVerified(true);
        return true;
      } else {
        setError(data.message || 'ライセンスキーが正しくありません');
        return false;
      }
    } catch (err) {
      console.error('License verification error:', err);
      setError('検証中にエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ライセンスをクリア
  const clearLicense = useCallback(() => {
    localStorage.removeItem(LICENSE_KEY_STORAGE);
    localStorage.removeItem(LICENSE_VERIFIED_STORAGE);
    setLicenseKey(null);
    setIsVerified(false);
    setError(null);
  }, []);

  return {
    isVerified,
    licenseKey,
    isLoading,
    error,
    verifyLicense,
    clearLicense,
  };
}
