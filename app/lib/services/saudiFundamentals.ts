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

export class SaudiFundamentals {
  private static readonly CACHE_DURATION = 300000; // 5 minutes
  private static cache: Map<string, { data: FundamentalData; timestamp: number }> = new Map();

  private static async fetchWithCache(url: string): Promise<any> {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.cache.set(url, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  static async getFundamental(symbol: string): Promise<FundamentalData | null> {
    try {
      const stockInfo = SAUDI_SYMBOLS.find(s => s.symbol === symbol);
      if (!stockInfo) return null;

      const formattedSymbol = stockInfo.tickerSymbol;
      
      // Fetch statistics from Twelve Data API
      const url = `${API_URL}/statistics?symbol=${formattedSymbol}&apikey=${API_KEY}`;
      const response = await this.fetchWithCache(url);

      if (!response || !response.statistics) {
        throw new Error('Invalid response from statistics endpoint');
      }

      const stats = response.statistics;

      // Transform API response into our FundamentalData structure
      const fundamentalData: FundamentalData = {
        symbol: stockInfo.symbol,
        name: stockInfo.name,
        sector: stockInfo.sector,
        valuation_metrics: {
          market_capitalization: stats.valuations_metrics?.market_capitalization,
          enterprise_value: stats.valuations_metrics?.enterprise_value,
          trailing_pe: stats.valuations_metrics?.trailing_pe,
          forward_pe: stats.valuations_metrics?.forward_pe,
          peg_ratio: stats.valuations_metrics?.peg_ratio,
          price_to_sales_ttm: stats.valuations_metrics?.price_to_sales_ttm,
          price_to_book_mrq: stats.valuations_metrics?.price_to_book_mrq,
          enterprise_to_revenue: stats.valuations_metrics?.enterprise_to_revenue,
          enterprise_to_ebitda: stats.valuations_metrics?.enterprise_to_ebitda
        },
        financials: {
          gross_margin: stats.financials?.gross_margin,
          profit_margin: stats.financials?.profit_margin,
          operating_margin: stats.financials?.operating_margin,
          return_on_assets_ttm: stats.financials?.return_on_assets_ttm,
          return_on_equity_ttm: stats.financials?.return_on_equity_ttm,
          income_statement: {
            revenue_ttm: stats.financials?.income_statement?.revenue_ttm,
            revenue_per_share_ttm: stats.financials?.income_statement?.revenue_per_share_ttm,
            quarterly_revenue_growth: stats.financials?.income_statement?.quarterly_revenue_growth,
            gross_profit_ttm: stats.financials?.income_statement?.gross_profit_ttm,
            ebitda: stats.financials?.income_statement?.ebitda,
            net_income_to_common_ttm: stats.financials?.income_statement?.net_income_to_common_ttm,
            diluted_eps_ttm: stats.financials?.income_statement?.diluted_eps_ttm,
            quarterly_earnings_growth_yoy: stats.financials?.income_statement?.quarterly_earnings_growth_yoy
          },
          balance_sheet: {
            total_cash_mrq: stats.financials?.balance_sheet?.total_cash_mrq,
            total_cash_per_share_mrq: stats.financials?.balance_sheet?.total_cash_per_share_mrq,
            total_debt_mrq: stats.financials?.balance_sheet?.total_debt_mrq,
            total_debt_to_equity_mrq: stats.financials?.balance_sheet?.total_debt_to_equity_mrq,
            current_ratio_mrq: stats.financials?.balance_sheet?.current_ratio_mrq,
            book_value_per_share_mrq: stats.financials?.balance_sheet?.book_value_per_share_mrq
          },
          cash_flow: {
            operating_cash_flow_ttm: stats.financials?.cash_flow?.operating_cash_flow_ttm,
            levered_free_cash_flow_ttm: stats.financials?.cash_flow?.levered_free_cash_flow_ttm
          }
        },
        dividends: {
          forward_annual_dividend_rate: stats.dividends_and_splits?.forward_annual_dividend_rate,
          forward_annual_dividend_yield: stats.dividends_and_splits?.forward_annual_dividend_yield,
          trailing_annual_dividend_rate: stats.dividends_and_splits?.trailing_annual_dividend_rate,
          trailing_annual_dividend_yield: stats.dividends_and_splits?.trailing_annual_dividend_yield,
          five_year_average_dividend_yield: stats.dividends_and_splits?.["5_year_average_dividend_yield"],
          payout_ratio: stats.dividends_and_splits?.payout_ratio,
          dividend_date: stats.dividends_and_splits?.dividend_date,
          ex_dividend_date: stats.dividends_and_splits?.ex_dividend_date
        },
        stock_statistics: {
          shares_outstanding: stats.stock_statistics?.shares_outstanding,
          float_shares: stats.stock_statistics?.float_shares,
          avg_volume_10d: stats.stock_statistics?.avg_10_volume,
          avg_volume_90d: stats.stock_statistics?.avg_90_volume,
          short_ratio: stats.stock_statistics?.short_ratio,
          percent_held_by_insiders: stats.stock_statistics?.percent_held_by_insiders,
          percent_held_by_institutions: stats.stock_statistics?.percent_held_by_institutions
        }
      };

      return fundamentalData;

    } catch (error) {
      console.error(`Error fetching fundamental data for ${symbol}:`, error);
      return null;
    }
  }

  static async getSectorAverages(sector: string): Promise<{
    avg_pe?: number;
    avg_market_cap?: number;
    avg_dividend_yield?: number;
    avg_revenue_growth?: number;
    best_performer?: { symbol: string; name: string; growth: number };
    worst_performer?: { symbol: string; name: string; growth: number };
  }> {
    try {
      const sectorStocks = SAUDI_SYMBOLS.filter(stock => stock.sector === sector);
      const fundamentalsPromises = sectorStocks.map(stock => this.getFundamental(stock.symbol));
      const results = await Promise.all(fundamentalsPromises);
      
      const validResults = results.filter((result): result is FundamentalData => result !== null);
      
      if (validResults.length === 0) {
        return {};
      }

      const sectorData = {
        avg_pe: this.calculateAverage(validResults.map(r => r.valuation_metrics?.trailing_pe)),
        avg_market_cap: this.calculateAverage(validResults.map(r => r.valuation_metrics?.market_capitalization)),
        avg_dividend_yield: this.calculateAverage(validResults.map(r => r.dividends?.trailing_annual_dividend_yield)),
        avg_revenue_growth: this.calculateAverage(validResults.map(r => r.financials?.income_statement?.quarterly_revenue_growth))
      };

      // Find best and worst performers based on revenue growth
      const performanceData = validResults
        .map(result => ({
          symbol: result.symbol,
          name: result.name,
          growth: result.financials?.income_statement?.quarterly_revenue_growth || 0
        }))
        .sort((a, b) => b.growth - a.growth);

      return {
        ...sectorData,
        best_performer: performanceData[0],
        worst_performer: performanceData[performanceData.length - 1]
      };

    } catch (error) {
      console.error(`Error calculating sector averages for ${sector}:`, error);
      return {};
    }
  }

  private static calculateAverage(numbers: (number | undefined)[]): number | undefined {
    const validNumbers = numbers.filter((n): n is number => typeof n === 'number' && !isNaN(n));
    if (validNumbers.length === 0) return undefined;
    return validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length;
  }
}