const fs = require('fs');

const csvPath = 'docs/check/FT_CSV_91886292.csv';
const fileContent = fs.readFileSync(csvPath, 'utf8');

// 簡易CSVパーサー（引用符対応）
function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
const header = parseCsvLine(lines[0]).map(h => h.trim());
console.log('Headers:', header);

const actionIndex = header.indexOf('Action');
const symbolIndex = header.indexOf('Symbol');
const descIndex = header.indexOf('Description');

if (actionIndex === -1) {
    console.error('Action column not found');
    process.exit(1);
}

const actionCounts = {};
const symbolCounts = {};
const examples = [];

lines.slice(1).forEach((line, index) => {
    const columns = parseCsvLine(line);
    if (columns.length < header.length) return;

    const rawAction = columns[actionIndex];
    const key = `"${rawAction}"`;
    actionCounts[key] = (actionCounts[key] || 0) + 1;

    const symbol = columns[symbolIndex];
    if (symbol) {
        const symKey = `"${symbol}"`;
        symbolCounts[symKey] = (symbolCounts[symKey] || 0) + 1;

        // AGGまたはDividendの例を表示
        if ((symbol.includes('AGG') || rawAction.includes('Dividend')) && examples.length < 10) {
            examples.push({
                index,
                Symbol: `"${symbol}"`,
                Action: `"${rawAction}"`
            });
        }
    }
});

console.log('\n--- Action Counts (Raw) ---');
console.log(actionCounts);

console.log('\n--- Symbol Counts (Top 10) ---');
console.log(Object.entries(symbolCounts).sort((a, b) => b[1] - a[1]).slice(0, 10));

console.log('\n--- Examples ---');
console.log(examples);
