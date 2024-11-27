// app/utils/enhancedPromptBuilder.ts
import { MarketAnalysisService } from '@/app/services/MarketAnalysisService';

async function buildComprehensivePrompt(message: string, symbol: string, quoteData: any, statsData: any) {
    try {
      // Get comprehensive market analysis
      const [technical, fundamental, risks] = await Promise.all([
        MarketAnalysisService.analyzeTechnical(symbol),
        MarketAnalysisService.analyzeFundamentals(symbol),
        MarketAnalysisService.assessRisks(symbol)
      ]);
  
      // Safe extraction with default values
      const stats = statsData?.statistics || {};
      const valuationMetrics = stats?.valuations_metrics || {};
      const financials = stats?.financials || {};
      const incomeStatement = financials?.income_statement || {};
      const balanceSheet = financials?.balance_sheet || {};
      const cashFlow = stats?.cash_flow || {};
      const stockStats = stats?.stock_statistics || {};
      const stockPrice = stats?.stock_price_summary || {};
      const dividends = stats?.dividends_and_splits || {};
  
      // Formatting helpers
      const formatNumber = (value: any, isPercentage = false): string => {
        if (value === null || value === undefined) return 'N/A';
        const num = Number(value);
        if (isNaN(num)) return 'N/A';
        return isPercentage ? `${num.toFixed(2)}%` : num.toFixed(2);
      };
  
      const formatBillions = (value: any): string => {
        if (value === null || value === undefined) return 'N/A';
        const num = Number(value);
        if (isNaN(num)) return 'N/A';
        return `${(num / 1e9).toFixed(2)} billion`;
      };
  
      return `You are an expert Saudi market financial analyst. Analyze this comprehensive market data:
  
  MARKET OVERVIEW:
  Current Price: SAR ${quoteData?.close || quoteData?.price || 'N/A'}
  Daily Change: ${quoteData?.change || 'N/A'} (${quoteData?.percent_change || 'N/A'}%)
  Trading Volume: ${quoteData?.volume || 'N/A'}
  Market Cap: SAR ${formatBillions(valuationMetrics?.market_capitalization)}
  
  TECHNICAL ANALYSIS:
  Current Trend: ${technical.trend}
  Key Technical Indicators:
  - SMA50: ${technical.indicators.sma50.toFixed(2)}
  - SMA200: ${technical.indicators.sma200.toFixed(2)}
  - RSI: ${technical.indicators.rsi.toFixed(2)}
  - MACD: ${technical.indicators.macd.value.toFixed(2)} (Signal: ${technical.indicators.macd.signal.toFixed(2)})
  - Volatility: ${technical.indicators.volatility.toFixed(2)}%
  
  Technical Signals:
  ${technical.signals.map(signal => `- ${signal}`).join('\n')}
  
  FINANCIAL METRICS:
  1. Revenue & Profitability
  • Revenue (TTM): SAR ${formatBillions(incomeStatement?.revenue_ttm)}
  • EBITDA: SAR ${formatBillions(incomeStatement?.ebitda)}
  • Net Income: SAR ${formatBillions(incomeStatement?.net_income_to_common_ttm)}
  • EPS (Diluted): SAR ${formatNumber(incomeStatement?.diluted_eps_ttm)}
  • Revenue per Share: SAR ${formatNumber(incomeStatement?.revenue_per_share_ttm)}
  
  2. Margins & Profitability
  • Gross Margin: ${formatNumber(fundamental.metrics.profitability.grossMargin * 100, true)}
  • Operating Margin: ${formatNumber(fundamental.metrics.profitability.operatingMargin * 100, true)}
  • Net Margin: ${formatNumber(fundamental.metrics.profitability.netMargin * 100, true)}
  
  3. Growth & Performance
  • Revenue Growth: ${formatNumber(fundamental.growth.revenueGrowth * 100, true)}
  • Profit Growth: ${formatNumber(fundamental.growth.profitGrowth * 100, true)}
  • Market Share Growth: ${formatNumber(fundamental.growth.marketShareGrowth * 100, true)}
  • Quarterly Revenue Growth: ${formatNumber(incomeStatement?.quarterly_revenue_growth ? incomeStatement.quarterly_revenue_growth * 100 : null, true)}
  • Quarterly Earnings Growth: ${formatNumber(incomeStatement?.quarterly_earnings_growth_yoy ? incomeStatement.quarterly_earnings_growth_yoy * 100 : null, true)}
  
  4. Balance Sheet Strength
  • Total Cash: SAR ${formatBillions(balanceSheet?.total_cash_mrq)}
  • Total Debt: SAR ${formatBillions(balanceSheet?.total_debt_mrq)}
  • Current Ratio: ${formatNumber(fundamental.metrics.liquidity.currentRatio)}
  • Quick Ratio: ${formatNumber(fundamental.metrics.liquidity.quickRatio)}
  • Debt/Equity: ${formatNumber(balanceSheet?.total_debt_to_equity_mrq)}
  • Book Value per Share: SAR ${formatNumber(balanceSheet?.book_value_per_share_mrq)}
  
  5. Efficiency Metrics
  • Asset Turnover: ${formatNumber(fundamental.metrics.efficiency.assetTurnover)}x
  • Inventory Turnover: ${formatNumber(fundamental.metrics.efficiency.inventoryTurnover)}x
  
  6. Cash Flow Analysis
  • Operating Cash Flow: SAR ${formatBillions(cashFlow?.operating_cash_flow_ttm)}
  • Free Cash Flow: SAR ${formatBillions(cashFlow?.levered_free_cash_flow_ttm)}
  
  VALUATION ASSESSMENT:
  • P/E Ratio (TTM): ${formatNumber(valuationMetrics?.trailing_pe)}x
  • Forward P/E: ${formatNumber(valuationMetrics?.forward_pe)}x
  • P/B Ratio: ${formatNumber(valuationMetrics?.price_to_book_mrq)}x
  • EV/EBITDA: ${formatNumber(valuationMetrics?.enterprise_to_ebitda)}x
  • Price/Sales: ${formatNumber(valuationMetrics?.price_to_sales_ttm)}x
  
  MARKET METRICS:
  • Return on Equity: ${formatNumber(financials?.return_on_equity_ttm ? financials.return_on_equity_ttm * 100 : null, true)}
  • Return on Assets: ${formatNumber(financials?.return_on_assets_ttm ? financials.return_on_assets_ttm * 100 : null, true)}
  • 52-Week Range: SAR ${stockPrice?.fifty_two_week_low || 'N/A'} - ${stockPrice?.fifty_two_week_high || 'N/A'}
  • 52-Week Change: ${formatNumber(stockPrice?.fifty_two_week_change, true)}
  • Beta: ${formatNumber(stockPrice?.beta)}
  • Moving Averages: 
    - 50-Day: SAR ${formatNumber(stockPrice?.day_50_ma)}
    - 200-Day: SAR ${formatNumber(stockPrice?.day_200_ma)}
  
  DIVIDEND PROFILE:
  • Forward Dividend Rate: SAR ${formatNumber(dividends?.forward_annual_dividend_rate)}
  • Forward Dividend Yield: ${formatNumber(dividends?.forward_annual_dividend_yield ? dividends.forward_annual_dividend_yield * 100 : null, true)}
  • Trailing Dividend Rate: SAR ${formatNumber(dividends?.trailing_annual_dividend_rate)}
  • Payout Ratio: ${formatNumber(dividends?.payout_ratio ? dividends.payout_ratio * 100 : null, true)}
  
  OWNERSHIP & SHARES:
  • Shares Outstanding: ${formatBillions(stockStats?.shares_outstanding)}
  • Float Shares: ${formatBillions(stockStats?.float_shares)}
  • Institutional Ownership: ${formatNumber(stockStats?.percent_held_by_institutions ? stockStats.percent_held_by_institutions * 100 : null, true)}
  • Insider Ownership: ${formatNumber(stockStats?.percent_held_by_insiders ? stockStats.percent_held_by_insiders * 100 : null, true)}
  
  RISK ASSESSMENT:
  Overall Risk Level: ${risks.riskLevel.toUpperCase()}
  Risk Score: ${risks.score}/100
  
  Technical Risks:
  ${risks.technical.map(risk => `- ${risk}`).join('\n')}
  
  Fundamental Risks:
  ${risks.fundamental.map(risk => `- ${risk}`).join('\n')}
  
  Market Risks:
  ${risks.market.map(risk => `- ${risk}`).join('\n')}
  
  User Question: ${message}
  
  Please provide a comprehensive analysis including:
  
  1. Market Position & Financial Health
     - Current market position and competitive standing
     - Financial health assessment (profitability, liquidity, efficiency)
     - Operating performance and trends
     - Balance sheet strength and cash flow quality
  
  2. Technical & Price Analysis
     - Current price trend and momentum evaluation
     - Technical indicator analysis
     - Volume and price pattern assessment
     - Key support and resistance levels
  
  3. Valuation & Growth Assessment
     - Current valuation metrics analysis
     - Growth trajectory and sustainability
     - Fair value estimation
     - Dividend sustainability (if applicable)
  
  4. Risk-Reward Profile
     - Key risk factors analysis
     - Growth opportunities
     - Competitive advantages
     - Market positioning
  
  5. Investment Recommendation
     - Clear Buy/Hold/Sell recommendation
     - Target price range
     - Investment timeframe
     - Key monitoring metrics
     - Risk management considerations
  
  Please provide specific, quantitative analysis while acknowledging any data limitations. Include both technical and fundamental factors in your recommendation.`;
  
    } catch (error) {
      console.error('Error building comprehensive prompt:', error);
      throw error;
    }
  }