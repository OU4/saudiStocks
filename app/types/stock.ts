// app/types/stock.ts


interface ProfileData {
    name: string;
    exchange: string;
    mic_code: string;
    sector: string;
    industry: string;
    employees: number;
    website: string;
    description: string;
    type: string;
    CEO: string;
    address: string;
    address2: string;
    city: string;
    zip: string;
    state: string;
    country: string;
    phone: string;
  }

// Quote data interface
export interface QuoteData {
    symbol: string;
    name: string;
    close: string;
    change: string;
    percent_change: string;
    high: string;
    low: string;
    open: string;
    volume: string;
  }
  
  // Time series data interface
  export interface TimeSeriesData {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }
  
  // Valuation metrics interface
  export interface ValuationMetrics {
    market_capitalization: number;    // Market cap
    enterprise_value: number;         // Enterprise value (EV)
    trailing_pe: number;             // Price to trailing earnings ratio (TTM)
    forward_pe: number;              // Price to forward earnings ratio
    peg_ratio: number;               // P/E to growth ratio
    price_to_sales_ttm: number;      // Price to sales ratio (TTM)
    price_to_book_mrq: number;       // Price to book ratio
    enterprise_to_revenue: number;    // Enterprise value to revenue
    enterprise_to_ebitda: number;    // Enterprise value to EBITDA
  }
  
  // Financial statement interfaces
  export interface IncomeStatement {
    revenue_ttm: number;              // Trailing 12m revenue
    revenue_per_share_ttm: number;    // Revenue per share
    quarterly_revenue_growth: number;  // QoQ revenue growth
    gross_profit_ttm: number;         // Gross profit
    ebitda: number;                   // EBITDA
    net_income_to_common_ttm: number; // Net income
    diluted_eps_ttm: number;          // Diluted EPS
    quarterly_earnings_growth_yoy: number; // YoY earnings growth
  }
  
  export interface BalanceSheet {
    total_cash_mrq: number;           // Total cash
    total_cash_per_share_mrq: number; // Cash per share
    total_debt_mrq: number;           // Total debt
    total_debt_to_equity_mrq: number; // Debt/Equity ratio
    current_ratio_mrq: number;        // Current ratio
    book_value_per_share_mrq: number; // Book value per share
  }
  
  export interface CashFlow {
    operating_cash_flow_ttm: number;   // Operating cash flow
    levered_free_cash_flow_ttm: number; // Free cash flow
  }
  
  export interface Financials {
    fiscal_year_ends: string;         // Last 12-month period end
    most_recent_quarter: string;      // Most recent quarter end
    gross_margin: number;            // Gross margin
    profit_margin: number;           // Net profit margin
    operating_margin: number;        // Operating margin
    return_on_assets_ttm: number;    // Return on assets
    return_on_equity_ttm: number;    // Return on equity
    income_statement: IncomeStatement;
    balance_sheet: BalanceSheet;
    cash_flow: CashFlow;
  }
  
  // Stock statistics interfaces
  export interface StockStatistics {
    shares_outstanding: number;
    float_shares: number;
    avg_10_volume: number;
    avg_90_volume: number;
  }
  
  export interface StockPriceSummary {
    fifty_two_week_low: number;
    fifty_two_week_high: number;
    fifty_two_week_change: number;
    beta: number;
    day_50_ma: number;
    day_200_ma: number;
  }
  
  export interface DividendData {
    forward_annual_dividend_rate: number;
    forward_annual_dividend_yield: number;
    trailing_annual_dividend_rate: number;
    trailing_annual_dividend_yield: number;
    "5_year_average_dividend_yield": number;
    payout_ratio: number;
    dividend_date: string;
    ex_dividend_date: string;
  }
  
  // Main stock data interface
  export interface StockData {
    quote: {
    symbol: string;
    name: string;
    close: string;
    change: string;
    percent_change: string;
    high: string;
    low: string;
    open: string;
    volume: string;
  };
  timeSeries: {
    values: Array<{
      datetime: string;
      open: string;
      high: string;
      low: string;
      close: string;
      volume: string;
    }>;
  };
  statistics: any;
  profile?: ProfileData};
