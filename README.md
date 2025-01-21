# Exchange Rate Management Scripts
為替レート管理のための4つのユーティリティスクリプト集です。

## Scripts Overview
### 1. fetchHistoricalRates.ts
過去の為替レートデータを取得・保存するスクリプト
```bash
node scripts/fetchHistoricalRates.ts
```

### 2. generateHistoricalRates.ts
テスト・デモ用の為替レートデータを生成
```bash
node scripts/generateHistoricalRates.ts
```

### 3. processRates.ts
為替レートデータを四半期ごとに整理
```bash
node scripts/processRates.ts
```

### 4. updateExchangeRates.ts
最新の為替レートを取得・更新
```bash
node scripts/updateExchangeRates.ts
```

## Setup

```bash
# 必要なパッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
```

## Usage Examples

### 初期データセットアップ
```bash
# 過去データの取得と整理
node scripts/fetchHistoricalRates.ts
node scripts/processRates.ts
```

### 定期実行用
```bash
# 日次更新（cron等で設定）
node scripts/updateExchangeRates.ts
```

### テストデータ生成
```bash
node scripts/generateHistoricalRates.ts
```

## 注意点

- APIレート制限があるため、大量リクエストには注意
- エラー発生時は logs/ 内のログを確認
- テスト環境での実行を推奨

## データ構造

保存されるデータは以下の構造で整理されます：
```
src/data/
├── current/        # 現在の四半期データ
├── historical/     # 過去の四半期データ
└── meta/          # メタデータ
```

## ライセンス
MIT