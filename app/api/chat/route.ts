// /app/api/chat/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import crypto from "crypto";
import { SaudiMarketHandler } from "@/app/market/saudiMarketHandler";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Response schema matching the ChatArea component expectations
const responseSchema = z.object({
  response: z.string(),
  thinking: z.string(),
  user_mood: z.enum(["positive", "neutral", "negative", "curious", "frustrated", "confused"]),
  suggested_questions: z.array(z.string()),
  financial_context: z.object({
    instruments_mentioned: z.array(z.string()).default([]),
    market_sentiment: z.enum(["bullish", "bearish", "neutral"]).default("neutral"),
    risk_level: z.enum(["low", "medium", "high"]).default("medium"),
    confidence_score: z.number().default(0.5),
    technical_indicators: z.array(z.string()).default([]),
    fundamental_factors: z.array(z.string()).default([]),
    sectors: z.array(z.string()).default([]),
    economic_indicators: z.array(z.string()).default([]),
    analysis_type: z.enum(["technical", "fundamental", "mixed", "general"]).default("general"),
    market_data: z.any().nullable().default(null),
    key_insights: z.array(z.string()).default([])
  }),
  debug: z.object({
    context_used: z.boolean().default(false),
    market_data_used: z.boolean().default(false),
    context_confidence: z.number().default(0.5),
    analysis_quality: z.string().default("limited")
  })
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    // Analyze Saudi market mentions
    let marketContext = null;
    let marketAnalysis = {
      companies: [],
      sectors: new Set<string>()
    };

    try {
      marketAnalysis = await SaudiMarketHandler.analyzeMentionedCompanies(latestMessage);
      if (marketAnalysis.companies.length > 0 || marketAnalysis.sectors.size > 0) {
        marketContext = {
          companies: marketAnalysis.companies,
          sectors: Array.from(marketAnalysis.sectors)
        };
      }
    } catch (error) {
      console.error("Market analysis error:", error);
    }

    // Analyze market sentiment
    const sentiment = analyzeSentiment(latestMessage);

    // Prepare system context
    const systemContext = [
      "You are a highly knowledgeable Saudi market financial advisor and analyst.",
      "Provide clear, concise analysis and recommendations.",
      marketContext && `Current market context: ${JSON.stringify(marketContext)}`,
    ].filter(Boolean).join("\n");

    // Get response from Claude
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `${systemContext}\n\nUser query: ${latestMessage}`
      }],
    });

    // Generate suggested questions based on context
    const suggestedQuestions = generateSuggestedQuestions(marketContext);

    // Prepare response data matching the expected schema
    const responseData = {
      response: response.content[0].text,
      thinking: "Analyzing Saudi market data",
      user_mood: determineUserMood(latestMessage),
      suggested_questions: suggestedQuestions,
      financial_context: {
        instruments_mentioned: marketAnalysis.companies.map(c => c.symbol),
        market_sentiment: sentiment,
        risk_level: assessRiskLevel(latestMessage),
        confidence_score: calculateConfidence(marketAnalysis),
        technical_indicators: extractTechnicalIndicators(latestMessage),
        fundamental_factors: extractFundamentalFactors(latestMessage),
        sectors: Array.from(marketAnalysis.sectors),
        economic_indicators: [],
        analysis_type: determineAnalysisType(latestMessage),
        market_data: marketContext,
        key_insights: generateKeyInsights(marketContext, sentiment)
      },
      debug: {
        context_used: !!marketContext,
        market_data_used: !!marketContext,
        context_confidence: marketAnalysis.companies.length > 0 ? 0.8 : 0.5,
        analysis_quality: determineAnalysisQuality(marketAnalysis)
      }
    };

    // Validate response
    const validatedResponse = responseSchema.parse(responseData);

    return new Response(JSON.stringify(validatedResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in chat handler:", error);
    
    // Return error response matching the expected schema
    const errorResponse = {
      response: "An error occurred while processing your request. Please try again.",
      thinking: "Error occurred",
      user_mood: "frustrated",
      suggested_questions: [
        "Would you like to view the current market overview?",
        "Should we look at a specific sector instead?",
        "Would you like to try a different query?"
      ],
      financial_context: {
        instruments_mentioned: [],
        market_sentiment: "neutral",
        risk_level: "medium",
        confidence_score: 0,
        technical_indicators: [],
        fundamental_factors: [],
        sectors: [],
        economic_indicators: [],
        analysis_type: "general",
        market_data: null,
        key_insights: []
      },
      debug: {
        context_used: false,
        market_data_used: false,
        context_confidence: 0,
        analysis_quality: "error"
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Helper functions
function analyzeSentiment(text: string): "bullish" | "bearish" | "neutral" {
  const bullishWords = ['up', 'gain', 'grow', 'positive', 'bullish', 'increase'];
  const bearishWords = ['down', 'loss', 'decline', 'negative', 'bearish', 'decrease'];
  
  const text_lower = text.toLowerCase();
  const bullishCount = bullishWords.filter(word => text_lower.includes(word)).length;
  const bearishCount = bearishWords.filter(word => text_lower.includes(word)).length;
  
  if (bullishCount > bearishCount) return "bullish";
  if (bearishCount > bullishCount) return "bearish";
  return "neutral";
}

function assessRiskLevel(text: string): "low" | "medium" | "high" {
  const highRiskWords = ['volatile', 'risky', 'speculative'];
  const lowRiskWords = ['safe', 'stable', 'conservative'];
  
  const text_lower = text.toLowerCase();
  const highRiskCount = highRiskWords.filter(word => text_lower.includes(word)).length;
  const lowRiskCount = lowRiskWords.filter(word => text_lower.includes(word)).length;
  
  if (highRiskCount > lowRiskCount) return "high";
  if (lowRiskCount > highRiskCount) return "low";
  return "medium";
}

function calculateConfidence(analysis: { companies: any[], sectors: Set<string> }): number {
  let confidence = 0.5; // base confidence
  if (analysis.companies.length > 0) confidence += 0.2;
  if (analysis.sectors.size > 0) confidence += 0.1;
  return Math.min(confidence, 1);
}

function extractTechnicalIndicators(text: string): string[] {
  const indicators = ['RSI', 'MACD', 'moving average', 'support', 'resistance', 'trend'];
  return indicators.filter(i => text.toLowerCase().includes(i.toLowerCase()));
}

function extractFundamentalFactors(text: string): string[] {
  const factors = ['revenue', 'profit', 'earnings', 'PE ratio', 'dividend', 'growth'];
  return factors.filter(f => text.toLowerCase().includes(f.toLowerCase()));
}

function determineAnalysisType(text: string): "technical" | "fundamental" | "mixed" | "general" {
  const technicalCount = extractTechnicalIndicators(text).length;
  const fundamentalCount = extractFundamentalFactors(text).length;
  
  if (technicalCount > 0 && fundamentalCount > 0) return "mixed";
  if (technicalCount > 0) return "technical";
  if (fundamentalCount > 0) return "fundamental";
  return "general";
}

function generateKeyInsights(marketContext: any, sentiment: string): string[] {
  const insights = [];
  
  if (marketContext?.companies.length > 0) {
    insights.push(`Analysis focused on ${marketContext.companies[0].name}`);
  }
  
  if (marketContext?.sectors.length > 0) {
    insights.push(`Sector analysis: ${marketContext.sectors.join(', ')}`);
  }
  
  insights.push(`Overall market sentiment: ${sentiment}`);
  
  return insights;
}

function determineAnalysisQuality(analysis: { companies: any[], sectors: Set<string> }): string {
  if (analysis.companies.length > 0 && analysis.sectors.size > 0) return "excellent";
  if (analysis.companies.length > 0 || analysis.sectors.size > 0) return "good";
  return "limited";
}

function generateSuggestedQuestions(marketContext: any): string[] {
  const questions = [];

  if (marketContext?.companies.length > 0) {
    const company = marketContext.companies[0];
    questions.push(
      `Can you analyze ${company.name}'s recent performance?`,
      `How does ${company.name} compare to its competitors?`
    );
  }

  if (marketContext?.sectors.length > 0) {
    const sector = marketContext.sectors[0];
    questions.push(
      `What's your outlook for the ${sector} sector?`,
      `Which are the top companies in the ${sector} sector?`
    );
  }

  if (questions.length < 2) {
    questions.push(
      "What are the key trends in the Saudi market today?",
      "Which sectors are showing strong growth potential?",
      "What are the major market movers today?"
    );
  }

  return questions.slice(0, 3);
}

function determineUserMood(message: string): "positive" | "neutral" | "negative" | "curious" | "frustrated" | "confused" {
  const text = message.toLowerCase();
  
  if (text.includes('help') || text.includes('?')) return 'curious';
  if (text.includes('wrong') || text.includes('error')) return 'frustrated';
  if (text.includes('not sure') || text.includes('confused')) return 'confused';
  if (text.includes('thank') || text.includes('good')) return 'positive';
  if (text.includes('bad') || text.includes('poor')) return 'negative';
  
  return 'neutral';
}