// src/components/common/ExportButton.tsx
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface Props {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export const ExportButton: React.FC<Props> = ({ 
  onClick, 
  label = 'CSVエクスポート',
  disabled = false 
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className="flex items-center gap-2 bg-white hover:bg-gray-50"
    >
      <Download className="w-4 h-4" />
      <span>{label}</span>
    </Button>
  );
};