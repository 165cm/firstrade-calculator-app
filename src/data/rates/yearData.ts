// src/data/rates/yearData.ts
export interface YearlyRates {
    [key: string]: {
      [key: string]: number;
    };
  }
  
  // 年ごとの月別データテンプレート生成
  export function generateYearTemplate(year: number, baseRate: number = 145): YearlyRates {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const yearTemplate: YearlyRates = {};
  
    months.forEach(month => {
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const daysInMonth = new Date(year, month, 0).getDate();
      
      const monthData: { [key: string]: number } = {};
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`;
        monthData[dateKey] = baseRate;
      }
      
      yearTemplate[monthKey] = monthData;
    });
  
    return yearTemplate;
  }