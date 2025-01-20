// src/components/common/ExportButton.tsx
import { useState } from 'react';
import { getCurrentPassword } from '@/config/exportConfig';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  onClick: () => void;
}

export function ExportButton({ onClick }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleExport = () => {
    if (password === getCurrentPassword()) {
      setIsOpen(false);
      setPassword('');
      setError('');
      onClick();
    } else {
      setError('パスワードが正しくありません');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleExport();
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        CSVエクスポート
      </Button>

      <Dialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="メンバー専用機能"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            CSVエクスポートはメンバー専用機能です。<br />
            パスワードを入力してください。
          </p>
          <div className="space-y-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="パスワードを入力"
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleExport}>
              エクスポート
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}