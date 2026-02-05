// src/app/guide/washsale/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/common/Footer';

export default function WashSaleGuidePage() {
    return (
        <>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
                {/* ナビゲーション */}
                <nav className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-blue-600">ホーム</Link>
                    <span className="mx-2">/</span>
                    <Link href="/faq" className="hover:text-blue-600">FAQ</Link>
                    <span className="mx-2">/</span>
                    <span className="text-slate-900">Wash Sale解説</span>
                </nav>

                {/* ヘッダー */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        Wash Sale（ウォッシュセール）とは？
                    </h1>
                    <p className="text-lg text-slate-600">
                        米国税制特有のルールで、損失が「認められない」ケースがあります。
                        このページでは、デモデータを使って実際の計算方法を解説します。
                    </p>
                </header>

                {/* メイン画像 */}
                <div className="mb-10 rounded-xl overflow-hidden shadow-lg border border-slate-200">
                    <Image
                        src="/images/washsale-guide.png"
                        alt="日米株式税務の違い - Wash Saleの仕組み"
                        width={1024}
                        height={576}
                        className="w-full h-auto"
                        priority
                    />
                </div>

                {/* セクション1: Wash Saleの基本 */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                        📌 Wash Sale Ruleとは
                    </h2>
                    <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                        <p className="text-slate-700">
                            <strong>Wash Sale Rule（ウォッシュセール・ルール）</strong>は、米国の税制ルールです。
                        </p>
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <p className="font-medium text-slate-900 mb-2">ルールの内容:</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-600">
                                <li>株を売って<span className="text-red-600 font-medium">損失</span>が発生した場合</li>
                                <li>その売却日の前後<span className="font-medium">30日以内</span>に</li>
                                <li>同じ銘柄（または実質的に同一の証券）を<span className="font-medium">買い戻した</span>場合</li>
                            </ul>
                            <p className="mt-3 text-red-600 font-medium">
                                → その損失は税務上「認められない」（Disallowed）
                            </p>
                        </div>
                    </div>
                </section>

                {/* セクション2: デモデータで計算してみよう */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                        🧮 デモデータで計算してみよう
                    </h2>

                    <p className="text-slate-600 mb-4">
                        本ツールのデモデータに含まれる「TEST」銘柄を例に、実際の計算を見てみましょう。
                    </p>

                    {/* データテーブル */}
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                            <thead className="bg-slate-800 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">項目</th>
                                    <th className="px-4 py-3 text-right">値</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                <tr><td className="px-4 py-3">銘柄</td><td className="px-4 py-3 text-right font-mono">TEST</td></tr>
                                <tr><td className="px-4 py-3">数量</td><td className="px-4 py-3 text-right font-mono">10株</td></tr>
                                <tr><td className="px-4 py-3">購入日</td><td className="px-4 py-3 text-right font-mono">2024/01/10</td></tr>
                                <tr><td className="px-4 py-3">売却日</td><td className="px-4 py-3 text-right font-mono">2024/01/20</td></tr>
                                <tr className="bg-green-50"><td className="px-4 py-3 font-medium">売却額 (Proceeds)</td><td className="px-4 py-3 text-right font-mono text-green-700">$900.00</td></tr>
                                <tr className="bg-red-50"><td className="px-4 py-3 font-medium">取得額 (Cost)</td><td className="px-4 py-3 text-right font-mono text-red-700">$1,000.00</td></tr>
                                <tr className="bg-yellow-50"><td className="px-4 py-3 font-medium">Wash Sale調整額</td><td className="px-4 py-3 text-right font-mono text-yellow-700">$100.00</td></tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 計算比較 */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* 日本方式 */}
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                                🇯🇵 日本方式
                            </h3>
                            <div className="bg-white rounded-lg p-4 font-mono text-sm space-y-2">
                                <p>損益 = 売却額 - 取得額</p>
                                <p>損益 = $900 - $1,000</p>
                                <p className="text-xl font-bold text-red-600">= -$100（損失）</p>
                            </div>
                            <p className="mt-4 text-sm text-blue-700">
                                シンプルに売却額と取得額の差額を計算します。
                            </p>
                        </div>

                        {/* 米国方式 */}
                        <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                            <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                                🇺🇸 米国方式
                            </h3>
                            <div className="bg-white rounded-lg p-4 font-mono text-sm space-y-2">
                                <p>損益 = 売却額 - 取得額 + WS調整</p>
                                <p>損益 = $900 - $1,000 + $100</p>
                                <p className="text-xl font-bold text-slate-600">= $0（損失不許可）</p>
                            </div>
                            <p className="mt-4 text-sm text-amber-700">
                                Wash Saleにより、損失が税務上「なかったこと」になります。
                            </p>
                        </div>
                    </div>
                </section>

                {/* セクション3: 円換算時の計算 */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                        💴 円換算時の計算
                    </h2>

                    <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">日本方式（¥）</h4>
                            <code className="block bg-white p-3 rounded border text-sm">
                                損益(¥) = (売却額 × 売却時レート) - (取得額 × 購入時レート)
                            </code>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">米国方式（¥）</h4>
                            <code className="block bg-white p-3 rounded border text-sm">
                                損益(¥) = (売却額 × 売却時レート) - (取得額 × 購入時レート) + (WS調整額 × 売却時レート)
                            </code>
                            <p className="text-sm text-slate-500 mt-2">
                                ※ Wash Sale調整額は売却時のレートで換算します（損失が繰り延べられるのは売却時点のため）
                            </p>
                        </div>
                    </div>
                </section>

                {/* セクション3.5: どちらを選ぶべきか */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                        🤔 どちらの方式を選ぶべき？
                    </h2>

                    <div className="bg-gradient-to-r from-blue-50 to-amber-50 rounded-lg p-6 space-y-4">
                        <p className="text-slate-700">
                            本ツールでは、<strong>日本方式</strong>と<strong>米国方式</strong>の両方でCSVをエクスポートできます。
                            どちらを使用するかは、<strong>ご自身の判断</strong>でお選びください。
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <h4 className="font-bold text-blue-900 mb-2">🇯🇵 日本方式を選ぶ場合</h4>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    <li>• シンプルに損益を把握したい</li>
                                    <li>• 日本の税制に則った計算をしたい</li>
                                    <li>• 実際のお金の動きを重視したい</li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-amber-200">
                                <h4 className="font-bold text-amber-900 mb-2">🇺🇸 米国方式を選ぶ場合</h4>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    <li>• Firstradeの明細（Statement）と数値を一致させたい</li>
                                    <li>• 証券会社の公式データと照合したい</li>
                                    <li>• 米国税制に準拠した記録を残したい</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-slate-200 mt-4">
                            <p className="text-sm text-slate-600">
                                <strong>💡 ポイント：</strong>
                                もしFirstradeのステートメントと金額が合わない場合、米国方式を使うとステートメントの数値と一致します。
                                どちらが「正しい」ということではなく、<strong>ご自身の申告方針に合わせてお選びください。</strong>
                            </p>
                        </div>
                    </div>
                </section>

                {/* セクション4: 注意事項 */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                        ⚠️ 注意事項
                    </h2>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600">•</span>
                                <span>本ツールは確定申告の参考資料作成を目的としています。<strong>税務アドバイスではありません。</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600">•</span>
                                <span>日本の税制では原則としてWash Sale Ruleは適用されません。</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600">•</span>
                                <span>正確な申告については、税理士等の専門家にご相談ください。</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* 関連リンク */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                        🔗 関連リンク
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Link
                            href="/gainloss"
                            className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
                        >
                            <h3 className="font-bold text-slate-900 mb-1">📊 売却損益計算</h3>
                            <p className="text-sm text-slate-500">CSVをアップロードして損益を計算</p>
                        </Link>
                        <Link
                            href="/faq"
                            className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
                        >
                            <h3 className="font-bold text-slate-900 mb-1">❓ よくある質問</h3>
                            <p className="text-sm text-slate-500">その他の疑問はこちら</p>
                        </Link>
                        <Link
                            href="/simulator"
                            className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
                        >
                            <h3 className="font-bold text-slate-900 mb-1">🎮 シミュレーター</h3>
                            <p className="text-sm text-slate-500">売却タイミングを試算</p>
                        </Link>
                        <Link
                            href="/dividend"
                            className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
                        >
                            <h3 className="font-bold text-slate-900 mb-1">💵 配当金計算</h3>
                            <p className="text-sm text-slate-500">配当金の円換算も対応</p>
                        </Link>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                        さっそく試してみましょう！
                    </h3>
                    <p className="text-slate-600 mb-4">
                        デモデータでWash Saleの動作を確認できます
                    </p>
                    <Link
                        href="/gainloss"
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                        売却損益計算を始める
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
            <Footer />
        </>
    );
}
