// app/api/chat/route.ts
import { Anthropic } from "@anthropic-ai/sdk";
import { API_URL, API_KEY, SAUDI_SYMBOLS } from "@/app/config/market";
import { MarketAnalysisService } from '@/app/services/MarketAnalysisService';
import { SaudiMarketHandler } from '@/app/market/saudiMarketHandler';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function buildPromptWithMarketData(message: string, quoteData: any, statsData: any): string {
  // Safe extraction with default values
  const stats = statsData?.statistics || {};
  const valuationMetrics = stats?.valuations_metrics || {};
  const financials = stats?.financials || {};
  const incomeStatement = financials?.income_statement || {};
  const balanceSheet = financials?.balance_sheet || {};
  const cashFlow = financials?.cash_flow || {};
  const stockStats = stats?.stock_statistics || {};
  const stockPrice = stats?.stock_price_summary || {};
  const dividends = stats?.dividends_and_splits || {};

  // Safe number formatting function
  const formatNumber = (value: any, isPercentage = false): string => {
    if (value === null || value === undefined) return 'N/A';
    const num = Number(value);
    if (isNaN(num)) return 'N/A';
    return isPercentage ? `${num.toFixed(2)}%` : num.toFixed(2);
  };

  // Safe billion formatter
  const formatBillions = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    const num = Number(value);
    if (isNaN(num)) return 'N/A';
    return `${(num / 1e9).toFixed(2)} billion`;
  };

  return `You are an expert Saudi market financial analyst. Analyze this comprehensive market data:

MARKET PERFORMANCE:
Current Price: SAR ${quoteData?.close || quoteData?.price || 'N/A'}
Daily Change: ${quoteData?.change || 'N/A'} (${quoteData?.percent_change || 'N/A'}%)
Trading Volume: ${quoteData?.volume || 'N/A'}
Market Cap: SAR ${formatBillions(valuationMetrics?.market_capitalization)}

FINANCIAL METRICS:
1. Revenue & Profitability
• Revenue (TTM): SAR ${formatBillions(incomeStatement?.revenue_ttm)}
• EBITDA: SAR ${formatBillions(incomeStatement?.ebitda)}
• Net Income: SAR ${formatBillions(incomeStatement?.net_income_to_common_ttm)}
• EPS (Diluted): SAR ${formatNumber(incomeStatement?.diluted_eps_ttm)}
• Revenue per Share: SAR ${formatNumber(incomeStatement?.revenue_per_share_ttm)}

2. Margins & Profitability
• Gross Margin: ${formatNumber(financials?.gross_margin ? financials.gross_margin * 100 : null, true)}
• Operating Margin: ${formatNumber(financials?.operating_margin ? financials.operating_margin * 100 : null, true)}
• Profit Margin: ${formatNumber(financials?.profit_margin ? financials.profit_margin * 100 : null, true)}

3. Growth Metrics
• Quarterly Revenue Growth: ${formatNumber(incomeStatement?.quarterly_revenue_growth ? incomeStatement.quarterly_revenue_growth * 100 : null, true)}
• Quarterly Earnings Growth: ${formatNumber(incomeStatement?.quarterly_earnings_growth_yoy ? incomeStatement.quarterly_earnings_growth_yoy * 100 : null, true)}

4. Balance Sheet Position
• Total Cash: SAR ${formatBillions(balanceSheet?.total_cash_mrq)}
• Total Debt: SAR ${formatBillions(balanceSheet?.total_debt_mrq)}
• Current Ratio: ${formatNumber(balanceSheet?.current_ratio_mrq)}
• Debt/Equity: ${formatNumber(balanceSheet?.total_debt_to_equity_mrq)}
• Book Value per Share: SAR ${formatNumber(balanceSheet?.book_value_per_share_mrq)}

5. Cash Flow Analysis
• Operating Cash Flow: SAR ${formatBillions(cashFlow?.operating_cash_flow_ttm)}
• Free Cash Flow: SAR ${formatBillions(cashFlow?.levered_free_cash_flow_ttm)}

VALUATION METRICS:
• P/E Ratio (TTM): ${formatNumber(valuationMetrics?.trailing_pe)}x
• Forward P/E: ${formatNumber(valuationMetrics?.forward_pe)}x
• P/B Ratio: ${formatNumber(valuationMetrics?.price_to_book_mrq)}x
• EV/EBITDA: ${formatNumber(valuationMetrics?.enterprise_to_ebitda)}x
• Price/Sales: ${formatNumber(valuationMetrics?.price_to_sales_ttm)}x

RETURNS & EFFICIENCY:
• Return on Equity: ${formatNumber(financials?.return_on_equity_ttm ? financials.return_on_equity_ttm * 100 : null, true)}
• Return on Assets: ${formatNumber(financials?.return_on_assets_ttm ? financials.return_on_assets_ttm * 100 : null, true)}

MARKET STATISTICS:
• 52-Week Range: SAR ${stockPrice?.fifty_two_week_low || 'N/A'} - ${stockPrice?.fifty_two_week_high || 'N/A'}
• 52-Week Change: ${formatNumber(stockPrice?.fifty_two_week_change, true)}
• Beta: ${formatNumber(stockPrice?.beta)}
• 50-Day MA: SAR ${formatNumber(stockPrice?.day_50_ma)}
• 200-Day MA: SAR ${formatNumber(stockPrice?.day_200_ma)}

DIVIDEND INFORMATION:
• Forward Dividend Rate: SAR ${formatNumber(dividends?.forward_annual_dividend_rate)}
• Forward Dividend Yield: ${formatNumber(dividends?.forward_annual_dividend_yield ? dividends.forward_annual_dividend_yield * 100 : null, true)}
• Trailing Dividend Rate: SAR ${formatNumber(dividends?.trailing_annual_dividend_rate)}
• Payout Ratio: ${formatNumber(dividends?.payout_ratio ? dividends.payout_ratio * 100 : null, true)}

OWNERSHIP STRUCTURE:
• Shares Outstanding: ${formatBillions(stockStats?.shares_outstanding)}
• Float Shares: ${formatBillions(stockStats?.float_shares)}
• Institutional Ownership: ${formatNumber(stockStats?.percent_held_by_institutions ? stockStats.percent_held_by_institutions * 100 : null, true)}
• Insider Ownership: ${formatNumber(stockStats?.percent_held_by_insiders ? stockStats.percent_held_by_insiders * 100 : null, true)}

User Question: ${message}

Based on the available data, please provide a detailed analysis including:

1. Financial Health Assessment
   - Current profitability and efficiency metrics
   - Balance sheet strength and liquidity
   - Cash flow generation and quality
   - Operating performance trends

2. Valuation Analysis
   - Current valuation metrics assessment
   - Fair value considerations
   - Dividend analysis (if applicable)
   - Risk-reward profile

3. Market Position
   - Competitive position analysis
   - Growth trajectory
   - Market performance assessment
   - Industry context

4. Technical Analysis
   - Price trend analysis
   - Moving averages assessment
   - Volume analysis
   - Market momentum

5. Investment Recommendation
   - Clear Buy/Hold/Sell guidance
   - Target price consideration
   - Investment timeframe
   - Key risks and monitoring points

Please focus on the available metrics while acknowledging any data limitations in your analysis.`;
}

function analyzeSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const bullishWords = ['growth', 'increase', 'positive', 'improve', 'strong', 'buy', 'upside'];
  const bearishWords = ['decline', 'decrease', 'negative', 'weak', 'sell', 'risk', 'concern'];

  const lowerText = text.toLowerCase();
  let bullishCount = 0;
  let bearishCount = 0;

  bullishWords.forEach(word => {
    if (lowerText.includes(word)) bullishCount++;
  });
  bearishWords.forEach(word => {
    if (lowerText.includes(word)) bearishCount++;
  });

  if (bullishCount > bearishCount) return 'bullish';
  if (bearishCount > bullishCount) return 'bearish';
  return 'neutral';
}

async function buildPromptWithAnalysis(message: string, symbol: string) {
  try {
    // Get comprehensive market analysis
    const [technical, fundamental, risks] = await Promise.all([
      MarketAnalysisService.analyzeTechnical(symbol),
      MarketAnalysisService.analyzeFundamentals(symbol),
      MarketAnalysisService.assessRisks(symbol)
    ]);

    return `You are an expert Saudi market financial analyst. Analyze this comprehensive market data:

TECHNICAL ANALYSIS:
Current Trend: ${technical.trend}
Key Indicators:
- SMA50: ${technical.indicators.sma50.toFixed(2)}
- SMA200: ${technical.indicators.sma200.toFixed(2)}
- RSI: ${technical.indicators.rsi.toFixed(2)}
- MACD: ${technical.indicators.macd.value.toFixed(2)} (Signal: ${technical.indicators.macd.signal.toFixed(2)})
- Volatility: ${technical.indicators.volatility.toFixed(2)}%

Technical Signals:
${technical.signals.map(signal => `- ${signal}`).join('\n')}

FUNDAMENTAL ANALYSIS:
Profitability Metrics:
- Gross Margin: ${(fundamental.metrics.profitability.grossMargin * 100).toFixed(2)}%
- Operating Margin: ${(fundamental.metrics.profitability.operatingMargin * 100).toFixed(2)}%
- Net Margin: ${(fundamental.metrics.profitability.netMargin * 100).toFixed(2)}%

Valuation Metrics:
- P/E Ratio: ${fundamental.valuation.peRatio.toFixed(2)}x
- P/B Ratio: ${fundamental.valuation.pbRatio.toFixed(2)}x
- EV/EBITDA: ${fundamental.valuation.evEbitda.toFixed(2)}x
- Price/Sales: ${fundamental.valuation.priceToSales.toFixed(2)}x

Growth Metrics:
- Revenue Growth: ${(fundamental.growth.revenueGrowth * 100).toFixed(2)}%
- Profit Growth: ${(fundamental.growth.profitGrowth * 100).toFixed(2)}%
- Market Share Growth: ${(fundamental.growth.marketShareGrowth * 100).toFixed(2)}%

Efficiency & Liquidity:
- Asset Turnover: ${fundamental.metrics.efficiency.assetTurnover.toFixed(2)}x
- Inventory Turnover: ${fundamental.metrics.efficiency.inventoryTurnover.toFixed(2)}x
- Current Ratio: ${fundamental.metrics.liquidity.currentRatio.toFixed(2)}
- Quick Ratio: ${fundamental.metrics.liquidity.quickRatio.toFixed(2)}

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

Based on this comprehensive analysis, please provide:
1. An evaluation of the current market position
2. Assessment of key strengths and weaknesses
3. Identified risks and opportunities
4. Clear investment recommendation with rationale
5. Specific factors to monitor going forward

Please be specific and quantitative in your analysis while considering both technical and fundamental factors.`;
  } catch (error) {
    console.error('Error building analysis prompt:', error);
    throw error;
  }
}


