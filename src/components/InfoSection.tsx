// src/components/InfoSection.tsx
export default function InfoSection() {
  return (
    <section className="max-w-5xl mx-auto mt-8 px-2">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <h2 className="text-lg font-bold mb-4">Firstrade証券の確定申告をラクにするサポートツール</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-bold mb-1">📱 3ステップで完了</h3>
            <p className="text-sm">CSVアップロードで為替レート自動取得。面倒な手作業から解放されます。</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <h3 className="font-bold mb-1">💰 基本機能無料</h3>
            <p className="text-sm">配当金・売買損益の計算が無料。CSVエクスポートは$25の買い切りライセンスで利用可能。</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h3 className="font-bold mb-1">👥 情報共有</h3>
            <p className="text-sm">コミュニティでの情報交換や定期的な機能改善で、より使いやすく。</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <a 
            href="https://www.nomadkazoku.com/firstrade-tax-calculator/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            詳しい使い方と機能説明を見る →
          </a>
        </div>
      </div>
    </section>
  );
}