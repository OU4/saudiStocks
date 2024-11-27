// app/services/MarketAnalysisService.ts

import { SaudiMarketHandler } from '@/app/market/saudiMarketHandler';
import { MarketValidation } from '@/app/market/services/marketValidation';
import { MarketQuality } from '@/app/market/services/marketQuality';
import { SaudiFundamentals } from '@/app/lib/services/saudiFundamentals';
import { SAUDI_SYMBOLS } from '@/app/config/market';

interface MarketDataPoint {
  close: number;
  volume: number;
  date: string;
}

export class MarketAnalysisService {
  private static readonly TECHNICAL_THRESHOLDS = {
    STRONG_TREND: 0.8,
    WEAK_TREND: 0.3,
    HIGH_VOLATILITY: 0.25,
    LOW_VOLATILITY: 0.1,
    RSI_OVERBOUGHT: 70,
    RSI_OVERSOLD: 30,
  };

  private static readonly FUNDAMENTAL_THRESHOLDS = {
    HEALTHY_MARGIN: 0.15,
    GOOD_CURRENT_RATIO: 1.5,
    HIGH_PE: 25,
    LOW_PE: 10,
    GROWTH_THRESHOLD: 0.1,
  };

  // Calculate moving averages
  private static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  // Calculate RSI
  private static calculateRSI(prices: number[]): number {
    if (prices.length < 14) return 50;
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }

    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // Calculate MACD
  private static calculateMACD(prices: number[]): { 
    value: number; 
    signal: number; 
    histogram: number; 
  } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const signal = this.calculateEMA([macd], 9);

