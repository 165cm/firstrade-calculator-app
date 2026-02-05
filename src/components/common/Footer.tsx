// src/components/common/Footer.tsx
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="py-8 bg-slate-50 text-slate-500 text-center text-sm border-t border-slate-200 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
                    <Link href="/" className="font-bold text-slate-700 hover:text-slate-900 transition-colors">
                        FirstScope
                    </Link>
                    <div className="flex gap-6 text-xs font-medium">
                        <a
                            href="https://www.nomadkazoku.com/legal/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-slate-700 transition-colors"
                        >
                            特定商取引法に基づく表記
                        </a>
                        <a
                            href="https://www.nomadkazoku.com/privacy-policy/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-slate-700 transition-colors"
                        >
                            プライバシーポリシー
                        </a>
                        <Link
                            href="/faq"
                            className="hover:text-slate-700 transition-colors"
                        >
                            よくある質問
                        </Link>
                        <a
                            href="https://www.notion.so/2d3e8c4088938053a31df1916c843dd0?pvs=106"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-slate-700 transition-colors"
                        >
                            お問い合わせ
                        </a>
                    </div>
                </div>
                <div className="mt-4 text-slate-400 text-xs">
                    <p>© 2025 Nomad Family. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
