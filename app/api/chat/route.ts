import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { SaudiMarketHandler } from "@/app/market/saudiMarketHandler";
import { SaudiFundamentals } from "@/app/lib/services/saudiFundamentals";
import { FinancialDocumentStore } from "@/app/documents/store/documentStore";
import { DocumentQuery, DocumentSearchResult, FinancialDocument } from "@/app/documents/types/document";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Type Definitions
interface MarketContext {
  companies: any[];
  sectors: string[];
  fundamentals: any[];
  sentiment: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    factors: string[];
  };
  technicalSignals: any[];
  timestamp: string;
}

interface DocumentContext {
  documents: DocumentSearchResult[];
  context: string;
  confidence: number;
}

interface AnalysisResult {
  marketContext: MarketContext;
  documentContext: DocumentContext | null;
}

// Response Schema
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
      analysis: z.object({
        sentiment: z.string(),
        fundamentals: z.any(),
        technical: z.any(),
        risks: z.array(z.string())
      }).optional()
    })).default([]),
    market_sentiment: z.enum(["bullish", "bearish", "neutral"]).default("neutral"),
    risk_level: z.enum(["low", "medium", "high"]).default("medium"),
    confidence_score: z.number().default(0.5),
    key_insights: z.array(z.string()).default([]),
    market_analysis: z.object({
      technicalSignals: z.array(z.any()),
      fundamentalFactors: z.array(z.any()),
      sectorAnalysis: z.any(),
      marketTrends: z.array(z.string())
    }).optional(),
    documents_used: z.array(z.object({
      id: z.string(),
      title: z.string(),
      category: z.string(),
      relevance: z.number(),
      key_excerpts: z.array(z.string()),
      last_updated: z.string()
    })).default([])
  }),
  debug: z.object({
    context_used: z.boolean().default(false),
    market_data_used: z.boolean().default(false),
    document_data_used: z.boolean().default(false),
    analysis_quality: z.string().default("limited"),
    confidence: z.object({
      market: z.number().default(0),
      documents: z.number().default(0),
      overall: z.number().default(0)
    })
  })
});

// Main Route Handler
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    // Analyze context
    const analysis = await analyzeContext(latestMessage);

    // Get Claude's response
    const prompt = buildPrompt(latestMessage, analysis);
    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    // Build enhanced response
    const response = await buildResponse(
      claudeResponse.content[0].text,
      analysis,
      messages
    );

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

// SECTION 2: Analysis Functions

async function analyzeContext(message: string): Promise<AnalysisResult> {
  try {
    // Step 1: Get market context first to identify companies
    const marketContext = await analyzeMarketContext(message);
    
    // Step 2: Get relevant documents based on mentioned companies
    let documentContext = null;
    if (marketContext.companies.length > 0) {
      documentContext = await getRelevantCompanyDocuments(
        message,
        marketContext.companies.map(c => c.symbol)
      );
    } else {
      // If no specific companies, get general market documents
      documentContext = await analyzeDocumentContext(message);
    }

    return {
      marketContext,
      documentContext
    };
  } catch (error) {
    console.error('Error in context analysis:', error);
    throw error;
  }
}

async function analyzeMarketContext(message: string): Promise<MarketContext> {
  // Get market data
  const marketAnalysis = await SaudiMarketHandler.analyzeMentionedCompanies(message);
  
  // Get fundamentals for mentioned companies
  const fundamentalsPromises = marketAnalysis.companies.map(async company => {
    try {
      return await SaudiFundamentals.getFundamental(company.symbol);
    } catch (error) {
      console.error(`Error fetching fundamentals for ${company.symbol}:`, error);
      return null;
    }
  });

  const fundamentals = (await Promise.all(fundamentalsPromises))
    .filter((f): f is NonNullable<typeof f> => f !== null);

  // Generate technical signals
  const technicalSignals = await generateTechnicalSignals(marketAnalysis.companies);

  // Analyze sentiment
  const sentiment = analyzeMarketSentiment(message, marketAnalysis, fundamentals);

  return {
    companies: marketAnalysis.companies,
    sectors: Array.from(marketAnalysis.sectors),
    fundamentals,
    sentiment,
    technicalSignals,
    timestamp: new Date().toISOString()
  };
}

async function analyzeDocumentContext(message: string): Promise<DocumentContext | null> {
  const documentStore = FinancialDocumentStore.getInstance();
  
  try {
    // Search for relevant documents
    const query: DocumentQuery = {
      searchTerm: message,
      limit: 5
    };

    const searchResults = await documentStore.searchDocuments(query);
    if (searchResults.length === 0) return null;

    // Build context string and calculate confidence
    return {
      documents: searchResults,
      context: buildDocumentContext(searchResults),
      confidence: calculateDocumentConfidence(searchResults)
    };
  } catch (error) {
    console.error("Error analyzing documents:", error);
    return null;
  }
}

async function getRelevantCompanyDocuments(
  message: string,
  companySymbols: string[]
): Promise<DocumentContext | null> {
  const documentStore = FinancialDocumentStore.getInstance();
  const allRelevantDocs: DocumentSearchResult[] = [];

  // Get documents for each company
  for (const symbol of companySymbols) {
    try {
      const docs = await documentStore.searchDocuments({
        searchTerm: symbol,
        category: ['financial_report', 'research', 'profile'],
        limit: 3
      });
      allRelevantDocs.push(...docs);
    } catch (error) {
      console.error(`Error fetching documents for ${symbol}:`, error);
    }
  }

  // Also search for documents matching the user's query
  const queryDocs = await documentStore.searchDocuments({
    searchTerm: message,
    limit: 3
  });

  // Combine and deduplicate documents
  const uniqueDocs = Array.from(
    new Map([
      ...allRelevantDocs, 
      ...queryDocs
    ].map(doc => [doc.document.metadata.id, doc])).values()
  );

  if (uniqueDocs.length === 0) return null;

  return {
    documents: uniqueDocs,
    context: buildDocumentContext(uniqueDocs),
    confidence: calculateDocumentConfidence(uniqueDocs)
  };
}
function extractFundamentalFactors(analysis: AnalysisResult): any[] {
  const factors: any[] = [];

  analysis.marketContext.fundamentals.forEach(fundamental => {
    const companyFactors = {
      symbol: fundamental.symbol,
      profitMargin: fundamental.financials?.profit_margin,
      revenueGrowth: fundamental.financials?.revenue_growth,
      peRatio: fundamental.valuation_metrics?.trailing_pe,
      debtToEquity: fundamental.financials?.debt_to_equity
    };
    factors.push(companyFactors);
  });

  return factors;
}

