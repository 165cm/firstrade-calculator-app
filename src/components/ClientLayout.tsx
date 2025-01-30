// src/components/ClientLayout.tsx
'use client';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { type ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  useServiceWorker();
  return <>{children}</>;
}