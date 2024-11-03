// lib/api/market.ts

const TWELVE_DATA_API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

export const DEFAULT_SYMBOLS = [
  'AAPL', 'AMZN', 'MSFT', 'NVDA', 'TSLA', 
  'GOOGL', 'V', 'TSM', 'BRK.A', 'WMT'
];

export async function getQuotes(symbols: string[] = DEFAULT_SYMBOLS) {
  try {
    const response = await fetch(
      `${BASE_URL}/quote?symbol=${symbols.join(',')}&apikey=${TWELVE_DATA_API_KEY}`
    );
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
}

export async function getTimeSeries(
  symbol: string,
  interval: string = '1day',
  outputsize: number = 252 // One year of trading days
) {
  try {
    const response = await fetch(
      `${BASE_URL}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVE_DATA_API_KEY}`
    );
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Error fetching time series:', error);
    return [];
  }
}