// hooks/useMarketSocket.ts
import { useEffect, useRef, useState } from 'react';
import { WS_URL, API_KEY } from '@/app/config/market';

export interface MarketQuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent_change: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: string;
}

interface WebSocketMessage {
  event: string;
  symbol: string;
  price: string;
  change: string;
  percent_change: string;
  volume: string;
  high: string;
  low: string;
  open: string;
  close: string;
  timestamp: string;
}

interface WebSocketSubscribeMessage {
  action: 'subscribe';
  params: {
    symbols: string;
  };
}

export function useMarketSocket(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, MarketQuoteData>>({});
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      setStatus('connecting');
      ws.current = new WebSocket(`${WS_URL}?apikey=${API_KEY}`);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        setStatus('connected');
        setError(null);
        if (ws.current?.readyState === WebSocket.OPEN && symbols.length > 0) {
          const message: WebSocketSubscribeMessage = {
            action: 'subscribe',
            params: {
              symbols: symbols.join(',')
            }
          };
          ws.current.send(JSON.stringify(message));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          if (data.event === 'price') {
            setQuotes(prev => ({
              ...prev,
              [data.symbol]: {
                symbol: data.symbol,
                name: prev[data.symbol]?.name || data.symbol,
                price: parseFloat(data.price) || 0,
                change: parseFloat(data.change) || 0,
                percent_change: parseFloat(data.percent_change) || 0,
                volume: parseInt(data.volume) || 0,
                high: parseFloat(data.high) || 0,
                low: parseFloat(data.low) || 0,
                open: parseFloat(data.open) || 0,
                close: parseFloat(data.close) || 0,
                timestamp: data.timestamp
              }
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket Disconnected');
        setStatus('disconnected');
        // Attempt to reconnect after 5 seconds
        reconnectTimeout.current = setTimeout(() => {
          connect();
        }, 5000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setStatus('disconnected');
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError('Failed to create WebSocket connection');
      setStatus('disconnected');
    }
  };

  useEffect(() => {
    if (symbols.length > 0) {
      connect();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [symbols]);

  // Resubscribe when symbols change and we're already connected
  useEffect(() => {
    if (ws.current?.readyState === WebSocket.OPEN && symbols.length > 0) {
      const message: WebSocketSubscribeMessage = {
        action: 'subscribe',
        params: {
          symbols: symbols.join(',')
        }
      };
      ws.current.send(JSON.stringify(message));
    }
  }, [symbols]);

  return {
    quotes,
    status,
    error,
    isConnected: status === 'connected'
  };
}

// Helper function to format quote data for display
export function formatQuoteData(quote: MarketQuoteData) {
  return {
    symbol: quote.symbol,
    name: quote.name,
    price: quote.price.toFixed(2),
    change: quote.change.toFixed(2),
    percentChange: quote.percent_change.toFixed(2),
    volume: quote.volume.toLocaleString(),
    isPositive: quote.change >= 0,
    timestamp: new Date(quote.timestamp).toLocaleString()
  };
}