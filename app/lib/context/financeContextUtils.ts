// /app/lib/context/financeContextUtils.ts

import { FinancialMetadata } from './types';

export class FinanceContextAnalyzer {
  private static readonly FINANCIAL_INSTRUMENTS = [
    'stock', 'bond', 'etf', 'option', 'future', 'forex', 'crypto',
    'dividend', 'mutual fund', 'index', 'commodity'
  ];

  private static readonly TECHNICAL_INDICATORS = [
    'moving average', 'MACD', 'RSI', 'bollinger', 'volume', 'momentum',
    'support', 'resistance', 'trend', 'volatility'
  ];

  private static readonly FUNDAMENTAL_FACTORS = [
    'earnings', 'revenue', 'profit', 'margin', 'PE ratio', 'market cap',
    'dividend yield', 'cash flow', 'debt', 'assets'
  ];

  private static readonly MARKET_KEYWORDS = [
    'bull', 'bear', 'volatile', 'correction', 'crash', 'rally',
    'uptick', 'downturn', 'market', 'trade', 'buy', 'sell'
  ];

  public static analyzeFinancialMessage(message: string): FinancialMetadata {
    const words = message.toLowerCase().split(/\s+/);
    
    return {
      instruments: this.extractFinancialInstruments(message),
      companies: this.extractCompanies(message),
      markets: this.extractMarkets(message),
      metrics: this.extractMetrics(message),
      timeframes: this.extractTimeframes(message),
      sentiment: this.analyzeMarketSentiment(message),
      confidenceScore: this.calculateConfidenceScore(message),
      riskLevel: this.assessRiskLevel(message),
      technicalIndicators: this.extractTechnicalIndicators(message),
      fundamentalFactors: this.extractFundamentalFactors(message)
    };
  }

  private static extractFinancialInstruments(message: string): string[] {
    const text = message.toLowerCase();
    return this.FINANCIAL_INSTRUMENTS.filter(instrument => 
      text.includes(instrument)
    );
  }

  private static extractCompanies(message: string): string[] {
    // Look for potential company names (capitalized words)
    const companies = new Set<string>();
    const words = message.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.length > 1 && 
          word[0] === word[0].toUpperCase() && 
          word[1] === word[1].toLowerCase()) {
        companies.add(word);
      }
      // Check for stock symbols (uppercase letters)
      if (word.match(/^\$?[A-Z]{1,5}$/)) {
        companies.add(word);
      }
    }
    
    return Array.from(companies);
  }

  private static extractMarkets(message: string): string[] {
    const commonMarkets = [
      'NYSE', 'NASDAQ', 'DOW', 'S&P', 'FTSE', 'market',
      'exchange', 'trading'
    ];
    
    return commonMarkets.filter(market => 
      message.toLowerCase().includes(market.toLowerCase())
    );
  }

  private static extractMetrics(message: string): string[] {
    const commonMetrics = [
      'price', 'volume', 'volatility', 'return', 'yield',
      'ratio', 'growth', 'loss', 'gain', 'percentage'
    ];
    
    return commonMetrics.filter(metric => 
      message.toLowerCase().includes(metric)
    );
  }

  private static extractTimeframes(message: string): string[] {
    const timeframes = [
      'day', 'week', 'month', 'year', 'quarter',
      'short-term', 'long-term', 'intraday'
    ];
    
    return timeframes.filter(timeframe => 
      message.toLowerCase().includes(timeframe)
    );
  }

  private static analyzeMarketSentiment(message: string): 'bullish' | 'bearish' | 'neutral' {
    const text = message.toLowerCase();
    
    const bullishWords = ['buy', 'bull', 'up', 'growth', 'positive', 'increase'];
    const bearishWords = ['sell', 'bear', 'down', 'decline', 'negative', 'decrease'];
    
    let sentiment = 0;
    
    bullishWords.forEach(word => {
      if (text.includes(word)) sentiment++;
    });
    
    bearishWords.forEach(word => {
      if (text.includes(word)) sentiment--;
    });
    
    if (sentiment > 0) return 'bullish';
    if (sentiment < 0) return 'bearish';
    return 'neutral';
  }

  private static calculateConfidenceScore(message: string): number {
    let score = 0.5; // Base confidence
    
    // Increase confidence based on presence of specific data
    if (this.extractMetrics(message).length > 0) score += 0.1;
    if (this.extractTechnicalIndicators(message).length > 0) score += 0.1;
    if (this.extractFundamentalFactors(message).length > 0) score += 0.1;
    
    // Cap the score at 1.0
    return Math.min(score, 1.0);
  }

  private static assessRiskLevel(message: string): 'low' | 'medium' | 'high' {
    const text = message.toLowerCase();
    
    const highRiskWords = ['volatile', 'risky', 'speculation', 'aggressive'];
    const lowRiskWords = ['safe', 'conservative', 'stable', 'defensive'];
    
    let riskScore = 0;
    
    highRiskWords.forEach(word => {
      if (text.includes(word)) riskScore++;
    });
    
    lowRiskWords.forEach(word => {
      if (text.includes(word)) riskScore--;
    });
    
    if (riskScore > 0) return 'high';
    if (riskScore < 0) return 'low';
    return 'medium';
  }

  private static extractTechnicalIndicators(message: string): string[] {
    return this.TECHNICAL_INDICATORS.filter(indicator => 
      message.toLowerCase().includes(indicator)
    );
  }

  private static extractFundamentalFactors(message: string): string[] {
    return this.FUNDAMENTAL_FACTORS.filter(factor => 
      message.toLowerCase().includes(factor)
    );
  }
}