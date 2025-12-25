
// src/utils/demoData.ts
import type { RawDividendData } from '@/types/dividend';

export const DEMO_POSITION_DATA = `
Symbol	Quantity	Price	Day's Change	$	Market Value	Unit Cost	Total Cost	Total Gain/Loss	$	%
AAPL	100	225.00	+1.50	+150.00	22500.00	120.00	12000.00	10500.00	+87.50%
MSFT	80	420.00	+2.00	+160.00	33600.00	250.00	20000.00	13600.00	+68.00%
NVDA	50	140.00	+1.20	+60.00	7000.00	40.00	2000.00	5000.00	+250.00%
GOOGL	60	180.00	-0.50	-30.00	10800.00	100.00	6000.00	4800.00	+80.00%
AMZN	50	190.00	+1.00	+50.00	9500.00	110.00	5500.00	4000.00	+72.73%
TSLA	40	250.00	+5.00	+200.00	10000.00	180.00	7200.00	2800.00	+38.89%
VOO	30	510.00	+0.80	+24.00	15300.00	350.00	10500.00	4800.00	+45.71%
QQQ	40	490.00	+1.10	+44.00	19600.00	300.00	12000.00	7600.00	+63.33%
VYM	100	130.00	+0.30	+30.00	13000.00	90.00	9000.00	4000.00	+44.44%
KO	150	65.00	+0.10	+15.00	9750.00	50.00	7500.00	2250.00	+30.00%
JNJ	50	160.00	+0.20	+10.00	8000.00	140.00	7000.00	1000.00	+14.29%
PG	60	170.00	+0.50	+30.00	10200.00	130.00	7800.00	2400.00	+30.77%
BND	200	73.00	+0.05	+10.00	14600.00	75.00	15000.00	-400.00	-2.67%
TLT	100	93.00	+0.15	+15.00	9300.00	98.00	9800.00	-500.00	-5.10%
`;

