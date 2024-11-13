// components/stock/StockOverview.tsx
"use client";

import { BookmarkPlus, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StockOverviewProps {
  stock: {
    symbol: string;
    tickerSymbol: string;
    name: string;
    name_ar: string;
    sector: string;
    website: string;
  };
  marketData: {
    price?: string;
    change?: string;
    percentChange?: string;
    volume?: string;
    high?: string;
    low?: string;
    open?: string;
  };
}

export function StockOverview({ stock, marketData }: StockOverviewProps) {
  const formatPrice = (value?: string) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(parseFloat(value));
  };

  const formatVolume = (value?: string) => {
    if (!value) return '-';
    const num = parseInt(value);
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {stock.name}
            <span className="ml-2 text-lg text-muted-foreground">
              {stock.tickerSymbol}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">{stock.sector}</p>
          <p className="text-sm text-muted-foreground">{stock.name_ar}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BookmarkPlus className="mr-2 h-4 w-4" />
            Watch
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`https://${stock.website}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Website
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Price</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-2xl font-bold">
              {formatPrice(marketData.price)}
            </div>
            <div className={cn(
              "flex items-center",
              parseFloat(marketData.percentChange || '0') >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {parseFloat(marketData.percentChange || '0') >= 0 ? 
                <TrendingUp className="mr-1 h-4 w-4" /> : 
                <TrendingDown className="mr-1 h-4 w-4" />
              }
              {marketData.percentChange}%
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Open</div>
          <div className="mt-2 text-2xl font-bold">
            {formatPrice(marketData.open)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Volume</div>
          <div className="mt-2 text-2xl font-bold">
            {formatVolume(marketData.volume)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Day Range</div>
          <div className="mt-2 text-lg font-bold">
            {formatPrice(marketData.low)} - {formatPrice(marketData.high)}
          </div>
        </Card>
      </div>
    </div>
  );
}