function analyzeMarketSentiment(
  message: string,
  marketData: any,
  fundamentals: any[]
): { sentiment: 'bullish' | 'bearish' | 'neutral'; confidence: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  
  // Text analysis
  const bullishTerms = ['up', 'gain', 'grow', 'positive', 'bullish', 'outperform'];
  const bearishTerms = ['down', 'loss', 'decline', 'negative', 'bearish', 'underperform'];
  
  const text = message.toLowerCase();
  bullishTerms.forEach(term => {
    if (text.includes(term)) {
      score++;
      factors.push(`Bullish language: "${term}"`);
    }
  });
  
  bearishTerms.forEach(term => {
    if (text.includes(term)) {
      score--;
      factors.push(`Bearish language: "${term}"`);
    }
  });

  // Price action analysis
  if (marketData.companies.length > 0) {
    const avgChange = marketData.companies.reduce(
      (sum: number, company: any) => sum + (company.percent_change || 0), 
      0
    ) / marketData.companies.length;
    
    score += Math.sign(avgChange);
    factors.push(`Average price change: ${avgChange.toFixed(2)}%`);
  }

  // Fundamental analysis contribution
  if (fundamentals.length > 0) {
    const fundamentalScore = fundamentals.reduce((sum, company) => {
      let companyScore = 0;
      if (company.financials?.profit_margin > 0.15) companyScore++;
      if (company.financials?.revenue_growth > 0.1) companyScore++;
      if (company.valuation_metrics?.peg_ratio < 1) companyScore++;
      return sum + companyScore;
    }, 0) / fundamentals.length;

    score += fundamentalScore;
    factors.push(`Fundamental analysis score: ${fundamentalScore.toFixed(2)}`);
  }

  return {
    sentiment: score > 0 ? 'bullish' : score < 0 ? 'bearish' : 'neutral',
    confidence: Math.min(Math.abs(score) / 5, 0.9),
    factors
  };
}

async function generateTechnicalSignals(companies: any[]) {
  const signals = [];
  
  for (const company of companies) {
    // Price momentum signals
    if (company.percent_change !== undefined) {
      signals.push({
        type: 'price_momentum',
        symbol: company.symbol,
        signal: company.percent_change > 0 ? 'bullish' : 'bearish',
        strength: Math.min(Math.abs(company.percent_change) / 5, 1),
        description: `${company.name} shows ${company.percent_change > 0 ? 'positive' : 'negative'} momentum`
      });
    }

    // Volume signals
    if (company.volume && company.avg_volume) {
      const volumeRatio = company.volume / company.avg_volume;
      if (volumeRatio > 1.5) {
        signals.push({
          type: 'volume_analysis',
          symbol: company.symbol,
          signal: 'high_activity',
          strength: Math.min(volumeRatio / 3, 1),
          description: `${company.name} shows unusual trading volume`
        });
      }
    }

    // Trend analysis
    if (company.price && company.moving_averages?.ma_50) {
      const trendStrength = (company.price / company.moving_averages.ma_50 - 1) * 100;
      if (Math.abs(trendStrength) > 5) {
        signals.push({
          type: 'trend_analysis',
          symbol: company.symbol,
          signal: trendStrength > 0 ? 'uptrend' : 'downtrend',
          strength: Math.min(Math.abs(trendStrength) / 10, 1),
          description: `${company.name} shows ${trendStrength > 0 ? 'bullish' : 'bearish'} trend`
        });
      }
    }
  }

  return signals;
}

// SECTION 3: Document Handling and Processing

