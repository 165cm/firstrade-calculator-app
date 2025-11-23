// src/components/common/ExportButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useLicense } from '@/hooks/useLicense';
import { isSupabaseConfigured } from '@/lib/supabase';

interface Props {
  onClick: () => void;
}

// Gumroad購入リンク（環境変数または直接設定）
const GUMROAD_PRODUCT_URL = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL || '';

export function ExportButton({ onClick }: Props) {
  const { user } = useAuth();
  const { isVerified, verifyLicense, isLoading: isLicenseLoading } = useLicense();
  const [isOpen, setIsOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Supabaseログインユーザー または ライセンス認証済みユーザーは直接エクスポート可能
  if ((isSupabaseConfigured() && user) || isVerified) {
    return (
      <Button onClick={onClick}>
        CSVエクスポート
      </Button>
    );
  }

  // ローディング中は無効化
  if (isLicenseLoading) {
    return (
      <Button disabled>
        読み込み中...
      </Button>
    );
  }

  const handleVerify = async () => {
    if (!licenseKey.trim()) {
      setError('ライセンスキーを入力してください');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');

      const success = await verifyLicense(licenseKey);

      if (success) {
        setIsOpen(false);
        setLicenseKey('');
        onClick();
      } else {
        setError('ライセンスキーが正しくありません');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('認証処理中にエラーが発生しました');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isVerifying) {
      handleVerify();
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        CSVエクスポート (メンバー限定)
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="メンバー専用機能"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            CSVエクスポートはメンバー専用機能です。<br />
            購入時に届いたライセンスキーを入力してください。
          </p>

          <div className="space-y-2">
            <Input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ライセンスキーを入力"
              disabled={isVerifying}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {GUMROAD_PRODUCT_URL && (
            <p className="text-sm text-gray-500">
              ライセンスをお持ちでない方は{' '}
              <a
                href={GUMROAD_PRODUCT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                こちらから購入
              </a>
            </p>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isVerifying}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? '確認中...' : '認証'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
