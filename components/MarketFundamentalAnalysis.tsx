// components/MarketFundamentalAnalysis.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FundamentalMetrics {
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
  };
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
  };
  liquidity: {
    currentRatio: number;
    quickRatio: number;
  };
}

interface ValuationMetrics {
  peRatio: number;
  pbRatio: number;
  evEbitda: number;
  priceToSales: number;
}

interface GrowthMetrics {
  revenueGrowth: number;
  profitGrowth: number;
  marketShareGrowth: number;
}

interface FundamentalAnalysisProps {
  metrics: FundamentalMetrics;
  valuation: ValuationMetrics;
  growth: GrowthMetrics;
  quality: number;
  isLoading?: boolean;
}

const MetricRow: React.FC<{
  label: string;
  value: number;
  benchmark?: number;
  format?: 'number' | 'percent' | 'multiple' | 'ratio';
  description?: string;
}> = ({ label, value, benchmark, format = 'number', description }) => {
  const getValueColor = (value: number, benchmark?: number) => {
    if (!benchmark) return "text-foreground";
    return value > benchmark ? "text-green-600 dark:text-green-400" :
           value < benchmark ? "text-red-600 dark:text-red-400" :
           "text-foreground";
  };

  const formatValue = (val: number) => {
    switch (format) {
      case 'percent':
        return formatNumber(val * 100, undefined, true) + '%';
      case 'multiple':
        return formatNumber(val, undefined, true) + 'x';
      case 'ratio':
        return formatNumber(val, undefined, false);
      default:
        return formatNumber(val, undefined, true);
    }
  };

  const getTrendIcon = (value: number, benchmark?: number) => {
    if (!benchmark) return null;
    if (value > benchmark) return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
    if (value < benchmark) return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {label}
        {description && (
          <span className="block text-xs text-muted-foreground">{description}</span>
        )}
      </TableCell>
      <TableCell className={`text-right ${getValueColor(value, benchmark)}`}>
        <div className="flex items-center justify-end gap-2">
          {formatValue(value)}
          {getTrendIcon(value, benchmark)}
        </div>
      </TableCell>
      {benchmark !== undefined && (
        <TableCell className="text-right text-muted-foreground">
          {formatValue(benchmark)}
        </TableCell>
      )}
    </TableRow>
  );
};

const QualityIndicator: React.FC<{ quality: number }> = ({ quality }) => {
  const getQualityColor = (quality: number) => {
    if (quality >= 0.8) return "bg-green-500";
    if (quality >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${getQualityColor(quality)}`}
          style={{ width: `${quality * 100}%` }}
        />
      </div>
      <span className="text-sm font-medium">
        {Math.round(quality * 100)}%
      </span>
    </div>
  );
};

export const MarketFundamentalAnalysis: React.FC<FundamentalAnalysisProps> = ({
  metrics,
  valuation,
  growth,
  quality,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fundamental Analysis</CardTitle>
            <CardDescription>
              Comprehensive analysis of key financial metrics and ratios
            </CardDescription>
          </div>
          <Badge variant={quality >= 0.8 ? "default" : "secondary"}>
            Data Quality: {Math.round(quality * 100)}%
          </Badge>
        </div>
        <QualityIndicator quality={quality} />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Profitability Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Profitability Metrics</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Industry Avg.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <MetricRow
                  label="Gross Margin"
                  value={metrics.profitability.grossMargin}
                  benchmark={0.4}
                  format="percent"
                  description="Revenue minus cost of goods sold"
                />
                <MetricRow
                  label="Operating Margin"
                  value={metrics.profitability.operatingMargin}
                  benchmark={0.15}
                  format="percent"
                  description="Profit from core business operations"
                />
                <MetricRow
                  label="Net Margin"
                  value={metrics.profitability.netMargin}
                  benchmark={0.1}
                  format="percent"
                  description="Final profit after all expenses"
                />
              </TableBody>
            </Table>
          </div>

          {/* Valuation Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Valuation Metrics</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Industry Avg.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <MetricRow
                  label="P/E Ratio"
                  value={valuation.peRatio}
                  benchmark={15}
                  format="multiple"
                  description="Price to earnings ratio"
                />
                <MetricRow
                  label="P/B Ratio"
                  value={valuation.pbRatio}
                  benchmark={2}
                  format="multiple"
                  description="Price to book ratio"
                />
                <MetricRow
                  label="EV/EBITDA"
                  value={valuation.evEbitda}
                  benchmark={10}
                  format="multiple"
                  description="Enterprise value to EBITDA"
                />
                <MetricRow
                  label="P/S Ratio"
                  value={valuation.priceToSales}
                  benchmark={3}
                  format="multiple"
                  description="Price to sales ratio"
                />
              </TableBody>
            </Table>
          </div>

          {/* Growth Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Growth Metrics</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Industry Avg.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <MetricRow
                  label="Revenue Growth"
                  value={growth.revenueGrowth}
                  benchmark={0.1}
                  format="percent"
                  description="Year-over-year revenue growth"
                />
                <MetricRow
                  label="Profit Growth"
                  value={growth.profitGrowth}
                  benchmark={0.1}
                  format="percent"
                  description="Year-over-year profit growth"
                />
                <MetricRow
                  label="Market Share Growth"
                  value={growth.marketShareGrowth}
                  benchmark={0.05}
                  format="percent"
                  description="Year-over-year market share growth"
                />
              </TableBody>
            </Table>
          </div>

          {/* Efficiency Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Efficiency Metrics</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Industry Avg.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <MetricRow
                  label="Asset Turnover"
                  value={metrics.efficiency.assetTurnover}
                  benchmark={1.5}
                  format="ratio"
                  description="Revenue generated per unit of assets"
                />
                <MetricRow
                  label="Inventory Turnover"
                  value={metrics.efficiency.inventoryTurnover}
                  benchmark={6}
                  format="ratio"
                  description="Cost of goods sold divided by average inventory"
                />
              </TableBody>
            </Table>
          </div>

          {/* Liquidity Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liquidity Metrics</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Industry Avg.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <MetricRow
                  label="Current Ratio"
                  value={metrics.liquidity.currentRatio}
                  benchmark={2}
                  format="ratio"
                  description="Current assets divided by current liabilities"
                />
                <MetricRow
                  label="Quick Ratio"
                  value={metrics.liquidity.quickRatio}
                  benchmark={1}
                  format="ratio"
                  description="Quick assets divided by current liabilities"
                />
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketFundamentalAnalysis;