// src/app/gainloss/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '売却損益計算 - Firstrade確定申告ツール',
    description: 'Firstrade証券の株式売却益を自動計算。Gain/Loss CSVをアップロードするだけで、確定申告用の譲渡損益計算書データを作成。',
    alternates: {
        canonical: 'https://firstrade.nomadkazoku.com/gainloss',
    },
    openGraph: {
        title: '売却損益計算 - Firstrade確定申告ツール | FirstScope 2025',
        description: 'Firstrade証券の株式売却益を自動計算。確定申告用の譲渡損益計算書データを作成。',
        url: 'https://firstrade.nomadkazoku.com/gainloss',
    },
};

export default function GainLossLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
