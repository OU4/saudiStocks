// /app/lib/context/financeAnalyzer.ts

import { SAUDI_SYMBOLS } from '@/app/config/market';
import { CompanyContext } from './types';

export class FinanceAnalyzer {
  // Known financial instruments and companies
  private static readonly SAUDI_MARKET_TERMS = new Set([
    'tadawul', 'saudi stock', 'saudi market', 'tasi', 'nomu',
    'parallel market', 'main market', 'saudi exchange', 'cma'
  ]);

  private static readonly TECHNICAL_INDICATORS = new Set([
    'RSI', 'MACD', 'moving average', 'bollinger bands', 'support', 'resistance',
    'volume', 'momentum', 'trend', 'breakout', 'consolidation', 'divergence',
    'fibonacci', 'chart pattern', 'candlestick', 'oscillator', 'volatility',
    'EMA', 'SMA', 'price action', 'trend line', 'head and shoulders',
    'double top', 'double bottom', 'triangle pattern', 'flag pattern'
  ]);

  private static readonly FUNDAMENTAL_FACTORS = new Set([
    'PE ratio', 'P/E', 'EPS', 'revenue', 'earnings', 'profit margin', 'cash flow',
    'debt', 'assets', 'liabilities', 'market cap', 'dividend', 'book value',
    'ROE', 'ROI', 'EBITDA', 'gross margin', 'operating margin', 'net margin',
    'PEG ratio', 'debt to equity', 'current ratio', 'quick ratio',
    'dividend yield', 'payout ratio', 'price to book', 'price to sales'
  ]);

  private static readonly SECTORS = new Set(
    Array.from(new Set(SAUDI_SYMBOLS.map(stock => stock.sector)))
  );

  private static readonly RISK_TERMS = {
    high: ['volatile', 'risky', 'speculative', 'aggressive', 'unstable', 'uncertain'],
    medium: ['moderate', 'balanced', 'mixed', 'neutral'],
    low: ['safe', 'stable', 'conservative', 'defensive', 'reliable']
  };

  private static readonly SENTIMENT_TERMS = {
    bullish: ['up', 'rise', 'grow', 'positive', 'bullish', 'outperform', 'buy', 'strong',
              'increase', 'higher', 'upside', 'potential', 'gain', 'profit'],
    bearish: ['down', 'fall', 'decline', 'negative', 'bearish', 'underperform', 'sell', 'weak',
              'decrease', 'lower', 'downside', 'risk', 'loss', 'concern'],
    neutral: ['stable', 'steady', 'hold', 'neutral', 'balanced', 'maintain', 'unchanged']
  };

  private static readonly COMPANY_RELATED_TERMS = new Set([
    'revenue', 'profit', 'earnings', 'growth', 'performance', 'management',
    'strategy', 'market share', 'competition', 'expansion', 'dividend',
    'announcement', 'report', 'guidance', 'forecast', 'outlook',
    'CEO', 'executive', 'board', 'shareholders', 'stock', 'shares',
    'price', 'valuation', 'target', 'rating', 'upgrade', 'downgrade'
  ]);

