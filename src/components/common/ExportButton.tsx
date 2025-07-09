// src/components/common/ExportButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  onClick: () => void;
}

export function ExportButton({ onClick }: Props) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // ログインユーザーは直接エクスポート可能
  if (user) {
    return (
      <Button onClick={onClick}>
        CSVエクスポート
      </Button>
    );
  }

  const handleExport = async () => {
    try {
      setIsVerifying(true);
      setError('');

      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        setIsOpen(false);
        setPassword('');
        onClick();
      } else {
        setError('パスワードが正しくありません');
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
      handleExport();
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
            会員登録またはパスワードを入力してください。
          </p>
          <div className="space-y-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="パスワードを入力"
              disabled={isVerifying}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isVerifying}
            >
              キャンセル
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isVerifying}
            >
              {isVerifying ? '確認中...' : 'エクスポート'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}