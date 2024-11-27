// utils/marketAnalysis.ts
import { 
    CompanyAnalysis, 
    FinancialMetrics, 
    BalanceSheetMetrics, 
    CashFlowMetrics,
    ValuationMetrics,
    SectorAnalysis,
    CompanyRisks,
    CompanyOpportunities
  } from '../types/marketAnalysis';
  
  export function getDefaultFinancialMetrics(): FinancialMetrics {
    return {
      revenue: 0,
      operatingIncome: 0,
      netIncome: 0,
      eps: 0,
      margins: {
        gross: 0,
        operating: 0,
        net: 0
      },
      growth: {
        revenue: 0,
        profit: 0
      }
    };
  }
  
  export function getDefaultBalanceSheet(): BalanceSheetMetrics {
    return {
      totalAssets: 0,
      totalLiabilities: 0,
      shareholdersEquity: 0,
      currentRatio: 0,
      debtToEquity: 0,
      workingCapital: 0
    };
  }
  
  export function getDefaultCashFlow(): CashFlowMetrics {
    return {
      operatingCashFlow: 0,
      freeCashFlow: 0,
      capitalExpenditures: 0,
      cashFromOperations: 0
    };
  }
  
  export function calculateFinancialMetrics(incomeStatement: any[]): FinancialMetrics {
    if (!incomeStatement?.length) return getDefaultFinancialMetrics();
  
    const current = incomeStatement[0];
    const previous = incomeStatement[1];
  
    return {
      revenue: current.sales || 0,
      operatingIncome: current.operating_income || 0,
      netIncome: current.net_income || 0,
      eps: current.eps_basic || 0,
      margins: {
        gross: current.sales ? (current.gross_profit / current.sales) * 100 : 0,
        operating: current.sales ? (current.operating_income / current.sales) * 100 : 0,
        net: current.sales ? (current.net_income / current.sales) * 100 : 0
      },
      growth: {
        revenue: previous?.sales ? ((current.sales - previous.sales) / previous.sales) * 100 : 0,
        profit: previous?.net_income ? ((current.net_income - previous.net_income) / previous.net_income) * 100 : 0
      }
    };
  }
  
  export function calculateBalanceSheetMetrics(balanceSheet: any[]): BalanceSheetMetrics {
    if (!balanceSheet?.length) return getDefaultBalanceSheet();
  
    const current = balanceSheet[0];
    
    const totalAssets = current.assets?.total_assets || 0;
    const totalLiabilities = current.liabilities?.total_liabilities || 0;
    const currentAssets = current.assets?.current_assets || 0;
    const currentLiabilities = current.liabilities?.current_liabilities || 0;
    
    return {
      totalAssets,
      totalLiabilities,
      shareholdersEquity: totalAssets - totalLiabilities,
      currentRatio: currentLiabilities ? currentAssets / currentLiabilities : 0,
      debtToEquity: (totalAssets - totalLiabilities) ? totalLiabilities / (totalAssets - totalLiabilities) : 0,
      workingCapital: currentAssets - currentLiabilities
    };
  }
  
  export function analyzeTrends(financials: any): { profitabilityTrend: string; marginTrend: string } {
    if (!financials?.incomeStatement?.income_statement?.length) {
      return {
        profitabilityTrend: 'Insufficient data',
        marginTrend: 'Insufficient data'
      };
    }
  
    const statements = financials.incomeStatement.income_statement;
    const profitGrowth = statements.slice(0, -1).map((curr: any, i: number) => {
      const next = statements[i + 1];
      return next?.net_income ? ((curr.net_income - next.net_income) / next.net_income) * 100 : 0;
    });
  
    const avgGrowth = profitGrowth.reduce((a: number, b: number) => a + b, 0) / profitGrowth.length;
  
    return {
      profitabilityTrend: avgGrowth > 5 ? 'Improving' : avgGrowth > 0 ? 'Stable' : 'Declining',
      marginTrend: analyzeProfitMargins(statements)
    };
  }
  
  function analyzeProfitMargins(statements: any[]): string {
    const margins = statements.map(s => s.net_income / s.sales * 100);
    const marginTrend = margins.slice(0, -1).map((curr, i) => curr - margins[i + 1]);
    const avgMarginChange = marginTrend.reduce((a, b) => a + b, 0) / marginTrend.length;
    
    return avgMarginChange > 1 ? 'Expanding margins' : 
           avgMarginChange > -1 ? 'Stable margins' : 'Contracting margins';
  }
  
  export function calculateRisksAndOpportunities(analysis: CompanyAnalysis): { risks: CompanyRisks; opportunities: CompanyOpportunities } {
    const risks: CompanyRisks = {
      financialRisks: [],
      operationalRisks: [],
      marketRisks: []
    };
  
    const opportunities: CompanyOpportunities = {
      growthOpportunities: [],
      marketOpportunities: [],
      competitiveAdvantages: []
    };
  
    // Financial Risks
    if (analysis.financials.balanceSheet.debtToEquity > 2) {
      risks.financialRisks.push("High leverage ratio could impact financial flexibility");
    }
    if (analysis.financials.balanceSheet.currentRatio < 1) {
      risks.financialRisks.push("Low current ratio indicates potential liquidity concerns");
    }
    if (analysis.financials.cashFlow.freeCashFlow < 0) {
      risks.financialRisks.push("Negative free cash flow may indicate operational challenges");
    }
  
    // Growth Opportunities
    if (analysis.financials.metrics.growth.revenue > 10) {
      opportunities.growthOpportunities.push("Strong revenue growth momentum");
    }
    if (analysis.sectorAnalysis.peersComparison.profitabilityPercentile > 75) {
      opportunities.competitiveAdvantages.push("Superior profitability compared to peers");
    }
    if (analysis.financials.metrics.margins.net > 20) {
      opportunities.competitiveAdvantages.push("Strong profit margins indicate competitive advantages");
    }
  
    return { risks, opportunities };
  }
  
  export function formatValue(value: number, type: 'currency' | 'percent' | 'ratio' = 'currency'): string {
    if (isNaN(value) || value === undefined) return 'N/A';
    
    switch (type) {
      case 'currency':
        return value >= 1e9 
          ? `${(value / 1e9).toFixed(2)}B SAR`
          : value >= 1e6
          ? `${(value / 1e6).toFixed(2)}M SAR`
          : `${value.toFixed(2)} SAR`;
      case 'percent':
        return `${value.toFixed(2)}%`;
      case 'ratio':
        return value.toFixed(2);
      default:
        return value.toFixed(2);
    }
  }