// types/marketAnalysis.ts

export interface MarketData {
    price: number;
    change: number;
    percentChange: number;
    volume: number;
    marketCap: number;
  }
  
  export interface FinancialMetrics {
    revenue: number;
    operatingIncome: number;
    netIncome: number;
    eps: number;
    margins: {
      gross: number;
      operating: number;
      net: number;
    };
    growth: {
      revenue: number;
      profit: number;
    };
  }
  
  export interface BalanceSheetMetrics {
    totalAssets: number;
    totalLiabilities: number;
    shareholdersEquity: number;
    currentRatio: number;
    debtToEquity: number;
    workingCapital: number;
  }
  
  export interface CashFlowMetrics {
    operatingCashFlow: number;
    freeCashFlow: number;
    capitalExpenditures: number;
    cashFromOperations: number;
  }
  
  export interface CompanyFinancials {
    metrics: FinancialMetrics;
    balanceSheet: BalanceSheetMetrics;
    cashFlow: CashFlowMetrics;
    trends: {
      quarterlyGrowth: number;
      profitabilityTrend: string;
      marginTrend: string;
    };
  }
  
  export interface ValuationMetrics {
    peRatio: number;
    pbRatio: number;
    evToEbitda: number;
    priceToSales: number;
    dividendYield?: number;
  }
  
  export interface SectorAnalysis {
    sector: string;
    marketShare: number;
    peersComparison: {
      valuationPercentile: number;
      profitabilityPercentile: number;
      growthPercentile: number;
    };
  }
  
  export interface CompanyRisks {
    financialRisks: string[];
    operationalRisks: string[];
    marketRisks: string[];
  }
  
  export interface CompanyOpportunities {
    growthOpportunities: string[];
    marketOpportunities: string[];
    competitiveAdvantages: string[];
  }
  
  export interface CompanyAnalysis {
    marketData: MarketData;
    financials: CompanyFinancials;
    valuation: ValuationMetrics;
    sectorAnalysis: SectorAnalysis;
    risks: CompanyRisks;
    opportunities: CompanyOpportunities;
  }

  // 1. Market Analysis Types (types/marketAnalysis.ts)
export interface MarketIndicators {
  price: number;
  volume: number;
  change: number;
  percentChange: number;
  sma50: number;
  sma200: number;
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
}

export interface FundamentalMetrics {
  peRatio: number;
  pbRatio: number;
  evToEbitda: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roe: number;
  roa: number;
}

export interface SectorAnalysis {
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  averages: {
    peRatio: number;
    pbRatio: number;
    margins: {
      gross: number;
      operating: number;
      net: number;
    };
  };
  ranking: number;
  peers: Array<{
    symbol: string;
    name: string;
    marketCap: number;
    performance: number;
  }>;
}
