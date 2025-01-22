// src/config/exportConfig.ts
export const MONTHLY_PASSWORDS = {
  'jan': process.env.NEXT_PUBLIC_PASSWORD_JAN,
  'feb': process.env.NEXT_PUBLIC_PASSWORD_FEB,
  'mar': process.env.NEXT_PUBLIC_PASSWORD_MAR,
  'apr': process.env.NEXT_PUBLIC_PASSWORD_APR,
  'may': process.env.NEXT_PUBLIC_PASSWORD_MAY,
  'jun': process.env.NEXT_PUBLIC_PASSWORD_JUN,
  'jul': process.env.NEXT_PUBLIC_PASSWORD_JUL,
  'aug': process.env.NEXT_PUBLIC_PASSWORD_AUG,
  'sep': process.env.NEXT_PUBLIC_PASSWORD_SEP,
  'oct': process.env.NEXT_PUBLIC_PASSWORD_OCT,
  'nov': process.env.NEXT_PUBLIC_PASSWORD_NOV,
  'dec': process.env.NEXT_PUBLIC_PASSWORD_DEC,
} as const;

export function getCurrentPassword(): string {
  const now = new Date();
  // 月を小文字の3文字に変換（例：January → jan）
  const month = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  
  const currentPassword = MONTHLY_PASSWORDS[month as keyof typeof MONTHLY_PASSWORDS];
  
  if (!currentPassword) {
    console.warn(`Password not found for month: ${month}, check environment variables`);
    return MONTHLY_PASSWORDS['jan'] || ''; // fallback to January
  }
  
  return currentPassword;
}