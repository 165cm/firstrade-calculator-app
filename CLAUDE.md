# Firstrade確定申告サポートツール - 開発ガイド

## プロジェクト概要

Firstrade証券ユーザー向けの確定申告支援Webアプリケーション。
配当金・売買損益の計算と、CSVエクスポート機能（有料）を提供。

## 技術スタック

- Next.js 15 / React / TypeScript / Tailwind CSS
- Gumroad License API（ライセンス認証）
- Supabase（オプション：ユーザー認証）
- デプロイ先: Google Cloud Run

---

## ライセンス認証システム

### 仕組み

- **無料機能**: データ閲覧・集計・グラフ表示
- **有料機能**: CSVエクスポート（$25/年間ライセンス）
- **認証方式**: Gumroadライセンスキー

### 環境変数

```env
# 重要: GUMROAD_PRODUCT_IDはpermalinkではなく、実際のProduct IDを設定
# 取得方法: Gumroadダッシュボード > 製品編集 > Content > License Keysを展開
GUMROAD_PRODUCT_ID=WvNatg-21X-yWxjV07CrdQ==  # ← 実際のProduct ID（Base64形式）

NEXT_PUBLIC_GUMROAD_PRODUCT_URL=https://papazon.gumroad.com/l/firstrade-ja
NEXT_PUBLIC_ANNOUNCEMENT_MODE=true  # true=無料開放、false=ライセンス認証必須
GUMROAD_LICENSE_EXPIRY=2026-12-31   # 2025年版の有効期限
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

### 4. ドキュメント更新

- `README.md` の年度表記を更新
- 告知文を作成（メール/掲示板）

### 5. 既存ユーザー対応

- 前年度ユーザーには割引クーポン（例: 50%オフ）を発行
- Gumroad > 商品 > Offer codes で作成

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

## 関連リンク

- [Gumroad License Keys Help](https://gumroad.com/help/article/76-license-keys)
- [Gumroad API Documentation](https://gumroad.com/api)
- [本番サイト](https://firstrade.nomadkazoku.com)
- [Google Cloud Run Console](https://console.cloud.google.com/run)
