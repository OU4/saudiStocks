import { API_KEY, API_URL, SAUDI_SYMBOLS } from '@/app/config/market';

interface FundamentalData {
  symbol: string;
  name: string;
  sector: string;
  valuation_metrics: {
    market_capitalization?: number;
    enterprise_value?: number;
    trailing_pe?: number;
    forward_pe?: number;
    peg_ratio?: number;
    price_to_sales_ttm?: number;
    price_to_book_mrq?: number;
    enterprise_to_revenue?: number;
    enterprise_to_ebitda?: number;
  };
  financials: {
    gross_margin?: number;
    profit_margin?: number;
    operating_margin?: number;
    return_on_assets_ttm?: number;
    return_on_equity_ttm?: number;
    income_statement?: {
      revenue_ttm?: number;
      revenue_per_share_ttm?: number;
      quarterly_revenue_growth?: number;
      gross_profit_ttm?: number;
      ebitda?: number;
      net_income_to_common_ttm?: number;
      diluted_eps_ttm?: number;
      quarterly_earnings_growth_yoy?: number;
    };
    balance_sheet?: {
      total_cash_mrq?: number;
      total_cash_per_share_mrq?: number;
      total_debt_mrq?: number;
      total_debt_to_equity_mrq?: number;
      current_ratio_mrq?: number;
      book_value_per_share_mrq?: number;
    };
    cash_flow?: {
      operating_cash_flow_ttm?: number;
      levered_free_cash_flow_ttm?: number;
    };
  };
  dividends?: {
    forward_annual_dividend_rate?: number;
    forward_annual_dividend_yield?: number;
    trailing_annual_dividend_rate?: number;
    trailing_annual_dividend_yield?: number;
    five_year_average_dividend_yield?: number;
    payout_ratio?: number;
    dividend_date?: string;
    ex_dividend_date?: string;
  };
  stock_statistics?: {
    shares_outstanding?: number;
    float_shares?: number;
    avg_volume_10d?: number;
    avg_volume_90d?: number;
    short_ratio?: number;
    percent_held_by_insiders?: number;
    percent_held_by_institutions?: number;
  };
}

interface BalanceSheetResponse {
  meta: {
    symbol: string;
    name: string;
    currency: string;
    exchange: string;
    mic_code: string;
    exchange_timezone: string;
    period: string;
  };
  balance_sheet: Array<{
    fiscal_date: string;
    assets: {
      current_assets: {
        cash: number;
        cash_equivalents: number;
        cash_and_cash_equivalents: number;
        other_short_term_investments: number;
        accounts_receivable: number;
        other_receivables: number;
        inventory: number;
        prepaid_assets: number | null;
        restricted_cash: number | null;
        assets_held_for_sale: number | null;
        hedging_assets: number | null;
        other_current_assets: number;
        total_current_assets: number;
      };
      non_current_assets: {
        properties: number;
        land_and_improvements: number;
        machinery_furniture_equipment: number;
        construction_in_progress: number | null;
        leases: number;
        accumulated_depreciation: number;
        goodwill: number | null;
        investment_properties: number | null;
        financial_assets: number | null;
        intangible_assets: number | null;
        investments_and_advances: number;
        other_non_current_assets: number;
        total_non_current_assets: number;
      };
      total_assets: number;
    };
    liabilities: {
      current_liabilities: {
        accounts_payable: number;
        accrued_expenses: number | null;
        short_term_debt: number;
        deferred_revenue: number;
        tax_payable: number | null;
        pensions: number | null;
        other_current_liabilities: number;
        total_current_liabilities: number;
      };
      non_current_liabilities: {
        long_term_provisions: number | null;
        long_term_debt: number;
        provision_for_risks_and_charges: number;
        deferred_liabilities: number | null;
        derivative_product_liabilities: number | null;
        other_non_current_liabilities: number;
        total_non_current_liabilities: number;
      };
      total_liabilities: number;
    };
    shareholders_equity: {
      common_stock: number;
      retained_earnings: number;
      other_shareholders_equity: number;
      total_shareholders_equity: number;
      additional_paid_in_capital: number | null;
      treasury_stock: number | null;
      minority_interest: number | null;
    };
  }>;
}

