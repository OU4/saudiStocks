// /app/lib/context/financeAnalyzer.ts

export class FinanceAnalyzer {
    // Known financial instruments and companies
    private static readonly KNOWN_STOCKS = new Set([
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'BAC', 'WFC',
      'apple', 'microsoft', 'google', 'amazon', 'meta', 'tesla', 'nvidia', 'jpmorgan', 'bank of america'
    ]);
  
    // Technical analysis terms
    private static readonly TECHNICAL_INDICATORS = new Set([
      'RSI', 'MACD', 'moving average', 'bollinger bands', 'support', 'resistance',
      'volume', 'momentum', 'trend', 'breakout', 'consolidation', 'divergence',
      'fibonacci', 'chart pattern', 'candlestick', 'oscillator', 'volatility'
    ]);
  
    // Fundamental analysis terms
    private static readonly FUNDAMENTAL_FACTORS = new Set([
      'PE ratio', 'P/E', 'EPS', 'revenue', 'earnings', 'profit margin', 'cash flow',
      'debt', 'assets', 'liabilities', 'market cap', 'dividend', 'book value',
      'ROE', 'ROI', 'EBITDA', 'gross margin', 'operating margin', 'net margin'
    ]);
  
    // Market sectors
    private static readonly SECTORS = new Set([
      'technology', 'finance', 'healthcare', 'energy', 'consumer', 'industrial',
      'utilities', 'materials', 'real estate', 'telecommunications'
    ]);
  
    // Economic indicators
    private static readonly ECONOMIC_INDICATORS = new Set([
      'GDP', 'inflation', 'interest rates', 'unemployment', 'CPI', 'PPI',
      'retail sales', 'housing starts', 'PMI', 'trade balance', 'fed', 'fomc'
    ]);
  
    // Risk-related terms
    private static readonly RISK_TERMS = {
      high: ['volatile', 'risky', 'speculative', 'aggressive', 'unstable', 'uncertain'],
      medium: ['moderate', 'balanced', 'mixed', 'neutral'],
      low: ['safe', 'stable', 'conservative', 'defensive', 'reliable']
    };
  
    // Sentiment terms
    private static readonly SENTIMENT_TERMS = {
      bullish: ['up', 'rise', 'grow', 'positive', 'bullish', 'outperform', 'buy', 'strong'],
      bearish: ['down', 'fall', 'decline', 'negative', 'bearish', 'underperform', 'sell', 'weak'],
      neutral: ['stable', 'steady', 'hold', 'neutral', 'balanced']
    };
  
    public static analyzeFinancialContext(message: string): {
      confidence: number;
      instruments: string[];
      technicalIndicators: string[];
      fundamentalFactors: string[];
      sectors: string[];
      economicIndicators: string[];
      riskLevel: 'low' | 'medium' | 'high';
      sentiment: 'bullish' | 'bearish' | 'neutral';
      analysisType: 'technical' | 'fundamental' | 'mixed' | 'general';
    } {
      const text = message.toLowerCase();
      const words = text.split(/\s+/);
      
      // Extract found items
      const instruments = this.extractInstruments(text);
      const technical = this.extractTechnicalIndicators(text);
      const fundamental = this.extractFundamentalFactors(text);
      const sectors = this.extractSectors(text);
      const economic = this.extractEconomicIndicators(text);
      
      // Determine analysis type
      const analysisType = this.determineAnalysisType(technical.length, fundamental.length);
      
      // Calculate risk level
      const riskLevel = this.assessRiskLevel(text);
      
      // Determine sentiment
      const sentiment = this.determineSentiment(text);
      
      // Calculate confidence score based on multiple factors
      const confidence = this.calculateConfidence({
        instruments: instruments.length,
        technical: technical.length,
        fundamental: fundamental.length,
        sectors: sectors.length,
        economic: economic.length,
        hasKnownTerms: this.hasKnownFinancialTerms(text),
        messageLength: words.length,
        isQuestionFormat: text.includes('?'),
        hasNumbers: /\d+/.test(text)
      });
  
      return {
        confidence,
        instruments,
        technicalIndicators: technical,
        fundamentalFactors: fundamental,
        sectors,
        economicIndicators: economic,
        riskLevel,
        sentiment,
        analysisType
      };
    }
  
