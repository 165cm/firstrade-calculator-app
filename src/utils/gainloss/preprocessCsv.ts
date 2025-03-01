// src/utils/gainloss/preprocessCsv.ts
import Papa, { ParseConfig } from 'papaparse';
import { HeaderKey, HEADER_MAPPINGS, normalizeHeader } from '@/types/gainloss';

interface PreprocessResult {
  success: boolean;
  data?: string;
  error?: string;
}

// 数値の正規化関数（金額だけでなく、全ての数値項目に対応）
function normalizeNumber(value: string): string {
  // カンマ、ドル記号、円記号、空白を除去
  return value.replace(/[$,¥\s]/g, '').trim();
}

// headerMatch関数を修正
function headerMatch(header: string, allowedNames: readonly string[]): boolean {
  const normalized = normalizeHeader(header);
  return allowedNames.some(allowed => normalizeHeader(allowed) === normalized);
}

// 数値として処理すべきフィールドのリスト
const numericFields: HeaderKey[] = ['Quantity', 'Proceeds', 'Cost', 'Amount'];

export function preprocessCsv(csvContent: string): PreprocessResult {
  try {
    // デバッグ情報（処理前）
    console.log('CSV処理開始: 文字数', csvContent.length);
    
    const config: ParseConfig<string[]> = {
      skipEmptyLines: 'greedy',
      header: false,
      delimiter: ',',
      transform: (value: string) => value
    };
    
    const parseResult = Papa.parse<string[]>(csvContent, config);
    
    if (!parseResult.data || parseResult.data.length === 0) {
      return { success: false, error: 'CSVの解析に失敗しました' };
    }
    
    let rows = parseResult.data;
    
    // タイトル行の削除（1行目を無視）
    rows = rows.slice(1);
    
    // 空行と集計行の削除
    rows = rows.filter(row => {
      const rowStr = row.join(',').toLowerCase();
      return !rowStr.includes('total') && 
             !rowStr.includes('account number') &&
             row.some(cell => cell.trim() !== '');
    });
    
    // ヘッダー行の取得と検証
    const headers = rows[0].map(h => normalizeHeader(h));
    console.log('正規化されたヘッダー:', headers);
    
    const headerIndexMap = new Map<HeaderKey, number>();
    
    Object.entries(HEADER_MAPPINGS).forEach(([key, allowedNames]) => {
      const index = headers.findIndex(h => headerMatch(h, allowedNames));
      
      if (index !== -1) {
        headerIndexMap.set(key as HeaderKey, index);
        console.log(`マッピング成功: ${headers[index]} -> ${key}`);
      } else {
        console.log(`マッピング失敗: ${key}. 許容値:`, allowedNames);
      }
    });
    
    // 必要なヘッダーが全て見つかったか確認
    const missingHeaders = Object.keys(HEADER_MAPPINGS).filter(
      key => !headerIndexMap.has(key as HeaderKey)
    );
    
    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: `必要なヘッダーが見つかりません: ${missingHeaders.join(', ')}`
      };
    }
    
    // データの変換
    const processedRows = [
      Array.from(headerIndexMap.keys()),
      ...rows.slice(1).map(row => {
        // 各フィールドの処理
        return Array.from(headerIndexMap.entries()).map(([key, index]) => {
          // 元の値を取得し、クォーテーションを削除
          let value = row[index]?.replace(/"/g, '').trim() || '';
          
          // 数値フィールドの場合は正規化
          if (numericFields.includes(key)) {
            // 変換前の値（デバッグ用）
            const beforeNormalize = value;
            
            // 数値の正規化
            value = normalizeNumber(value);
            
            // 変換に失敗した場合のログ
            if (value === '' || isNaN(Number(value))) {
              console.warn(`数値変換エラー: "${key}" フィールド, 元の値: "${beforeNormalize}", 変換後: "${value}"`);
            }
            
            // デバッグログ（変換前後の比較）
            if (beforeNormalize !== value) {
              console.log(`数値正規化: ${key}, 元の値: "${beforeNormalize}" -> 変換後: "${value}"`);
            }
          }
          
          return value;
        });
      })
    ];
    
    const processedCsv = Papa.unparse(processedRows);
    
    // デバッグ情報（処理後）
    console.log('CSV処理完了: 行数', processedRows.length);
    
    // サンプルデータのログ（最初の2行）
    if (processedRows.length > 2) {
      console.log('処理後のサンプルデータ (最初の行):', processedRows[1]);
    }
    
    return { success: true, data: processedCsv };
  } catch (error) {
    console.error('CSV処理エラー:', error);
    return { 
      success: false, 
      error: `CSV前処理中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    };
  }
}