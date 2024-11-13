"use client";
import React from 'react';

import { useStockData } from '@/app/hooks/useStockData';
import { formatCurrency, formatNumber, formatPercent } from "@/app/utils/format";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, BookmarkPlus } from "lucide-react";
import { SAUDI_SYMBOLS } from '@/app/config/market';

interface MetricProps {
    label: string;
    value: any;
    format?: 'number' | 'percent' | 'currency' | 'compact' | 'text';
  }
  
  const formatValue = (value: any, format?: MetricProps['format']) => {
    // Handle JSX elements
    if (React.isValidElement(value)) return value;
    
    // Handle empty values
    if (value === null || value === undefined || value === '') return 'N/A';
    
    // Handle text format or string values that shouldn't be converted
    if (format === 'text' || typeof value === 'string') return value;
  
    try {
      const numValue = Number(value);
      if (isNaN(numValue)) return String(value);
  
      switch (format) {
        case 'percent':
          return formatPercent(numValue);
        case 'currency':
          return formatCurrency(numValue);
        case 'compact':
          return formatNumber(numValue, undefined, true);
        case 'number':
          return numValue.toFixed(2);
        default:
          return String(value);
      }
    } catch {
      return String(value);
    }
  };  
  // Updated Metric component
  const Metric = ({ label, value, format }: MetricProps) => {
    // Direct return for JSX elements (like website links)
    if (React.isValidElement(value)) {
      return (
        <div className="flex justify-between items-center py-1.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="font-medium">{value}</span>
        </div>
      );
    }  
    // Handle all other types of values
    const displayValue = formatValue(value, format);
  
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">
        {displayValue}
      </span>
    </div>
  );
};
  
  // Updated MetricSection component
  const MetricSection = ({ title, metrics }: {
    title: string;
    metrics: Array<{ label: string; value: any; format?: MetricProps['format'] }>;
  }) => (
    <div className="border-b last:border-b-0 pb-4 mb-4 last:mb-0">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-1">
        {metrics.map((metric, index) => (
          <Metric
            key={`${title}-${metric.label}-${index}`}
            label={metric.label}
            value={metric.value}
            format={metric.format || 'text'}
          />
        ))}
      </div>
    </div>
  );
  
  // Updated CompanyOverview component using the fixed Metric components
  const CompanyOverview = ({ stock, stockData }: { 
    stock: any; 
    stockData: any;
  }) => {
    // Create website link
    const websiteLink = stock.website && (
      <a
        href={`https://${stock.website}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {stock.website}
      </a>
    );
  
    return (
      <Card className="p-6 mb-6">
        <div className="space-y-6">
          {/* Description Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Company Overview</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {stockData?.profile?.description || 'No company description available.'}
            </p>
          </div>
  
          {/* Company Details Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Using stock data for basic info */}
            <Metric 
              label="Name" 
              value={stock.name}
            />
            <Metric 
              label="الاسم" 
              value={stock.name_ar}
            />
            <Metric 
              label="CEO" 
              value={stockData?.profile?.CEO}
            />
            <Metric 
              label="Website" 
              value={websiteLink}
            />
            <Metric 
              label="Sector" 
              value={stock.sector}
            />
            <Metric 
              label="Year Founded" 
              value={stockData?.profile?.yearFounded}
            />
          </div>
        </div>
      </Card>
    );
  
        };  // Usage in the main component remains the same but pass stockData instead of profile:
  // <CompanyOverview stock={stock} stockData={stockData} />);

export default function StockPage({ params }: { params: { symbol: string } }) {
  const stock = SAUDI_SYMBOLS.find(s => s.tickerSymbol === params.symbol);
  const { data: stockData, loading, error } = useStockData(params.symbol);

  if (!stock) return <div className="p-4">Stock not found</div>;
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <span>Loading stock data...</span>
    </div>
  );
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!stockData) return <div className="p-4">No data available</div>;

  const stats = stockData.statistics;

  const metrics = [
    {
      title: "Profile",
      metrics: [
        { label: "Market Cap", value: stats?.valuations_metrics?.market_capitalization, format: 'currency' },
        { label: "Enterprise Value", value: stats?.valuations_metrics?.enterprise_value, format: 'currency' },
        { label: "Shares Out", value: stats?.stock_statistics?.shares_outstanding, format: 'compact' },
        { label: "Revenue", value: stats?.financials?.income_statement?.revenue_ttm, format: 'currency' },
        { label: "Revenue/Share", value: stats?.financials?.income_statement?.revenue_per_share_ttm, format: 'currency' },
      ]
    },
    {
      title: "Valuation",
      metrics: [
        { label: "P/E (TTM)", value: stats?.valuations_metrics?.trailing_pe },
        { label: "Forward P/E", value: stats?.valuations_metrics?.forward_pe },
        { label: "PEG Ratio", value: stats?.valuations_metrics?.peg_ratio },
        { label: "P/S (TTM)", value: stats?.valuations_metrics?.price_to_sales_ttm },
        { label: "P/B", value: stats?.valuations_metrics?.price_to_book_mrq },
        { label: "EV/EBITDA", value: stats?.valuations_metrics?.enterprise_to_ebitda },
      ]
    },
    {
      title: "Margins",
      metrics: [
        { label: "Gross", value: stats?.financials?.gross_margin, format: 'percent' },
        { label: "Operating", value: stats?.financials?.operating_margin, format: 'percent' },
        { label: "Profit", value: stats?.financials?.profit_margin, format: 'percent' },
      ]
    },
    {
      title: "Returns",
      metrics: [
        { label: "ROA", value: stats?.financials?.return_on_assets_ttm, format: 'percent' },
        { label: "ROE", value: stats?.financials?.return_on_equity_ttm, format: 'percent' },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-medium">
                  {stock.tickerSymbol.slice(0, 2)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{stock.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{stock.tickerSymbol}</span>
                    <span>•</span>
                    <span>{stock.sector}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold tabular-nums">
                  {formatCurrency(parseFloat(stockData.quote.close))}
                </div>
                <div className={cn(
                  "text-sm font-medium tabular-nums",
                  parseFloat(stockData.quote.change) >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {parseFloat(stockData.quote.change) >= 0 ? "+" : ""}
                  {formatCurrency(parseFloat(stockData.quote.change))} 
                  ({formatNumber(parseFloat(stockData.quote.percent_change))}%)
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-accent rounded-full">
              <BookmarkPlus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        {/* Company Overview Section */}
        {/* <CompanyOverview stock={stock} profile={stockData.profile} /> */}
        <CompanyOverview stock={stock} stockData={stockData} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Metrics */}
          <div>
            <Card className="p-4">
              {metrics.map((section, index) => (
                <MetricSection
                  key={index}
                  title={section.title}
                  metrics={section.metrics}
                />
              ))}
            </Card>
          </div>

          {/* Right Column - Chart */}
          <div className="md:col-span-2">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {['5D', '1M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y', 'MAX'].map((period) => (
                      <button
                        key={period}
                        className="px-3 py-1 text-sm rounded-md hover:bg-accent"
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockData.timeSeries.values}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="datetime"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={(value) => formatCurrency(value)}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <div className="text-sm text-muted-foreground">
                                {new Date(label).toLocaleDateString()}
                              </div>
                              <div className="font-medium tabular-nums">
                                {formatCurrency(payload[0].value as number)}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}