const buildDocumentContext = (documents: DocumentSearchResult[]): string => {
  if (!documents || documents.length === 0) {
    return 'No relevant documents found.';
  }

  const groupedDocs = documents.reduce((acc, doc) => {
    const category = doc.document.metadata.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, DocumentSearchResult[]>);

  return Object.entries(groupedDocs)
    .map(([category, docs]) => {
      const documentsText = docs.map((doc, idx) => [
        `[Document ${idx + 1}: ${doc.document.metadata.title}]`,
        `Category: ${doc.document.metadata.category}`,
        `Last Updated: ${doc.document.metadata.lastUpdated}`,
        doc.document.metadata.source ? `Source: ${doc.document.metadata.source}` : '',
        '',
        'Key Excerpts:',
        ...doc.matchedSegments.map(excerpt => `- ${excerpt.trim()}`),
        '',
        `Relevance: ${(doc.relevanceScore * 100).toFixed(1)}%`,
        '---'
      ].filter(Boolean).join('\n'));

      return [
        category.toUpperCase(),
        ...documentsText
      ].join('\n');
    })
    .join('\n\n');
};

function calculateDocumentConfidence(documents: DocumentSearchResult[]): number {
  if (documents.length === 0) return 0;

  // Average relevance score
  const avgRelevance = documents.reduce(
    (sum, doc) => sum + doc.relevanceScore, 
    0
  ) / documents.length;

  // Document freshness score
  const freshnessScores = documents.map(doc => {
    const age = Date.now() - new Date(doc.document.metadata.lastUpdated).getTime();
    const maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
    return 1 - Math.min(age / maxAge, 1);
  });

  const avgFreshness = freshnessScores.reduce((a, b) => a + b) / freshnessScores.length;

  // Coverage score based on number of relevant documents
  const coverageScore = Math.min(documents.length / 3, 1);

  return (
    avgRelevance * 0.4 +
    avgFreshness * 0.3 +
    coverageScore * 0.3
  );
}

function extractFinancialDataFromDocument(content: string): any[] {
  const factors = [];
  const contentLower = content.toLowerCase();

  // Define key financial metrics to look for
  const metrics = {
    revenue: /revenue:?\s*([\d,.]+)/i,
    profit: /profit:?\s*([\d,.]+)/i,
    eps: /eps:?\s*([\d,.]+)/i,
    margin: /margin:?\s*([\d,.]+)%?/i,
    debt: /debt:?\s*([\d,.]+)/i,
    assets: /assets:?\s*([\d,.]+)/i,
    equity: /equity:?\s*([\d,.]+)/i,
    dividend: /dividend:?\s*([\d,.]+)/i
  };

  // Extract metrics from content
  for (const [metric, pattern] of Object.entries(metrics)) {
    const matches = Array.from(contentLower.matchAll(pattern));
    matches.forEach(match => {
      if (match[1]) {
        factors.push({
          type: 'document_extracted',
          metric: metric.charAt(0).toUpperCase() + metric.slice(1),
          value: parseFloat(match[1].replace(/,/g, '')),
          source: 'document',
          confidence: calculateMetricConfidence(match[0], content)
        });
      }
    });
  }

  return factors;
}

function extractTrendsFromDocument(content: string, sector: string = ''): string[] {
  const trends: string[] = [];
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);

  const trendIndicators = [
    'increase', 'decrease', 'growth', 'decline', 'trend', 'shift',
    'rising', 'falling', 'improving', 'deteriorating', 'expanding',
    'contracting', 'accelerating', 'decelerating'
  ];
  
  sentences.forEach(sentence => {
    const sentenceLower = sentence.toLowerCase();
    
    // Check if sentence is trend-related
    const hasTrendIndicator = trendIndicators.some(indicator => 
      sentenceLower.includes(indicator)
    );

    // If sector is specified, only include sector-specific trends
    if (hasTrendIndicator && (!sector || sentenceLower.includes(sector.toLowerCase()))) {
      // Clean and normalize the trend statement
      let trend = sentence
        .replace(/\s+/g, ' ')
        .replace(/^\W+|\W+$/g, '');
      
      // Add date context if available
      const dateMatch = content.match(/\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/);
      if (dateMatch) {
        trend += ` (as of ${dateMatch[0]})`;
      }
      
      trends.push(trend);
    }
  });

  return trends;
}

function formatDocumentsUsed(documents: DocumentSearchResult[]): any[] {
  return documents.map(doc => ({
    id: doc.document.metadata.id,
    title: doc.document.metadata.title,
    category: doc.document.metadata.category,
    relevance: doc.relevanceScore,
    key_excerpts: doc.matchedSegments,
    last_updated: doc.document.metadata.lastUpdated
  }));
}

function calculateMetricConfidence(match: string, fullContent: string): number {
  let confidence = 0.5; // Base confidence

  // Ensure 'match' and 'fullContent' are valid strings
  if (typeof match !== 'string' || typeof fullContent !== 'string') {
    console.error('Invalid input for calculateMetricConfidence:', { match, fullContent });
    return 0; // Return a default confidence score if inputs are not valid
  }

  // Check if the metric is in a table or structured format
  if (/[\|\t]/.test(match)) confidence += 0.2;
  
  // Check if there's a date associated with the metric
  if (/\d{4}[-/]\d{1,2}/.test(match)) confidence += 0.1;
  
  // Check if the value has proper formatting
  if (/[\d,]+\.\d{2}/.test(match)) confidence += 0.1;
  
  // Check if it's part of a financial statement section
  const matchIndex = fullContent.indexOf(match);
  if (matchIndex !== -1) {
    const nearbyContext = fullContent.substring(
      Math.max(0, matchIndex - 100),
      Math.min(fullContent.length, matchIndex + 100)
    ).toLowerCase();
    
    if (
      nearbyContext.includes('financial statement') ||
      nearbyContext.includes('balance sheet') ||
      nearbyContext.includes('income statement')
    ) {
      confidence += 0.1;
    }
  }

  return Math.min(confidence, 1);
}

function determineUserMood(response: string, messageHistory: any[]): string {
  // Simple implementation example
  if (response.includes('error') || response.includes('problem')) {
    return 'frustrated';
  }
  // Add more logic based on message history or response content
  return 'neutral'; // Default mood
}

async function processPDFDocument(content: string): Promise<DocumentSearchResult | null> {
  try {
    const metadata = {
      id: `pdf_${Date.now()}`,
      title: extractTitle(content) || 'Untitled Document',
      category: determinePDFType(content),
      lastUpdated: extractDate(content) || new Date().toISOString(),
      source: 'PDF Upload'
    };

    const sections = content.split(/\n{2,}/);
    const relevantSections = sections.filter(section => 
      isRelevantSection(section)
    ).map(section => cleanSection(section));

    return {
      document: {
        metadata,
        content: relevantSections.join('\n\n'),
        path: ''
      },
      matchedSegments: relevantSections.slice(0, 3),
      relevanceScore: calculateContentRelevance(relevantSections)
    };
  } catch (error) {
    console.error('Error processing PDF document:', error);
    return null;
  }
}

