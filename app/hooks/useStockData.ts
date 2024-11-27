// app/hooks/useStockData.ts
import { useState, useEffect } from 'react';
import { API_KEY, API_URL, formatSymbol } from '@/app/config/market';

interface UseStockDataResult {
  data: StockData | null;
  loading: boolean;
  error: string | null;
}

export function useStockData(tickerSymbol: string): UseStockDataResult {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!tickerSymbol) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const symbol = `${tickerSymbol}:TADAWUL`;

        // Fetch all data in parallel
        const [statsRes, quoteRes, timeSeriesRes, profileRes] = await Promise.all([
          fetch(`${API_URL}/statistics?symbol=${symbol}&apikey=${API_KEY}`),
          fetch(`${API_URL}/quote?symbol=${symbol}&apikey=${API_KEY}`),
          fetch(`${API_URL}/time_series?symbol=${symbol}&interval=1day&outputsize=90&apikey=${API_KEY}`),
          fetch(`${API_URL}/profile?symbol=${symbol}&apikey=${API_KEY}`)
        ]);

        // Check responses individually
        const responses = {
          stats: statsRes.ok,
          quote: quoteRes.ok,
          timeSeries: timeSeriesRes.ok,
          profile: profileRes.ok
        };

        console.log('API Response Status:', responses);

        // Get the JSON data, handling potential errors for each request
        const [statsData, quoteData, timeSeriesData, profileData] = await Promise.all([
          statsRes.json().catch(e => ({ statistics: {} })),
          quoteRes.json().catch(e => ({})),
          timeSeriesRes.json().catch(e => ({ values: [] })),
          profileRes.json().catch(e => null)
        ]);

        // Log raw data for debugging
        console.log('Raw Profile Data:', profileData);

        const stockData: StockData = {
          quote: {
            symbol: symbol,
            name: quoteData.name || '',
            close: String(quoteData.close || quoteData.price || '0'),
            change: String(quoteData.change || '0'),
            percent_change: String(quoteData.percent_change || '0'),
            high: String(quoteData.high || '0'),
            low: String(quoteData.low || '0'),
            open: String(quoteData.open || '0'),
            volume: String(quoteData.volume || '0')
          },
          timeSeries: {
            values: timeSeriesData.values?.map((item: any) => ({
              datetime: item.datetime,
              open: String(item.open || '0'),
              high: String(item.high || '0'),
              low: String(item.low || '0'),
              close: String(item.close || '0'),
              volume: String(item.volume || '0')
            })) || []
          },
          statistics: statsData.statistics,
          profile: profileData ? {
            name: profileData.name || '',
            exchange: profileData.exchange || 'TADAWUL',
            mic_code: profileData.mic_code || '',
            sector: profileData.sector || '',
            industry: profileData.industry || '',
            employees: profileData.employees || 0,
            website: profileData.website || '',
            description: profileData.description || '',
            type: profileData.type || 'Common Stock',
            CEO: profileData.CEO || '',
            address: profileData.address || '',
            address2: profileData.address2 || '',
            city: profileData.city || '',
            zip: profileData.zip || '',
            state: profileData.state || '',
            country: profileData.country || '',
            phone: profileData.phone || ''
          } : undefined
        };

        setData(stockData);
        setError(null);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stock data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
    // Refresh data every minute
    const interval = setInterval(fetchStockData, 60000);
    return () => clearInterval(interval);
  }, [tickerSymbol]);

  return { data, loading, error };
}