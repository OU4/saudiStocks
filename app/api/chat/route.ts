// /app/api/chat/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import crypto from "crypto";
import { FinanceAnalyzer } from "@/app/lib/context/financeAnalyzer";
import { FinanceContextManager } from "@/app/lib/context/financeContextManager";
import { FinanceContextAnalyzer } from "@/app/lib/context/financeContextUtils";
import { SaudiMarketHandler } from "@/app/market/saudiMarketHandler";
import { SaudiFundamentals } from '@/app/lib/services/saudiFundamentals';


// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: {
    "anthropic-beta": "pdfs-2024-09-25"
  }
});

// Initialize singleton context manager
const contextManager = new FinanceContextManager();

// Enhanced response schema with Saudi market data
const responseSchema = z.object({
  response: z.string(),
  thinking: z.string(),
  user_mood: z.enum(["positive", "neutral", "negative", "curious", "frustrated", "confused"]),
  suggested_questions: z.array(z.string()),
  financial_context: z.object({
    instruments_mentioned: z.array(z.string()),
    market_sentiment: z.enum(["bullish", "bearish", "neutral"]),
    risk_level: z.enum(["low", "medium", "high"]),
    confidence_score: z.number(),
    technical_indicators: z.array(z.string()),
    fundamental_factors: z.array(z.string()),
    sectors: z.array(z.string()),
    economic_indicators: z.array(z.string()),
    analysis_type: z.enum(["technical", "fundamental", "mixed", "general"]),
    market_data: z.object({
      quotes: z.array(z.object({
        symbol: z.string(),
        name: z.string(),
        price: z.number().nonnegative(),
        change: z.number().default(0),
        percent_change: z.number().default(0),
        volume: z.number().nonnegative().default(0),
        timestamp: z.string().optional(),
        sector: z.string().optional()
      })).default([]),
      market_details: z.object({
        exchange: z.string(),
        currency: z.string(),
        trading_hours: z.string(),
        data_delay: z.string()
      }).optional(),
      recent_performance: z.array(z.any()).optional()
    }).optional().nullable(),
    key_insights: z.array(z.string())
  }),
  debug: z.object({
    context_used: z.boolean(),
    market_data_used: z.boolean(),
    context_confidence: z.number(),
    analysis_quality: z.string()
  })
});

