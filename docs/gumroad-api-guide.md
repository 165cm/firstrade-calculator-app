# Gumroad API 連携ガイド

このドキュメントでは、Gumroad APIを利用したライセンス認証機能のセットアップ方法を解説します。

---

## 必要な情報

APIを利用するには、以下の2つの情報が必要です。

| 項目             | 内容                               | 役割                                     |
| ---------------- | ---------------------------------- | ---------------------------------------- |
| **Product ID**   | 商品ごとの固有ID                   | **どの商品**に対して操作するかを指定する |
| **Access Token** | あなた専用の鍵（本アプリでは不要） | **あなた本人**であることを証明する       |

> [!NOTE]
> 本アプリのライセンス認証（`/v2/licenses/verify`）では **Access Token は不要** です。Product ID のみで動作します。

---

## Product ID の取得方法

### 方法1：ダッシュボードで確認（推奨）

1. [Gumroad](https://gumroad.com) にログイン
2. [Products](https://app.gumroad.com/products) ページを開く
3. 対象の **商品名をクリック** して編集画面へ
4. 上部タブから **「Content」** を選択
5. **「License key」** モジュールを開くと `product_id` が表示されます

> [!IMPORTANT]
> **2023年以降の新仕様**
> 2023年1月9日以降に作成された商品では、パーマリンクではなく **専用のProduct ID（Base64形式の長い文字列）** を使用してください。
> 例: `WvNatg-21X-yWxjV07CrdQ==`

### 方法2：商品URLから確認

一部のAPIではパーマリンクも使用可能ですが、ライセンス認証APIでは推奨されません。

- **URL例:** `https://gumroad.com/l/abcd`
- **Permalink:** `abcd`

---

## 環境変数の設定

取得した Product ID を `.env.local` に設定します。

```env
# Gumroad License Configuration
GUMROAD_PRODUCT_ID=WvNatg-21X-yWxjV07CrdQ==
NEXT_PUBLIC_GUMROAD_PRODUCT_URL=https://yourname.gumroad.com/l/your-product

# License Expiry Date (YYYY-MM-DD format)
GUMROAD_LICENSE_EXPIRY=2026-12-31

# Announcement Mode (true = show announcement but allow free access)
NEXT_PUBLIC_ANNOUNCEMENT_MODE=false
```

---

## ライセンス認証の仕組み

本アプリは Gumroad の `/v2/licenses/verify` エンドポイントを使用しています。

### リクエスト例

```bash
curl -X POST https://api.gumroad.com/v2/licenses/verify \
  -d "product_id=WvNatg-21X-yWxjV07CrdQ==" \
  -d "license_key=XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
```

### 成功レスポンス

```json
{
  "success": true,
  "uses": 1,
  "purchase": {
    "email": "customer@example.com",
    "product_name": "Your Product",
    "refunded": false,
    "disputed": false
  }
}
```

### 失敗レスポンス

```json
{
  "success": false,
  "message": "That license does not exist for the provided product."
}
```

---

## トラブルシューティング

### 「ライセンスキーが正しくありません」と表示される

1. **Product ID の確認**: `.env.local` の `GUMROAD_PRODUCT_ID` が正しいか確認
2. **形式の確認**: 2023年以降の商品は Base64 形式の長いID（例: `WvNatg-21X-yWxjV07CrdQ==`）を使用
3. **商品の一致**: ライセンスキーが発行された商品と、設定している Product ID が一致しているか確認

### サーバーログでデバッグ

`npm run dev` のコンソールに以下のログが出力されます：

```
=== Gumroad License Verification Request ===
Product ID: WvNatg-21X-yWxjV07CrdQ==
License Key: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX
=== Gumroad License Verification Response ===
Response Status: 200
Response Data: { "success": true, ... }
```

---

## 参考リンク

- [Gumroad API Documentation](https://gumroad.com/api)
- [Gumroad APIでのライセンス認証方法（動画）](https://www.youtube.com/watch?v=U7kmKmrEBZQ)