  public static analyzeFinancialContext(
    message: string,
    currentCompany?: CompanyContext
  ): {
    confidence: number;
    companies: Array<{
      symbol: string;
      name: string;
      sector?: string;
      isContinuedDiscussion: boolean;
    }>;
    technicalIndicators: string[];
    fundamentalFactors: string[];
    sectors: string[];
    riskLevel: 'low' | 'medium' | 'high';
    sentiment: 'bullish' | 'bearish' | 'neutral';
    analysisType: 'technical' | 'fundamental' | 'mixed' | 'general';
    marketContext: {
      isSaudiMarket: boolean;
      mentionedMarket?: string;
    };
    companyContext: {
      hasExplicitMention: boolean;
      continuedDiscussion: boolean;
      discussionTopics: string[];
    };
  } {
    const text = message.toLowerCase();
    
    // Analyze company context first
    const companiesAnalysis = this.analyzeCompanyContext(text, currentCompany);
    
    // Extract all indicators and factors
    const technical = this.extractTechnicalIndicators(text);
    const fundamental = this.extractFundamentalFactors(text);
    const sectors = this.extractSectors(text);
    
    // Determine market context
    const isSaudiMarket = this.checkSaudiMarketContext(text);
    
    // Analyze sentiment with company context
    const sentiment = companiesAnalysis.companies.length > 0
      ? this.analyzeSentimentWithContext(text, companiesAnalysis.companies[0])
      : this.determineSentiment(text);

    // Determine analysis type
    const analysisType = this.determineAnalysisType(
      technical.length,
      fundamental.length,
      companiesAnalysis.discussionTopics
    );

    // Calculate confidence score
    const confidence = this.calculateConfidence({
      technical: technical.length,
      fundamental: fundamental.length,
      sectors: sectors.length,
      hasExplicitCompany: companiesAnalysis.hasExplicitMention,
      isContinuedDiscussion: companiesAnalysis.continuedDiscussion,
      messageLength: text.split(/\s+/).length,
      hasNumbers: /\d+/.test(text),
      isQuestion: text.includes('?'),
      isSaudiMarket
    });

    return {
      confidence,
      companies: companiesAnalysis.companies,
      technicalIndicators: technical,
      fundamentalFactors: fundamental,
      sectors,
      riskLevel: this.assessRiskLevel(text),
      sentiment,
      analysisType,
      marketContext: {
        isSaudiMarket,
        mentionedMarket: isSaudiMarket ? 'Tadawul' : undefined
      },
      companyContext: {
        hasExplicitMention: companiesAnalysis.hasExplicitMention,
        continuedDiscussion: companiesAnalysis.continuedDiscussion,
        discussionTopics: companiesAnalysis.discussionTopics
      }
    };
  }

  private static analyzeCompanyContext(
    text: string,
    currentCompany?: CompanyContext
  ) {
    const companies: Array<{
      symbol: string;
      name: string;
      sector?: string;
      isContinuedDiscussion: boolean;
    }> = [];
    
    const discussionTopics: string[] = [];
    let hasExplicitMention = false;
    let continuedDiscussion = false;

    // First check for explicit company mentions
    SAUDI_SYMBOLS.forEach(stock => {
      if (
        text.includes(stock.tickerSymbol.toLowerCase()) ||
        text.includes(stock.name.toLowerCase()) ||
        (stock.name_ar && text.includes(stock.name_ar.toLowerCase()))
      ) {
        companies.push({
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          isContinuedDiscussion: false
        });
        hasExplicitMention = true;
      }
    });

    // If no explicit mentions but we have a current company
    if (companies.length === 0 && currentCompany) {
      const hasRelatedTerms = Array.from(this.COMPANY_RELATED_TERMS)
        .some(term => text.includes(term.toLowerCase()));
      
      if (hasRelatedTerms) {
        companies.push({
          symbol: currentCompany.symbol,
          name: currentCompany.name,
          sector: currentCompany.sector,
          isContinuedDiscussion: true
        });
        continuedDiscussion = true;
      }
    }

    // Extract discussion topics
    if (companies.length > 0) {
      discussionTopics.push(
        ...this.extractTechnicalIndicators(text),
        ...this.extractFundamentalFactors(text),
        ...Array.from(this.COMPANY_RELATED_TERMS)
          .filter(term => text.includes(term.toLowerCase()))
      );
    }

    return {
      companies,
      hasExplicitMention,
      continuedDiscussion,
      discussionTopics: Array.from(new Set(discussionTopics))
    };
  }

  private static checkSaudiMarketContext(text: string): boolean {
    return Array.from(this.SAUDI_MARKET_TERMS)
      .some(term => text.includes(term.toLowerCase()));
  }