function analyzeRiskLevel(text: string): 'low' | 'medium' | 'high' {
  const highRiskWords = ['volatile', 'risky', 'uncertain', 'concern', 'warning'];
  const lowRiskWords = ['stable', 'solid', 'safe', 'defensive', 'reliable'];

  const lowerText = text.toLowerCase();
  let highRiskCount = 0;
  let lowRiskCount = 0;

  highRiskWords.forEach(word => {
    if (lowerText.includes(word)) highRiskCount++;
  });
  lowRiskWords.forEach(word => {
    if (lowerText.includes(word)) lowRiskCount++;
  });

  if (highRiskCount > lowRiskCount) return 'high';
  if (lowRiskCount > highRiskCount) return 'low';
  return 'medium';
}

function extractTechnicalIndicators(stats: any): string[] {
  const indicators = [];
  if (stats.stock_price_summary) {
    if (stats.stock_price_summary.day_50_ma) indicators.push('50-Day Moving Average');
    if (stats.stock_price_summary.day_200_ma) indicators.push('200-Day Moving Average');
    if (stats.stock_price_summary.beta) indicators.push('Beta');
  }
  return indicators;
}

function extractFundamentalFactors(stats: any): string[] {
  const factors = [];
  if (stats.valuations_metrics) {
    if (stats.valuations_metrics.trailing_pe) factors.push('P/E Ratio');
    if (stats.valuations_metrics.price_to_book_mrq) factors.push('Price to Book');
    if (stats.valuations_metrics.enterprise_to_ebitda) factors.push('EV/EBITDA');
  }
  if (stats.financials) {
    if (stats.financials.operating_margin) factors.push('Operating Margin');
    if (stats.financials.return_on_equity_ttm) factors.push('ROE');
  }
  return factors;
}