// 配当金用のデモデータ（Tax Center CSV形式 - 公式データ準拠）
// Based on official data format provided by user (2025 style)
// NKE, BKCH examples included. Dates shifted to 2025/2024 relevant periods.
export const DEMO_DIVIDEND_DATA: RawDividendData[] = [
    // 1月 (2025 - matching user snippet)
    { TradeDate: '2025-01-02', Symbol: 'NKE', Description: 'NIKE INC CLASS B COM CASH DIV  ON 13.35050 SHS REC 12/02/24 PAY 01/02/25 NON-RES TAX WITHHELD  $0.53', Amount: 5.34, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2025-01-07', Symbol: 'BKCH', Description: 'GLOBAL X FDS GLOBAL X BLOCKCHAIN ETF CASH DIV  ON 0.47564 SHS REC 12/30/24 PAY 01/07/25 NON-QUALIFIED DIVIDEND AMOUNT INCLUDED ON 2024-1099', Amount: 1.79, RecordType: 'Other', Action: 'DIVIDEND' }, // Using DIVIDEND Action for calculation, RecordType matches CSV
    { TradeDate: '2025-01-07', Symbol: 'BKCH', Description: 'GLOBAL X FDS GLOBAL X BLOCKCHAIN ETF SUBST PAY ON      61 SHS REC 12/30/24 PAY 01/07/25 IN LIEU OF DIVIDEND NON-RES TAX WITHHELD  $22.91', Amount: 229.07, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2025-01-07', Symbol: '', Description: 'INTEREST ON CREDIT BALANCE', Amount: 8.50, RecordType: 'Financial', Action: 'INTEREST' },

    // 2月
    { TradeDate: '2024-02-15', Symbol: 'O', Description: 'REALTY INCOME CORP CASH DIV ON 100 SHS REC 02/01/24 PAY 02/15/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-02-05', Symbol: 'BND', Description: 'VANGUARD TOTAL BOND MARKET ETF CASH DIV ON 200 SHS REC 01/31/24 PAY 02/05/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-02-16', Symbol: 'AAPL', Description: 'APPLE INC CASH DIV ON 200 SHS REC 02/05/24 PAY 02/16/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },

    // 3月
    { TradeDate: '2024-03-15', Symbol: 'O', Description: 'REALTY INCOME CORP CASH DIV ON 100 SHS REC 03/01/24 PAY 03/15/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-03-05', Symbol: 'BND', Description: 'VANGUARD TOTAL BOND MARKET ETF CASH DIV ON 200 SHS REC 02/29/24 PAY 03/05/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-03-14', Symbol: 'MSFT', Description: 'MICROSOFT CORP CASH DIV ON 100 SHS REC 02/15/24 PAY 03/14/24 NON-RES TAX WITHHELD $7.50', Amount: 75.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-03-20', Symbol: 'VYM', Description: 'VANGUARD HIGH DIVIDEND YIELD ETF CASH DIV ON 300 SHS REC 03/10/24 PAY 03/20/24 NON-RES TAX WITHHELD $25.00', Amount: 250.00, RecordType: 'Dividend', Action: 'DIVIDEND' },

    // 4月
    { TradeDate: '2024-04-15', Symbol: 'O', Description: 'REALTY INCOME CORP CASH DIV ON 100 SHS REC 04/01/24 PAY 04/15/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-04-05', Symbol: 'BND', Description: 'VANGUARD TOTAL BOND MARKET ETF CASH DIV ON 200 SHS REC 03/29/24 PAY 04/05/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-04-01', Symbol: 'KO', Description: 'COCA-COLA CO CASH DIV ON 300 SHS REC 03/15/24 PAY 04/01/24 NON-RES TAX WITHHELD $15.00', Amount: 150.00, RecordType: 'Dividend', Action: 'DIVIDEND' },

    // 5月
    { TradeDate: '2024-05-15', Symbol: 'O', Description: 'REALTY INCOME CORP CASH DIV ON 100 SHS REC 05/01/24 PAY 05/15/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-05-06', Symbol: 'BND', Description: 'VANGUARD TOTAL BOND MARKET ETF CASH DIV ON 200 SHS REC 04/30/24 PAY 05/06/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-05-16', Symbol: 'AAPL', Description: 'APPLE INC CASH DIV ON 200 SHS REC 05/06/24 PAY 05/16/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },

    // 6月
    { TradeDate: '2024-06-14', Symbol: 'O', Description: 'REALTY INCOME CORP CASH DIV ON 100 SHS REC 06/03/24 PAY 06/14/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-06-05', Symbol: 'BND', Description: 'VANGUARD TOTAL BOND MARKET ETF CASH DIV ON 200 SHS REC 05/31/24 PAY 06/05/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-06-13', Symbol: 'MSFT', Description: 'MICROSOFT CORP CASH DIV ON 100 SHS REC 05/16/24 PAY 06/13/24 NON-RES TAX WITHHELD $7.50', Amount: 75.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-06-20', Symbol: 'VYM', Description: 'VANGUARD HIGH DIVIDEND YIELD ETF CASH DIV ON 300 SHS REC 06/10/24 PAY 06/20/24 NON-RES TAX WITHHELD $25.00', Amount: 250.00, RecordType: 'Dividend', Action: 'DIVIDEND' },

    // 7月
    { TradeDate: '2024-07-15', Symbol: 'O', Description: 'REALTY INCOME CORP CASH DIV ON 100 SHS REC 07/01/24 PAY 07/15/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-07-05', Symbol: 'BND', Description: 'VANGUARD TOTAL BOND MARKET ETF CASH DIV ON 200 SHS REC 06/28/24 PAY 07/05/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-07-01', Symbol: 'KO', Description: 'COCA-COLA CO CASH DIV ON 300 SHS REC 06/14/24 PAY 07/01/24 NON-RES TAX WITHHELD $15.00', Amount: 150.00, RecordType: 'Dividend', Action: 'DIVIDEND' },

    // 8月
    { TradeDate: '2024-08-15', Symbol: 'O', Description: 'REALTY INCOME CORP CASH DIV ON 100 SHS REC 08/01/24 PAY 08/15/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-08-05', Symbol: 'BND', Description: 'VANGUARD TOTAL BOND MARKET ETF CASH DIV ON 200 SHS REC 07/31/24 PAY 08/05/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-08-15', Symbol: 'AAPL', Description: 'APPLE INC CASH DIV ON 200 SHS REC 08/05/24 PAY 08/15/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },

    // 9月
    { TradeDate: '2024-09-13', Symbol: 'O', Description: 'REALTY INCOME CORP CASH DIV ON 100 SHS REC 09/03/24 PAY 09/13/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-09-05', Symbol: 'BND', Description: 'VANGUARD TOTAL BOND MARKET ETF CASH DIV ON 200 SHS REC 08/30/24 PAY 09/05/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-09-12', Symbol: 'MSFT', Description: 'MICROSOFT CORP CASH DIV ON 100 SHS REC 08/15/24 PAY 09/12/24 NON-RES TAX WITHHELD $7.50', Amount: 75.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-09-19', Symbol: 'VYM', Description: 'VANGUARD HIGH DIVIDEND YIELD ETF CASH DIV ON 300 SHS REC 09/09/24 PAY 09/19/24 NON-RES TAX WITHHELD $25.00', Amount: 250.00, RecordType: 'Dividend', Action: 'DIVIDEND' },

    // 10月
    { TradeDate: '2024-10-15', Symbol: 'O', Description: 'REALTY INCOME CORP CASH DIV ON 100 SHS REC 10/01/24 PAY 10/15/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-10-04', Symbol: 'BND', Description: 'VANGUARD TOTAL BOND MARKET ETF CASH DIV ON 200 SHS REC 09/30/24 PAY 10/04/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-10-01', Symbol: 'KO', Description: 'COCA-COLA CO CASH DIV ON 300 SHS REC 09/13/24 PAY 10/01/24 NON-RES TAX WITHHELD $15.00', Amount: 150.00, RecordType: 'Dividend', Action: 'DIVIDEND' },

    // 11月
    { TradeDate: '2024-11-15', Symbol: 'O', Description: 'REALTY INCOME CORP CASH DIV ON 100 SHS REC 11/01/24 PAY 11/15/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-11-06', Symbol: 'BND', Description: 'VANGUARD TOTAL BOND MARKET ETF CASH DIV ON 200 SHS REC 10/31/24 PAY 11/06/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-11-14', Symbol: 'AAPL', Description: 'APPLE INC CASH DIV ON 200 SHS REC 11/04/24 PAY 11/14/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },

    // 12月
    { TradeDate: '2024-12-13', Symbol: 'O', Description: 'REALTY INCOME CORP CASH DIV ON 100 SHS REC 12/02/24 PAY 12/13/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-12-05', Symbol: 'BND', Description: 'VANGUARD TOTAL BOND MARKET ETF CASH DIV ON 200 SHS REC 11/29/24 PAY 12/05/24 NON-RES TAX WITHHELD $5.00', Amount: 50.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-12-12', Symbol: 'MSFT', Description: 'MICROSOFT CORP CASH DIV ON 100 SHS REC 11/14/24 PAY 12/12/24 NON-RES TAX WITHHELD $7.50', Amount: 75.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-12-19', Symbol: 'VYM', Description: 'VANGUARD HIGH DIVIDEND YIELD ETF CASH DIV ON 300 SHS REC 12/09/24 PAY 12/19/24 NON-RES TAX WITHHELD $25.00', Amount: 250.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-12-16', Symbol: 'KO', Description: 'COCA-COLA CO CASH DIV ON 300 SHS REC 11/29/24 PAY 12/16/24 NON-RES TAX WITHHELD $15.00', Amount: 150.00, RecordType: 'Dividend', Action: 'DIVIDEND' },
    { TradeDate: '2024-12-31', Symbol: '', Description: 'INTEREST ON CREDIT BALANCE', Amount: 9.20, RecordType: 'Financial', Action: 'INTEREST' },
];

// 売却損益用のデモデータ（Gain/Loss CSV形式）- 複数取引/銘柄、合計30件
export const DEMO_GAINLOSS_DATA = [
    // NVDA - 3取引
    { Symbol: 'NVDA', Quantity: 20, PurchaseDate: '2023/01/15', TradeDate: '2024/03/10', Proceeds: 18400.00, Cost: 4200.00, Amount: 14200.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'NVDA', Quantity: 15, PurchaseDate: '2023/04/20', TradeDate: '2024/05/15', Proceeds: 14100.00, Cost: 4500.00, Amount: 9600.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'NVDA', Quantity: 10, PurchaseDate: '2023/08/10', TradeDate: '2024/06/20', Proceeds: 9800.00, Cost: 4000.00, Amount: 5800.00, WashSale: '', Term: 'Short Term' },
    // TSLA - 3取引
    { Symbol: 'TSLA', Quantity: 50, PurchaseDate: '2023/06/20', TradeDate: '2024/04/05', Proceeds: 12500.00, Cost: 10000.00, Amount: 2500.00, WashSale: '', Term: 'Short Term' },
    { Symbol: 'TSLA', Quantity: 30, PurchaseDate: '2023/02/15', TradeDate: '2024/03/20', Proceeds: 7800.00, Cost: 5400.00, Amount: 2400.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'TSLA', Quantity: 25, PurchaseDate: '2023/09/10', TradeDate: '2024/07/25', Proceeds: 6500.00, Cost: 5000.00, Amount: 1500.00, WashSale: '', Term: 'Short Term' },
    // AMD - 3取引
    { Symbol: 'AMD', Quantity: 100, PurchaseDate: '2023/05/10', TradeDate: '2024/02/15', Proceeds: 17500.00, Cost: 9500.00, Amount: 8000.00, WashSale: '', Term: 'Short Term' },
    { Symbol: 'AMD', Quantity: 80, PurchaseDate: '2022/12/05', TradeDate: '2024/04/10', Proceeds: 14400.00, Cost: 6400.00, Amount: 8000.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'AMD', Quantity: 60, PurchaseDate: '2023/07/20', TradeDate: '2024/08/05', Proceeds: 11100.00, Cost: 7200.00, Amount: 3900.00, WashSale: '', Term: 'Long Term' },
    // META - 3取引
    { Symbol: 'META', Quantity: 15, PurchaseDate: '2022/11/05', TradeDate: '2024/01/25', Proceeds: 7500.00, Cost: 1800.00, Amount: 5700.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'META', Quantity: 20, PurchaseDate: '2023/03/15', TradeDate: '2024/05/30', Proceeds: 9600.00, Cost: 4800.00, Amount: 4800.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'META', Quantity: 12, PurchaseDate: '2023/10/10', TradeDate: '2024/09/15', Proceeds: 5880.00, Cost: 4200.00, Amount: 1680.00, WashSale: '', Term: 'Short Term' },
    // GOOGL - 3取引
    { Symbol: 'GOOGL', Quantity: 30, PurchaseDate: '2022/09/15', TradeDate: '2024/06/12', Proceeds: 5400.00, Cost: 2700.00, Amount: 2700.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'GOOGL', Quantity: 25, PurchaseDate: '2023/01/20', TradeDate: '2024/04/25', Proceeds: 4500.00, Cost: 2750.00, Amount: 1750.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'GOOGL', Quantity: 40, PurchaseDate: '2023/06/05', TradeDate: '2024/08/20', Proceeds: 7200.00, Cost: 5600.00, Amount: 1600.00, WashSale: '', Term: 'Long Term' },
    // AMZN - 3取引
    { Symbol: 'AMZN', Quantity: 25, PurchaseDate: '2023/03/22', TradeDate: '2024/07/08', Proceeds: 4625.00, Cost: 2500.00, Amount: 2125.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'AMZN', Quantity: 35, PurchaseDate: '2022/10/15', TradeDate: '2024/02/28', Proceeds: 6475.00, Cost: 3150.00, Amount: 3325.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'AMZN', Quantity: 20, PurchaseDate: '2023/08/20', TradeDate: '2024/09/10', Proceeds: 3800.00, Cost: 2600.00, Amount: 1200.00, WashSale: '', Term: 'Long Term' },
    // MSFT - 3取引
    { Symbol: 'MSFT', Quantity: 40, PurchaseDate: '2023/04/18', TradeDate: '2024/08/25', Proceeds: 16800.00, Cost: 12000.00, Amount: 4800.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'MSFT', Quantity: 30, PurchaseDate: '2022/08/10', TradeDate: '2024/03/15', Proceeds: 12600.00, Cost: 7800.00, Amount: 4800.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'MSFT', Quantity: 25, PurchaseDate: '2023/11/05', TradeDate: '2024/10/20', Proceeds: 10500.00, Cost: 9250.00, Amount: 1250.00, WashSale: '', Term: 'Short Term' },
    // AAPL - 3取引
    { Symbol: 'AAPL', Quantity: 60, PurchaseDate: '2023/07/05', TradeDate: '2024/09/15', Proceeds: 12900.00, Cost: 9600.00, Amount: 3300.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'AAPL', Quantity: 50, PurchaseDate: '2022/06/20', TradeDate: '2024/01/30', Proceeds: 10750.00, Cost: 6500.00, Amount: 4250.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'AAPL', Quantity: 45, PurchaseDate: '2023/09/15', TradeDate: '2024/07/10', Proceeds: 9675.00, Cost: 7650.00, Amount: 2025.00, WashSale: '', Term: 'Short Term' },
    // CRM - 3取引
    { Symbol: 'CRM', Quantity: 35, PurchaseDate: '2023/10/30', TradeDate: '2024/10/28', Proceeds: 9800.00, Cost: 7000.00, Amount: 2800.00, WashSale: '', Term: 'Short Term' },
    { Symbol: 'CRM', Quantity: 40, PurchaseDate: '2022/12/15', TradeDate: '2024/05/20', Proceeds: 11200.00, Cost: 6800.00, Amount: 4400.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'CRM', Quantity: 28, PurchaseDate: '2023/05/25', TradeDate: '2024/08/30', Proceeds: 7840.00, Cost: 5040.00, Amount: 2800.00, WashSale: '', Term: 'Long Term' },
    // PLTR - 3取引
    { Symbol: 'PLTR', Quantity: 200, PurchaseDate: '2023/08/12', TradeDate: '2024/05/20', Proceeds: 5200.00, Cost: 3000.00, Amount: 2200.00, WashSale: '', Term: 'Short Term' },
    { Symbol: 'PLTR', Quantity: 300, PurchaseDate: '2022/11/20', TradeDate: '2024/02/15', Proceeds: 7800.00, Cost: 3600.00, Amount: 4200.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'PLTR', Quantity: 150, PurchaseDate: '2023/06/10', TradeDate: '2024/09/25', Proceeds: 3900.00, Cost: 2250.00, Amount: 1650.00, WashSale: '', Term: 'Long Term' },
];

// シミュレーター用のデモデータ（コピペ形式）- 20件
// 形式: Symbol \t Description \t Qty \t Days \t DateAcquired \t DateSold \t Proceeds \t Cost \t WS \t GainLoss
// Short Term と Long Term を含める
export const DEMO_SIMULATOR_DATA = `Short Term
NVDA	NVIDIA CORP	10	180	07/15/2023	01/11/2024	$9,200.00	$2,100.00	$0.00	$7,100.00
AAPL	APPLE INC	20	150	05/20/2023	10/17/2023	$4,500.00	$3,000.00	$0.00	$1,500.00
TSLA	TESLA INC	15	200	03/10/2023	09/26/2023	$3,900.00	$2,400.00	$0.00	$1,500.00
AMD	AMD INC	50	120	08/01/2023	11/29/2023	$8,500.00	$5,500.00	$0.00	$3,000.00
META	META PLATFORMS	25	90	09/15/2023	12/14/2023	$7,250.00	$5,000.00	$0.00	$2,250.00
PLTR	PALANTIR TECH	100	60	10/01/2023	11/30/2023	$2,500.00	$1,800.00	$0.00	$700.00
CRM	SALESFORCE INC	30	180	04/20/2023	10/17/2023	$7,800.00	$5,400.00	$0.00	$2,400.00
COIN	COINBASE GLOBAL	40	150	06/01/2023	10/29/2023	$6,400.00	$3,600.00	$0.00	$2,800.00

Long Term
MSFT	MICROSOFT CORP	15	400	08/10/2022	09/14/2023	$6,300.00	$4,500.00	$0.00	$1,800.00
GOOGL	ALPHABET INC	25	500	01/05/2022	05/19/2023	$5,000.00	$3,000.00	$0.00	$2,000.00
AMZN	AMAZON COM INC	20	450	02/15/2022	05/11/2023	$3,800.00	$2,200.00	$0.00	$1,600.00
NVDA	NVIDIA CORP	30	380	01/20/2022	02/04/2023	$27,000.00	$6,000.00	$0.00	$21,000.00
META	META PLATFORMS	18	420	11/05/2021	12/30/2022	$2,700.00	$6,300.00	$0.00	$-3,600.00
AAPL	APPLE INC	40	550	03/01/2021	09/02/2022	$7,200.00	$5,200.00	$0.00	$2,000.00
TSLA	TESLA INC	12	480	06/20/2021	10/13/2022	$2,640.00	$3,000.00	$0.00	$-360.00
AMD	AMD INC	60	400	04/15/2022	05/20/2023	$9,600.00	$5,400.00	$0.00	$4,200.00
GOOGL	ALPHABET INC	35	600	07/10/2021	03/01/2023	$4,900.00	$4,200.00	$0.00	$700.00
MSFT	MICROSOFT CORP	22	520	09/01/2021	02/03/2023	$7,700.00	$6,160.00	$0.00	$1,540.00
CRM	SALESFORCE INC	28	450	05/01/2022	07/25/2023	$6,720.00	$5,320.00	$0.00	$1,400.00
AMZN	AMAZON COM INC	15	380	10/15/2022	10/30/2023	$2,775.00	$2,100.00	$0.00	$675.00
`;
