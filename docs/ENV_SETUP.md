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

## 注意事項

- `.env.local` はGitにコミットされません（セキュリティ対策）
- APIキーは他人と共有しないでください
- 無料枠: 1分あたり15リクエスト