  private static extractTechnicalIndicators(text: string): string[] {
    return Array.from(this.TECHNICAL_INDICATORS)
      .filter(indicator => text.includes(indicator.toLowerCase()));
  }

  private static extractFundamentalFactors(text: string): string[] {
    return Array.from(this.FUNDAMENTAL_FACTORS)
      .filter(factor => text.includes(factor.toLowerCase()));
  }

  private static extractSectors(text: string): string[] {
    return Array.from(this.SECTORS)
      .filter(sector => text.includes(sector.toLowerCase()));
  }

  private static analyzeSentimentWithContext(
    text: string,
    company: { symbol: string; name: string }
  ): 'bullish' | 'bearish' | 'neutral' {
    // Look for sentiment near company mentions
    const words = text.split(/\s+/);
    const companyIndex = words.findIndex(word => 
      word.includes(company.name.toLowerCase()) ||
      word.includes(company.symbol.toLowerCase())
    );

    if (companyIndex !== -1) {
      // Analyze sentiment in company context (5 words before and after)
      const start = Math.max(0, companyIndex - 5);
      const end = Math.min(words.length, companyIndex + 6);
      const contextText = words.slice(start, end).join(' ');
      return this.determineSentiment(contextText);
    }

    return this.determineSentiment(text);
  }

  private static determineSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
    let score = 0;
    
    for (const term of this.SENTIMENT_TERMS.bullish) {
      if (text.includes(term)) score += 1;
    }
    for (const term of this.SENTIMENT_TERMS.bearish) {
      if (text.includes(term)) score -= 1;
    }
    
    if (score > 1) return 'bullish';
    if (score < -1) return 'bearish';
    return 'neutral';
  }

  private static assessRiskLevel(text: string): 'low' | 'medium' | 'high' {
    let score = 0;
    
    for (const term of this.RISK_TERMS.high) {
      if (text.includes(term)) score += 2;
    }
    for (const term of this.RISK_TERMS.low) {
      if (text.includes(term)) score -= 2;
    }
    
    if (text.includes('hedge') || text.includes('diversif')) score -= 1;
    if (text.includes('leverage') || text.includes('margin')) score += 1;
    
    if (score > 2) return 'high';
    if (score < -1) return 'low';
    return 'medium';
  }

  private static determineAnalysisType(
    technicalCount: number,
    fundamentalCount: number,
    topics: string[]
  ): 'technical' | 'fundamental' | 'mixed' | 'general' {
    const hasCompanySpecific = topics.some(topic =>
      this.COMPANY_RELATED_TERMS.has(topic)
    );

    if (technicalCount > 0 && fundamentalCount > 0) {
      return 'mixed';
    }
    if (technicalCount > 0) {
      return 'technical';
    }
    if (fundamentalCount > 0 || hasCompanySpecific) {
      return 'fundamental';
    }
    return 'general';
  }

  private static calculateConfidence(factors: {
    technical: number;
    fundamental: number;
    sectors: number;
    hasExplicitCompany: boolean;
    isContinuedDiscussion: boolean;
    messageLength: number;
    hasNumbers: boolean;
    isQuestion: boolean;
    isSaudiMarket: boolean;
  }): number {
    let confidence = 0.5; // Base confidence

    // Company context factors
    if (factors.hasExplicitCompany) confidence += 0.2;
    if (factors.isContinuedDiscussion) confidence += 0.1;
    
    // Analysis depth factors
    if (factors.technical > 0) confidence += 0.1;
    if (factors.fundamental > 0) confidence += 0.1;
    if (factors.sectors > 0) confidence += 0.05;
    
    // Message quality factors
    if (factors.hasNumbers) confidence += 0.05;
    if (factors.isQuestion) confidence += 0.05;
    if (factors.isSaudiMarket) confidence += 0.1;
    
    // Penalize very short messages
    if (factors.messageLength < 3) confidence -= 0.2;

    // Ensure confidence stays within bounds
    return Math.max(0.1, Math.min(0.95, confidence));
  }
}