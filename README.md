# Firstrade証券 確定申告支援ツール

米国証券会社Firstradeでの取引における確定申告作業を支援するWebアプリケーションです。

## 機能

- CSVファイルから配当金・売買損益を自動計算
- 為替レートの自動取得と円換算
- 月次・年次サマリーの可視化
- 確定申告用CSVエクスポート機能 (メンバー限定)

## 技術スタック

- **フロントエンド**
  - Next.js 15
  - React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - Recharts

- **認証・データベース**
  - Supabase (認証・データベース)

- **データ処理**
  - PapaParse (CSV処理)
  - Frankfurter API (為替レート取得)

## ローカル開発環境のセットアップ

### 基本セットアップ
```bash
# リポジトリのクローン
git clone https://github.com/yourusername/firstrade-calculator.git

# 依存パッケージのインストール
cd firstrade-calculator
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルにSupabaseの設定を追加

# 開発サーバーの起動
npm run dev
```

### Supabaseセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトのURLとAnon Keyを取得
3. `.env`ファイルに以下を設定：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Supabaseダッシュボードで認証設定を確認（メール確認を無効化推奨）

### 為替レート管理のセットアップ

為替レートデータの取得・管理用スクリプトを提供しています。

```bash
# 環境変数の設定
cp .env.example .env

# 初期データセットアップ
node scripts/fetchHistoricalRates.ts  # 過去の為替レートを取得
node scripts/processRates.ts          # データを四半期ごとに整理

# 定期更新用スクリプト（cron等で設定）
node scripts/updateExchangeRates.ts   # 最新レートの取得・更新

# テストデータ生成（必要な場合）
node scripts/generateHistoricalRates.ts
```

#### データ構造
```
src/data/
├── current/        # 現在の四半期データ
├── historical/     # 過去の四半期データ
└── meta/          # メタデータ
```

注意：
- APIレート制限に注意してください
- エラー時は logs/ ディレクトリを確認
- テスト環境での実行を推奨します
```

## 必要なデータ

### 配当金明細用CSV
- 場所: Firstrade > Accounts > Tax Center > Download Account Information
- ファイル名: FT_CSV_[口座番号].csv

### 売買損益用CSV
- 場所: Firstrade > Account > Gain/Loss > Download CSV
- ファイル名: FT_GainLoss_[口座番号].csv

## 主な機能の説明

### 配当金計算
- 配当金・利子収入の自動分類
- 月次配当金の集計とグラフ化
- 年間配当金サマリー

### 売買損益計算
- 銘柄ごとの損益計算
- 為替差損益の計算
- 年間損益サマリー

## 貢献について

バグ報告や機能改善の提案は、GitHubのIssuesにてお願いします。

プルリクエストを送る際は以下の点をご確認ください：
1. コードスタイルの一貫性
2. 適切なテストの追加
3. ドキュメントの更新

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 免責事項

本ツールは確定申告の計算を補助するものであり、税務アドバイスを提供するものではありません。確定申告の内容については、必ずご自身でご確認ください。不明な点がある場合は、税理士にご相談することをお勧めします。