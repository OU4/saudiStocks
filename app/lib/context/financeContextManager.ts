// /app/lib/context/financeContextManager.ts

import { 
  Message, 
  ConversationContext, 
  ContextWindow, 
  ContextScore,
  ContextPriority,
  MarketContext,
  FinancialMetadata 
} from './types';

export class FinanceContextManager {
  private readonly maxWindowSize: number;
  private contexts: Map<string, ConversationContext>;
  private activeWindow: ContextWindow;
  private marketContext: MarketContext;

  constructor(maxWindowSize: number = 4096) {
    this.maxWindowSize = maxWindowSize;
    this.contexts = new Map();
    this.activeWindow = {
      maxSize: maxWindowSize,
      currentSize: 0,
      priorityThreshold: 0.7,
      recentMessages: [],
      marketSnapshots: [],
      keyInsights: []
    };
    this.marketContext = {
      currentMarketHours: false,
      marketConditions: 'neutral',
      volatilityLevel: 'low',
      majorIndices: {}
    };
  }

  private calculateFinancialContextScore(message: Message, currentTime: number): ContextScore {
    const timeRelevance = Math.exp(-(currentTime - message.timestamp) / (1000 * 60 * 60));
    const metadata = message.metadata;
    
    let marketRelevance = 0.5;
    if (metadata) {
      if (metadata.instruments?.length) marketRelevance += 0.1;
      if (metadata.markets?.length) marketRelevance += 0.1;
      if (metadata.technicalIndicators?.length) marketRelevance += 0.1;
      if (metadata.fundamentalFactors?.length) marketRelevance += 0.1;
    }

    let instrumentRelevance = 0.5;
    if (metadata?.instruments?.length) {
      instrumentRelevance = 0.7;
      if (this.isActiveInstrument(metadata.instruments[0])) {
        instrumentRelevance = 0.9;
      }
    }

    let userPriorityScore = 0.5;
    if (metadata) {
      if (metadata.riskLevel === 'high') userPriorityScore += 0.2;
      if (metadata.confidenceScore && metadata.confidenceScore > 0.8) userPriorityScore += 0.1;
    }

    return {
      messageId: message.id,
      marketRelevance,
      timeRelevance,
      instrumentRelevance,
      userPriorityScore,
      finalScore: (
        marketRelevance * 0.3 +
        timeRelevance * 0.2 +
        instrumentRelevance * 0.3 +
        userPriorityScore * 0.2
      )
    };
  }

  private isActiveInstrument(instrument: string): boolean {
    const contexts = Array.from(this.contexts.values());
    return contexts.some(context => 
      context.activeInstruments.includes(instrument)
    );
  }

  public addMessage(conversationId: string, message: Message): void {
    let context = this.contexts.get(conversationId);
    
    if (!context) {
      context = {
        conversationId,
        messages: [],
        activeInstruments: [],
        activeTechnicalAnalysis: false,
        fundamentalAnalysisActive: false,
        lastUpdated: Date.now(),
        userPreferences: {
          preferredMarkets: [],
          riskTolerance: 'moderate',
          preferredTimeframe: 'medium',
          technicalAnalysisLevel: 'basic'
        }
      };
      this.contexts.set(conversationId, context);
    }

    if (message.metadata?.instruments) {
      context.activeInstruments = Array.from(new Set([
        ...context.activeInstruments,
        ...message.metadata.instruments
      ]));
    }

    if (message.metadata?.technicalIndicators?.length) {
      context.activeTechnicalAnalysis = true;
    }
    if (message.metadata?.fundamentalFactors?.length) {
      context.fundamentalAnalysisActive = true;
    }

    context.messages.push(message);
    context.lastUpdated = Date.now();
    this.updateActiveWindow(context);
  }

  private updateActiveWindow(context: ConversationContext): void {
    const currentTime = Date.now();
    
    const scoredMessages = context.messages
      .map(msg => ({
        message: msg,
        score: this.calculateFinancialContextScore(msg, currentTime)
      }))
      .sort((a, b) => b.score.finalScore - a.score.finalScore);

    this.activeWindow.recentMessages = scoredMessages
      .filter(scored => scored.score.finalScore > this.activeWindow.priorityThreshold)
      .map(scored => scored.message)
      .slice(0, Math.floor(this.maxWindowSize / 2));

    this.activeWindow.keyInsights = this.extractFinancialInsights(
      scoredMessages.slice(0, 5).map(scored => scored.message)
    );

    if (this.shouldTakeMarketSnapshot(context)) {
      this.activeWindow.marketSnapshots.push({ ...this.marketContext });
    }
  }

  private shouldTakeMarketSnapshot(context: ConversationContext): boolean {
    const latestMessage = context.messages[context.messages.length - 1];
    return Boolean(
      latestMessage.metadata?.markets?.length ||
      (this.marketContext.volatilityLevel === 'high' && Math.random() > 0.7)
    );
  }

  private extractFinancialInsights(messages: Message[]): string[] {
    const insights = new Set<string>();
    
    messages.forEach(message => {
      const metadata = message.metadata;
      if (metadata) {
        if (metadata.technicalIndicators?.length) {
          insights.add(`Technical Analysis: ${metadata.technicalIndicators.join(', ')}`);
        }
        
        if (metadata.fundamentalFactors?.length) {
          insights.add(`Fundamental Factors: ${metadata.fundamentalFactors.join(', ')}`);
        }

        if (metadata.sentiment) {
          insights.add(`Market Sentiment: ${metadata.sentiment}`);
        }

        if (metadata.riskLevel) {
          insights.add(`Risk Level: ${metadata.riskLevel}`);
        }
      }
    });

    return Array.from(insights);
  }

  public getContextForPrompt(conversationId: string): string {
    const context = this.contexts.get(conversationId);
    if (!context) return '';

    const relevantMessages = this.activeWindow.recentMessages
      .map(msg => {
        const metadata = msg.metadata;
        return `${msg.role}: ${msg.content}
        ${metadata ? `
        Instruments: ${metadata.instruments?.join(', ') || 'none'}
        Technical Indicators: ${metadata.technicalIndicators?.join(', ') || 'none'}
        Sentiment: ${metadata.sentiment || 'neutral'}
        Risk Level: ${metadata.riskLevel || 'medium'}` : ''}`;
      })
      .join('\n\n');

    const marketContext = this.activeWindow.marketSnapshots.length > 0 
      ? `\nCurrent Market Context:
        Market Hours: ${this.marketContext.currentMarketHours ? 'Open' : 'Closed'}
        Conditions: ${this.marketContext.marketConditions}
        Volatility: ${this.marketContext.volatilityLevel}`
      : '';

    const insights = this.activeWindow.keyInsights.length > 0
      ? `\nKey Insights:\n${this.activeWindow.keyInsights.join('\n')}`
      : '';

    return `${marketContext}\n${insights}\n\nRecent Discussion:\n${relevantMessages}`;
  }

  public updateMarketContext(newContext: Partial<MarketContext>): void {
    this.marketContext = { ...this.marketContext, ...newContext };
  }

  public getActiveInstruments(conversationId: string): string[] {
    return this.contexts.get(conversationId)?.activeInstruments || [];
  }

  public getCurrentMarketContext(): MarketContext {
    return this.marketContext;
  }

  public getKeyInsights(conversationId: string): string[] {
    return this.activeWindow.keyInsights;
  }
}