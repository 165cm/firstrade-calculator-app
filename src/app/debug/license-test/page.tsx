'use client';

import { ExportButton } from '@/components/common/ExportButton';

export default function LicenseTestPage() {
    const handleExport = () => {
        alert('エクスポート処理が実行されました（ライセンス認証成功）');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">ライセンス認証テスト</h1>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                    <p className="text-sm text-amber-800">
                        このページは、<code>ANNOUNCEMENT_MODE</code> 設定に関わらず、
                        強制的にライセンス認証モードの挙動を確認するためのデバッグページです。
                        <br />
                        （2026年以降の挙動をシミュレーションしています）
                    </p>
                </div>

                <div className="space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-4">テスト用エクスポートボタン</h2>
                        <div className="bg-slate-100 p-8 rounded-xl flex items-center justify-center">
                            <ExportButton
                                onClick={handleExport}
                                ignoreAnnouncementMode={true}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Click to open license modal
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