// Helper functions for PDF processing
function extractTitle(content: string): string {
  const lines = content.split('\n');
  return lines.find(line => 
    line.trim().length > 0 && 
    line.trim().length < 100 &&
    !line.includes(':')
  ) || '';
}

function determinePDFType(content: string): string {
  const contentLower = content.toLowerCase();
  if (contentLower.includes('financial statement')) return 'financial_report';
  if (contentLower.includes('research')) return 'research';
  if (contentLower.includes('profile')) return 'profile';
  return 'general';
}

function extractDate(content: string): string | null {
  const dateMatches = content.match(
    /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b|\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/
  );
  return dateMatches ? dateMatches[0] : null;
}

function isRelevantSection(section: string): boolean {
  // Skip empty or very short sections
  if (!section.trim() || section.length < 20) return false;
  
  // Skip header/footer like content
  if (/page \d+|confidential|all rights reserved/i.test(section)) return false;
  
  return true;
}

function cleanSection(section: string): string {
  return section
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\n]/g, '')
    .trim();
}

function calculateContentRelevance(sections: string[]): number {
  if (sections.length === 0) return 0;
  
  const hasFinancialData = sections.some(s => 
    /revenue|profit|margin|eps|dividend/i.test(s)
  );
  
  const hasStructuredData = sections.some(s => 
    /[\|\t]/.test(s) || /[\d,]+\.\d{2}/.test(s)
  );
  
  const hasRecentDates = sections.some(s => 
    /202[0-4]/.test(s)
  );

  let score = 0.5; // Base score
  if (hasFinancialData) score += 0.2;
  if (hasStructuredData) score += 0.2;
  if (hasRecentDates) score += 0.1;

  return Math.min(score, 1);
}

// SECTION 4: Market Analysis and Data Enrichment

function enrichCompanyData(companies: any[], analysis: AnalysisResult) {
  return companies.map(company => {
    const fundamental = analysis.marketContext.fundamentals.find(
      f => f.symbol === company.symbol
    );

    const technicalSignals = analysis.marketContext.technicalSignals.filter(
      s => s.symbol === company.symbol
    );

    const documentData = analysis.documentContext?.documents.filter(
      doc => doc.document.content.toLowerCase().includes(company.symbol.toLowerCase())
    );

    return {
      symbol: company.symbol,
      name: company.name,
      sector: company.sector,
      price: company.price,
      change: company.percent_change,
      analysis: {
        sentiment: determineSentiment(company, technicalSignals),
        fundamentals: summarizeFundamentals(fundamental),
        technical: summarizeTechnicalSignals(technicalSignals),
        risks: identifyCompanyRisks(company, fundamental, technicalSignals, documentData),
        documents: documentData?.length ? summarizeDocumentFindings(documentData) : null
      }
    };
  });
}

function summarizeFundamentals(fundamental: any): any {
  if (!fundamental) return null;

  return {
    profitMargin: fundamental.financials?.profit_margin || null,
    revenueGrowth: fundamental.financials?.revenue_growth || null,
    peRatio: fundamental.valuation_metrics?.trailing_pe || null,
    debtToEquity: fundamental.financials?.debt_to_equity || null,
    summary: generateSummary(fundamental)
  };
}

function generateSummary(fundamental: any): string {
  const summaryParts = [];

  if (fundamental.financials?.profit_margin !== undefined) {
    summaryParts.push(`Profit Margin: ${(fundamental.financials.profit_margin * 100).toFixed(2)}%`);
  }

  if (fundamental.financials?.revenue_growth !== undefined) {
    summaryParts.push(`Revenue Growth: ${(fundamental.financials.revenue_growth * 100).toFixed(2)}%`);
  }

  if (fundamental.valuation_metrics?.trailing_pe !== undefined) {
    summaryParts.push(`P/E Ratio: ${fundamental.valuation_metrics.trailing_pe.toFixed(2)}`);
  }

  if (fundamental.financials?.debt_to_equity !== undefined) {
    summaryParts.push(`Debt to Equity: ${fundamental.financials.debt_to_equity.toFixed(2)}`);
  }

  return summaryParts.join(', ');
}

function generateSectorAnalysis(analysis: AnalysisResult): any {
  const sectors = new Map();

  // Aggregate company data by sector
  analysis.marketContext.companies.forEach(company => {
    if (!company.sector) return;

    if (!sectors.has(company.sector)) {
      sectors.set(company.sector, {
        companies: [],
        performance: {
          averageChange: 0,
          topPerformer: null,
          worstPerformer: null
        },
        fundamentals: {
          averagePE: 0,
          averageMargin: 0
        },
        trends: [],
        risks: []
      });
    }

    const sectorData = sectors.get(company.sector);
    sectorData.companies.push({
      symbol: company.symbol,
      name: company.name,
      change: company.percent_change
    });
  });

  // Calculate sector metrics and analyze documents
  for (const [sector, data] of sectors) {
    if (data.companies.length === 0) continue;

    // Calculate average performance
    data.performance.averageChange = data.companies.reduce(
      (sum, comp) => sum + (comp.change || 0), 
      0
    ) / data.companies.length;

    // Find top and worst performers
    data.companies.sort((a, b) => (b.change || 0) - (a.change || 0));
    data.performance.topPerformer = data.companies[0];
    data.performance.worstPerformer = data.companies[data.companies.length - 1];

    // Calculate fundamental averages
    const sectorFundamentals = analysis.marketContext.fundamentals.filter(
      f => data.companies.some(c => c.symbol === f.symbol)
    );

    if (sectorFundamentals.length > 0) {
      data.fundamentals = calculateSectorFundamentals(sectorFundamentals);
    }

    // Add sector-specific trends from documents
    if (analysis.documentContext?.documents) {
      const sectorDocs = analysis.documentContext.documents.filter(doc => 
        doc.document.content.toLowerCase().includes(sector.toLowerCase())
      );

      sectorDocs.forEach(doc => {
        const trends = extractTrendsFromDocument(doc.document.content, sector);
        data.trends.push(...trends);
      });

      // Identify sector risks
      data.risks = identifySectorRisks(sector, sectorDocs, data);
    }
  }

  return Object.fromEntries(sectors);
}

