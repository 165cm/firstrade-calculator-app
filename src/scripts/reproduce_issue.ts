// src/scripts/reproduce_issue.ts
import fs from 'fs';
import Papa from 'papaparse';

const csvPath = 'docs/check/FT_CSV_91886292.csv';
const fileContent = fs.readFileSync(csvPath, 'utf8');

// パース実行
Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    complete: (results: any) => {
        const rawRows = results.data;
        console.log(`Total Raw Rows: ${rawRows.length}`);

        // 旧ロジックのシミュレーション
        let oldAccepted = 0;
        let oldRejected = 0;
        const oldRejectedExamples: string[] = [];

        rawRows.forEach((row: any) => {
            const action = row.Action || '';
            const validActions = ['DIVIDEND', 'INTEREST', 'OTHER', 'BUY', 'SELL'];
            const normalizedAction = validActions.includes(action.toUpperCase())
                ? action.toUpperCase()
                : 'OTHER';

            if (normalizedAction === 'DIVIDEND' || normalizedAction === 'INTEREST') {
                oldAccepted++;
            } else {
                oldRejected++;
                if (oldRejectedExamples.length < 5) {
                    oldRejectedExamples.push(`"${action}" -> ${normalizedAction} (Symbol: ${row.Symbol})`);
                }
            }
        });

        console.log('\n--- Old Logic ---');
        console.log(`Accepted: ${oldAccepted}`);
        console.log(`Rejected: ${oldRejected}`);
        console.log('Rejected Examples:', oldRejectedExamples);

        // 新ロジックのシミュレーション
        let newAccepted = 0;
        let newRejected = 0;
        const cleanString = (val: string | undefined): string => {
            if (!val) return '';
            return val.replace(/['"]+/g, '').trim();
        };

        rawRows.forEach((row: any) => {
            const rawAction = cleanString(row.Action);
            const validActions = ['DIVIDEND', 'INTEREST', 'OTHER', 'BUY', 'SELL'];
            const normalizedAction = validActions.includes(rawAction.toUpperCase())
                ? rawAction.toUpperCase()
                : 'OTHER';

            if (normalizedAction === 'DIVIDEND' || normalizedAction === 'INTEREST') {
                newAccepted++;
            } else {
                newRejected++;
            }
        });

        console.log('\n--- New Logic ---');
        console.log(`Accepted: ${newAccepted}`);
        console.log(`Rejected: ${newRejected}`);
    }
});