function extractCompanySymbol(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  for (const stock of SAUDI_SYMBOLS) {
    if (
      lowerMessage.includes(stock.name.toLowerCase()) ||
      lowerMessage.includes(stock.tickerSymbol.toLowerCase()) ||
      (stock.name_ar && lowerMessage.includes(stock.name_ar.toLowerCase()))
    ) {
      return `${stock.tickerSymbol}:TADAWUL`;
    }
  }
  return null;
}


export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;
    
    // Extract company mentions
    console.log('Analyzing text for company mentions:', latestMessage);
    const mentionedCompany = extractCompanySymbol(latestMessage);
    
    if (!mentionedCompany) {
      return new Response(
        JSON.stringify({
          response: "I couldn't identify any specific stocks in your question. Please mention which stock you'd like to analyze.",
          thinking: "No stock symbols found",
          financial_context: {
            instruments_mentioned: [],
            market_sentiment: 'neutral',
            risk_level: 'medium',
            confidence_score: 0,
            technical_indicators: [],
            fundamental_factors: [],
            market_data_used: false,
            context_used: false
          },
          timestamp: new Date().toISOString()
        }),
        { status: 200 }
      );
    }

    // Fetch market data
    console.log('Fetching data for:', mentionedCompany);
    const [quoteResponse, statsResponse] = await Promise.all([
      fetch(`${API_URL}/quote?symbol=${mentionedCompany}&apikey=${API_KEY}`),
      fetch(`${API_URL}/statistics?symbol=${mentionedCompany}&apikey=${API_KEY}`)
    ]);

    const [quoteData, statsData] = await Promise.all([
      quoteResponse.json(),
      statsResponse.json()
    ]);

    if (!quoteData || !statsData || !statsData.statistics) {
      throw new Error('Failed to fetch market data');
    }
    
    // Build prompt with the actual data
    const prompt = buildPromptWithMarketData(latestMessage, quoteData, statsData);

    // Get AI analysis
    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    return new Response(
      JSON.stringify({
        response: claudeResponse.content[0].text,
        thinking: "Analyzing market data and financials",
        financial_context: {
          quote: quoteData,
          statistics: statsData.statistics,
          timestamp: new Date().toISOString()
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in chat handler:', error);
    return new Response(
      JSON.stringify({
        response: "I apologize, but I encountered an error while analyzing the market data. Please try again.",
        thinking: "Error processing request",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }),
      { status: 500 }
    );
  }
}
function determineSentiment(technical: any): 'bullish' | 'bearish' | 'neutral' {
  let score = 0;
  
  // Trend analysis
  if (technical.trend === 'upward') score += 2;
  if (technical.trend === 'downward') score -= 2;

  // RSI analysis
  if (technical.indicators.rsi > 70) score -= 1;
  if (technical.indicators.rsi < 30) score += 1;

  // MACD analysis
  if (technical.indicators.macd.histogram > 0) score += 1;
  if (technical.indicators.macd.histogram < 0) score -= 1;

  // Price vs Moving Averages
  if (technical.currentPrice > technical.indicators.sma50) score += 1;
  if (technical.currentPrice < technical.indicators.sma50) score -= 1;

  return score > 2 ? 'bullish' : score < -2 ? 'bearish' : 'neutral';
}



// function extractCompanySymbol(message: string): string | null {
//   // Add company symbol extraction logic
//   if (message.toLowerCase().includes('aramco')) {
//     return '2222:TADAWUL';
//   }
//   // Add more company matches as needed
//   return null;
// }