function calculateSectorFundamentals(fundamentals: any[]) {
  const aggregates = fundamentals.reduce((acc, company) => {
    if (company.valuation_metrics?.trailing_pe) {
      acc.peRatios.push(company.valuation_metrics.trailing_pe);
    }
    if (company.financials?.profit_margin) {
      acc.margins.push(company.financials.profit_margin);
    }
    if (company.financials?.revenue_growth) {
      acc.growthRates.push(company.financials.revenue_growth);
    }
    return acc;
  }, { peRatios: [], margins: [], growthRates: [] });

  return {
    averagePE: calculateAverage(aggregates.peRatios),
    averageMargin: calculateAverage(aggregates.margins),
    averageGrowth: calculateAverage(aggregates.growthRates),
    medianPE: calculateMedian(aggregates.peRatios),
    medianMargin: calculateMedian(aggregates.margins),
    medianGrowth: calculateMedian(aggregates.growthRates)
  };
}

function identifySectorRisks(
  sector: string, 
  documents: DocumentSearchResult[], 
  sectorData: any
): string[] {
  const risks: string[] = [];

  // Performance-based risks
  if (sectorData.performance.averageChange < -5) {
    risks.push(`Significant sector-wide decline (${sectorData.performance.averageChange.toFixed(1)}%)`);
  }

  // Valuation risks
  if (sectorData.fundamentals.averagePE > 25) {
    risks.push('High sector-wide valuations');
  }

  // Document-based risks
  const riskIndicators = [
    'challenge', 'risk', 'threat', 'concern', 'pressure',
    'competition', 'regulation', 'disruption'
  ];

  documents.forEach(doc => {
    const content = doc.document.content.toLowerCase();
    const relevantSentences = content.split(/[.!?]+/).filter(sentence => {
      const sentenceLower = sentence.toLowerCase();
      return sentenceLower.includes(sector.toLowerCase()) &&
             riskIndicators.some(indicator => sentenceLower.includes(indicator));
    });

    risks.push(...relevantSentences.map(s => s.trim()));
  });

  return [...new Set(risks)]; // Remove duplicates
}

function identifyMarketTrends(analysis: AnalysisResult): string[] {
  const trends: string[] = [];

  // Market-wide trends
  if (analysis.marketContext.companies.length > 0) {
    const marketStats = calculateMarketStatistics(analysis.marketContext.companies);
    
    trends.push(
      `Market showing ${marketStats.avgChange > 0 ? 'positive' : 'negative'} momentum (${marketStats.avgChange.toFixed(1)}%)`
    );

    if (marketStats.volatility > 2) {
      trends.push(`High market volatility detected (${marketStats.volatility.toFixed(1)}% average movement)`);
    }
  }

  // Sector trends
  const sectorTrends = analyzeSectorTrends(analysis);
  trends.push(...sectorTrends);

  // Document-based trends
  if (analysis.documentContext?.documents) {
    const documentTrends = extractDocumentTrends(analysis.documentContext.documents);
    trends.push(...documentTrends);
  }

  return trends.slice(0, 5); // Return top 5 most significant trends
}

function calculateMarketStatistics(companies: any[]) {
  const changes = companies.map(c => c.percent_change || 0);
  return {
    avgChange: calculateAverage(changes),
    volatility: calculateStandardDeviation(changes),
    medianChange: calculateMedian(changes),
    gainers: changes.filter(c => c > 0).length,
    losers: changes.filter(c => c < 0).length
  };
}

function analyzeSectorTrends(analysis: AnalysisResult): string[] {
  const sectorPerformance = new Map();
  
  // Group companies by sector
  analysis.marketContext.companies.forEach(company => {
    if (!company.sector) return;
    if (!sectorPerformance.has(company.sector)) {
      sectorPerformance.set(company.sector, []);
    }
    sectorPerformance.get(company.sector).push(company.percent_change || 0);
  });

  // Analyze each sector
  const trends: string[] = [];
  sectorPerformance.forEach((changes, sector) => {
    const avgChange = calculateAverage(changes);
    const volatility = calculateStandardDeviation(changes);

    if (Math.abs(avgChange) > 2) {
      trends.push(
        `${sector} sector showing ${avgChange > 0 ? 'strength' : 'weakness'} (${avgChange.toFixed(1)}%)`
      );
    }

    if (volatility > 3) {
      trends.push(
        `High volatility in ${sector} sector (${volatility.toFixed(1)}% standard deviation)`
      );
    }
  });

  return trends;
}

// Statistical Utility Functions
function calculateAverage(numbers: number[]): number {
  return numbers.length > 0 
    ? numbers.reduce((a, b) => a + b, 0) / numbers.length 
    : 0;
}

function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function calculateStandardDeviation(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const avg = calculateAverage(numbers);
  const squareDiffs = numbers.map(value => {
    const diff = value - avg;
    return diff * diff;
  });
  return Math.sqrt(calculateAverage(squareDiffs));
}

