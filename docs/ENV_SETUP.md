# 環境変数設定ガイド

## Gemini API Keyの取得方法

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. APIキーをコピー

## 設定方法

プロジェクトルートに `.env.local` ファイルを作成し、以下を記載：

```
GEMINI_API_KEY=ここに取得したAPIキーを貼り付け
```

その他の変数は `.env.example` を参照してください。

## 本番環境（Cloud Run）で必須の変数

| 変数 | 用途 |
| --- | --- |
| `GUMROAD_PRODUCTS` | 年度版ごとの商品（`版名:商品ID:有効期限` のカンマ区切り） |
| `GUMROAD_PRODUCT_ID` / `GUMROAD_LICENSE_EXPIRY` | 単一商品の旧設定（`GUMROAD_PRODUCTS` 未設定時のみ使用） |
| `LICENSE_TOKEN_SECRET` | 認証トークンの署名鍵（32文字以上）。**未設定だとライセンス認証ができません** |
| `LICENSE_COUPON_CODES` | 招待コード（`コード` または `コード:有効期限` のカンマ区切り、任意） |
| `CRON_SECRET` | 為替更新APIの認証（任意。未設定ならAPIは無効） |
| `GEMINI_API_KEY` | チャットサポート |

秘密情報は Secret Manager に登録し、`gcloud run services update --update-secrets` で渡すことを推奨します。

## 新しい年度版の販売を始めるとき

1. Gumroad で新しい年度版の商品を作成し、商品IDを控える
2. `GUMROAD_PRODUCTS` に新しい版を追加する（旧版も期限付きで残す）
   例: `2026年版:新商品ID:2027-12-31,2025年版:旧商品ID:2026-12-31`
3. `src/config/license.ts` の版名・有効期限・価格・購入URLを新しい版に書き換えてデプロイする
4. 必要に応じて `LICENSE_COUPON_CODES` の招待コードを新しい版用に入れ替える

旧版のキーで認証していた利用者は、期限が切れると次回アクセス時に「新しい年度版のライセンスキーを入力してください」と案内されます。

## 注意事項

- `.env.local` はGitにコミットされません（セキュリティ対策）
- APIキーは他人と共有しないでください
- 無料枠: 1分あたり15リクエスト
