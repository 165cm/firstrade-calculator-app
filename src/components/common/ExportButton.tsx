// src/components/common/ExportButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLicense } from '@/hooks/useLicense';

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

// Gumroad購入リンク（環境変数または直接設定）
const GUMROAD_PRODUCT_URL = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL || '';
// 告知モード（true: 告知のみ表示、false: 認証を要求）
const ANNOUNCEMENT_MODE = process.env.NEXT_PUBLIC_ANNOUNCEMENT_MODE === 'true';

export function ExportButton({ onClick, disabled = false }: Props) {
  const { isVerified, verifyLicense, expiryDate, isLoading: isLicenseLoading } = useLicense();
  const [isOpen, setIsOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // ライセンス認証済みユーザーは直接エクスポート可能
  if (isVerified) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={onClick}
          disabled={disabled}
          className={`${disabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          CSVエクスポート
        </Button>
        {expiryDate && (
          <span className="text-xs text-gray-500">
            〜{expiryDate}
          </span>
        )}
      </div>
    );
  }

  // ローディング中は無効化（disabledプロパティがtrueでもこちらが優先されるが、見た目は同じ）
  if (isLicenseLoading) {
    return (
      <Button disabled className="bg-gray-400">
        読み込み中...
      </Button>
    );
  }

  // 告知モード: 認証なしで使えるが、告知を表示
  if (ANNOUNCEMENT_MODE) {
    return (
      <>
        <div className="flex items-center gap-3">
          <Button
            onClick={onClick}
            disabled={disabled}
            className={`${disabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            CSVエクスポート
          </Button>
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            近日有料化予定
          </span>
        </div>
      </>
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
      <Button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className={`${disabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        CSVエクスポート
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title=""
      >
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="text-center pb-4 border-b">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">プレミアム機能</h2>
            <p className="text-sm text-gray-500 mt-1">CSVエクスポートはライセンスが必要です</p>
          </div>

          {/* 機能説明 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-900 mb-2">エクスポート機能でできること</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                確定申告用データの出力
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Excelでの編集・分析
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                年間ライセンス（2025年版は2026年12月まで有効）
              </li>
            </ul>
          </div>

          {/* ライセンスキー入力 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              ライセンスキー
            </label>
            <Input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
              disabled={isVerifying}
              className="font-mono text-sm"
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* 購入リンク */}
          {GUMROAD_PRODUCT_URL && (
            <div className="text-center pt-2">
              <a
                href={GUMROAD_PRODUCT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                2025年版ライセンスを購入（$25）
              </a>
              <p className="text-xs text-gray-400 mt-2">
                Gumroadで安全に決済できます
              </p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isVerifying ? '確認中...' : '認証する'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
