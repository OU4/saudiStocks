// /app/types/chat.ts

export interface FinancialMetadata {
    instruments?: string[];
    sentiment?: 'bullish' | 'bearish' | 'neutral';
    riskLevel?: 'low' | 'medium' | 'high';
    confidenceScore?: number;
    technicalIndicators?: string[];
    fundamentalFactors?: string[];
  }
  
  export interface Message {
    id: string;
    role: string;
    content: string;
    metadata?: FinancialMetadata;
  }
  
  export interface ChatResponse {
    id: string;
    response: string;
    thinking: string;
    user_mood: string;
    suggested_questions: string[];
    financial_context: {
      instruments_mentioned: string[];
      market_sentiment: 'bullish' | 'bearish' | 'neutral';
      risk_level: 'low' | 'medium' | 'high';
      confidence_score: number;
      technical_indicators: string[];
      fundamental_factors: string[];
    };
    debug: {
      context_used: boolean;
      market_data_used: boolean;
    };
  }