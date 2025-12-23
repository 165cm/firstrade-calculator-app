# 開発者向けドキュメント

このドキュメントは、Firstrade Calculator Appの開発者向けの技術情報、セットアップ手順、環境設定について説明しています。

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
# 重要: GUMROAD_PRODUCT_IDはpermalinkではなく、実際のProduct IDを設定
# 取得方法: Gumroadダッシュボード > 製品編集 > Content > License Keysを展開
GUMROAD_PRODUCT_ID=WvNatg-21X-yWxjV07CrdQ==
NEXT_PUBLIC_GUMROAD_PRODUCT_URL=https://papazon.gumroad.com/l/firstrade-ja

# Announcement Mode (true = 告知モード、false = 認証必須)
NEXT_PUBLIC_ANNOUNCEMENT_MODE=true

# License Expiry Date
GUMROAD_LICENSE_EXPIRY=2026-12-31
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

## Google Cloud Run デプロイ

このプロジェクトはGoogle Cloud Build + Cloud Runでデプロイされています。

### 環境変数の確認・設定方法

1. **Google Cloud Console** にアクセス: https://console.cloud.google.com/run
2. **Cloud Run サービス一覧**から `firstrade-calculator` を選択
3. **「新しいリビジョンの編集とデプロイ」** をクリック
4. **「コンテナ」タブ** → **「変数とシークレット」** セクションを展開
5. 環境変数を確認・編集

### 必要な環境変数（本番環境）

| 変数名                            | 説明                      | 確認方法                                                  |
| --------------------------------- | ------------------------- | --------------------------------------------------------- |
| `GUMROAD_PRODUCT_ID`              | Gumroad製品ID（**重要**） | Gumroadダッシュボード → 製品編集 → Content → License Keys |
| `NEXT_PUBLIC_GUMROAD_PRODUCT_URL` | Gumroad購入ページURL      | `https://papazon.gumroad.com/l/firstrade-ja`              |
| `NEXT_PUBLIC_ANNOUNCEMENT_MODE`   | 告知モード                | `true`=無料開放、`false`=ライセンス認証必須               |
| `GUMROAD_LICENSE_EXPIRY`          | ライセンス有効期限        | 例: `2026-12-31`                                          |

### GumroadのProduct IDの確認方法

> [!IMPORTANT]
> `GUMROAD_PRODUCT_ID`には、製品のpermalink（`firstrade-ja`）ではなく、**実際のProduct ID**を設定してください。

1. [Gumroadダッシュボード](https://app.gumroad.com/dashboard) にログイン
2. **Products** → 該当製品を選択
3. **Edit** → **Content** タブ
4. **License key** セクションを展開
5. 表示される `Product ID` をコピー

### gcloudコマンドで環境変数を更新

```bash
gcloud run services update firstrade-calculator \
  --region asia-northeast1 \
  --set-env-vars "GUMROAD_PRODUCT_ID=【実際のProduct ID】" \
  --set-env-vars "GUMROAD_LICENSE_EXPIRY=2026-12-31" \
  --set-env-vars "NEXT_PUBLIC_ANNOUNCEMENT_MODE=false"
```

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

## 貢献について

バグ報告や機能改善の提案は、GitHubのIssuesにてお願いします。

プルリクエストを送る際は以下の点をご確認ください：
1. コードスタイルの一貫性
2. 適切なテストの追加
3. ドキュメントの更新

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
