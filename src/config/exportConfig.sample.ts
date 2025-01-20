// src/config/exportConfig.sample.ts
export const MONTHLY_PASSWORDS = {
    '2024-01': 'password_january',
    '2024-02': 'password_february',
    '2024-03': 'password_march',
    '2024-04': 'password_april',
    '2024-05': 'password_may',
    '2024-06': 'password_june',
    '2024-07': 'password_july',
    '2024-08': 'password_august',
    '2024-09': 'password_september',
    '2024-10': 'password_october',
    '2024-11': 'password_november',
    '2024-12': 'password_december',
  } as const;
  
  export function getCurrentPassword(): string {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return MONTHLY_PASSWORDS[yearMonth as keyof typeof MONTHLY_PASSWORDS] || MONTHLY_PASSWORDS['2024-01'];
  }