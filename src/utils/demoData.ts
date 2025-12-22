
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

// 売却損益用のデモデータ（Gain/Loss CSV形式）
export const DEMO_GAINLOSS_DATA = [
    { Symbol: 'NVDA', Quantity: 20, PurchaseDate: '2023/01/15', TradeDate: '2024/03/10', Proceeds: 18400.00, Cost: 4200.00, Amount: 14200.00, WashSale: '', Term: 'Long Term' },
    { Symbol: 'TSLA', Quantity: 50, PurchaseDate: '2023/06/20', TradeDate: '2024/04/05', Proceeds: 12500.00, Cost: 10000.00, Amount: 2500.00, WashSale: '', Term: 'Short Term' },
    { Symbol: 'AMD', Quantity: 100, PurchaseDate: '2023/05/10', TradeDate: '2024/02/15', Proceeds: 17500.00, Cost: 9500.00, Amount: 8000.00, WashSale: '', Term: 'Short Term' },
    { Symbol: 'PLTR', Quantity: 200, PurchaseDate: '2023/08/12', TradeDate: '2024/05/20', Proceeds: 5200.00, Cost: 3000.00, Amount: 2200.00, WashSale: '', Term: 'Short Term' },
    { Symbol: 'META', Quantity: 15, PurchaseDate: '2022/11/05', TradeDate: '2024/01/25', Proceeds: 7500.00, Cost: 1800.00, Amount: 5700.00, WashSale: '', Term: 'Long Term' },
];

// シミュレーター用のデモデータ（コピペ形式）
// 形式: Symbol \t Description \t Qty \t Days \t DateAcquired \t DateSold \t Proceeds \t Cost \t WS \t GainLoss
// Short Term と Long Term を含める
export const DEMO_SIMULATOR_DATA = `Short Term
NVDA	NVIDIA CORP	10	365	01/15/2023	05/31/2023	$9,200.00	$2,100.00	$0.00	$7,100.00
AAPL	APPLE INC	20	150	05/20/2023	10/31/2023	$4,500.00	$3,000.00	$0.00	$1,500.00

Long Term
MSFT	MICROSOFT CORP	15	400	08/10/2022	12/31/2023	$6,300.00	$4,500.00	$0.00	$1,800.00
GOOGL	ALPHABET INC	25	500	01/05/2022	06/30/2023	$5,000.00	$3,000.00	$0.00	$2,000.00
`;
