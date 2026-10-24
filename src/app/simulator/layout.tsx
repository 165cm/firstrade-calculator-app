// src/app/simulator/layout.tsx
import type { Metadata } from 'next';
import { PRODUCT_NAME } from '@/config/license';

export const metadata: Metadata = {
    title: '損益シミュレーター - Firstrade確定申告ツール',
    description: 'Firstrade証券の売却タイミングをシミュレーション。税金計算を事前に確認し、最適な売却戦略を見極める。',
    alternates: {
        canonical: 'https://firstrade.nomadkazoku.com/simulator',
    },
    openGraph: {
        title: `損益シミュレーター - Firstrade確定申告ツール | ${PRODUCT_NAME}`,
        description: 'Firstrade証券の売却タイミングをシミュレーション。最適な売却戦略を見極める。',
        url: 'https://firstrade.nomadkazoku.com/simulator',
    },
};

export default function SimulatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
