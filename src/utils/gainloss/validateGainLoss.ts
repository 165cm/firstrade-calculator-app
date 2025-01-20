// src/utils/gainloss/validateGainLoss.ts

import type { RawGainLossData, HeaderKey } from '@/types/gainloss';
import { HEADER_MAPPINGS, normalizeHeader } from '@/types/gainloss';
import Papa from 'papaparse';

// インターフェース定義の追加
interface ValidationError {
  type: 'HEADER' | 'FORMAT' | 'DATA';
  message: string;
  details?: string;
}

interface ValidationResult {
  isValid: boolean;
  data?: RawGainLossData[];
  errors?: ValidationError[];
  errorMessage?: string;
}

// src/utils/gainloss/validateGainLoss.ts
export async function validateGainLossData(file: File): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        console.log('Processing header (raw):', header);
        const normalizedHeader = header.replace(/"/g, '').trim();
        console.log('Normalized header:', normalizedHeader);
        
        if (normalizedHeader.includes('Capital Gains and Losses')) {
          console.log('Skipping title header:', normalizedHeader);
          return '';
        }
      
        for (const [key, allowedNames] of Object.entries(HEADER_MAPPINGS)) {
          console.log(`Checking mapping ${key}:`, allowedNames);
          if (allowedNames.some(name => 
            name.toLowerCase() === normalizedHeader.toLowerCase()
          )) {
            console.log(`Successfully mapped ${normalizedHeader} to ${key}`);
            return key;
          }
        }
        
        console.log(`No mapping found for: ${normalizedHeader}`);
        return normalizedHeader;
      },
      complete: (results) => {
        const errors: ValidationError[] = []; // ここでerrorsを定義
        const data = results.data as RawGainLossData[]; // ここでdataを定義

        console.log('Parse complete. Fields:', results.meta.fields);
        console.log('First row data:', data[0]);

        // 1. ベーシックチェック
        if (!data || data.length === 0) {
          errors.push({
            type: 'DATA',
            message: 'データが空です',
            details: 'アップロードされたファイルにデータが含まれていません。'
          });
          return resolveWithErrors(errors);
        }

        // 2. ヘッダーチェック
        const missingFields = validateHeaders(results.meta.fields || []);
        if (missingFields.length > 0) {
          errors.push({
            type: 'HEADER',
            message: '必須フィールドが不足しています',
            details: `不足フィールド: ${missingFields.join(', ')}\n` +
                    `検出されたヘッダー: ${results.meta.fields?.join(', ')}`
          });
        }

        // 3. データフォーマットチェック
        const formatErrors = validateDataFormat(data);
        errors.push(...formatErrors);

        // 4. 年度チェック
        const yearErrors = validateSingleYear(data);
        if (yearErrors) {
          errors.push(yearErrors);
        }

        if (errors.length > 0) {
          return resolveWithErrors(errors);
        }

        resolve({
          isValid: true,
          data: data
        });
      },
      error: (error) => {
        reject(new Error(`CSVの解析に失敗しました: ${error.message}`));
      }
    });
  });
}

function validateHeaders(headers: string[]): string[] {
  console.log('Validating headers:', headers);
  
  const normalizedHeaders = headers.map(h => normalizeHeader(h));
  console.log('Normalized headers:', normalizedHeaders);
  
  const requiredHeaders = Object.keys(HEADER_MAPPINGS) as HeaderKey[];
  console.log('Required headers:', requiredHeaders);
  
  // 各必須ヘッダーについて、マッピング対象が存在するかチェック
  const missingHeaders = requiredHeaders.filter(required => {
    const mappedValues = HEADER_MAPPINGS[required];
    const hasMapping = normalizedHeaders.some(header =>
      mappedValues.some(mapped => normalizeHeader(mapped) === header)
    );
    if (!hasMapping) {
      console.log(`Missing mapping for ${required}. Valid values:`, mappedValues);
    }
    return !hasMapping;
  });
  
  return missingHeaders;
}

function validateDataFormat(data: RawGainLossData[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  data.forEach((row, index) => {
    // 数値チェック（変更なし）
    if (isNaN(Number(row.Quantity)) || isNaN(Number(row.Proceeds)) || 
        isNaN(Number(row.Cost)) || isNaN(Number(row.Amount))) {
      errors.push({
        type: 'FORMAT',
        message: `行 ${index + 1} に無効な数値が含まれています`,
        details: `全ての数値フィールド (Quantity, Proceeds, Cost, Amount) は有効な数値である必要があります`
      });
    }

    // 日付フォーマットチェックの修正
    const dateFields = ['TradeDate', 'PurchaseDate'];
    dateFields.forEach(field => {
      const dateStr = String(row[field as keyof RawGainLossData]);
      if (!isValidDate(dateStr)) {
        console.log(`Invalid date format: ${field} = ${dateStr}`);
        errors.push({
          type: 'FORMAT',
          message: `行 ${index + 1} の日付フォーマットが無効です`,
          details: `${field} は MM/DD/YYYY または YYYY/MM/DD 形式である必要があります`
        });
      }
    });
  });

  return errors;
}


function validateSingleYear(data: RawGainLossData[]): ValidationError | null {
  const years = new Set(
    data.map(row => new Date(row.TradeDate).getFullYear())
  );

  if (years.size > 1) {
    return {
      type: 'DATA',
      message: '複数年度のデータが含まれています',
      details: `検出された年度: ${Array.from(years).join(', ')}\n` +
              '単一年度のデータのみアップロードしてください'
    };
  }

  return null;
}

function isValidDate(dateStr: string): boolean {
  // MM/DD/YYYY形式のチェック
  const mmddyyyyRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (mmddyyyyRegex.test(dateStr)) {
    const [month, day, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && 
           date.getDate() === day && 
           date.getFullYear() === year;
  }

  // YYYY/MM/DD形式のチェック
  const yyyymmddRegex = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
  if (yyyymmddRegex.test(dateStr)) {
    const [year, month, day] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && 
           date.getDate() === day && 
           date.getFullYear() === year;
  }

  return false;
}

function resolveWithErrors(errors: ValidationError[]): ValidationResult {
  return {
    isValid: false,
    errors: errors,
    errorMessage: errors.map(e => 
      `${e.message}\n${e.details || ''}`
    ).join('\n\n')
  };
}

interface ValidationResult {
  isValid: boolean;
  data?: RawGainLossData[];
  errors?: ValidationError[];
  errorMessage?: string;
}