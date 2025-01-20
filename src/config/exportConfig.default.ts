// src/config/exportConfig.default.ts
export const MONTHLY_PASSWORDS = {
    '2024-01': 'member2024jan',
    '2024-02': 'member2024feb',
    '2024-03': 'member2024mar',
    '2024-04': 'member2024apr',
    '2024-05': 'member2024may',
    '2024-06': 'member2024jun',
    '2024-07': 'member2024jul',
    '2024-08': 'member2024aug',
    '2024-09': 'member2024sep',
    '2024-10': 'member2024oct',
    '2024-11': 'member2024nov',
    '2024-12': 'member2024dec',
  } as const;
  
  export function getCurrentPassword(): string {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return MONTHLY_PASSWORDS[yearMonth as keyof typeof MONTHLY_PASSWORDS] || MONTHLY_PASSWORDS['2024-01'];
  }