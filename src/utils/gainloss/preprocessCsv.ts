// src/utils/gainloss/preprocessCsv.ts
import Papa, { ParseConfig } from 'papaparse';
import { HeaderKey, HEADER_MAPPINGS, normalizeHeader } from '@/types/gainloss';

interface PreprocessResult {
  success: boolean;
  data?: string;
  error?: string;
}

// 金額の正規化関数のみ残す
function normalizeAmount(amount: string): string {
  return amount.replace(/[$,]/g, '').trim();
}

// headerMatch関数を修正
function headerMatch(header: string, allowedNames: readonly string[]): boolean {
  const normalized = normalizeHeader(header);
  return allowedNames.some(allowed => normalizeHeader(allowed) === normalized);
}

export function preprocessCsv(csvContent: string): PreprocessResult {
  try {
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
    console.log('Normalized headers:', headers);
    
    const headerIndexMap = new Map<HeaderKey, number>();
    Object.entries(HEADER_MAPPINGS).forEach(([key, allowedNames]) => {
      const index = headers.findIndex(h => headerMatch(h, allowedNames));
      
      if (index !== -1) {
        headerIndexMap.set(key as HeaderKey, index);
        console.log(`Mapped ${headers[index]} -> ${key}`);
      } else {
        console.log(`Failed to map ${key}. Allowed:`, allowedNames);
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
      ...rows.slice(1).map(row => 
        Array.from(headerIndexMap.values()).map(index => {
          let value = row[index]?.replace(/"/g, '').trim() || '';
          if (value.includes('$')) {
            value = normalizeAmount(value);
          }
          return value;
        })
      )
    ];

    const processedCsv = Papa.unparse(processedRows);
    return { success: true, data: processedCsv };

  } catch (error) {
    console.error('CSV processing error:', error);
    return { 
      success: false, 
      error: `CSV前処理中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    };
  }
}