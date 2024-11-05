// /app/lib/services/saudiFundamentals.ts

import { API_KEY, API_URL, SAUDI_SYMBOLS } from '@/app/config/market';

export class SaudiFundamentals {
  private static readonly CACHE_DURATION = 300000; // 5 minutes
  private static cache: Map<string, { data: any; timestamp: number }> = new Map();

  private static async fetchWithCache(url: string): Promise<any> {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    this.cache.set(url, { data, timestamp: Date.now() });
    return data;
  }

  static async getFundamentalMetrics(symbol: string): Promise<FundamentalData | null> {
    try {
      const stockInfo = SAUDI_SYMBOLS.find(s => s.symbol === symbol);
      if (!stockInfo) return null;

      const formattedSymbol = stockInfo.tickerSymbol;
      
      // Fetch fundamental data and quarterly results in parallel
      const [fundamentals, quarterlyResults] = await Promise.all([
        this.fetchWithCache(`${API_URL}/fundamentals?symbol=${formattedSymbol}&apikey=${API_KEY}`),
        this.fetchWithCache(`${API_URL}/income-statement?symbol=${formattedSymbol}&period=quarter&apikey=${API_KEY}`)
      ]);

      // Calculate growth metrics
      const growth = this.calculateGrowthMetrics(quarterlyResults);

      return {
        symbol: stockInfo.symbol,
        name: stockInfo.name,
        sector: stockInfo.sector,
        earnings_per_share: this.safeNumber(fundamentals.eps),
        dividend_yield: this.safeNumber(fundamentals.dividend_yield),
        book_value: this.safeNumber(fundamentals.book_value),
        beta: this.safeNumber(fundamentals.beta),
        financial_ratios: {
          quick_ratio: this.safeNumber(fundamentals.quick_ratio),
          current_ratio: this.safeNumber(fundamentals.current_ratio),
          debt_to_equity: this.safeNumber(fundamentals.debt_to_equity),
          gross_margin: this.safeNumber(fundamentals.gross_margin),
          operating_margin: this.safeNumber(fundamentals.operating_margin),
          net_profit_margin: this.safeNumber(fundamentals.net_profit_margin),
          return_on_assets: this.safeNumber(fundamentals.roa),
          return_on_equity: this.safeNumber(fundamentals.roe),
        },
        valuation_metrics: {
          price_earnings: this.safeNumber(fundamentals.pe_ratio),
          price_to_book: this.safeNumber(fundamentals.price_to_book_ratio),
          price_to_sales: this.safeNumber(fundamentals.price_to_sales_ratio),
          enterprise_value: this.safeNumber(fundamentals.enterprise_value),
          market_cap: this.safeNumber(fundamentals.market_cap)
        },
        growth_metrics: growth
      };
    } catch (error) {
      console.error('Error fetching fundamental metrics:', error);
      return null;
    }
  }

  static async getSectorAnalysis(sector: string): Promise<SectorMetrics | null> {
    try {
      const sectorCompanies = SAUDI_SYMBOLS.filter(stock => stock.sector === sector);
      const fundamentalsPromises = sectorCompanies.map(company => 
        this.getFundamentalMetrics(company.symbol)
      );

      const results = await Promise.allSettled(fundamentalsPromises);
      const validResults = results
        .filter((result): result is PromiseFulfilledResult<FundamentalData | null> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value!);

      if (!validResults.length) return null;

      // Calculate sector averages
      const averages = this.calculateSectorAverages(validResults);
      const performance = this.calculateSectorPerformance(validResults);

      return {
        sector,
        average_pe: averages.pe,
        average_dividend_yield: averages.dividendYield,
        average_market_cap: averages.marketCap,
        best_performer: performance.best,
        worst_performer: performance.worst,
        total_market_cap: validResults.reduce((sum, company) => 
          sum + company.valuation_metrics.market_cap, 0
        ),
        companies_count: validResults.length
      };
    } catch (error) {
      console.error('Error in sector analysis:', error);
      return null;
    }
  }

  private static calculateGrowthMetrics(quarterlyResults: any[]): GrowthMetrics {
    // Ensure we have at least 2 quarters of data
    if (!Array.isArray(quarterlyResults) || quarterlyResults.length < 2) {
      return {
        revenue_growth: 0,
        earnings_growth: 0,
        dividend_growth: 0
      };
    }

    const current = quarterlyResults[0];
    const previous = quarterlyResults[1];

    return {
      revenue_growth: this.calculateGrowthRate(current.revenue, previous.revenue),
      earnings_growth: this.calculateGrowthRate(current.net_income, previous.net_income),
      dividend_growth: this.calculateGrowthRate(current.dividends, previous.dividends)
    };
  }

  private static calculateGrowthRate(current: number, previous: number): number {
    if (!previous) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  private static safeNumber(value: any, defaultValue: number = 0): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private static calculateSectorAverages(companies: FundamentalData[]): {
    pe: number;
    dividendYield: number;
    marketCap: number;
  } {
    const sum = companies.reduce((acc, company) => ({
      pe: acc.pe + company.valuation_metrics.price_earnings,
      dividendYield: acc.dividendYield + company.dividend_yield,
      marketCap: acc.marketCap + company.valuation_metrics.market_cap
    }), { pe: 0, dividendYield: 0, marketCap: 0 });

    const count = companies.length;
    return {
      pe: sum.pe / count,
      dividendYield: sum.dividendYield / count,
      marketCap: sum.marketCap / count
    };
  }

  private static calculateSectorPerformance(companies: FundamentalData[]): {
    best: { symbol: string; name: string; return: number };
    worst: { symbol: string; name: string; return: number };
  } {
    const withReturns = companies.map(company => ({
      symbol: company.symbol,
      name: company.name,
      return: company.growth_metrics?.earnings_growth || 0
    }));

    withReturns.sort((a, b) => b.return - a.return);

    return {
      best: withReturns[0],
      worst: withReturns[withReturns.length - 1]
    };
  }
}