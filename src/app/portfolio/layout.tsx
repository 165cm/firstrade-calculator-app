// src/app/portfolio/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ポートフォリオ分析 - Firstrade確定申告ツール',
    description: 'Firstrade証券の保有銘柄を可視化。資産配分、セクター分析、理想的なリバランス案を提案。CSV不要でコピペだけで分析可能。',
    alternates: {
        canonical: 'https://firstrade.nomadkazoku.com/portfolio',
    },
    openGraph: {
        title: 'ポートフォリオ分析 - Firstrade確定申告ツール | FirstScope 2025',
        description: 'Firstrade証券の保有銘柄を可視化。資産配分、セクター分析、リバランス案を提案。',
        url: 'https://firstrade.nomadkazoku.com/portfolio',
    },
};

export default function PortfolioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
