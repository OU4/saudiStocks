// // hooks/useSaudiMarket.ts
// import { useState, useEffect } from 'react';

// interface SaudiStock {
//   symbol: string;
//   name: string;
//   currency: string;
//   exchange: string;
//   mic_code: string;
//   country: string;
//   type: string;
// }

// interface StockQuote {
//   symbol: string;
//   price: string;
//   change: string;
//   percent_change: string;
//   volume: string;
//   timestamp: string;
// }

// interface RealTimeData {
//   price: number;
//   change: number;
//   percentChange: number;
//   volume: number;
//   timestamp: string;
// }

// interface StockData {
//   stock: SaudiStock;
//   quote?: StockQuote;
//   realTimeData?: RealTimeData;
// }

// interface WebSocketMessage {
//   event: string;
//   symbol: string;
//   price: string;
//   change: string;
//   percent_change: string;
//   volume: string;
//   timestamp: string;
// }

// export function useSaudiMarket() {
//   const [stocks, setStocks] = useState<StockData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedTimeframe, setSelectedTimeframe] = useState('1day');

//   const fetchSaudiMarketData = async () => {
//     try {
//       setLoading(true);
//       // Fetch Saudi stocks list
//       const stocksResponse = await fetch(
//         `https://api.twelvedata.com/stocks?country=Saudi Arabia&apikey=${process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY}`
//       );

//       if (!stocksResponse.ok) {
//         throw new Error('Failed to fetch stocks list');
//       }

//       const stocksData = await stocksResponse.json();
//       const stocksList: SaudiStock[] = stocksData.data || stocksData;

//       // Take first 20 stocks to avoid rate limits
//       const stocksToFetch = stocksList.slice(0, 20);
//       const symbols = stocksToFetch.map(stock => stock.symbol).join(',');

//       // Fetch quotes for all stocks at once
//       const quotesResponse = await fetch(
//         `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY}`
//       );

//       if (!quotesResponse.ok) {
//         throw new Error('Failed to fetch quotes');
//       }

//       const quotesData = await quotesResponse.json();
//       let quotesArray: StockQuote[];

//       if (Array.isArray(quotesData)) {
//         quotesArray = quotesData;
//       } else if (quotesData.data) {
//         quotesArray = Array.isArray(quotesData.data) ? quotesData.data : [quotesData.data];
//       } else {
//         quotesArray = [quotesData];
//       }

//       // Combine stocks with their quotes
//       const combinedData = stocksToFetch.map(stock => {
//         const quote = quotesArray.find(q => q.symbol === stock.symbol);
//         return {
//           stock,
//           quote,
//           realTimeData: quote ? {
//             price: parseFloat(quote.price),
//             change: parseFloat(quote.change),
//             percentChange: parseFloat(quote.percent_change),
//             volume: parseInt(quote.volume),
//             timestamp: quote.timestamp
//           } : undefined
//         };
//       });

//       setStocks(combinedData);
//       setupWebSocket(symbols.split(','));
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching market data:', err);
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setupWebSocket = (symbols: string[]) => {
//     const ws = new WebSocket(
//       `wss://ws.twelvedata.com/v1/quotes/price?apikey=${process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY}`
//     );

//     ws.onopen = () => {
//       ws.send(JSON.stringify({
//         action: 'subscribe',
//         params: {
//           symbols: symbols.join(',')
//         }
//       }));
//     };

//     ws.onmessage = (event: MessageEvent) => {
//       try {
//         const data = JSON.parse(event.data) as WebSocketMessage;
//         if (data.event === 'price') {
//           setStocks(prev => prev.map(stock => {
//             if (stock.stock.symbol === data.symbol) {
//               return {
//                 ...stock,
//                 realTimeData: {
//                   price: parseFloat(data.price),
//                   change: parseFloat(data.change),
//                   percentChange: parseFloat(data.percent_change),
//                   volume: parseInt(data.volume),
//                   timestamp: data.timestamp
//                 }
//               };
//             }
//             return stock;
//           }));
//         }
//       } catch (error) {
//         console.error('WebSocket message parsing error:', error);
//       }
//     };

//     ws.onerror = (error: Event) => {
//       console.error('WebSocket error:', error);
//     };

//     return () => {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.close();
//       }
//     };
//   };

//   useEffect(() => {
//     fetchSaudiMarketData();
//     // Refresh data every minute
//     const interval = setInterval(fetchSaudiMarketData, 60000);
//     return () => clearInterval(interval);
//   }, [selectedTimeframe]);

//   const changeTimeframe = (timeframe: string) => {
//     setSelectedTimeframe(timeframe);
//   };

//   return {
//     stocks,
//     loading,
//     error,
//     selectedTimeframe,
//     changeTimeframe,
//     refreshData: fetchSaudiMarketData
//   };
// }