    private static extractInstruments(text: string): string[] {
      return Array.from(this.KNOWN_STOCKS).filter(stock => 
        text.includes(stock.toLowerCase())
      );
    }
  
    private static extractTechnicalIndicators(text: string): string[] {
      return Array.from(this.TECHNICAL_INDICATORS).filter(indicator =>
        text.includes(indicator.toLowerCase())
      );
    }
  
    private static extractFundamentalFactors(text: string): string[] {
      return Array.from(this.FUNDAMENTAL_FACTORS).filter(factor =>
        text.includes(factor.toLowerCase())
      );
    }
  
    private static extractSectors(text: string): string[] {
      return Array.from(this.SECTORS).filter(sector =>
        text.includes(sector.toLowerCase())
      );
    }
  
    private static extractEconomicIndicators(text: string): string[] {
      return Array.from(this.ECONOMIC_INDICATORS).filter(indicator =>
        text.includes(indicator.toLowerCase())
      );
    }
  
    private static assessRiskLevel(text: string): 'low' | 'medium' | 'high' {
      let riskScore = 0;
      
      // Check for risk-related terms
      for (const term of this.RISK_TERMS.high) {
        if (text.includes(term)) riskScore += 2;
      }
      for (const term of this.RISK_TERMS.low) {
        if (text.includes(term)) riskScore -= 2;
      }
      
      // Adjust based on other factors
      if (text.includes('hedge') || text.includes('diversif')) riskScore -= 1;
      if (text.includes('leverage') || text.includes('margin')) riskScore += 1;
      
      if (riskScore > 2) return 'high';
      if (riskScore < -1) return 'low';
      return 'medium';
    }
  
    private static determineSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
      let sentimentScore = 0;
      
      // Check sentiment terms
      for (const term of this.SENTIMENT_TERMS.bullish) {
        if (text.includes(term)) sentimentScore += 1;
      }
      for (const term of this.SENTIMENT_TERMS.bearish) {
        if (text.includes(term)) sentimentScore -= 1;
      }
      
      // Additional context analysis
      if (text.includes('buy') || text.includes('long')) sentimentScore += 1;
      if (text.includes('sell') || text.includes('short')) sentimentScore -= 1;
      
      if (sentimentScore > 1) return 'bullish';
      if (sentimentScore < -1) return 'bearish';
      return 'neutral';
    }
  
    private static determineAnalysisType(technicalCount: number, fundamentalCount: number): 'technical' | 'fundamental' | 'mixed' | 'general' {
      if (technicalCount > 0 && fundamentalCount > 0) return 'mixed';
      if (technicalCount > 0) return 'technical';
      if (fundamentalCount > 0) return 'fundamental';
      return 'general';
    }
  
    private static hasKnownFinancialTerms(text: string): boolean {
      const financialTerms = [
        'market', 'stock', 'trade', 'invest', 'price', 'value',
        'portfolio', 'analysis', 'performance', 'return'
      ];
      return financialTerms.some(term => text.includes(term));
    }
  
    private static calculateConfidence(factors: {
      instruments: number;
      technical: number;
      fundamental: number;
      sectors: number;
      economic: number;
      hasKnownTerms: boolean;
      messageLength: number;
      isQuestionFormat: boolean;
      hasNumbers: boolean;
    }): number {
      let confidence = 0.5; // Base confidence
  
      // Adjust based on identified elements
      if (factors.instruments > 0) confidence += 0.15;
      if (factors.technical > 0) confidence += 0.1;
      if (factors.fundamental > 0) confidence += 0.1;
      if (factors.sectors > 0) confidence += 0.05;
      if (factors.economic > 0) confidence += 0.05;
  
      // Adjust for question quality
      if (factors.hasKnownTerms) confidence += 0.1;
      if (factors.isQuestionFormat) confidence += 0.05;
      if (factors.hasNumbers) confidence += 0.05;
  
      // Penalize very short messages
      if (factors.messageLength < 3) confidence -= 0.2;
      
      // Penalize if no specific elements found
      if (factors.instruments + factors.technical + factors.fundamental + factors.sectors + factors.economic === 0) {
        confidence -= 0.3;
      }
  
      // Ensure confidence stays within bounds
      return Math.max(0.1, Math.min(0.95, confidence));
    }
  }