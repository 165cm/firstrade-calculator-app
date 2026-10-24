// src/components/common/ExportButton.tsx
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLicenseContext } from '@/contexts/LicenseContext';
import { CURRENT_EDITION, PURCHASE_URL } from '@/config/license';

interface Props {
  onClick: () => void;
  disabled?: boolean;
  ignoreAnnouncementMode?: boolean;
  bypassLicense?: boolean;
}


// Gumroad購入リンク
const GUMROAD_PRODUCT_URL = PURCHASE_URL;
// 告知モード（true: 告知のみ表示、false: 認証を要求）
const ANNOUNCEMENT_MODE = process.env.NEXT_PUBLIC_ANNOUNCEMENT_MODE === 'true';

export function ExportButton({ onClick, disabled = false, ignoreAnnouncementMode = false, bypassLicense = false }: Props) {
  const {
    isVerified,
    verifyLicense,
    expiryDate,
    edition,
    notice,
    error: licenseError,
    isLoading: isLicenseLoading,
  } = useLicenseContext();
  const [isOpen, setIsOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  // 割引コードがある場合はGumroadのURLに付与
  const purchaseUrl = useMemo(() => {
    if (!GUMROAD_PRODUCT_URL) return '';
    if (!discountCode.trim()) return GUMROAD_PRODUCT_URL;

    // 末尾のスラッシュ処理
    const baseUrl = GUMROAD_PRODUCT_URL.endsWith('/')
      ? GUMROAD_PRODUCT_URL.slice(0, -1)
      : GUMROAD_PRODUCT_URL;

    // https://help.gumroad.com/article/270-url-parameters#Discounts-codes
    return `${baseUrl}/${encodeURIComponent(discountCode.trim())}`;
  }, [discountCode]);

  const shouldShowAnnouncement = ANNOUNCEMENT_MODE && !ignoreAnnouncementMode;
  const isLicenseBypassed = bypassLicense;

  // ライセンス認証済みユーザー、またはバイパス許可（デモデータ等）の場合は直接エクスポート可能
  if (isVerified || isLicenseBypassed) {
    // 有効期限を「YYYY末まで」形式に変換
    const expiryYear = expiryDate ? expiryDate.split('-')[0] : null;

    return (
      <div className="flex items-center gap-3">
        <div className="text-xs text-right">
          {isVerified ? (
            <>
              <div className="text-green-600 font-semibold">✓ 認証済み</div>
              {(edition || expiryYear) && (
                <div className="text-slate-500">
                  {[edition, expiryYear && `${expiryYear}末まで`].filter(Boolean).join('・')}
                </div>
              )}
            </>
          ) : (
            <div className="text-blue-600 font-semibold">デモモード</div>
          )}
        </div>
        <Button
          onClick={onClick}
          disabled={disabled}
          className={`${disabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          CSVエクスポート
        </Button>
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

  // 告知モード: 認証なしで使えるが、シンプルに表示
  if (shouldShowAnnouncement) {
    return (
      <Button
        onClick={onClick}
        disabled={disabled}
        className={`${disabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        CSVエクスポート
      </Button>
    );
  }

  const handleVerify = async () => {
    const key = licenseKey.trim();
    const coupon = couponCode.trim();

    if (!key && !coupon) {
      setError('ライセンスキーまたは招待コードを入力してください');
      return;
    }
    if (key && coupon) {
      setError('ライセンスキーと招待コードは、どちらか一方だけを入力してください');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');

      const success = key
        ? await verifyLicense(key, 'license')
        : await verifyLicense(coupon, 'coupon');

      if (success) {
        setIsOpen(false);
        setLicenseKey('');
        setCouponCode('');
        onClick();
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
                年間ライセンス（{CURRENT_EDITION.label}は{CURRENT_EDITION.validUntil}まで有効）
              </li>
            </ul>
          </div>

          {/* 期限切れの案内 */}
          {notice && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {notice}
            </div>
          )}

          {/* ライセンスキー / 招待コード入力 */}
          <div className="space-y-3">
            <label htmlFor="license-key-input" className="block text-sm font-medium text-gray-700">
              ライセンスキー
            </label>
            <Input
              id="license-key-input"
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
              disabled={isVerifying}
              className="w-full text-center font-mono text-base py-6 uppercase"
            />

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="h-px flex-1 bg-gray-200" />
              または
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <label htmlFor="coupon-code-input" className="block text-sm font-medium text-gray-700">
              招待コード（お持ちの方）
            </label>
            <Input
              id="coupon-code-input"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例: INVITE123"
              disabled={isVerifying}
              className="w-full text-center font-mono uppercase tracking-wider"
            />

            {(error || licenseError) && (
              <p className="text-sm text-red-500">{error || licenseError}</p>
            )}
          </div>

          {/* 購入リンク */}
          {purchaseUrl && (
            <div className="text-center pt-2 border-t mt-4">
              <div className="mb-4">
                <label htmlFor="discount-code-input" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  割引コード（購入時・お持ちの方）
                </label>
                <div className="flex gap-2">
                  <Input
                    id="discount-code-input"
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="例: SALE2026"
                    className="font-mono uppercase text-center tracking-wider"
                  />
                </div>
              </div>

              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {discountCode.trim()
                  ? `割引コードを適用して購入`
                  : `${CURRENT_EDITION.label}ライセンスを購入（${CURRENT_EDITION.price}）`}
              </a>
              <p className="text-xs text-gray-500 mt-2 mb-1">
                Gumroadのページへ移動します
              </p>
              <p className="text-xs text-gray-400 leading-relaxed text-left mx-auto max-w-sm">
                ※Gumroadは、米国サンフランシスコを拠点とする、世界中のクリエイターが利用する安全な決済プラットフォームです。
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
