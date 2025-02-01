// src/config/exportConfig.ts
type Month = '01' | '02' | '03' | '04' | '05' | '06' | 
             '07' | '08' | '09' | '10' | '11' | '12';

export const MONTHLY_PASSWORDS: Record<Month, string | undefined> = {
  '01': process.env.NEXT_PUBLIC_PASSWORD_JAN,
  '02': process.env.NEXT_PUBLIC_PASSWORD_FEB,
  '03': process.env.NEXT_PUBLIC_PASSWORD_MAR,
  '04': process.env.NEXT_PUBLIC_PASSWORD_APR,
  '05': process.env.NEXT_PUBLIC_PASSWORD_MAY,
  '06': process.env.NEXT_PUBLIC_PASSWORD_JUN,
  '07': process.env.NEXT_PUBLIC_PASSWORD_JUL,
  '08': process.env.NEXT_PUBLIC_PASSWORD_AUG,
  '09': process.env.NEXT_PUBLIC_PASSWORD_SEP,
  '10': process.env.NEXT_PUBLIC_PASSWORD_OCT,
  '11': process.env.NEXT_PUBLIC_PASSWORD_NOV,
  '12': process.env.NEXT_PUBLIC_PASSWORD_DEC,
} as const;

export function getCurrentPassword(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0') as Month;
  
  const currentPassword = MONTHLY_PASSWORDS[month];
  if (!currentPassword) {
    console.warn(`Password not found for month: ${month}, check environment variables`);
    return MONTHLY_PASSWORDS['01'] || '';  // fallback to January
  }
  
  return currentPassword;
}