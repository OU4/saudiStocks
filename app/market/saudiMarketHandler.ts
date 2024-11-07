// /app/market/saudiMarketHandler.ts
import { API_KEY, API_URL, SAUDI_SYMBOLS, SAUDI_MARKET } from '@/app/config/market';

interface ValuationMetrics {
  market_capitalization?: number;
  enterprise_value?: number;
  trailing_pe?: number;
  forward_pe?: number;
  peg_ratio?: number;
  price_to_sales_ttm?: number;
  price_to_book_mrq?: number;
  enterprise_to_revenue?: number;
  enterprise_to_ebitda?: number;
}

interface IncomeStatement {
  fiscal_date?: string;
  sales?: number;
  cost_of_goods?: number;
  gross_profit?: number;
  operating_expense?: {
    research_and_development?: number;
    selling_general_and_administrative?: number;
    other_operating_expenses?: number;
  };
  operating_income?: number;
  net_income?: number;
  eps_basic?: number;
  eps_diluted?: number;
  ebitda?: number;
}

interface BalanceSheet {
  fiscal_date?: string;
  assets?: {
    current_assets?: {
      cash_and_cash_equivalents?: number;
      accounts_receivable?: number;
      inventory?: number;
      total_current_assets?: number;
    };
    non_current_assets?: {
      properties?: number;
      investments_and_advances?: number;
      total_non_current_assets?: number;
    };
    total_assets?: number;
  };
  liabilities?: {
    current_liabilities?: {
      accounts_payable?: number;
      short_term_debt?: number;
      total_current_liabilities?: number;
    };
    non_current_liabilities?: {
      long_term_debt?: number;
      total_non_current_liabilities?: number;
    };
    total_liabilities?: number;
  };
  shareholders_equity?: {
    common_stock?: number;
    retained_earnings?: number;
    total_shareholders_equity?: number;
  };
}

interface CashFlow {
  fiscal_date?: string;
  operating_activities?: {
    net_income?: number;
    operating_cash_flow?: number;
  };
  investing_activities?: {
    capital_expenditures?: number;
    investing_cash_flow?: number;
  };
  financing_activities?: {
    financing_cash_flow?: number;
  };
  free_cash_flow?: number;
}

interface CompanyFundamentals {
  valuation_metrics: ValuationMetrics;
  income_statement: IncomeStatement;
  balance_sheet: BalanceSheet;
  cash_flow: CashFlow;
  financial_ratios: {
    gross_margin?: number;
    operating_margin?: number;
    profit_margin?: number;
    return_on_equity_ttm?: number;
    return_on_assets_ttm?: number;
    debt_to_equity?: number;
    current_ratio?: number;
    quick_ratio?: number;
  };
  dividend_info: {
    forward_dividend_rate?: number;
    forward_dividend_yield?: number;
    trailing_dividend_rate?: number;
    trailing_dividend_yield?: number;
    payout_ratio?: number;
    dividend_date?: string;
  };
}

interface SaudiQuote {
  symbol: string;
  name: string;
  name_ar?: string;
  price: number;
  change: number;
  percent_change: number;
  volume: number;
  timestamp: string;
  sector?: string;
  trading_info?: {
    open: number;
    high: number;
    low: number;
    previous_close: number;
    is_market_open: boolean;
    fifty_two_week?: {
      low: string;
      high: string;
      low_change: string;
      high_change: string;
      low_change_percent: string;
      high_change_percent: string;
      range: string;
    };
  };
  fundamentals?: CompanyFundamentals;
}

export class SaudiMarketHandler {
  private static readonly CACHE_DURATION = 300000; // 5 minutes
  private static cache = new Map<string, { data: any; timestamp: number }>();

