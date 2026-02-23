# 開発者向けドキュメント

このドキュメントは、Firstrade Calculator Appの開発者向けの技術情報、セットアップ手順、環境設定について説明しています。

## プロジェクト概要

Firstrade証券ユーザー向けの確定申告支援Webアプリケーション。
配当金・売買損益の計算と、CSVエクスポート機能（有料）を提供。

## 技術スタック

- **フロントエンド**
  - Next.js 15 / React / TypeScript
  - Tailwind CSS / shadcn/ui
  - Recharts

- **認証**
  - Gumroad License API（ライセンスキー認証）
  - Supabase（オプション：ユーザー認証）

- **データ処理**
  - PapaParse (CSV処理)
  - Frankfurter API (為替レート取得)

- **デプロイ**
  - Google Cloud Run

---

## ローカル開発環境のセットアップ

```bash
git clone https://github.com/yourusername/firstrade-calculator.git
cd firstrade-calculator
npm install
cp .env.example .env
npm run dev
```

---

## ライセンス認証システム

### 仕組み

- **無料機能**: データ閲覧・集計・グラフ表示
- **有料機能**: CSVエクスポート（$25/年間ライセンス）
- **認証方式**: Gumroadライセンスキー

### 環境変数

```env
# Supabase Configuration（オプション）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gumroad License Configuration
# 重要: GUMROAD_PRODUCT_IDはpermalinkではなく、実際のProduct IDを設定
GUMROAD_PRODUCT_ID=WvNatg-21X-yWxjV07CrdQ==
NEXT_PUBLIC_GUMROAD_PRODUCT_URL=https://papazon.gumroad.com/l/firstrade-ja

# Announcement Mode
NEXT_PUBLIC_ANNOUNCEMENT_MODE=true  # true=無料開放、false=ライセンス認証必須

# License Expiry Date
GUMROAD_LICENSE_EXPIRY=2026-12-31
```

> ⚠️ **注意**: `GUMROAD_PRODUCT_ID`に`firstrade-ja`のようなpermalinkを設定しても動作しません。
> 必ずGumroadダッシュボードから取得した実際のProduct ID（`xxx==`形式）を使用してください。

### Product IDの確認方法