function summarizeDocumentFindings(documents: DocumentSearchResult[]): any {
  const findings = {
    keyPoints: [] as string[],
    metrics: {} as Record<string, number>,
    lastUpdate: '',
    confidence: 0
  };

  documents.forEach(doc => {
    // Extract key points from matched segments
    doc.matchedSegments.forEach(segment => {
      if (segment.length > 20 && !findings.keyPoints.includes(segment)) {
        findings.keyPoints.push(segment);
      }
    });

    // Extract metrics
    const financialData = extractFinancialDataFromDocument(doc.document.content);
    financialData.forEach(data => {
      if (data.confidence > (findings.metrics[data.metric]?.confidence || 0)) {
        findings.metrics[data.metric] = {
          value: data.value,
          confidence: data.confidence
        };
      }
    });

    // Track most recent update
    const docDate = new Date(doc.document.metadata.lastUpdated);
    if (!findings.lastUpdate || docDate > new Date(findings.lastUpdate)) {
      findings.lastUpdate = doc.document.metadata.lastUpdated;
    }
  });

  findings.confidence = calculateDocumentConfidence(documents);
  return findings;
}

// SECTION 5: Response Building and Final Utils

function buildPrompt(message: string, analysis: AnalysisResult): string {
  const contextParts = [
    "You are a highly knowledgeable Saudi market financial advisor and analyst.",
    "Provide clear, concise analysis and recommendations.",
    
    // Document Context
    analysis.documentContext && `
    Reference Materials:
    ${analysis.documentContext.context}
    
    When referencing these documents, cite them using [Doc X] notation.
    `,
    
    // Market Context
    analysis.marketContext.companies.length > 0 && `
    Market Analysis:
    Companies: ${analysis.marketContext.companies.map(c => c.name).join(', ')}
    Sectors: ${analysis.marketContext.sectors.join(', ')}
    Market Sentiment: ${analysis.marketContext.sentiment.sentiment} 
    (Confidence: ${(analysis.marketContext.sentiment.confidence * 100).toFixed()}%)
    
    Technical Signals:
    ${formatTechnicalSignals(analysis.marketContext.technicalSignals)}
    
    Fundamental Analysis Available: ${analysis.marketContext.fundamentals.length > 0 ? 'Yes' : 'No'}
    `,

    // Company-specific instructions
    analysis.marketContext.companies.length === 1 && `
    For ${analysis.marketContext.companies[0].name}:
    - Analyze current performance and trends
    - Evaluate fundamental strengths and weaknesses
    - Consider market position and competitive factors
    - Identify key risks and opportunities
    `,
    
    // Special Instructions
    `
    Please provide:
    1. Clear analysis of the current situation
    2. Specific insights based on the data
    3. Actionable recommendations if appropriate
    4. Any relevant risks or concerns
    `,
    
    // User Query
    `User query: ${message}`
  ].filter(Boolean);

  return contextParts.join("\n\n");
}

async function buildResponse(
  claudeResponse: string, 
  analysis: AnalysisResult,
  messageHistory: any[]
): Promise<any> {
  const companies = enrichCompanyData(analysis.marketContext.companies, analysis);
  const insights = generateInsights(analysis);
  const confidence = calculateOverallConfidence(analysis);

  return {
    response: claudeResponse,
    thinking: "Analyzing market data and relevant documents",
    user_mood: determineUserMood(claudeResponse, messageHistory),
    suggested_questions: generateQuestions(analysis),
    financial_context: {
      companies,
      market_sentiment: analysis.marketContext.sentiment.sentiment,
      risk_level: assessRiskLevel(analysis),
      confidence_score: confidence.overall,
      key_insights: insights,
      market_analysis: {
        technicalSignals: analysis.marketContext.technicalSignals,
        fundamentalFactors: extractFundamentalFactors(analysis), // Use the new function here
        sectorAnalysis: generateSectorAnalysis(analysis),
        marketTrends: identifyMarketTrends(analysis)
      },
      documents_used: analysis.documentContext ? 
        formatDocumentsUsed(analysis.documentContext.documents) : []
    },
    debug: {
      context_used: true,
      market_data_used: analysis.marketContext.companies.length > 0,
      document_data_used: !!analysis.documentContext,
      analysis_quality: determineAnalysisQuality(analysis),
      confidence: {
        market: confidence.market,
        documents: confidence.documents,
        overall: confidence.overall
      }
    }
  };
}

