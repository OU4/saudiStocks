import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { SaudiMarketHandler } from "@/app/market/saudiMarketHandler";
import { SaudiFundamentals } from "@/app/lib/services/saudiFundamentals";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Core response schema
const responseSchema = z.object({
  response: z.string(),
  thinking: z.string(),
  user_mood: z.enum(["positive", "neutral", "negative", "curious", "frustrated", "confused"]),
  suggested_questions: z.array(z.string()),
  financial_context: z.object({
    companies: z.array(z.object({
      symbol: z.string(),
      name: z.string(),
      sector: z.string().optional(),
      price: z.number().optional(),
      change: z.number().optional(),
      analysis: z.any().optional()
    })).default([]),
    market_sentiment: z.enum(["bullish", "bearish", "neutral"]).default("neutral"),
    risk_level: z.enum(["low", "medium", "high"]).default("medium"),
    confidence_score: z.number().default(0.5),
    key_insights: z.array(z.string()).default([]),
    analysis_details: z.any().optional()
  }),
  debug: z.object({
    context_used: z.boolean().default(false),
    market_data_used: z.boolean().default(false),
    analysis_quality: z.string().default("limited")
  })
});

export async function POST(req: Request) {
  try {
    const { messages, documentContext } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    // Step 1: Market Analysis
    const marketContext = await analyzeMarket(latestMessage);

    // Step 2: Get Claude's Response
    const enhancedPrompt = buildPrompt(latestMessage, marketContext, documentContext);
    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [{ role: 'user', content: enhancedPrompt }],
    });

    // Step 3: Build Enhanced Response
    const response = await buildResponse(claudeResponse.content[0].text, marketContext);
    
    // Validate and return
    const validatedResponse = responseSchema.parse(response);
    return new Response(JSON.stringify(validatedResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in chat handler:", error);
    return handleError(error);
  }
}

async function analyzeMarket(message: string) {
  // Get market data
  const marketAnalysis = await SaudiMarketHandler.analyzeMentionedCompanies(message);
  
  // Get fundamentals for mentioned companies
  const fundamentals = await Promise.all(
    marketAnalysis.companies.map(company => 
      SaudiFundamentals.getFundamental(company.symbol)
    )
  );

  // Analyze sentiment
  const sentiment = analyzeSentiment(message, marketAnalysis.companies);

  return {
    companies: marketAnalysis.companies,
    sectors: Array.from(marketAnalysis.sectors),
    fundamentals: fundamentals.filter(f => f !== null),
    sentiment,
    timestamp: new Date().toISOString()
  };
}

function buildPrompt(message: string, marketContext: any, documentContext?: any) {
  const contextParts = [
    "You are a highly knowledgeable Saudi market financial advisor and analyst.",
    "Provide clear, concise analysis and recommendations.",
    
    // Market Context
    marketContext.companies.length > 0 && `
    Analyzing companies: ${marketContext.companies.map(c => c.name).join(', ')}
    Sectors involved: ${marketContext.sectors.join(', ')}
    Market sentiment: ${marketContext.sentiment.sentiment}
    `,

    // Document Context (if available)
    documentContext && `Reference materials available: ${documentContext}`,
    
    // User Query
    `User query: ${message}`
  ].filter(Boolean);

  return contextParts.join("\n\n");
}

async function buildResponse(claudeResponse: string, marketContext: any) {
  const suggestedQuestions = generateQuestions(marketContext);
  const insights = generateInsights(marketContext);

  return {
    response: claudeResponse,
    thinking: "Analyzing Saudi market data",
    user_mood: determineUserMood(claudeResponse),
    suggested_questions: suggestedQuestions,
    financial_context: {
      companies: marketContext.companies.map(enrichCompanyData),
      market_sentiment: marketContext.sentiment.sentiment,
      risk_level: assessRiskLevel(marketContext),
      confidence_score: calculateConfidence(marketContext),
      key_insights: insights,
      analysis_details: {
        fundamentals: marketContext.fundamentals,
        sentiment: marketContext.sentiment
      }
    },
    debug: {
      context_used: true,
      market_data_used: marketContext.companies.length > 0,
      analysis_quality: determineQuality(marketContext)
    }
  };
}

