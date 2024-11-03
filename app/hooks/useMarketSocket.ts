// // hooks/useMarketSocket.ts

// import { useEffect, useRef, useState } from 'react';
// import { WS_URL, API_KEY, MarketQuote } from '@/app/config/market';

// export function useMarketSocket(symbols: string[]) {
//   const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
//   const ws = useRef<WebSocket | null>(null);

//   useEffect(() => {
//     if (!symbols.length) return;

//     // Create WebSocket connection
//     ws.current = new WebSocket(`${WS_URL}?apikey=${API_KEY}`);

//     ws.current.onopen = () => {
//       console.log('WebSocket Connected');
//       if (ws.current?.readyState === WebSocket.OPEN) {
//         // Subscribe to symbols
//         ws.current.send(JSON.stringify({
//           action: 'subscribe',
//           params: {
//             symbols: symbols.join(',')
//           }
//         }));
//       }
//     };

//     ws.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.event === 'price') {
//         setQuotes(prev => ({
//           ...prev,
//           [data.symbol]: {
//             ...prev[data.symbol],
//             symbol: data.symbol,
//             name: prev[data.symbol]?.name || data.symbol,
//             price: parseFloat(data.price),
//             timestamp: data.timestamp,
//             change: parseFloat(data.change) || 0,
//             percentChange: parseFloat(data.percent_change) || 0,
//             volume: parseInt(data.volume) || 0
//           }
//         }));
//       }
//     };

//     ws.current.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };

//     return () => {
//       if (ws.current) {
//         ws.current.close();
//       }
//     };
//   }, [symbols]);

//   return quotes;
// }