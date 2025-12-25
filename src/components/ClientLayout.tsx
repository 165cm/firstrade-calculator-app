// src/components/ClientLayout.tsx
'use client';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { LicenseProvider } from '@/contexts/LicenseContext';
import { type ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  useServiceWorker();
  return <LicenseProvider>{children}</LicenseProvider>;
}