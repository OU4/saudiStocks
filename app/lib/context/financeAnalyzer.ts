// /app/lib/context/financeAnalyzer.ts

import { SAUDI_SYMBOLS } from '@/app/config/market';
import { CompanyContext } from './types';

interface CompanyMatch {
  symbol: string;
  name: string;
  sector?: string;
  isContinuedDiscussion: boolean;
  confidence: number;
}
interface MatchConfidence {
  symbolMatch: boolean;
  nameMatch: boolean;
  arabicMatch: boolean;
  partialMatch: boolean;
  contextualRelevance: boolean;
}
interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
  lastUpdated: string;
}
interface MarketData {
  [symbol: string]: {
    values: {
      close: number;
      open: number;
      high: number;
      low: number;
      volume: number;
      datetime: string;
    }[];
  };
}



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

  private static calculateMatchConfidence(matches: {
    symbolMatch: boolean;
    nameMatch: boolean;
    arabicMatch: boolean;
    partialMatch: boolean;
    contextualRelevance: boolean;
  }): number {
    let confidence = 0;
    
    if (matches.symbolMatch) confidence += 0.4;
    if (matches.nameMatch) confidence += 0.3;
    if (matches.arabicMatch) confidence += 0.3;
    if (matches.partialMatch) confidence += 0.2;
    if (matches.contextualRelevance) confidence += 0.1;
    // Normalize confidence to be between 0 and 1
    return Math.min(1, confidence);
  }
    
  
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
      confidence: number;
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
    
    // Analyze company context first with enhanced detection
    const companiesAnalysis = this.analyzeCompanyContext(text, currentCompany);
    
    // Extract all indicators and factors
    const technical = this.extractTechnicalIndicators(text);
    const fundamental = this.extractFundamentalFactors(text);
    const sectors = this.extractSectors(text);
    
    // Determine market context
    const isSaudiMarket = this.checkSaudiMarketContext(text);
    
    // Analyze sentiment with enhanced company context
    const sentiment = companiesAnalysis.companies.length > 0
      ? this.analyzeSentimentWithContext(text, companiesAnalysis.companies[0])
      : this.determineSentiment(text);

    // Determine analysis type with enhanced logic
    const analysisType = this.determineAnalysisType(
      technical.length,
      fundamental.length,
      companiesAnalysis.discussionTopics
    );

    // Calculate confidence with enhanced factors
    const confidence = this.calculateConfidence({
      technical: technical.length,
      fundamental: fundamental.length,
      sectors: sectors.length,
      hasExplicitCompany: companiesAnalysis.hasExplicitMention,
      isContinuedDiscussion: companiesAnalysis.continuedDiscussion,
      messageLength: text.split(/\s+/).length,
      hasNumbers: /\d+/.test(text),
      isQuestion: text.includes('?'),
      isSaudiMarket,
      companyConfidence: companiesAnalysis.companies[0]?.confidence || 0
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
  ): {
    companies: CompanyMatch[];
    hasExplicitMention: boolean;
    continuedDiscussion: boolean;
    discussionTopics: string[];
  } {
    const companies: CompanyMatch[] = [];
    const discussionTopics: string[] = [];
    let hasExplicitMention = false;
    let continuedDiscussion = false;
    // Safely convert text to lowercase
    const lowerText = (text || '').toLowerCase();
    // First check for explicit company mentions
    SAUDI_SYMBOLS.forEach(stock => {
      const matches: MatchConfidence = {
        symbolMatch: Boolean(stock.tickerSymbol && lowerText.includes(stock.tickerSymbol.toLowerCase())),
        nameMatch: Boolean(stock.name && lowerText.includes(stock.name.toLowerCase())),
        arabicMatch: Boolean(stock.name_ar && lowerText.includes(stock.name_ar.toLowerCase())),
        partialMatch: false,
        contextualRelevance: false
      };
      // Check for partial matches if no exact match found
      if (!matches.symbolMatch && !matches.nameMatch && !matches.arabicMatch) {
        matches.partialMatch = this.checkPartialMatch(lowerText, stock);
      }
      // Check contextual relevance
      matches.contextualRelevance = this.checkContextualRelevance(lowerText, stock);
      // Calculate confidence score
      const confidence = this.calculateMatchConfidence(matches);
      if (confidence > 0.3) { // Threshold for considering a match
        companies.push({
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          isContinuedDiscussion: false,
          confidence
        });
        hasExplicitMention = true;
      }
    });
    // If no explicit mentions but we have a current company
    if (companies.length === 0 && currentCompany) {
      const hasRelatedTerms = Array.from(this.COMPANY_RELATED_TERMS)
        .some(term => lowerText.includes(term.toLowerCase()));
      
      if (hasRelatedTerms) {
        companies.push({
          symbol: currentCompany.symbol,
          name: currentCompany.name,
          sector: currentCompany.sector,
          isContinuedDiscussion: true,
          confidence: 0.4 // Default confidence for continued discussion
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
          .filter(term => lowerText.includes(term.toLowerCase()))
      );
    }
    return {
      companies,
      hasExplicitMention,
      continuedDiscussion,
      discussionTopics: Array.from(new Set(discussionTopics))
    };
  }
  
  private static checkPartialMatch(text: string, stock: any): boolean {
    const words = text.split(/\s+/);
    const stockNameWords = stock.name?.toLowerCase().split(/\s+/) || [];
    
    return stockNameWords.some((word: string) => 
      word.length > 3 && words.some((textWord: string) => 
        textWord.includes(word) || word.includes(textWord)
      )
    );
  }
  
  
  
  
  private static checkContextualRelevance(text: string, stock: any): boolean {
    const sectorTerms = this.getSectorTerms(stock.sector);
    return sectorTerms.some((term: string) => text.includes(term.toLowerCase()));
  }
    
  private static getSectorTerms(sector?: string): string[] {
    // Add sector-specific terms mapping
    const sectorTermsMap: { [key: string]: string[] } = {
      'Technology': ['tech', 'software', 'digital', 'IT'],
      'Banking': ['bank', 'finance', 'loan', 'deposit'],
      // Add more sectors as needed
    };
    
    return sector ? (sectorTermsMap[sector] || []) : [];
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
    const words = text.split(/\s+/);
    const companyIndex = words.findIndex(word => 
      word.includes(company.name.toLowerCase()) ||
      word.includes(company.symbol.toLowerCase())
    );

    if (companyIndex !== -1) {
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
    companyConfidence: number;
  }): number {
    let confidence = 0.5; // Base confidence

    // Company context factors
    if (factors.hasExplicitCompany) confidence += 0.2;
    if (factors.isContinuedDiscussion) confidence += 0.1;
    confidence += factors.companyConfidence * 0.2;
    
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