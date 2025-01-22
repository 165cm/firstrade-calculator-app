// src/config/exportConfig.ts
export const MONTHLY_PASSWORDS = {
  '2024-01': process.env.NEXT_PUBLIC_PASSWORD_JAN,
  '2024-02': process.env.NEXT_PUBLIC_PASSWORD_FEB,
  '2024-03': process.env.NEXT_PUBLIC_PASSWORD_MAR,
  '2024-04': process.env.NEXT_PUBLIC_PASSWORD_APR,
  '2024-05': process.env.NEXT_PUBLIC_PASSWORD_MAY,
  '2024-06': process.env.NEXT_PUBLIC_PASSWORD_JUN,
  '2024-07': process.env.NEXT_PUBLIC_PASSWORD_JUL,
  '2024-08': process.env.NEXT_PUBLIC_PASSWORD_AUG,
  '2024-09': process.env.NEXT_PUBLIC_PASSWORD_SEP,
  '2024-10': process.env.NEXT_PUBLIC_PASSWORD_OCT,
  '2024-11': process.env.NEXT_PUBLIC_PASSWORD_NOV,
  '2024-12': process.env.NEXT_PUBLIC_PASSWORD_DEC,
  } as const;
  
  export function getCurrentPassword(): string {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const currentPassword = MONTHLY_PASSWORDS[yearMonth as keyof typeof MONTHLY_PASSWORDS];
    if (!currentPassword) {
      console.warn(`Password not found for ${yearMonth}, using fallback`);
      return MONTHLY_PASSWORDS['2024-01'] || '';
    }
    
    return currentPassword;
  }