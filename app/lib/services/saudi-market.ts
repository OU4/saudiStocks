// lib/services/saudi-market.ts

const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

export interface SaudiStock {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  mic_code: string;
  country: string;
  type: string;
  figi_code: string;
}

export interface TimeSeries {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

class SaudiMarketService {
  // Fetch all Saudi stocks
  async getSaudiStocks(): Promise<SaudiStock[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/stocks?country=Saudi Arabia&apikey=${API_KEY}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Saudi stocks:', error);
      throw error;
    }
  }

  // Get time series data for a specific stock
  async getTimeSeries(symbol: string, interval: string = '1day'): Promise<TimeSeries[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/time_series?symbol=${symbol}&interval=${interval}&apikey=${API_KEY}`
      );
      const data = await response.json();
      return data.values;
    } catch (error) {
      console.error(`Error fetching time series for ${symbol}:`, error);
      throw error;
    }
  }

  // Get real-time quote for a stock
  async getRealTimeQuote(symbol: string) {
    try {
      const response = await fetch(
        `${BASE_URL}/quote?symbol=${symbol}&apikey=${API_KEY}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  // Get WebSocket connection for real-time updates
  getWebSocketConnection(symbols: string[]) {
    const ws = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${API_KEY}`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: "subscribe",
        params: {
          symbols: symbols.join(',')
        }
      }));
    };

    return ws;
  }
}