interface CashFlowResponse {
  meta: {
    symbol: string;
    name: string;
    currency: string;
    exchange: string;
    mic_code: string;
    exchange_timezone: string;
    period: string;
  };
  cash_flow: Array<{
    fiscal_date: string;
    quarter?: number;
    operating_activities: {
      net_income: number;
      depreciation: number;
      deferred_taxes: number;
      stock_based_compensation: number;
      other_non_cash_items: number;
      accounts_receivable: number;
      accounts_payable: number;
      other_assets_liabilities: number;
      operating_cash_flow: number;
    };
    investing_activities: {
      capital_expenditures: number;
      net_intangibles: number | null;
      net_acquisitions: number | null;
      purchase_of_investments: number;
      sale_of_investments: number;
      other_investing_activity: number;
      investing_cash_flow: number;
    };
    financing_activities: {
      long_term_debt_issuance: number | null;
      long_term_debt_payments: number;
      short_term_debt_issuance: number;
      common_stock_issuance: number | null;
      common_stock_repurchase: number;
      common_dividends: number;
      other_financing_charges: number;
      financing_cash_flow: number;
    };
    end_cash_position: number;
    income_tax_paid: number;
    interest_paid: number;
    free_cash_flow: number;
  }>;
}



interface IncomeStatementResponse {
  meta: {
    symbol: string;
    name: string;
    currency: string;
    exchange: string;
    mic_code: string;
    exchange_timezone: string;
    period: string;
  };
  income_statement: Array<{
    fiscal_date: string;
    quarter?: number;
    year?: number;
    sales: number;
    cost_of_goods: number;
    gross_profit: number;
    operating_expense: {
      research_and_development: number;
      selling_general_and_administrative: number;
      other_operating_expenses: number | null;
    };
    operating_income: number;
    non_operating_interest: {
      income: number;
      expense: number;
    };
    other_income_expense: number;
    pretax_income: number;
    income_tax: number;
    net_income: number;
    eps_basic: number;
    eps_diluted: number;
    basic_shares_outstanding: number;
    diluted_shares_outstanding: number;
    ebitda: number;
    net_income_continuous_operations: number | null;
    minority_interests: number | null;
    preferred_stock_dividends: number | null;
  }>;
}

// app/lib/services/saudiFundamentals.ts

export class SaudiFundamentals {
  private static readonly CACHE_DURATION = 300000; // 5 minutes
  private static cache: Map<string, { data: any; timestamp: number }> = new Map();

