// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export function Button({ 
  children, 
  className = '', 
  variant = 'primary', 
  ...props 
}: ButtonProps) {
  const baseStyle = 'px-4 py-2 rounded-md transition-colors';
  const variantStyle = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'border border-gray-300 hover:bg-gray-50';

  const combinedClassName = `${baseStyle} ${variantStyle} ${className}`;

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}