// src/components/ui/Input.tsx
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const BASE_CLASS_NAME =
  'w-full px-3 py-2 border rounded-md border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50';

export function Input({ className, ...props }: InputProps) {
  // 呼び出し側の className は基本のスタイルに追加する（上書きすると枠線などが消える）
  return <input className={`${BASE_CLASS_NAME} ${className ?? ''}`} {...props} />;
}
