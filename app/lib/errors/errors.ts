// File: /app/lib/errors.ts

export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

export class MarketDataError extends Error {
  constructor(
    public code: string,
    message: string,
    public severity: ErrorSeverity = 'error',
    public metadata: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'MarketDataError';
  }
}

export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public severity: ErrorSeverity = 'error',
    public metadata: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends Error {
  constructor(
    public code: string,
    message: string,
    public severity: ErrorSeverity = 'error',
    public metadata: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Helper function to determine if an error is a specific type
export function isMarketDataError(error: unknown): error is MarketDataError {
  return error instanceof MarketDataError;
}

// Helper function to create a user-friendly error message
export function createUserFriendlyError(error: unknown): string {
  if (error instanceof MarketDataError) {
    switch (error.code) {
      case 'API_ERROR':
        return 'Unable to fetch market data at the moment. Please try again later.';
      case 'VALIDATION_ERROR':
        return 'Invalid input provided. Please check your request and try again.';
      case 'RATE_LIMIT':
        return 'Too many requests. Please wait a moment before trying again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred. Please try again.';
}

// Error codes
export const ERROR_CODES = {
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  INVALID_SYMBOL: 'INVALID_SYMBOL',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PARSE_ERROR: 'PARSE_ERROR'
} as const;

// Helper function to handle API errors
export function handleAPIError(error: unknown): MarketDataError {
  if (error instanceof MarketDataError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle rate limit errors
    if (error.message.includes('API credits') || error.message.includes('rate limit')) {
      return new MarketDataError(
        ERROR_CODES.RATE_LIMIT,
        'API rate limit exceeded. Please try again later.',
        'error',
        { originalError: error }
      );
    }

    // Handle network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new MarketDataError(
        ERROR_CODES.NETWORK_ERROR,
        'Network error occurred. Please check your connection.',
        'error',
        { originalError: error }
      );
    }

    // Handle parse errors
    if (error.message.includes('JSON') || error.message.includes('parse')) {
      return new MarketDataError(
        ERROR_CODES.PARSE_ERROR,
        'Error processing market data.',
        'error',
        { originalError: error }
      );
    }
  }

  // Generic error
  return new MarketDataError(
    ERROR_CODES.API_ERROR,
    'An unexpected error occurred.',
    'error',
    { originalError: error }
  );
}