  static async getFundamental(symbol: string): Promise<any> {
    try {
      const stockInfo = SAUDI_SYMBOLS.find(s => s.symbol === symbol);
      if (!stockInfo) return null;

      const formattedSymbol = `${stockInfo.tickerSymbol}:TADAWUL`;
      
      // First try to get from cache
      const cacheKey = `fundamentals_${formattedSymbol}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Fetch fundamental data with retry logic
      const data = await this.fetchFundamentalData(formattedSymbol);
      if (!data) return null;

      // Format and cache the response
      const fundamentals = this.formatFundamentalData(data, stockInfo);
      this.addToCache(cacheKey, fundamentals);

      return fundamentals;
    } catch (error) {
      console.error(`Error fetching fundamental data for ${symbol}:`, error);
      return null;
    }
  }

  private static async fetchFundamentalData(symbol: string, retries = 2): Promise<any> {
    try {
      const url = `${API_URL}/statistics?symbol=${symbol}&apikey=${API_KEY}`;
      console.log('Fetching fundamentals for:', symbol);

      const response = await fetch(url);
      const data = await response.json();

      // Check for valid data structure
      if (!data || data.status === 'error' || !data.statistics) {
        throw new Error('Invalid data structure received');
      }

      return data;
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying fundamental data fetch for ${symbol}, attempts left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.fetchFundamentalData(symbol, retries - 1);
      }
      throw error;
    }
  }

  static async getSectorAverages(sector: string): Promise<any> {
    try {
      // Get all stocks in the sector
      const sectorStocks = SAUDI_SYMBOLS.filter(stock => stock.sector === sector);
      if (!sectorStocks.length) return {};

      // Get fundamentals with basic error handling for each stock
      const fundamentalsPromises = sectorStocks.map(stock => 
        this.getFundamental(stock.symbol)
          .catch(error => {
            console.warn(`Error fetching fundamentals for ${stock.symbol}:`, error);
            return null;
          })
      );

      const results = await Promise.all(fundamentalsPromises);
      const validResults = results.filter(result => result !== null);

      if (validResults.length === 0) {
        console.warn(`No valid fundamental data found for sector: ${sector}`);
        return this.getDefaultSectorMetrics();
      }

      return this.calculateSectorAverages(validResults);
    } catch (error) {
      console.error(`Error calculating sector averages for ${sector}:`, error);
      return this.getDefaultSectorMetrics();
    }
  }

  private static formatFundamentalData(data: any, stockInfo: any) {
    const stats = data.statistics || {};
    
    return {
      symbol: stockInfo.symbol,
      name: stockInfo.name,
      sector: stockInfo.sector,
      metrics: {
        valuation: {
          market_cap: this.safeNumber(stats.market_capitalization),
          pe_ratio: this.safeNumber(stats.trailing_pe),
          price_to_book: this.safeNumber(stats.price_to_book_mrq),
          ev_to_ebitda: this.safeNumber(stats.enterprise_to_ebitda)
        },
        profitability: {
          gross_margin: this.safeNumber(stats.gross_margin),
          operating_margin: this.safeNumber(stats.operating_margin),
          net_margin: this.safeNumber(stats.profit_margin),
          roe: this.safeNumber(stats.return_on_equity_ttm),
          roa: this.safeNumber(stats.return_on_assets_ttm)
        },
        growth: {
          revenue_growth: this.safeNumber(stats.quarterly_revenue_growth),
          earnings_growth: this.safeNumber(stats.quarterly_earnings_growth)
        }
      }
    };
  }

  private static getDefaultSectorMetrics() {
    return {
      averages: {
        pe_ratio: null,
        market_cap: null,
        price_to_book: null,
        operating_margin: null,
        net_margin: null,
        roe: null
      },
      status: 'limited_data'
    };
  }

  private static safeNumber(value: any): number | null {
    if (value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  private static getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private static addToCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private static calculateSectorAverages(results: any[]): any {
    const metrics = [
      'pe_ratio', 'market_cap', 'price_to_book', 
      'operating_margin', 'net_margin', 'roe'
    ];

    const sums = {};
    const counts = {};

    results.forEach(result => {
      if (!result?.metrics) return;

      metrics.forEach(metric => {
        const value = this.getMetricValue(result.metrics, metric);
        if (value !== null) {
          sums[metric] = (sums[metric] || 0) + value;
          counts[metric] = (counts[metric] || 0) + 1;
        }
      });
    });

    const averages = {};
    metrics.forEach(metric => {
      averages[metric] = counts[metric] ? sums[metric] / counts[metric] : null;
    });

    return {
      averages,
      status: 'success',
      sample_size: results.length
    };
  }

  private static getMetricValue(metrics: any, metric: string): number | null {
    const paths = {
      pe_ratio: ['valuation', 'pe_ratio'],
      market_cap: ['valuation', 'market_cap'],
      price_to_book: ['valuation', 'price_to_book'],
      operating_margin: ['profitability', 'operating_margin'],
      net_margin: ['profitability', 'net_margin'],
      roe: ['profitability', 'roe']
    };

    const path = paths[metric];
    if (!path) return null;

    let value = metrics;
    for (const key of path) {
      value = value?.[key];
      if (value === undefined || value === null) return null;
    }

    return this.safeNumber(value);
  }
}