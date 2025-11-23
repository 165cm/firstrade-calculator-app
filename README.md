# Firstrade証券 確定申告支援ツール

米国証券会社Firstradeでの取引における確定申告作業を支援するWebアプリケーションです。

## 機能

### 無料機能
- CSVファイルから配当金・売買損益を自動計算
- 為替レートの自動取得と円換算
- 月次・年次サマリーの可視化

### プレミアム機能（$25 買い切り）
- 確定申告用CSVエクスポート機能
- 永久ライセンス（年度ごとの追加料金なし）

## 技術スタック

- **フロントエンド**
  - Next.js 15
  - React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - Recharts

- **認証**
  - Gumroad License API（ライセンスキー認証）
  - Supabase（オプション：ユーザー認証）

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
# .envファイルを編集

# 開発サーバーの起動
npm run dev
```

### 環境変数の設定

```env
# Supabase Configuration（オプション）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gumroad License Configuration
GUMROAD_PRODUCT_ID=your_gumroad_product_id
NEXT_PUBLIC_GUMROAD_PRODUCT_URL=https://yourname.gumroad.com/l/your-product

# Announcement Mode (true = 告知モード、false = 認証必須)
NEXT_PUBLIC_ANNOUNCEMENT_MODE=true
```

### Gumroadセットアップ

1. [Gumroad](https://gumroad.com)でアカウント作成
2. 商品を作成（Digital product）
3. Contentページでライセンスキーモジュールを追加
4. Product IDを取得して環境変数に設定

詳細は[Gumroad License Keys Help](https://gumroad.com/help/article/76-license-keys)を参照

### Supabaseセットアップ（オプション）

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトのURLとAnon Keyを取得
3. `.env`ファイルに設定
4. Supabaseダッシュボードで認証設定を確認

### 為替レート管理のセットアップ

為替レートデータの取得・管理用スクリプトを提供しています。

```bash
# 初期データセットアップ
node scripts/fetchHistoricalRates.ts  # 過去の為替レートを取得
node scripts/processRates.ts          # データを四半期ごとに整理

# 定期更新用スクリプト（cron等で設定）
node scripts/updateExchangeRates.ts   # 最新レートの取得・更新
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

## 料金体系

| 機能 | 料金 |
|------|------|
| データ閲覧・集計 | 無料 |
| グラフ表示 | 無料 |
| CSVエクスポート | $25（買い切り） |

ライセンスは[Gumroad](https://gumroad.com)で購入できます。

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