function generateInsights(analysis: AnalysisResult): string[] {
  const insights: string[] = [];

  // Market-wide insights
  if (analysis.marketContext.companies.length > 0) {
    const marketStats = {
      totalCompanies: analysis.marketContext.companies.length,
      gainers: analysis.marketContext.companies.filter(c => c.percent_change > 0).length,
      losers: analysis.marketContext.companies.filter(c => c.percent_change < 0).length,
      avgChange: analysis.marketContext.companies.reduce((sum, c) => sum + (c.percent_change || 0), 0) / 
        analysis.marketContext.companies.length
    };

    // Market direction insight
    insights.push(
      `Market showing ${marketStats.avgChange > 0 ? 'positive' : 'negative'} trend ` +
      `(${marketStats.gainers} gainers vs ${marketStats.losers} losers)`
    );

    // Significant movers
    const significantMovers = analysis.marketContext.companies.filter(
      c => Math.abs(c.percent_change) > 3
    );
    
    if (significantMovers.length > 0) {
      insights.push(
        `Significant price movements in: ${significantMovers.map(c => 
          `${c.name} (${c.percent_change > 0 ? '+' : ''}${c.percent_change.toFixed(1)}%)`
        ).join(', ')}`
      );
    }
  }

  // Technical insights
  const strongSignals = analysis.marketContext.technicalSignals.filter(
    s => s.strength > 0.7
  );
  if (strongSignals.length > 0) {
    insights.push(
      `Strong technical signals: ${strongSignals.map(s => s.description).join('; ')}`
    );
  }

  // Fundamental insights
  const fundamentalInsights = analysis.marketContext.fundamentals
    .filter(f => f?.financials?.profit_margin > 0.15)
    .map(f => {
      const company = analysis.marketContext.companies.find(c => c.symbol === f.symbol);
      return `${company?.name || f.symbol} shows strong profitability (${(f.financials.profit_margin * 100).toFixed(1)}% margin)`;
    });
  
  insights.push(...fundamentalInsights);

  // Document-based insights
  if (analysis.documentContext?.documents.length > 0) {
    // Get high-relevance documents
    const relevantDocs = analysis.documentContext.documents
      .filter(d => d.relevanceScore > 0.8)
      .map(d => ({
        title: d.document.metadata.title,
        category: d.document.metadata.category,
        excerpts: d.matchedSegments
      }));
    
    if (relevantDocs.length > 0) {
      // Add document-based insights
      relevantDocs.forEach(doc => {
        // Filter meaningful excerpts
        const meaningfulExcerpts = doc.excerpts.filter(excerpt => 
          excerpt.length > 30 && // Minimum length
          !excerpt.toLowerCase().includes('page') && // Filter out page numbers
          /[.!?]$/.test(excerpt.trim()) // Complete sentences
        );

        if (meaningfulExcerpts.length > 0) {
          insights.push(`From ${doc.title}: ${meaningfulExcerpts[0].trim()}`);
        }
      });
    }
  }

  // Sector insights
  if (analysis.marketContext.sectors.length > 0) {
    const sectorPerformance = new Map();
    analysis.marketContext.companies.forEach(company => {
      if (!company.sector) return;
      if (!sectorPerformance.has(company.sector)) {
        sectorPerformance.set(company.sector, []);
      }
      sectorPerformance.get(company.sector).push(company.percent_change || 0);
    });

    // Find best and worst performing sectors
    const sectorStats = Array.from(sectorPerformance.entries()).map(([sector, changes]) => ({
      sector,
      avgChange: changes.reduce((a, b) => a + b, 0) / changes.length
    })).sort((a, b) => b.avgChange - a.avgChange);

    if (sectorStats.length > 0) {
      const bestSector = sectorStats[0];
      const worstSector = sectorStats[sectorStats.length - 1];

      if (Math.abs(bestSector.avgChange) > 2) {
        insights.push(
          `${bestSector.sector} leading the market (${bestSector.avgChange.toFixed(1)}%)`
        );
      }
      if (Math.abs(worstSector.avgChange) > 2) {
        insights.push(
          `${worstSector.sector} showing weakness (${worstSector.avgChange.toFixed(1)}%)`
        );
      }
    }
  }

  // Risk insights
  const riskLevel = assessRiskLevel(analysis);
  if (riskLevel === 'high') {
    insights.push('Multiple risk factors detected - exercise caution');
  }

  // Remove duplicates and limit length
  return Array.from(new Set(insights)).slice(0, 5);
}

// Helper function to generate questions
function generateQuestions(analysis: AnalysisResult): string[] {
  const questions = new Set<string>();

  // Company-specific questions
  if (analysis.marketContext.companies.length > 0) {
    const company = analysis.marketContext.companies[0];
    questions.add(`What's the detailed outlook for ${company.name}?`);
    
    if (analysis.marketContext.fundamentals.find(f => f.symbol === company.symbol)) {
      questions.add(`How do ${company.name}'s fundamentals compare to its sector peers?`);
    }
  }

  // Sector questions
  if (analysis.marketContext.sectors.length > 0) {
    questions.add(
      `What are the key trends in the ${analysis.marketContext.sectors[0]} sector?`
    );
  }

  // Document-based questions
  if (analysis.documentContext?.documents.length > 0) {
    const doc = analysis.documentContext.documents[0].document;
    questions.add(`Can you elaborate on the insights from ${doc.metadata.title}?`);
  }

  // Risk-based questions
  const riskLevel = assessRiskLevel(analysis);
  if (riskLevel === 'high') {
    questions.add("What are the main risk factors to consider?");
  }

  // Add general market question if we don't have enough
  if (questions.size < 3) {
    questions.add("What are the major market movers today?");
  }

  return Array.from(questions).slice(0, 3);
}

function calculateOverallConfidence(analysis: AnalysisResult) {
  const marketConfidence = calculateMetricConfidence("market", "context"); // Placeholder, adjust as needed
  const documentConfidence = analysis.documentContext?.confidence || 0;

  const overall = (
    marketConfidence * 0.6 +
    documentConfidence * 0.4
  );

  return {
    market: marketConfidence,
    documents: documentConfidence,
    overall: Math.min(overall, 0.95) // Cap at 0.95
  };
}

function assessRiskLevel(analysis: AnalysisResult): "low" | "medium" | "high" {
  const risks: string[] = [];
  
  // Market volatility risk
  if (analysis.marketContext.companies.some(c => Math.abs(c.percent_change) > 5)) {
    risks.push('high_volatility');
  }

  // Fundamental risks
  analysis.marketContext.fundamentals.forEach(f => {
    if (f?.valuation_metrics?.trailing_pe > 30) risks.push('high_valuation');
    if (f?.financials?.profit_margin < 0) risks.push('negative_margins');
    if (f?.financials?.debt_to_equity > 2) risks.push('high_leverage');
  });

  // Technical risks
  if (analysis.marketContext.technicalSignals.some(
    s => s.signal === 'bearish' && s.strength > 0.7
  )) {
    risks.push('technical_weakness');
  }

  // Document-based risks
  if (analysis.documentContext?.documents.some(d => 
    d.document.metadata.category === 'regulation' && d.relevanceScore > 0.8
  )) {
    risks.push('regulatory_concern');
  }

  // Determine overall risk level
  if (risks.length >= 3 || risks.includes('high_leverage')) return 'high';
  if (risks.length >= 1) return 'medium';
  return 'low';
}