    return {
      value: macd,
      signal,
      histogram: macd - signal
    };
  }

  // Calculate EMA
  private static calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  // Calculate volatility
  private static calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = prices.slice(1).map((price, i) => 
      Math.log(price / prices[i])
    );

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / returns.length;
    
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
  }

  // Technical Analysis
  public static async analyzeTechnical(symbol: string) {
    try {
      const quoteData = await SaudiMarketHandler.getQuoteData(symbol);
      if (!quoteData?.timeSeries?.values) {
        throw new Error('No technical data available');
      }

      const prices = quoteData.timeSeries.values.map(v => parseFloat(v.close));
      const volumes = quoteData.timeSeries.values.map(v => parseFloat(v.volume));

      const sma50 = this.calculateSMA(prices, 50);
      const sma200 = this.calculateSMA(prices, 200);
      const rsi = this.calculateRSI(prices);
      const macd = this.calculateMACD(prices);
      const volatility = this.calculateVolatility(prices);

      const currentPrice = prices[prices.length - 1];
      const trend = this.determineTrend(currentPrice, sma50, sma200);

      return {
        trend,
        indicators: {
          sma50,
          sma200,
          rsi,
          macd,
          volatility
        },
        currentPrice,
        signals: this.generateTechnicalSignals({
          price: currentPrice,
          sma50,
          sma200,
          rsi,
          macd,
          volatility
        })
      };
    } catch (error) {
      console.error('Error in technical analysis:', error);
      throw error;
    }
  }

  // Fundamental Analysis
  public static async analyzeFundamentals(symbol: string) {
    try {
      const fundamentalData = await SaudiFundamentals.getFundamental(symbol);
      if (!fundamentalData) {
        throw new Error('No fundamental data available');
      }

      return {
        metrics: this.calculateKeyMetrics(fundamentalData),
        valuation: this.calculateValuationMetrics(fundamentalData),
        growth: this.calculateGrowthMetrics(fundamentalData),
        quality: this.assessFundamentalQuality(fundamentalData)
      };
    } catch (error) {
      console.error('Error in fundamental analysis:', error);
      throw error;
    }
  }

  // Risk Assessment
  public static async assessRisks(symbol: string) {
    try {
      const [technical, fundamental] = await Promise.all([
        this.analyzeTechnical(symbol),
        this.analyzeFundamentals(symbol)
      ]);

      const risks = {
        technical: this.identifyTechnicalRisks(technical),
        fundamental: this.identifyFundamentalRisks(fundamental),
        market: await this.identifyMarketRisks(symbol),
        score: this.calculateRiskScore(technical, fundamental)
      };

      return {
        ...risks,
        riskLevel: this.determineRiskLevel(risks.score)
      };
    } catch (error) {
      console.error('Error in risk assessment:', error);
      throw error;
    }
  }

  private static identifyTechnicalRisks(technical: any): string[] {
    const risks: string[] = [];

    if (technical.indicators.volatility > this.TECHNICAL_THRESHOLDS.HIGH_VOLATILITY) {
      risks.push('High price volatility');
    }

    if (technical.indicators.rsi > this.TECHNICAL_THRESHOLDS.RSI_OVERBOUGHT) {
      risks.push('Overbought conditions');
    }

    if (technical.indicators.rsi < this.TECHNICAL_THRESHOLDS.RSI_OVERSOLD) {
      risks.push('Oversold conditions');
    }

    return risks;
  }

  private static identifyFundamentalRisks(fundamental: any): string[] {
    const risks: string[] = [];

    if (fundamental.metrics.liquidity.currentRatio < this.FUNDAMENTAL_THRESHOLDS.GOOD_CURRENT_RATIO) {
      risks.push('Low liquidity ratio');
    }

    if (fundamental.valuation.peRatio > this.FUNDAMENTAL_THRESHOLDS.HIGH_PE) {
      risks.push('High valuation multiples');
    }

    return risks;
  }

  private static async identifyMarketRisks(symbol: string): Promise<string[]> {
    const risks: string[] = [];
    const stockInfo = SAUDI_SYMBOLS.find(s => s.symbol === symbol);
    
    if (stockInfo) {
      const sectorData = await SaudiFundamentals.getSectorAverages(stockInfo.sector);
      if (sectorData?.performance?.sectorReturn < -0.1) {
        risks.push('Weak sector performance');
      }
    }

    return risks;
  }

  private static calculateRiskScore(technical: any, fundamental: any): number {
    let score = 50; // Base score

    // Technical factors
    if (technical.indicators.volatility > this.TECHNICAL_THRESHOLDS.HIGH_VOLATILITY) score += 10;
    if (technical.indicators.rsi > this.TECHNICAL_THRESHOLDS.RSI_OVERBOUGHT) score += 5;
    if (technical.indicators.rsi < this.TECHNICAL_THRESHOLDS.RSI_OVERSOLD) score += 5;

    // Fundamental factors
    if (fundamental.metrics.liquidity.currentRatio < this.FUNDAMENTAL_THRESHOLDS.GOOD_CURRENT_RATIO) {
      score += 8;
    }
    if (fundamental.valuation.peRatio > this.FUNDAMENTAL_THRESHOLDS.HIGH_PE) {
      score += 7;
    }

    return Math.min(100, Math.max(0, score));
  }

  private static determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score <= 40) return 'low';
    if (score <= 70) return 'medium';
    return 'high';
  }

  private static determineTrend(
    currentPrice: number,
    sma50: number,
    sma200: number
  ): 'upward' | 'downward' | 'sideways' {
    if (currentPrice > sma50 && sma50 > sma200) return 'upward';
    if (currentPrice < sma50 && sma50 < sma200) return 'downward';
    return 'sideways';
  }

  private static generateTechnicalSignals(indicators: any): string[] {
    const signals: string[] = [];
    
    if (indicators.rsi > this.TECHNICAL_THRESHOLDS.RSI_OVERBOUGHT) {
      signals.push('RSI indicates overbought conditions');
    }
    
    if (indicators.rsi < this.TECHNICAL_THRESHOLDS.RSI_OVERSOLD) {
      signals.push('RSI indicates oversold conditions');
    }
    
    if (indicators.macd.histogram > 0 && indicators.macd.histogram > indicators.macd.signal) {
      signals.push('MACD shows bullish momentum');
    }
    
    if (indicators.macd.histogram < 0 && indicators.macd.histogram < indicators.macd.signal) {
      signals.push('MACD shows bearish momentum');
    }

    return signals;
  }

  // Helper method to calculate key metrics
  private static calculateKeyMetrics(data: any) {
    return {
      profitability: {
        grossMargin: data.metrics?.profitability?.gross_margin || 0,
        operatingMargin: data.metrics?.profitability?.operating_margin || 0,
        netMargin: data.metrics?.profitability?.net_margin || 0
      },
      efficiency: {
        assetTurnover: data.metrics?.efficiency?.asset_turnover || 0,
        inventoryTurnover: data.metrics?.efficiency?.inventory_turnover || 0
      },
      liquidity: {
        currentRatio: data.metrics?.liquidity?.current_ratio || 0,
        quickRatio: data.metrics?.liquidity?.quick_ratio || 0
      }
    };
  }

  private static calculateValuationMetrics(data: any) {
    return {
      peRatio: data.metrics?.valuation?.pe_ratio || 0,
      pbRatio: data.metrics?.valuation?.pb_ratio || 0,
      evEbitda: data.metrics?.valuation?.ev_ebitda || 0,
      priceToSales: data.metrics?.valuation?.price_to_sales || 0
    };
  }

  private static calculateGrowthMetrics(data: any) {
    return {
      revenueGrowth: data.metrics?.growth?.revenue_growth || 0,
      profitGrowth: data.metrics?.growth?.profit_growth || 0,
      marketShareGrowth: data.metrics?.growth?.market_share_growth || 0
    };
  }

  private static assessFundamentalQuality(data: any): number {
    let score = 0;
    let metrics = 0;

    // Check each metric and increase score if available
    if (data.metrics?.profitability) {
      score += 1;
      metrics += 1;
    }
    if (data.metrics?.efficiency) {
      score += 1;
      metrics += 1;
    }
    if (data.metrics?.liquidity) {
      score += 1;
      metrics += 1;
    }
    if (data.metrics?.valuation) {
      score += 1;
      metrics += 1;
    }
    if (data.metrics?.growth) {
      score += 1;
      metrics += 1;
    }

    return metrics > 0 ? score / metrics : 0;
  }
}