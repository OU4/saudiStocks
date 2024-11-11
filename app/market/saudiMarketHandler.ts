// /app/market/saudiMarketHandler.ts

import { API_KEY, API_URL, SAUDI_SYMBOLS, SAUDI_MARKET } from '@/app/config/market';
import { MarketValidation } from './services/marketValidation';
import { MarketQuality } from './services/marketQuality';
import { MarketDataQuality } from './types/marketTypes';
export class SaudiMarketHandler {
  private static readonly ENDPOINTS = {
    QUOTE: (symbol: string) => `/quote?symbol=${symbol}&apikey=${API_KEY}`,
    STATISTICS: (symbol: string) => `/statistics?symbol=${symbol}&apikey=${API_KEY}`,
    INCOME: (symbol: string) => `/income_statement?symbol=${symbol}&period=quarterly&apikey=${API_KEY}`,
    BALANCE: (symbol: string) => `/balance_sheet?symbol=${symbol}&period=quarterly&apikey=${API_KEY}`,
    CASH_FLOW: (symbol: string) => `/cash_flow?symbol=${symbol}&period=quarterly&apikey=${API_KEY}`
  };

  private static readonly CACHE_DURATION = 300000; // 5 minutes
  private static cache = new Map<string, { data: any; timestamp: number }>();

  private static async fetchWithCache(endpoint: string): Promise<any> {
    try {
      const url = `${API_URL}${endpoint}`;
      const cached = this.cache.get(url);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      console.log('Fetching URL:', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'API Error');
      }

      this.cache.set(url, { 
        data, 
        timestamp: Date.now() 
      });

      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      const cached = this.cache.get(endpoint);
      if (cached) {
        console.log('Using cached data due to fetch error');
        return cached.data;
      }
      return null;
    }
  }

  private static async getFundamentals(symbol: string): Promise<any> {
    try {
      const [statistics, incomeStatement, balanceSheet, cashFlow] = await Promise.all([
        this.fetchWithCache(this.ENDPOINTS.STATISTICS(symbol)),
        this.fetchWithCache(this.ENDPOINTS.INCOME(symbol)),
        this.fetchWithCache(this.ENDPOINTS.BALANCE(symbol)),
        this.fetchWithCache(this.ENDPOINTS.CASH_FLOW(symbol))
      ]);

      return {
        statistics,
        incomeStatement,
        balanceSheet,
        cashFlow
      };
    } catch (error) {
      console.error(`Error fetching fundamentals for ${symbol}:`, error);
      return null;
    }
  }

  static async getQuoteData(symbol: string): Promise<any> {
    try {
      const formattedSymbol = this.formatTadawulSymbol(symbol);
      const stockInfo = SAUDI_SYMBOLS.find(s => 
        s.symbol === formattedSymbol || 
        s.tickerSymbol === symbol
      );

      if (!stockInfo) {
        return null;
      }

      const quoteData = await this.fetchWithCache(this.ENDPOINTS.QUOTE(formattedSymbol));
      if (!quoteData) {
        return null;
      }

      // Make fundamentals optional and don't let it block the main response
      const fundamentals = await this.getFundamentals(formattedSymbol)
        .catch(() => null);

      return {
        symbol: stockInfo.tickerSymbol,
        name: stockInfo.name,
        name_ar: stockInfo.name_ar,
        price: this.safeParseNumber(quoteData.close || quoteData.price),
        change: this.safeParseNumber(quoteData.change),
        percent_change: this.safeParseNumber(quoteData.percent_change),
        volume: this.safeParseNumber(quoteData.volume),
        timestamp: this.formatTimestamp(quoteData.timestamp),
        sector: stockInfo.sector,
        trading_info: {
          open: this.safeParseNumber(quoteData.open),
          high: this.safeParseNumber(quoteData.high),
          low: this.safeParseNumber(quoteData.low),
          previous_close: this.safeParseNumber(quoteData.previous_close),
          is_market_open: quoteData.is_market_open || false,
          fifty_two_week: quoteData.fifty_two_week
        },
        fundamentals: fundamentals
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  static async analyzeMentionedCompanies(text: string): Promise<{
    companies: any[];
    sectors: Set<string>;
  }> {
    try {
      console.log('Analyzing text for company mentions:', text);

      const mentionedStocks = SAUDI_SYMBOLS.filter(stock => {
        const nameMatch = stock.name && text.toLowerCase().includes(stock.name.toLowerCase());
        const tickerMatch = stock.tickerSymbol && text.includes(stock.tickerSymbol);
        const arabicMatch = stock.name_ar && text.includes(stock.name_ar);
        return nameMatch || tickerMatch || arabicMatch;
      });

      console.log('Found mentioned stocks:', mentionedStocks.length);

      if (mentionedStocks.length === 0) {
        return {
          companies: [],
          sectors: new Set<string>()
        };
      }

      const quotesPromises = mentionedStocks.map(async (stock) => {
        try {
          return await this.getQuoteData(stock.tickerSymbol);
        } catch (error) {
          console.error(`Error fetching data for ${stock.tickerSymbol}:`, error);
          return null;
        }
      });

      const quotes = (await Promise.all(quotesPromises))
        .filter(quote => quote !== null);

      console.log('Successfully fetched data for', quotes.length, 'companies');

      return {
        companies: quotes,
        sectors: new Set(mentionedStocks.map(stock => stock.sector))
      };
    } catch (error) {
      console.error('Error analyzing mentioned companies:', error);
      return {
        companies: [],
        sectors: new Set<string>()
      };
    }
  }

  private static formatTadawulSymbol(symbol: string): string {
    const cleanSymbol = symbol.replace(/\.(SAU|TADAWUL)$/, '');
    return `${cleanSymbol}:TADAWUL`;
  }

  private static safeParseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  private static formatTimestamp(timestamp?: number | string): string {
    if (!timestamp) return new Date().toISOString();
    if (typeof timestamp === 'number') {
      return new Date(timestamp * 1000).toISOString();
    }
    return timestamp;
  }
}