function determineAnalysisQuality(analysis: AnalysisResult): string {
  const metrics = {
    hasCompanies: analysis.marketContext.companies.length > 0,
    hasFundamentals: analysis.marketContext.fundamentals.length > 0,
    hasTechnicals: analysis.marketContext.technicalSignals.length > 0,
    hasDocuments: analysis.documentContext?.documents.length > 0,
    fundamentalQuality: calculateFundamentalQuality(analysis.marketContext.fundamentals),
    documentQuality: analysis.documentContext?.confidence || 0,
    technicalQuality: calculateTechnicalQuality(analysis.marketContext.technicalSignals)
  };

  // Calculate overall quality score
  const qualityScore = 
    (metrics.hasCompanies ? 0.2 : 0) +
    (metrics.hasFundamentals ? metrics.fundamentalQuality * 0.3 : 0) +
    (metrics.hasTechnicals ? metrics.technicalQuality * 0.2 : 0) +
    (metrics.hasDocuments ? metrics.documentQuality * 0.3 : 0);

  if (qualityScore > 0.8) return 'comprehensive';
  if (qualityScore > 0.6) return 'good';
  if (qualityScore > 0.3) return 'limited';
  return 'basic';
}

function calculateFundamentalQuality(fundamentals: any[]): number {
  if (fundamentals.length === 0) return 0;

  return fundamentals.reduce((quality, fundamental) => {
    let score = 0;
    if (fundamental.financials?.profit_margin !== undefined) score += 0.2;
    if (fundamental.financials?.revenue_growth !== undefined) score += 0.2;
    if (fundamental.valuation_metrics?.trailing_pe !== undefined) score += 0.2;
    if (fundamental.valuation_metrics?.price_to_book_mrq !== undefined) score += 0.2;
    if (fundamental.financials?.debt_to_equity !== undefined) score += 0.2;
    return quality + score;
  }, 0) / fundamentals.length;
}

function calculateTechnicalQuality(signals: any[]): number {
  if (signals.length === 0) return 0;
  
  return signals.reduce((quality, signal) => {
    return quality + (signal.strength || 0);
  }, 0) / signals.length;
}

function formatTechnicalSignals(signals: any[]): string {
  if (!signals || signals.length === 0) return "No significant technical signals";
  
  return signals
    .sort((a, b) => b.strength - a.strength)
    .map(s => `- ${s.description} (Strength: ${(s.strength * 100).toFixed()}%)`)
    .join('\n');
}

function determineSentiment(company: any, signals: any[]): string {
  const priceChange = company.percent_change || 0;
  const signalStrength = signals.reduce((acc, s) => 
    acc + (s.signal === 'bullish' ? s.strength : -s.strength), 
    0
  );
  
  const totalScore = priceChange / 2 + signalStrength;
  return totalScore > 0 ? 'positive' : totalScore < 0 ? 'negative' : 'neutral';
}

function summarizeTechnicalSignals(signals: any[]) {
  if (signals.length === 0) return null;
  
  return {
    overall_trend: signals.reduce((acc, s) => acc + (s.signal === 'bullish' ? 1 : -1), 0) > 0 
      ? 'bullish' : 'bearish',
    strength: signals.reduce((acc, s) => acc + s.strength, 0) / signals.length,
    signals: signals.map(s => ({
      type: s.type,
      direction: s.signal,
      strength: s.strength
    }))
  };
}

function identifyCompanyRisks(
  company: any, 
  fundamental: any, 
  signals: any[],
  documents?: DocumentSearchResult[]
): string[] {
  const risks: string[] = [];

  // Price and volatility risks
  if (Math.abs(company.percent_change) > 5) {
    risks.push('High price volatility');
  }

  // Fundamental risks
  if (fundamental) {
    if (fundamental.valuation_metrics?.trailing_pe > 30) {
      risks.push('High valuation');
    }
    if (fundamental.financials?.profit_margin < 0) {
      risks.push('Negative profitability');
    }
    if (fundamental.financials?.debt_to_equity > 2) {
      risks.push('High leverage');
    }
  }

  // Technical risks
  const bearishSignals = signals.filter(
    s => s.signal === 'bearish' && s.strength > 0.7
  );
  if (bearishSignals.length > 0) {
    risks.push(...bearishSignals.map(s => s.description));
  }

  // Document-based risks
  if (documents) {
    documents.forEach(doc => {
      if (doc.document.metadata.category === 'risk' && doc.relevanceScore > 0.7) {
        doc.matchedSegments.forEach(segment => {
          if (segment.toLowerCase().includes('risk')) {
            risks.push(segment.trim());
          }
        });
      }
    });
  }

  return Array.from(new Set(risks)); // Remove duplicates
}

function handleError(error: unknown) {
  console.error('Error in chat handler:', error);
  
  return new Response(
    JSON.stringify({
      response: "An error occurred while processing your request. Please try again.",
      thinking: "Error occurred",
      user_mood: "frustrated",
      suggested_questions: [
        "Would you like to view the current market overview?",
        "Should we look at a specific sector instead?",
        "Would you like to try a different query?"
      ],
      financial_context: {
        companies: [],
        market_sentiment: "neutral",
        risk_level: "medium",
        confidence_score: 0,
        key_insights: [],
        market_analysis: {
          technicalSignals: [],
          fundamentalFactors: [],
          sectorAnalysis: null,
          marketTrends: []
        }
      },
      debug: {
        context_used: false,
        market_data_used: false,
        document_data_used: false,
        analysis_quality: "error",
        confidence: {
          market: 0,
          documents: 0,
          overall: 0
        }
      }
    }),
    { status: 500 }
  );
}

// Export types for use in other files
export type {
  MarketContext,
  DocumentContext,
  AnalysisResult
};
