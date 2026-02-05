const fs = require('fs');

const csvPath = 'docs/check/FT_CSV_91886292.csv';
const outputPath = 'analysis_result.txt';
const fileContent = fs.readFileSync(csvPath, 'utf8');

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

let output = `Headers: ${JSON.stringify(header)}\n`;

const actionIndex = header.indexOf('Action');
const symbolIndex = header.indexOf('Symbol');

if (actionIndex === -1) {
    fs.writeFileSync(outputPath, 'Error: Action column not found');
    process.exit(1);
}

const actionCounts = {};
const symbolCounts = {};
const examples = [];

lines.slice(1).forEach((line, index) => {
    const columns = parseCsvLine(line);
    if (columns.length < header.length) return;

    const rawAction = columns[actionIndex];
    // 引用符で囲んでキーにする（空白の可視化）
    const key = `"${rawAction}"`;
    actionCounts[key] = (actionCounts[key] || 0) + 1;

    const symbol = columns[symbolIndex];
    if (symbol) {
        const symKey = `"${symbol}"`;
        symbolCounts[symKey] = (symbolCounts[symKey] || 0) + 1;

        if ((symbol.includes('AGG') || rawAction.toLowerCase().includes('dividend')) && examples.length < 20) {
            examples.push({
                index,
                Symbol: `"${symbol}"`,
                Action: `"${rawAction}"`
            });
        }
    }
});

output += '\n--- Action Counts (Raw) ---\n';
output += JSON.stringify(actionCounts, null, 2);

output += '\n\n--- Symbol Counts (Top 10) ---\n';
output += JSON.stringify(Object.entries(symbolCounts).sort((a, b) => b[1] - a[1]).slice(0, 10), null, 2);

output += '\n\n--- Examples ---\n';
output += JSON.stringify(examples, null, 2);

fs.writeFileSync(outputPath, output);
console.log('Analysis complete');
