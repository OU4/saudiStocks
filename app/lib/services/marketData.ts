// File: /app/lib/services/marketData.ts

import { API_KEY, API_URL, formatSymbol } from '@/app/config/market';
import { MarketDataError } from '@/app/lib/errors/errors';
import { MarketQuote, MarketResponse } from '@/app/types/market';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class MarketDataService {
  private static readonly CACHE_DURATION = 10000; // 10 seconds
  private static readonly REQUEST_TIMEOUT = 5000;  // 5 seconds
  private static cache = new Map<string, CacheItem<MarketQuote>>();

  static async fetchQuote(symbol: string): Promise<MarketQuote> {
    try {
      // Check cache first
      const cachedData = this.getFromCache(symbol);
      if (cachedData) {
        return cachedData;
      }

      const formattedSymbol = formatSymbol(symbol);
      const data = await this.fetchWithTimeout(
        `${API_URL}/quote?symbol=${formattedSymbol}&apikey=${API_KEY}`
      );

      if (!this.isValidQuoteResponse(data)) {
        throw new MarketDataError(
          'INVALID_DATA',
          'Invalid quote data received',
          'error',
          { symbol, response: data }
        );
      }

      const quote = this.transformQuoteData(data);
      this.addToCache(symbol, quote);

      return quote;
    } catch (error) {
      if (error instanceof MarketDataError) {
        throw error;
      }
      throw new MarketDataError(
        'FETCH_ERROR',
        `Failed to fetch quote for ${symbol}`,
        'error',
        { symbol, error }
      );
    }
  }

  private static async fetchWithTimeout(url: string): Promise<MarketResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new MarketDataError(
          'API_ERROR',
          `HTTP error! status: ${response.status}`,
          'error',
          { status: response.status }
        );
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private static isValidQuoteResponse(data: any): data is MarketResponse {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.symbol === 'string' &&
      (typeof data.price === 'string' || typeof data.price === 'number' ||
       typeof data.close === 'string' || typeof data.close === 'number')
    );
  }

  private static transformQuoteData(data: MarketResponse): MarketQuote {
    return {
      symbol: data.symbol,
      price: this.parseNumber(data.price || data.close),
      change: this.parseNumber(data.change),
      percentChange: this.parseNumber(data.percent_change),
      volume: this.parseNumber(data.volume),
      timestamp: new Date().toISOString(),
      high: this.parseNumber(data.high),
      low: this.parseNumber(data.low),
      open: this.parseNumber(data.open)
    };
  }

  private static parseNumber(value: string | number | undefined): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  }

  private static getFromCache(symbol: string): MarketQuote | null {
    const cached = this.cache.get(symbol);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_DURATION) {
      this.cache.delete(symbol);
      return null;
    }

    return cached.data;
  }

  private static addToCache(symbol: string, data: MarketQuote): void {
    this.cache.set(symbol, {
      data,
      timestamp: Date.now()
    });
  }
}