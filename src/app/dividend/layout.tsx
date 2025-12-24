// src/app/dividend/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '配当金明細 - Firstrade確定申告ツール',
    description: 'Firstrade証券の配当金・利子収入を自動集計。CSVアップロードでTTM為替レート自動換算、確定申告用の円換算データを作成。',
    alternates: {
        canonical: 'https://firstrade.nomadkazoku.com/dividend',
    },
    openGraph: {
        title: '配当金明細 - Firstrade確定申告ツール | FirstScope 2025',
        description: 'Firstrade証券の配当金・利子収入を自動集計。CSVアップロードでTTM為替レート自動換算。',
        url: 'https://firstrade.nomadkazoku.com/dividend',
    },
};

export default function DividendLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
