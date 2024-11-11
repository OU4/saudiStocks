// /app/lib/context/types.ts

// Base metadata interfaces
export interface FinancialMetrics {
  pe_ratio?: number;
  profit_margin?: number;
  revenue_growth?: number;
  dividend_yield?: number;
  market_cap?: number;
  volume?: number;
  [key: string]: number | undefined;
}

export interface TechnicalIndicators {
  rsi?: number;
  macd?: {
    value: number;
    signal: number;
    histogram: number;
  };
  moving_averages?: {
    sma_50?: number;
    sma_200?: number;
    ema_20?: number;
  };
  support_levels?: number[];
  resistance_levels?: number[];
}



// Enhanced company context
export interface CompanyContext {
  symbol: string;
  name: string;
  name_ar?: string;
  sector?: string;
  lastMentioned: number;
  metadata: {
    recentTopics: string[];
    financialMetrics?: FinancialMetrics;
    technicalIndicators?: TechnicalIndicators;
    fundamentalFactors: string[];
    marketMetrics: {
      price: number;
      change: number;
      changePercent: number;
      volume: number;
      timestamp: number;
    };
    analysisContext: {
      mentionCount: number;
      sentiment: 'bullish' | 'bearish' | 'neutral';
      confidence: number;
    };
  };
}

// Enhanced market context
export interface MarketContext {
  currentMarketHours: boolean;
  marketConditions: 'bull' | 'bear' | 'neutral';
  volatilityLevel: 'low' | 'medium' | 'high';
  timestamp: number;
  majorIndices: {
    [key: string]: {
      value: number;
      change: number;
      changePercent: number;
      volume: number;
    };
  };
  sectorPerformance: {
    [sector: string]: {
      change: number;
      volume: number;
      topMovers: Array<{
        symbol: string;
        change: number;
      }>;
    };
  };
  marketBreadth: {
    advancers: number;
    decliners: number;
    unchanged: number;
    totalVolume: number;
  };
}

// Enhanced message interface
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata: {
    instruments: string[];
    companies: string[];
    markets: string[];
    metrics: string[];
    timeframes: string[];
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
    technicalIndicators: string[];
    fundamentalFactors: string[];
    analysisType: 'technical' | 'fundamental' | 'mixed' | 'general';
    priority: 'critical' | 'high' | 'medium' | 'low';
    language?: 'en' | 'ar';
  };
  contextScore?: ContextScore;
}

// Enhanced conversation state
export interface ConversationState {
  id: string;
  currentCompany?: CompanyContext;
  recentCompanies: CompanyContext[];
  messageHistory: Array<Message>;
  analysisContext: {
    activeTechnicalAnalysis: boolean;
    fundamentalAnalysisActive: boolean;
    lastMarketUpdate: number;
    confidence: number;
    contextQuality: 'excellent' | 'good' | 'limited' | 'poor';
  };
  userPreferences: {
    preferredMarkets: string[];
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    preferredTimeframe: 'short' | 'medium' | 'long';
    technicalAnalysisLevel: 'basic' | 'intermediate' | 'advanced';
    language: 'en' | 'ar';
  };
  marketContext?: MarketContext;
  lastActivity: number;
  conversationStart: number;
}

// Context window management
export interface ContextWindow {
  maxSize: number;
  currentSize: number;
  priorityThreshold: number;
  recentMessages: Message[];
  marketSnapshots: MarketContext[];
  keyInsights: Array<{
    content: string;
    timestamp: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: 'market' | 'company' | 'sector' | 'general';
  }>;
}

export interface ContextScore {
  messageId: string;
  marketRelevance: number;
  timeRelevance: number;
  instrumentRelevance: number;
  userPriorityScore: number;
  finalScore: number;
  timestamp: number;
}

export interface AnalysisResponse {
  companies: CompanyContext[];
  sectors: Set<string>;
  confidence: number;
  analysisTimestamp: number;
  marketSnapshot?: MarketContext;
}

// Response schema for API
export interface ChatResponse {
  response: string;
  thinking: string;
  user_mood: 'positive' | 'neutral' | 'negative' | 'curious' | 'frustrated' | 'confused';
  suggested_questions: string[];
  financial_context: {
    instruments_mentioned: string[];
    market_sentiment: 'bullish' | 'bearish' | 'neutral';
    risk_level: 'low' | 'medium' | 'high';
    confidence_score: number;
    technical_indicators: string[];
    fundamental_factors: string[];
    sectors: string[];
    economic_indicators: string[];
    analysis_type: 'technical' | 'fundamental' | 'mixed' | 'general';
    market_data: any | null;
    key_insights: string[];
  };
  debug: {
    context_used: boolean;
    market_data_used: boolean;
    context_confidence: number;
    analysis_quality: string;
  };
}