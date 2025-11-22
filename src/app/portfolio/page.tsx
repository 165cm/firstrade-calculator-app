// src/app/portfolio/page.tsx
'use client';

import { PortfolioAnalysis } from '@/components/portfolio/PortfolioAnalysis';
import InfoSection from '@/components/InfoSection';

export default function PortfolioPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <PortfolioAnalysis />
      <InfoSection />
    </div>
  );
}