  private static async fetchWithCache(url: string): Promise<any> {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      console.log('Fetching URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.cache.set(url, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  private static async fetchAllFundamentals(symbol: string): Promise<CompanyFundamentals> {
    try {
      // Fetch all fundamental data in parallel
      const [statistics, incomeStatement, balanceSheet, cashFlow] = await Promise.all([
        this.fetchWithCache(`${API_URL}/statistics?symbol=${symbol}&apikey=${API_KEY}`),
        this.fetchWithCache(`${API_URL}/income_statement?symbol=${symbol}&period=quarterly&apikey=${API_KEY}`),
        this.fetchWithCache(`${API_URL}/balance_sheet?symbol=${symbol}&period=quarterly&apikey=${API_KEY}`),
        this.fetchWithCache(`${API_URL}/cash_flow?symbol=${symbol}&period=quarterly&apikey=${API_KEY}`)
      ]);

      // Log the raw responses for debugging
      console.log('Raw Statistics:', JSON.stringify(statistics, null, 2));
      console.log('Raw Income Statement:', JSON.stringify(incomeStatement, null, 2));
      console.log('Raw Balance Sheet:', JSON.stringify(balanceSheet, null, 2));
      console.log('Raw Cash Flow:', JSON.stringify(cashFlow, null, 2));

      // Safely extract data from potentially nested arrays
      const stats = statistics?.statistics;
      const income = Array.isArray(incomeStatement?.income_statement) 
        ? incomeStatement.income_statement[0] 
        : incomeStatement?.income_statement;
      const balance = Array.isArray(balanceSheet?.balance_sheet)
        ? balanceSheet.balance_sheet[0]
        : balanceSheet?.balance_sheet;
      const cash = Array.isArray(cashFlow?.cash_flow)
        ? cashFlow.cash_flow[0]
        : cashFlow?.cash_flow;
      return {
        valuation_metrics: {
          market_capitalization: stats?.valuations_metrics?.market_capitalization,
          enterprise_value: stats?.valuations_metrics?.enterprise_value,
          trailing_pe: stats?.valuations_metrics?.trailing_pe,
          forward_pe: stats?.valuations_metrics?.forward_pe,
          peg_ratio: stats?.valuations_metrics?.peg_ratio,
          price_to_sales_ttm: stats?.valuations_metrics?.price_to_sales_ttm,
          price_to_book_mrq: stats?.valuations_metrics?.price_to_book_mrq,
          enterprise_to_revenue: stats?.valuations_metrics?.enterprise_to_revenue,
          enterprise_to_ebitda: stats?.valuations_metrics?.enterprise_to_ebitda
        },
        income_statement: {
          fiscal_date: income?.fiscal_date,
          sales: income?.sales,
          cost_of_goods: income?.cost_of_goods,
          gross_profit: income?.gross_profit,
          operating_expense: {
            research_and_development: income?.operating_expense?.research_and_development,
            selling_general_and_administrative: income?.operating_expense?.selling_general_and_administrative,
            other_operating_expenses: income?.operating_expense?.other_operating_expenses
          },
          operating_income: income?.operating_income,
          net_income: income?.net_income,
          eps_basic: income?.eps_basic,
          eps_diluted: income?.eps_diluted,
          ebitda: income?.ebitda
        },
        balance_sheet: {
          fiscal_date: balance?.fiscal_date,
          assets: {
            current_assets: {
              cash_and_cash_equivalents: balance?.assets?.current_assets?.cash_and_cash_equivalents,
              accounts_receivable: balance?.assets?.current_assets?.accounts_receivable,
              inventory: balance?.assets?.current_assets?.inventory,
              total_current_assets: balance?.assets?.current_assets?.total_current_assets
            },
            non_current_assets: balance?.assets?.non_current_assets,
            total_assets: balance?.assets?.total_assets
          },
          liabilities: {
            current_liabilities: balance?.liabilities?.current_liabilities,
            non_current_liabilities: balance?.liabilities?.non_current_liabilities,
            total_liabilities: balance?.liabilities?.total_liabilities
          },
          shareholders_equity: balance?.shareholders_equity
        },
        cash_flow: {
          fiscal_date: cash?.fiscal_date,
          operating_activities: cash?.operating_activities,
          investing_activities: cash?.investing_activities,
          financing_activities: cash?.financing_activities,
          free_cash_flow: cash?.free_cash_flow
        },
        financial_ratios: {
          gross_margin: stats?.financials?.gross_margin,
          operating_margin: stats?.financials?.operating_margin,
          profit_margin: stats?.financials?.profit_margin,
          return_on_equity_ttm: stats?.financials?.return_on_equity_ttm,
          return_on_assets_ttm: stats?.financials?.return_on_assets_ttm,
          debt_to_equity: balance?.liabilities?.total_liabilities / balance?.shareholders_equity?.total_shareholders_equity,
          current_ratio: balance?.assets?.current_assets?.total_current_assets / balance?.liabilities?.current_liabilities?.total_current_liabilities,
          quick_ratio: (
            (balance?.assets?.current_assets?.cash_and_cash_equivalents || 0) +
            (balance?.assets?.current_assets?.accounts_receivable || 0)
          ) / (balance?.liabilities?.current_liabilities?.total_current_liabilities || 1)
        },
        dividend_info: {
          forward_dividend_rate: stats?.dividends_and_splits?.forward_annual_dividend_rate,
          forward_dividend_yield: stats?.dividends_and_splits?.forward_annual_dividend_yield,
          trailing_dividend_rate: stats?.dividends_and_splits?.trailing_annual_dividend_rate,
          trailing_dividend_yield: stats?.dividends_and_splits?.trailing_annual_dividend_yield,
          payout_ratio: stats?.dividends_and_splits?.payout_ratio,
          dividend_date: stats?.dividends_and_splits?.dividend_date
        }
      };
    } catch (error) {
      console.error(`Error fetching fundamentals for ${symbol}:`, error);
      return null;
    }
  }

  private static async getQuoteData(symbol: string): Promise<SaudiQuote | null> {
    try {
      const formattedSymbol = this.formatTadawulSymbol(symbol);
      const stockInfo = SAUDI_SYMBOLS.find(s => s.symbol === formattedSymbol || s.tickerSymbol === symbol);
      
      if (!stockInfo) {
        console.log('Stock not found:', symbol);
        return null;
      }

      // Fetch quote and fundamentals in parallel
      const [quoteData, fundamentals] = await Promise.all([
        this.fetchWithCache(`${API_URL}/quote?symbol=${formattedSymbol}&apikey=${API_KEY}`),
        this.fetchAllFundamentals(formattedSymbol)
      ]);

      if (!quoteData) {
        throw new Error('Failed to fetch quote data');
      }

      return {
        symbol: stockInfo.tickerSymbol,
        name: stockInfo.name,
        name_ar: stockInfo.name_ar,
        price: this.safeParseNumber(quoteData.close || quoteData.price),
        change: this.safeParseNumber(quoteData.change),
        percent_change: this.safeParseNumber(quoteData.percent_change),
        volume: this.safeParseNumber(quoteData.volume),
        timestamp: this.formatTimestamp(quoteData.timestamp),
        sector: stockInfo.sector,
        trading_info: {
          open: this.safeParseNumber(quoteData.open),
          high: this.safeParseNumber(quoteData.high),
          low: this.safeParseNumber(quoteData.low),
          previous_close: this.safeParseNumber(quoteData.previous_close),
          is_market_open: quoteData.is_market_open || false,
          fifty_two_week: quoteData.fifty_two_week
        },
        fundamentals
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  private static formatTadawulSymbol(symbol: string): string {
    const cleanSymbol = symbol.replace(/\.(SAU|TADAWUL)$/, '');
    return `${cleanSymbol}:TADAWUL`;
  }

  private static safeParseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  private static formatTimestamp(timestamp: number | string): string {
    if (typeof timestamp === 'number') {
      return new Date(timestamp * 1000).toISOString();
    }
    return timestamp || new Date().toISOString();
  }

  static async analyzeMentionedCompanies(text: string): Promise<{
    companies: SaudiQuote[];
    sectors: Set<string>;
  }> {
    try {
      const mentionedStocks = SAUDI_SYMBOLS.filter(stock =>
        text.toLowerCase().includes(stock.name.toLowerCase()) ||
        text.includes(stock.tickerSymbol) ||
        (stock.name_ar && text.includes(stock.name_ar))
      );

      console.log('Found mentioned stocks:', mentionedStocks);

      const quotesPromises = mentionedStocks.map(stock => 
        this.getQuoteData(stock.tickerSymbol)
      );
      
      const quotes = (await Promise.all(quotesPromises)).filter((quote): quote is SaudiQuote => quote !== null);

      return {
        companies: quotes,
        sectors: new Set(mentionedStocks.map(stock => stock.sector))
      };
    } catch (error) {
      console.error('Error analyzing mentioned companies:', error);
      return {
        companies: [],
        sectors: new Set()
      };
    }
  }

  static async getMarketOverview(): Promise<any> {
    try {
      const mainSymbols = [
        '1120', // Al Rajhi Bank
        '2222', // Saudi Aramco
        '7010', // STC
        '2010'  // SABIC
      ];

      const quotesPromises = mainSymbols.map(symbol => this.getQuoteData(symbol));
      const quotes = (await Promise.all(quotesPromises)).filter(quote => quote !== null);

      return {
        quotes,
        market_info: SAUDI_MARKET,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching market overview:', error);
      return null;
    }
  }
}