//     statistics: {
//       valuations_metrics: ValuationMetrics;
//       financials: Financials;
//       stock_statistics: StockStatistics;
//       stock_price_summary: StockPriceSummary;
//       dividends_and_splits: DividendData;
//     };
//   }
  
  // Helper interface for metric display
  export interface MetricItem {
    label: string;
    value: number | string | null;
    format?: 'number' | 'percent' | 'currency' | 'compact';
    description?: string;
  }
  
  // Helper function to format numbers based on type
  export function formatValuationMetric(
    value: number | undefined | null,
    format: 'number' | 'percent' | 'currency' | 'compact' = 'number'
  ): string {
    if (value === null || value === undefined || isNaN(value)) return '—';
    
    switch (format) {
      case 'number':
        return value.toFixed(2);
      case 'percent':
        return `${(value * 100).toFixed(2)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'SAR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'compact':
        return new Intl.NumberFormat('en-US', { 
          notation: 'compact',
          compactDisplay: 'short' 
        }).format(value);
      default:
        return value.toString();
    }
  }
  
  // Get formatted valuation metrics for display
  export function getValuationMetricsDisplay(metrics: ValuationMetrics): Array<MetricItem> {
    return [
      {
        label: 'P/E (TTM)',
        value: metrics.trailing_pe,
        format: 'number',
        description: 'Price to trailing earnings ratio'
      },
      {
        label: 'Forward P/E',
        value: metrics.forward_pe,
        format: 'number',
        description: 'Price to forward earnings ratio'
      },
      {
        label: 'PEG Ratio',
        value: metrics.peg_ratio,
        format: 'number',
        description: 'P/E ratio divided by growth rate'
      },
      {
        label: 'P/S (TTM)',
        value: metrics.price_to_sales_ttm,
        format: 'number',
        description: 'Price to sales ratio'
      },
      {
        label: 'P/B',
        value: metrics.price_to_book_mrq,
        format: 'number',
        description: 'Price to book ratio'
      },
      {
        label: 'EV/EBITDA',
        value: metrics.enterprise_to_ebitda,
        format: 'number',
        description: 'Enterprise value to EBITDA ratio'
      }
    ];
  }
  
  // Get formatted margin metrics for display
  export function getMarginMetricsDisplay(financials: Financials): Array<MetricItem> {
    return [
      {
        label: 'Gross Margin',
        value: financials.gross_margin,
        format: 'percent',
        description: 'Gross profit as a percentage of revenue'
      },
      {
        label: 'Operating Margin',
        value: financials.operating_margin,
        format: 'percent',
        description: 'Operating income as a percentage of revenue'
      },
      {
        label: 'Profit Margin',
        value: financials.profit_margin,
        format: 'percent',
        description: 'Net income as a percentage of revenue'
      }
    ];
  }

  // Validation helper function for valuation metrics
export function validateValuationMetrics(data: any): ValuationMetrics {
    return {
      market_capitalization: Number(data?.market_capitalization) || 0,
      enterprise_value: Number(data?.enterprise_value) || 0,
      trailing_pe: Number(data?.trailing_pe) || 0,
      forward_pe: Number(data?.forward_pe) || 0,
      peg_ratio: Number(data?.peg_ratio) || 0,
      price_to_sales_ttm: Number(data?.price_to_sales_ttm) || 0,
      price_to_book_mrq: Number(data?.price_to_book_mrq) || 0,
      enterprise_to_revenue: Number(data?.enterprise_to_revenue) || 0,
      enterprise_to_ebitda: Number(data?.enterprise_to_ebitda) || 0
    };
  }
  
  // Validation helper function for financial metrics
  export function validateFinancials(data: any): Financials {
    return {
      fiscal_year_ends: data?.fiscal_year_ends || '',
      most_recent_quarter: data?.most_recent_quarter || '',
      gross_margin: Number(data?.gross_margin) || 0,
      profit_margin: Number(data?.profit_margin) || 0,
      operating_margin: Number(data?.operating_margin) || 0,
      return_on_assets_ttm: Number(data?.return_on_assets_ttm) || 0,
      return_on_equity_ttm: Number(data?.return_on_equity_ttm) || 0,
      income_statement: {
        revenue_ttm: Number(data?.income_statement?.revenue_ttm) || 0,
        revenue_per_share_ttm: Number(data?.income_statement?.revenue_per_share_ttm) || 0,
        quarterly_revenue_growth: Number(data?.income_statement?.quarterly_revenue_growth) || 0,
        gross_profit_ttm: Number(data?.income_statement?.gross_profit_ttm) || 0,
        ebitda: Number(data?.income_statement?.ebitda) || 0,
        net_income_to_common_ttm: Number(data?.income_statement?.net_income_to_common_ttm) || 0,
        diluted_eps_ttm: Number(data?.income_statement?.diluted_eps_ttm) || 0,
        quarterly_earnings_growth_yoy: Number(data?.income_statement?.quarterly_earnings_growth_yoy) || 0
      },
      balance_sheet: {
        total_cash_mrq: Number(data?.balance_sheet?.total_cash_mrq) || 0,
        total_cash_per_share_mrq: Number(data?.balance_sheet?.total_cash_per_share_mrq) || 0,
        total_debt_mrq: Number(data?.balance_sheet?.total_debt_mrq) || 0,
        total_debt_to_equity_mrq: Number(data?.balance_sheet?.total_debt_to_equity_mrq) || 0,
        current_ratio_mrq: Number(data?.balance_sheet?.current_ratio_mrq) || 0,
        book_value_per_share_mrq: Number(data?.balance_sheet?.book_value_per_share_mrq) || 0
      },
      cash_flow: {
        operating_cash_flow_ttm: Number(data?.cash_flow?.operating_cash_flow_ttm) || 0,
        levered_free_cash_flow_ttm: Number(data?.cash_flow?.levered_free_cash_flow_ttm) || 0
      }
    };
  }
  
  // Validation helper function for stock statistics
  export function validateStockStatistics(data: any): StockStatistics {
    return {
      shares_outstanding: Number(data?.shares_outstanding) || 0,
      float_shares: Number(data?.float_shares) || 0,
      avg_10_volume: Number(data?.avg_10_volume) || 0,
      avg_90_volume: Number(data?.avg_90_volume) || 0
    };
  }
  
  // Main validation function for entire stock data
  export function validateStockData(data: any): Partial<StockData> {
    try {
      return {
        quote: {
          symbol: data?.quote?.symbol || '',
          name: data?.quote?.name || '',
          close: String(data?.quote?.close || '0'),
          change: String(data?.quote?.change || '0'),
          percent_change: String(data?.quote?.percent_change || '0'),
          high: String(data?.quote?.high || '0'),
          low: String(data?.quote?.low || '0'),
          open: String(data?.quote?.open || '0'),
          volume: String(data?.quote?.volume || '0')
        },
        timeSeries: {
          values: Array.isArray(data?.timeSeries?.values) 
            ? data.timeSeries.values.map((item: any) => ({
                datetime: String(item.datetime || ''),
                open: String(item.open || '0'),
                high: String(item.high || '0'),
                low: String(item.low || '0'),
                close: String(item.close || '0'),
                volume: String(item.volume || '0')
              }))
            : []
        },
        statistics: {
          valuations_metrics: validateValuationMetrics(data?.statistics?.valuations_metrics),
          financials: validateFinancials(data?.statistics?.financials),
          stock_statistics: validateStockStatistics(data?.statistics?.stock_statistics),
          stock_price_summary: {
            fifty_two_week_low: Number(data?.statistics?.stock_price_summary?.fifty_two_week_low) || 0,
            fifty_two_week_high: Number(data?.statistics?.stock_price_summary?.fifty_two_week_high) || 0,
            fifty_two_week_change: Number(data?.statistics?.stock_price_summary?.fifty_two_week_change) || 0,
            beta: Number(data?.statistics?.stock_price_summary?.beta) || 0,
            day_50_ma: Number(data?.statistics?.stock_price_summary?.day_50_ma) || 0,
            day_200_ma: Number(data?.statistics?.stock_price_summary?.day_200_ma) || 0
          },
          dividends_and_splits: {
            forward_annual_dividend_rate: Number(data?.statistics?.dividends_and_splits?.forward_annual_dividend_rate) || 0,
            forward_annual_dividend_yield: Number(data?.statistics?.dividends_and_splits?.forward_annual_dividend_yield) || 0,
            trailing_annual_dividend_rate: Number(data?.statistics?.dividends_and_splits?.trailing_annual_dividend_rate) || 0,
            trailing_annual_dividend_yield: Number(data?.statistics?.dividends_and_splits?.trailing_annual_dividend_yield) || 0,
            "5_year_average_dividend_yield": Number(data?.statistics?.dividends_and_splits?.["5_year_average_dividend_yield"]) || 0,
            payout_ratio: Number(data?.statistics?.dividends_and_splits?.payout_ratio) || 0,
            dividend_date: String(data?.statistics?.dividends_and_splits?.dividend_date || ''),
            ex_dividend_date: String(data?.statistics?.dividends_and_splits?.ex_dividend_date || '')
          }
        }
      };
    } catch (error) {
      console.error('Error validating stock data:', error);
      return {};
    }
  }
  
  // Get formatted return metrics for display
  export function getReturnMetricsDisplay(financials: Financials): Array<MetricItem> {
    return [
      {
        label: 'ROE',
        value: financials.return_on_equity_ttm,
        format: 'percent',
        description: 'Return on equity'
      },
      {
        label: 'ROA',
        value: financials.return_on_assets_ttm,
        format: 'percent',
        description: 'Return on assets'
      }
    ];
  }