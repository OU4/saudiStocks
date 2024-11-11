// /app/market/types/marketTypes.ts

export interface ValidationResult {
    isValid: boolean;
    score: number;
    timestamp: string;
    issues: string[];
    warnings: string[];
  }
  
  export interface MarketDataQuality {
    freshness: {
      lastUpdate: string;
      isStale: boolean;
      age: number;
    };
    validation: {
      price: ValidationResult;
      volume: ValidationResult;
      fundamentals?: ValidationResult;
    };
    reliability: {
      dataCompleteness: number;
      sourceQuality: number;
      overallScore: number;
    };
  }
  
  export interface MarketError {
    code: string;
    message: string;
    severity: 'critical' | 'warning' | 'info';
    timestamp: string;
    context?: any;
  }