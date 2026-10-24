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
| `GUMROAD_PRODUCT_ID` | Gumroadのライセンス検証 |
| `GUMROAD_LICENSE_EXPIRY` | ライセンス有効期限（YYYY-MM-DD） |
| `LICENSE_TOKEN_SECRET` | 認証トークンの署名鍵（32文字以上）。**未設定だとライセンス認証ができません** |
| `LICENSE_COUPON_CODES` | 招待コード（カンマ区切り、任意） |
| `CRON_SECRET` | 為替更新APIの認証（任意。未設定ならAPIは無効） |
| `GEMINI_API_KEY` | チャットサポート |

秘密情報は Secret Manager に登録し、`gcloud run services update --update-secrets` で渡すことを推奨します。

## 注意事項

- `.env.local` はGitにコミットされません（セキュリティ対策）
- APIキーは他人と共有しないでください
- 無料枠: 1分あたり15リクエスト
