// /app/market/services/marketQuality.ts

import { MarketDataQuality, ValidationResult } from '../types/marketTypes';

export class MarketQuality {
  private static readonly MAX_DATA_AGE = 300000; // 5 minutes

  static assessDataQuality(
    priceValidation: ValidationResult,
    volumeValidation: ValidationResult,
    fundamentalsValidation: ValidationResult | undefined,
    lastUpdate: string
  ): MarketDataQuality {
    // Calculate data freshness
    const freshness = this.calculateFreshness(lastUpdate);

    // Calculate reliability scores
    const reliability = this.calculateReliability(
      priceValidation,
      volumeValidation,
      fundamentalsValidation,
      freshness
    );

    return {
      freshness,
      validation: {
        price: priceValidation,
        volume: volumeValidation,
        fundamentals: fundamentalsValidation
      },
      reliability
    };
  }

  private static calculateFreshness(lastUpdate: string): {
    lastUpdate: string;
    isStale: boolean;
    age: number;
  } {
    const now = Date.now();
    const updateTime = new Date(lastUpdate).getTime();
    const age = now - updateTime;

    return {
      lastUpdate,
      isStale: age > this.MAX_DATA_AGE,
      age
    };
  }

  private static calculateReliability(
    priceValidation: ValidationResult,
    volumeValidation: ValidationResult,
    fundamentalsValidation: ValidationResult | undefined,
    freshness: { isStale: boolean; age: number }
  ): {
    dataCompleteness: number;
    sourceQuality: number;
    overallScore: number;
  } {
    let dataCompleteness = 100;
    
    // Reduce completeness score for missing or invalid data
    if (!priceValidation.isValid) dataCompleteness -= 40;
    if (!volumeValidation.isValid) dataCompleteness -= 30;
    if (!fundamentalsValidation) dataCompleteness -= 20;

    // Calculate source quality based on validation scores
    const sourceQuality = (
      priceValidation.score * 0.4 +
      volumeValidation.score * 0.3 +
      (fundamentalsValidation?.score || 0) * 0.3
    );

    // Calculate overall score
    let overallScore = (
      dataCompleteness * 0.3 +
      sourceQuality * 0.4 +
      (freshness.isStale ? 50 : 100) * 0.3
    );

    // Ensure scores are within bounds
    return {
      dataCompleteness: Math.max(0, Math.min(100, dataCompleteness)),
      sourceQuality: Math.max(0, Math.min(100, sourceQuality)),
      overallScore: Math.max(0, Math.min(100, overallScore))
    };
  }
}