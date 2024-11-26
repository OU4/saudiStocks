// components/MarketTable.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  API_URL, 
  API_KEY, 
  SAUDI_SYMBOLS,
  SAUDI_MARKET
} from '@/app/config/market';
import { cn } from '@/lib/utils';
import { Loader2, Clock, TrendingUp, TrendingDown } from 'lucide-react';

// components/MarketTable.tsx
// ... (previous imports remain the same)

// Take only the first 10 symbols for rate limiting
const LIMITED_SYMBOLS = SAUDI_SYMBOLS.slice(0, 10);

interface TimeSeriesData {
  meta: {
    symbol: string;
    currency: string;
    exchange: string;
  };
  values: {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }[];
  status: string;
}

interface MarketStats {
  change: string;
  percentChange: string;
  volume: string;
}

export function MarketTable() {
  const router = useRouter();
  const [marketData, setMarketData] = useState<Record<string, TimeSeriesData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch market data function
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      
      const dataPromises = LIMITED_SYMBOLS.map(async (stock) => {
        const response = await fetch(
          `${API_URL}/time_series?symbol=${stock.symbol}&interval=1min&apikey=${API_KEY}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch ${stock.symbol}`);
        }

        const data = await response.json();
        return [stock.symbol, data] as [string, TimeSeriesData];
      });

      const results = await Promise.allSettled(dataPromises);
      const newData: Record<string, TimeSeriesData> = {};

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const [symbol, data] = result.value;
          newData[symbol] = data;
        }
      });

      setMarketData(newData);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Format helpers
  const formatPrice = (value?: string) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(parseFloat(value));
  };

  const formatVolume = (value: string | number) => {
    if (!value || value === '-') return '-';
    const num = typeof value === 'string' ? parseInt(value) : value;
    if (num === 0) return '-';
    
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString('en-SA');
  };

  // Market data calculations
  const calculateChange = (values?: TimeSeriesData['values']) => {
    if (!values || values.length < 2) {
      return {
        change: '0',
        percentChange: '0'
      };
    }

    const current = parseFloat(values[0].close);
    const previous = parseFloat(values[values.length - 1].close);
    const change = current - previous;
    const percentChange = (change / previous) * 100;

    return {
      change: change.toFixed(2),
      percentChange: percentChange.toFixed(2)
    };
  };

  const calculateDailyStats = (values?: TimeSeriesData['values']): MarketStats => {
    if (!values || values.length === 0) {
      return {
        change: '-',
        percentChange: '-',
        volume: '-'
      };
    }

    // Calculate total volume
    const totalVolume = values.reduce((sum, value) => 
      sum + (parseInt(value.volume) || 0), 0
    );

    // Calculate price changes
    const current = parseFloat(values[0].close);
    const previous = parseFloat(values[values.length - 1].close);
    const change = current - previous;
    const percentChange = (change / previous) * 100;

    return {
      change: change.toFixed(2),
      percentChange: percentChange.toFixed(2),
      volume: totalVolume.toString()
    };
  };

  // Effect for data fetching
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Component render
  return (
    <Card className="w-full">
      <div className="p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Saudi Stock Market ({SAUDI_MARKET.exchange})</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {SAUDI_MARKET.trading_hours} ({SAUDI_MARKET.timezone})
            {lastUpdate && (
              <span className="text-xs">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Showing top {LIMITED_SYMBOLS.length} stocks
          </p>
        </div>
        <button
          onClick={fetchMarketData}
          className="px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Updating...
            </span>
          ) : (
            'Refresh'
          )}
        </button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Change</TableHead>
            <TableHead className="text-right">% Change</TableHead>
            <TableHead className="text-right">Volume</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && Object.keys(marketData).length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading market data...
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-red-500">
                <div className="flex flex-col items-center gap-2">
                  <p>Error: {error}</p>
                  <button
                    onClick={fetchMarketData}
                    className="px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Retry
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            LIMITED_SYMBOLS.map((stock) => {
              const data = marketData[stock.symbol];
              const latestValues = data?.values?.[0];
              const changes = calculateChange(data?.values);
              const stats = calculateDailyStats(data?.values);

              return (
                <TableRow 
                  key={stock.symbol} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/market/${stock.tickerSymbol}`)}
                >
                  <TableCell className="font-medium">{stock.tickerSymbol}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell className="text-right">
                    {formatPrice(latestValues?.close)}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right flex items-center justify-end gap-1",
                    parseFloat(changes.change) > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {parseFloat(changes.change) > 0 ? 
                      <TrendingUp className="w-4 h-4" /> : 
                      <TrendingDown className="w-4 h-4" />
                    }
                    {formatPrice(changes.change)}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right",
                    parseFloat(changes.percentChange) > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {changes.percentChange}%
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatVolume(stats.volume)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}