export async function POST(req: Request) {
  try {
    const { messages, pdfData, conversationId = crypto.randomUUID() } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    // Analyze financial context
    const baseAnalysis = FinanceAnalyzer.analyzeFinancialContext(latestMessage);
    const contextAnalysis = FinanceContextAnalyzer.analyzeFinancialMessage(latestMessage);

    // Analyze Saudi market specific companies and sectors
    const saudiMarketAnalysis = await SaudiMarketHandler.analyzeMentionedCompanies(latestMessage);

    // Fetch financial data for mentioned companies
    const financialDataPromises = saudiMarketAnalysis.companies.map(company => 
      SaudiFundamentals.getFundamentals(company.symbol)
    );
    const financialDataResults = await Promise.all(financialDataPromises);

    // Combine all analyses
    const combinedAnalysis = {
      ...baseAnalysis,
      confidence: Math.max(baseAnalysis.confidence, contextAnalysis.confidenceScore || 0),
      sentiment: contextAnalysis.sentiment || baseAnalysis.sentiment,
      technicalIndicators: [
        ...new Set([
          ...baseAnalysis.technicalIndicators,
          ...(contextAnalysis.technicalIndicators || [])
        ])
      ],
      fundamentalFactors: [
        ...new Set([
          ...baseAnalysis.fundamentalFactors,
          ...(contextAnalysis.fundamentalFactors || [])
        ])
      ],
      sectors: Array.from(saudiMarketAnalysis.sectors)
    };

    // Update context manager
    const messageContext = {
      id: crypto.randomUUID(),
      role: 'user',
      content: latestMessage,
      timestamp: Date.now(),
      metadata: {
        instruments: combinedAnalysis.instruments,
        sentiment: combinedAnalysis.sentiment,
        riskLevel: combinedAnalysis.riskLevel,
        confidenceScore: combinedAnalysis.confidence,
        technicalIndicators: combinedAnalysis.technicalIndicators,
        fundamentalFactors: combinedAnalysis.fundamentalFactors,
        topics: combinedAnalysis.sectors,
        markets: combinedAnalysis.instruments
      }
    };

    contextManager.addMessage(conversationId, messageContext);
    const historicalContext = contextManager.getContextForPrompt(conversationId);

    // Get market data for mentioned companies
    let marketData = null;
    if (saudiMarketAnalysis.companies.length > 0) {
      const companyData = await Promise.all(
        saudiMarketAnalysis.companies.slice(0, 3).map(company => 
          SaudiMarketHandler.getCompanyData(company.symbol)
        )
      );

      // Integrate financial data with market data
      marketData = {
        quotes: saudiMarketAnalysis.companies.map((company, index) => ({
          ...company,
          fundamentals: financialDataResults[index]
        })),
        market_details: companyData[0]?.market_details,
        recent_performance: companyData[0]?.recent_performance
      };
    }

    // Build system context based on analysis
    let systemContext = [
      "You are a highly knowledgeable Saudi market financial advisor and analyst.",
      combinedAnalysis.analysisType === 'technical' && "Focus on technical analysis and chart patterns.",
      combinedAnalysis.analysisType === 'fundamental' && "Focus on fundamental analysis and company metrics.",
      combinedAnalysis.riskLevel === 'high' && "Be sure to emphasize risk factors and potential downsides.",
      historicalContext && `Previous context: ${historicalContext}`,
      marketData && `Current market data: ${JSON.stringify(marketData)}`,
      `Current market sentiment: ${combinedAnalysis.sentiment}`,
      `Analysis confidence: ${(combinedAnalysis.confidence * 100).toFixed(1)}%`
    ].filter(Boolean).join("\n");

    // Prepare message content
    const messageContent = pdfData ? [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: pdfData,
          },
        },
        {
          type: 'text',
          text: latestMessage,
        },
      ],
    }] : [{
      role: 'user',
      content: [{ 
        type: 'text', 
        text: `${systemContext}\n\nUser query: ${latestMessage}`
      }],
    }];

    // Get response from Claude
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: messageContent,
    });

    // Generate suggested questions based on context
    const suggestedQuestions = generateFinancialQuestions(
      combinedAnalysis,
      contextManager.getKeyInsights(conversationId),
      saudiMarketAnalysis
    );

    // Calculate analysis quality
    const analysisQuality = calculateAnalysisQuality(
      combinedAnalysis,
      historicalContext,
      saudiMarketAnalysis
    );

    // Prepare response data
    const responseData = {
      response: response.content[0].text,
      thinking: "Analyzing Saudi market data and financial context",
      user_mood: determineUserMood(latestMessage, combinedAnalysis),
      suggested_questions: suggestedQuestions,
      financial_context: {
        instruments_mentioned: combinedAnalysis.instruments,
        market_sentiment: combinedAnalysis.sentiment,
        risk_level: combinedAnalysis.riskLevel,
        confidence_score: combinedAnalysis.confidence,
        technical_indicators: combinedAnalysis.technicalIndicators,
        fundamental_factors: combinedAnalysis.fundamentalFactors,
        sectors: combinedAnalysis.sectors,
        economic_indicators: combinedAnalysis.economicIndicators,
        analysis_type: combinedAnalysis.analysisType,
        market_data: marketData,
        key_insights: contextManager.getKeyInsights(conversationId)
      },
      debug: { 
        context_used: !!historicalContext,
        market_data_used: !!marketData,
        context_confidence: contextManager.getActiveInstruments(conversationId).length > 0 ? 0.9 : 0.5,
        analysis_quality: analysisQuality
      }
    };

    // Validate response
    const validatedResponse = responseSchema.parse(responseData);
    
    return new Response(JSON.stringify({
      id: crypto.randomUUID(),
      conversationId,
      ...validatedResponse,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in chat handler:", error);
    return new Response(
      JSON.stringify({
        response: "An error occurred while processing your Saudi market query. Please try again.",
        thinking: "Error in analysis",
        user_mood: "frustrated",
        suggested_questions: [
          "Would you like to view the current market overview?",
          "Should we look at a specific sector instead?",
          "Would you like to know about top performing stocks?"
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
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}

function generateFinancialQuestions(
  analysis: any,
  insights: string[],
  marketAnalysis: { companies: any[], sectors: Set<string> }
): string[] {
  const questions = [];

  // Add Saudi market specific questions
  if (marketAnalysis.companies.length > 0) {
    const company = marketAnalysis.companies[0];
    questions.push(
      `What's your analysis of ${company.name}'s recent performance?`,
      `How does ${company.name} compare to its sector peers?`
    );
  }

  if (marketAnalysis.sectors.size > 0) {
    const sector = Array.from(marketAnalysis.sectors)[0];
    questions.push(
      `What's your outlook for the ${sector} sector?`,
      `Which companies in the ${sector} sector show the most promise?`
    );
  }

  // Add analysis-type specific questions
  if (analysis.technicalIndicators.length > 0) {
    questions.push(
      `How do the ${analysis.technicalIndicators[0]} levels compare to historical trends?`
    );
  }

  if (analysis.fundamentalFactors.length > 0) {
    questions.push(
      `How do these ${analysis.fundamentalFactors[0]} metrics compare to sector averages?`
    );
  }

  // Add general market questions if needed
  if (questions.length < 3) {
    questions.push(
      "What are the key factors driving the Saudi market today?",
      "Which sectors are showing the strongest momentum?",
      "How might current economic conditions affect the market?"
    );
  }

  // Return top 3 most relevant questions
  return questions.slice(0, 3);
}

function determineUserMood(
  message: string,
  analysis: any
): "positive" | "neutral" | "negative" | "curious" | "frustrated" | "confused" {
  const text = message.toLowerCase();
  
  if (text.includes('help') || text.includes('?')) return 'curious';
  if (text.includes('wrong') || text.includes('error')) return 'frustrated';
  if (text.includes('not sure') || text.includes('confused')) return 'confused';
  
  if (analysis.confidence > 0.8) {
    return analysis.sentiment === 'bullish' ? 'positive' : 
           analysis.sentiment === 'bearish' ? 'negative' : 'neutral';
  }
  
  return analysis.confidence < 0.5 ? 'curious' : 'neutral';
}

function calculateAnalysisQuality(
  analysis: any,
  historicalContext: string | null,
  marketAnalysis: { companies: any[], sectors: Set<string> }
): string {
  const factors = {
    hasCompanies: marketAnalysis.companies.length > 0,
    hasSectors: marketAnalysis.sectors.size > 0,
    hasTechnical: analysis.technicalIndicators.length > 0,
    hasFundamental: analysis.fundamentalFactors.length > 0,
    hasHistory: !!historicalContext,
    highConfidence: analysis.confidence > 0.7
  };

  const score = Object.values(factors).filter(Boolean).length;

  if (score >= 5) return 'excellent';
  if (score >= 3) return 'good';
  if (score >= 1) return 'fair';
  return 'limited';
}