// /app/lib/context/types.ts

export interface FinancialMetadata {
    instruments?: string[];              // Mentioned financial instruments
    companies?: string[];               // Mentioned companies
    markets?: string[];                 // Mentioned markets/exchanges
    metrics?: string[];                 // Financial metrics discussed
    timeframes?: string[];             // Timeframes mentioned
    sentiment?: 'bullish' | 'bearish' | 'neutral';
    confidenceScore?: number;          // Confidence in financial analysis
    riskLevel?: 'low' | 'medium' | 'high';
    technicalIndicators?: string[];    // Technical analysis indicators
    fundamentalFactors?: string[];     // Fundamental analysis factors
  }
  
  export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    metadata: FinancialMetadata;
  }
  
  export interface MarketContext {
    currentMarketHours: boolean;
    marketConditions: 'bull' | 'bear' | 'neutral';
    volatilityLevel: 'low' | 'medium' | 'high';
    majorIndices: {
      [key: string]: {
        value: number;
        change: number;
        changePercent: number;
      };
    };
  }
  
  export interface ConversationContext {
    conversationId: string;
    messages: Message[];
    activeInstruments: string[];
    activeTechnicalAnalysis: boolean;
    fundamentalAnalysisActive: boolean;
    marketContext?: MarketContext;
    lastUpdated: number;
    userPreferences?: {
      preferredMarkets?: string[];
      riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
      preferredTimeframe?: 'short' | 'medium' | 'long';
      technicalAnalysisLevel?: 'basic' | 'intermediate' | 'advanced';
    };
  }
  
  export interface ContextWindow {
    maxSize: number;
    currentSize: number;
    priorityThreshold: number;
    recentMessages: Message[];
    marketSnapshots: MarketContext[];
    keyInsights: string[];
  }
  
  export type ContextPriority = 'critical' | 'high' | 'medium' | 'low';
  
  export interface ContextScore {
    messageId: string;
    marketRelevance: number;
    timeRelevance: number;
    instrumentRelevance: number;
    userPriorityScore: number;
    finalScore: number;
  }