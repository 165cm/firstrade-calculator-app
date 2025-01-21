// src/config/exportConfig.ts
export const MONTHLY_PASSWORDS = {
    '2024-01': process.env.NEXT_PUBLIC_PASSWORD_JAN || 'default_jan',
    '2024-02': process.env.NEXT_PUBLIC_PASSWORD_FEB || 'default_feb',
    '2024-03': process.env.NEXT_PUBLIC_PASSWORD_MAR || 'default_mar',
    '2024-04': process.env.NEXT_PUBLIC_PASSWORD_APR || 'default_apr',
    '2024-05': process.env.NEXT_PUBLIC_PASSWORD_MAY || 'default_may',
    '2024-06': process.env.NEXT_PUBLIC_PASSWORD_JUN || 'default_jun',
    '2024-07': process.env.NEXT_PUBLIC_PASSWORD_JUL || 'default_jul',
    '2024-08': process.env.NEXT_PUBLIC_PASSWORD_AUG || 'default_aug',
    '2024-09': process.env.NEXT_PUBLIC_PASSWORD_SEP || 'default_sep',
    '2024-10': process.env.NEXT_PUBLIC_PASSWORD_OCT || 'default_oct',
    '2024-11': process.env.NEXT_PUBLIC_PASSWORD_NOV || 'default_nov',
    '2024-12': process.env.NEXT_PUBLIC_PASSWORD_DEC || 'default_dec',
  } as const;
  
  export function getCurrentPassword(): string {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return MONTHLY_PASSWORDS[yearMonth as keyof typeof MONTHLY_PASSWORDS] || MONTHLY_PASSWORDS['2024-01'];
  }