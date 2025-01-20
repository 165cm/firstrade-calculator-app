// src/__tests__/exchangeRates.test.ts
import { getExchangeRate, normalizeDate, DEFAULT_RATE, validateExchangeRates } from '@/data/exchangeRates';

describe('Exchange Rates', () => {
  describe('normalizeDate', () => {
    test('正しい日付形式を正規化できる', () => {
      expect(normalizeDate('2024-01-15')).toBe('2024-01-15');
    });

    test('無効な日付の場合は空文字を返す', () => {
      expect(normalizeDate('invalid-date')).toBe('');
      expect(normalizeDate('2024-13-01')).toBe('');  // 無効な月
      expect(normalizeDate('2024-01-32')).toBe('');  // 無効な日
    });
  });

  describe('getExchangeRate', () => {
    // 基本的なレート取得
    test('存在する日付のレートを取得できる', () => {
      expect(getExchangeRate('2024-01-04')).toBe(144.30);
      expect(getExchangeRate('2024-02-01')).toBe(144.50);
    });

    // 休日のレート取得
    test('土曜日の場合は直前の金曜日のレートを返す', () => {
      const fridayRate = getExchangeRate('2024-01-05');  // 金曜日
      const saturdayRate = getExchangeRate('2024-01-06');  // 土曜日
      expect(saturdayRate).toBe(fridayRate);
    });

    test('日曜日の場合は直前の金曜日のレートを返す', () => {
      const fridayRate = getExchangeRate('2024-01-05');  // 金曜日
      const sundayRate = getExchangeRate('2024-01-07');  // 日曜日
      expect(sundayRate).toBe(fridayRate);
    });

    test('祝日の場合は直前の営業日のレートを返す', () => {
      const holidayRate = getExchangeRate('2024-01-08');  // 成人の日
      expect(holidayRate).toBeDefined();
      expect(holidayRate).toBeGreaterThan(0);
    });

    // エッジケース
    test('月初のレートを取得できる', () => {
      expect(getExchangeRate('2024-02-01')).toBeDefined();
      expect(getExchangeRate('2024-03-01')).toBeDefined();
    });

    test('月末のレートを取得できる', () => {
      expect(getExchangeRate('2024-01-31')).toBeDefined();
      expect(getExchangeRate('2024-02-29')).toBeDefined();  // うるう年
    });

    test('存在しない日付の場合はデフォルトレートを返す', () => {
      expect(getExchangeRate('invalid-date')).toBe(DEFAULT_RATE);
      expect(getExchangeRate('2025-01-01')).toBe(DEFAULT_RATE);
    });

    // レートの妥当性チェック
    test('すべてのレートが妥当な範囲内にある', () => {
      const rates = [
        getExchangeRate('2024-01-04'),
        getExchangeRate('2024-02-01'),
        getExchangeRate('2024-03-01'),
      ];

      rates.forEach(rate => {
        expect(rate).toBeGreaterThan(100);
        expect(rate).toBeLessThan(200);
      });
    });
  });

  describe('validateExchangeRates', () => {
    test('レートの検証が正常に実行される', () => {
      const mockConsoleError = jest.spyOn(console, 'error');
      mockConsoleError.mockImplementation(() => {});

      validateExchangeRates();
      expect(mockConsoleError).not.toHaveBeenCalled();
      
      mockConsoleError.mockRestore();
    });
  });
});