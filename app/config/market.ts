// config/market.ts

export const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || 'demo';
export const API_URL = 'https://api.twelvedata.com';

export const SAUDI_MARKET = {
  exchange: 'Tadawul',
  mic_code: 'XSAU',
  currency: 'SAR',
  timezone: 'Asia/Riyadh',
  trading_hours: 'Su-Th, 10:00am - 3:00pm',
  data_delay: '15min'
} as const;

// Trial symbol for testing: 4261 (Theeb Rent A Car Company)
export const SAUDI_SYMBOLS = [
  { symbol: '4261', name: 'Theeb Rent A Car' },
  { symbol: '1180', name: 'Al Rajhi Bank' },
  { symbol: '2222', name: 'Saudi Aramco' },
  { symbol: '2350', name: 'Saudi Telecom' },
  { symbol: '1211', name: "Ma'aden" }
];