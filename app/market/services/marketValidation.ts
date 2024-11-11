// /app/market/services/marketValidation.ts

import { ValidationResult } from '../types//marketTypes';

export class MarketValidation {
  private static readonly RULES = {
    PRICE: {
      MAX_DAILY_CHANGE: 0.20, // 20%
      MIN_PRICE: 0.01,
      MAX_PRICE: 10000
    },
    VOLUME: {
      MIN_DAILY_VOLUME: 100,
      MAX_SPIKE: 1000 // 1000% increase from average
    },
    FUNDAMENTALS: {
      MAX_PE_RATIO: 200,
      MIN_MARKET_CAP: 1000000,
      MAX_DEBT_EQUITY: 5
    }
  };

  static validatePrice(
    currentPrice: number,
    previousClose: number,
    lastUpdate: string
  ): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check price range
    if (currentPrice < this.RULES.PRICE.MIN_PRICE) {
      issues.push(`Price too low: ${currentPrice}`);
      score -= 30;
    }
    if (currentPrice > this.RULES.PRICE.MAX_PRICE) {
      issues.push(`Price too high: ${currentPrice}`);
      score -= 30;
    }

    // Check price change
    if (previousClose > 0) {
      const priceChange = Math.abs(currentPrice - previousClose) / previousClose;
      if (priceChange > this.RULES.PRICE.MAX_DAILY_CHANGE) {
        warnings.push(`Large price change: ${(priceChange * 100).toFixed(2)}%`);
        score -= 20;
      }
    }

    return {
      isValid: issues.length === 0,
      score: Math.max(0, score),
      timestamp: new Date().toISOString(),
      issues,
      warnings
    };
  }

  static validateVolume(
    currentVolume: number,
    averageVolume: number
  ): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    if (currentVolume < this.RULES.VOLUME.MIN_DAILY_VOLUME) {
      issues.push(`Volume too low: ${currentVolume}`);
      score -= 30;
    }

    if (averageVolume > 0) {
      const volumeSpike = currentVolume / averageVolume;
      if (volumeSpike > this.RULES.VOLUME.MAX_SPIKE) {
        warnings.push(`Unusual volume spike: ${volumeSpike.toFixed(2)}x average`);
        score -= 20;
      }
    }

    return {
      isValid: issues.length === 0,
      score: Math.max(0, score),
      timestamp: new Date().toISOString(),
      issues,
      warnings
    };
  }

  static validateFundamentals(data: {
    peRatio?: number;
    marketCap?: number;
    debtEquity?: number;
  }): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    if (data.peRatio && data.peRatio > this.RULES.FUNDAMENTALS.MAX_PE_RATIO) {
      warnings.push(`High P/E ratio: ${data.peRatio}`);
      score -= 15;
    }

    if (data.marketCap && data.marketCap < this.RULES.FUNDAMENTALS.MIN_MARKET_CAP) {
      issues.push(`Low market cap: ${data.marketCap}`);
      score -= 25;
    }

    if (data.debtEquity && data.debtEquity > this.RULES.FUNDAMENTALS.MAX_DEBT_EQUITY) {
      warnings.push(`High debt/equity ratio: ${data.debtEquity}`);
      score -= 15;
    }

    return {
      isValid: issues.length === 0,
      score: Math.max(0, score),
      timestamp: new Date().toISOString(),
      issues,
      warnings
    };
  }
}