1. [Gumroadダッシュボード](https://app.gumroad.com/dashboard) にログイン
2. **Products** → 該当製品を選択
3. **Edit** → **Content** タブ
4. **License key** セクションを展開
5. 表示される `Product ID` をコピー（例: `WvNatg-21X-yWxjV07CrdQ==`）

### ファイル構成

- `src/lib/gumroad.ts` - Gumroad API検証ロジック
- `src/hooks/useLicense.ts` - ライセンス状態管理（localStorage連携）
- `src/app/api/license/verify/route.ts` - ライセンス検証APIエンドポイント
- `src/components/common/ExportButton.tsx` - 認証UI・ダイアログ

---

## 年度更新作業（毎年実施）

### 1. Gumroad側

1. 新年度版商品を作成（例: 2026年版）
2. Contentページでライセンスキーモジュールを追加
3. Product IDを取得

### 2. 環境変数更新（Google Cloud）

```env
GUMROAD_PRODUCT_ID=新しい商品ID
GUMROAD_LICENSE_EXPIRY=2027-12-31  # 翌年12月31日
NEXT_PUBLIC_GUMROAD_PRODUCT_URL=新しい購入URL
```

### 3. コード更新

`src/components/common/ExportButton.tsx` の以下を更新:

```typescript
// 147行目付近
年間ライセンス（2026年版は2027年12月まで有効）

// 183行目付近
2026年版ライセンスを購入（$25）
```

### 4. ドキュメント・告知

- `README.md` の年度表記を更新
- 告知文を作成（メール/掲示板）
- 前年度ユーザーには割引クーポン（50%オフ等）を発行

---

## 告知モード

新機能リリース時や価格変更時に使用。

```env
NEXT_PUBLIC_ANNOUNCEMENT_MODE=true
```

- `true`: 認証なしでCSVエクスポート可能（「近日有料化予定」バッジ表示）
- `false`: ライセンス認証必須

---

## クーポン発行（Gumroad）

### 100%オフ（無料配布）

1. 商品 > Offer codes > New offer code
2. Amount off: 100%
3. Max uses: 人数分

### 割引クーポン

1. 商品 > Offer codes > New offer code
2. Amount off: 50%（など）
3. Code: RENEW2026（など）

---

## Google Cloud Run デプロイ

### 環境変数の確認・設定方法

1. **Google Cloud Console** にアクセス: https://console.cloud.google.com/run
2. **Cloud Run サービス一覧**から `firstrade-calculator` を選択
3. **「新しいリビジョンの編集とデプロイ」** をクリック
4. **「コンテナ」タブ** → **「変数とシークレット」** セクションを展開
5. 環境変数を確認・編集

### 必要な環境変数（本番環境）

| 変数名                            | 説明                      |
| --------------------------------- | ------------------------- |
| `GUMROAD_PRODUCT_ID`              | Gumroad製品ID（**重要**） |
| `NEXT_PUBLIC_GUMROAD_PRODUCT_URL` | Gumroad購入ページURL      |
| `NEXT_PUBLIC_ANNOUNCEMENT_MODE`   | 告知モード                |
| `GUMROAD_LICENSE_EXPIRY`          | ライセンス有効期限        |

### gcloudコマンドで環境変数を更新

```bash
gcloud run services update firstrade-calculator \
  --region asia-northeast1 \
  --set-env-vars "GUMROAD_PRODUCT_ID=【実際のProduct ID】" \
  --set-env-vars "GUMROAD_LICENSE_EXPIRY=2026-12-31" \
  --set-env-vars "NEXT_PUBLIC_ANNOUNCEMENT_MODE=false"
```

---

## トラブルシューティング

### ライセンス認証が通らない

**よくある原因:**

1. **Product IDがpermalinkになっている（最も多い）**
   - ❌ `GUMROAD_PRODUCT_ID=firstrade-ja`（これはpermalink）
   - ✅ `GUMROAD_PRODUCT_ID=WvNatg-21X-yWxjV07CrdQ==`（これが正しいProduct ID）

2. **ライセンスキーモジュールが有効化されていない**
   - Gumroad製品編集 > Content > License Keysが追加されているか確認

3. **ライセンスキーが別製品に紐付いている**
   - Gumroad Sales画面でライセンスキーを検索し、どの製品から発行されたか確認

### デバッグ方法

ターミナルで直接APIをテスト:
```powershell
Invoke-RestMethod -Uri "https://api.gumroad.com/v2/licenses/verify" `
  -Method POST `
  -Body @{product_id="WvNatg-21X-yWxjV07CrdQ=="; license_key="ライセンスキー"}
```

### Cloud Runの環境変数確認

```bash
gcloud run services describe firstrade-calculator \
  --region asia-northeast1 \
  --format="table(spec.template.spec.containers[0].env.name,spec.template.spec.containers[0].env.value)"
```

### 期限切れエラーが出る

- `GUMROAD_LICENSE_EXPIRY` の日付を確認（形式: `YYYY-MM-DD`）
- 現在の日付がこの値を超えていないか確認

---

## 為替レート管理

```bash
# 初期データセットアップ
node scripts/fetchHistoricalRates.ts
node scripts/processRates.ts

# 定期更新用スクリプト
node scripts/updateExchangeRates.ts
```

データ構造:
```
src/data/
├── current/        # 現在の四半期データ
├── historical/     # 過去の四半期データ
└── meta/          # メタデータ
```

---

## 関連リンク

- [本番サイト](https://firstrade.nomadkazoku.com)
- [特定商取引法に基づく表記](https://www.nomadkazoku.com/legal/)
- [プライバシーポリシー](https://www.nomadkazoku.com/privacy-policy/)
- [お問い合わせ](https://majestic-gateway-e4a.notion.site/2d3e8c4088938053a31df1916c843dd0?pvs=105)
- [Gumroad License Keys Help](https://gumroad.com/help/article/76-license-keys)
- [Gumroad API Documentation](https://gumroad.com/api)
- [Google Cloud Run Console](https://console.cloud.google.com/run)

---

## ライセンス

本アプリケーションは商用製品であり、無断での複製・再配布・販売を固く禁じます。
(Copyright © 2025 Nomad Family. All Rights Reserved.)