// Helper Functions
function analyzeSentiment(message: string, companies: any[]) {
  const bullishTerms = ['up', 'gain', 'grow', 'positive', 'bullish'];
  const bearishTerms = ['down', 'loss', 'decline', 'negative', 'bearish'];
  
  let score = 0;
  const text = message.toLowerCase();
  
  bullishTerms.forEach(term => text.includes(term) && score++);
  bearishTerms.forEach(term => text.includes(term) && score--);
  
  if (companies.length > 0) {
    const avgChange = companies.reduce((sum, c) => sum + (c.percent_change || 0), 0) / companies.length;
    score += Math.sign(avgChange);
  }

  return {
    sentiment: score > 0 ? 'bullish' : score < 0 ? 'bearish' : 'neutral',
    confidence: Math.min(Math.abs(score) / 3, 0.9)
  };
}

function enrichCompanyData(company: any) {
  return {
    symbol: company.symbol,
    name: company.name,
    sector: company.sector,
    price: company.price,
    change: company.percent_change,
    analysis: {
      momentum: company.percent_change > 0 ? 'positive' : 'negative',
      activity: company.volume > (company.avg_volume || 0) ? 'high' : 'normal'
    }
  };
}

function generateQuestions(context: any): string[] {
  const questions = new Set<string>();
  
  if (context.companies.length > 0) {
    const company = context.companies[0];
    questions.add(`What's the outlook for ${company.name}?`);
  }
  
  if (context.sectors.length > 0) {
    questions.add(`How is the ${context.sectors[0]} sector performing?`);
  }

  questions.add("What are the key market trends today?");
  
  return Array.from(questions).slice(0, 3);
}

function generateInsights(context: any): string[] {
  const insights = [];
  
  if (context.companies.length > 0) {
    const movers = context.companies.filter(c => Math.abs(c.percent_change) > 2);
    if (movers.length > 0) {
      insights.push(
        `Significant price movements in: ${movers.map(c => c.name).join(', ')}`
      );
    }
  }

  if (context.fundamentals?.length > 0) {
    const strongFundamentals = context.fundamentals.filter(f => 
      f?.financials?.profit_margin > 0.15
    );
    if (strongFundamentals.length > 0) {
      insights.push("Companies showing strong profitability metrics");
    }
  }

  return insights;
}

function determineUserMood(response: string): "positive" | "neutral" | "negative" | "curious" | "frustrated" | "confused" {
  const text = response.toLowerCase();
  if (text.includes('help') || text.includes('?')) return 'curious';
  if (text.includes('thank') || text.includes('great')) return 'positive';
  if (text.includes('error') || text.includes('wrong')) return 'frustrated';
  if (text.includes('not sure')) return 'confused';
  if (text.includes('bad')) return 'negative';
  return 'neutral';
}

function assessRiskLevel(context: any): "low" | "medium" | "high" {
  const volatility = context.companies.some(c => Math.abs(c.percent_change) > 5);
  const fundamentalRisk = context.fundamentals.some(f => 
    f?.valuation_metrics?.trailing_pe > 30
  );
  
  if (volatility && fundamentalRisk) return "high";
  if (volatility || fundamentalRisk) return "medium";
  return "low";
}

function calculateConfidence(context: any): number {
  let score = 0.5;
  if (context.companies.length > 0) score += 0.2;
  if (context.fundamentals.length > 0) score += 0.2;
  if (context.sentiment.confidence > 0.7) score += 0.1;
  return Math.min(score, 0.95);
}

function determineQuality(context: any): string {
  const hasCompanies = context.companies.length > 0;
  const hasFundamentals = context.fundamentals.length > 0;
  
  if (hasCompanies && hasFundamentals) return 'comprehensive';
  if (hasCompanies || hasFundamentals) return 'good';
  return 'limited';
}

function handleError(error: unknown) {
  return new Response(
    JSON.stringify({
      response: "An error occurred while processing your request.",
      thinking: "Error occurred",
      user_mood: "frustrated",
      suggested_questions: [
        "Would you like to try a different query?",
        "Should we look at the overall market instead?",
        "Would you like to focus on a specific sector?"
      ],
      financial_context: {
        companies: [],
        market_sentiment: "neutral",
        risk_level: "medium",
        confidence_score: 0,
        key_insights: [],
      },
      debug: {
        context_used: false,
        market_data_used: false,
        analysis_quality: "error"
      }
    }),
    { status: 500 }
  );
}