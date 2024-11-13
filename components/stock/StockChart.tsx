// components/stock/StockChart.tsx
"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StockChartProps {
  symbol: string;
}

interface ChartData {
  date: string;
  value: number;
}

const TIME_RANGES = [
  { label: "1D", value: "1day" },
  { label: "1W", value: "1week" },
  { label: "1M", value: "1month" },
  { label: "3M", value: "3months" },
  { label: "1Y", value: "1year" },
  { label: "5Y", value: "5years" },
] as const;

export function StockChart({ symbol }: StockChartProps) {
  const [timeRange, setTimeRange] = useState<string>("1month");
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true);
        // In a real app, fetch data from your API based on the timeRange
        const response = await fetch(`/api/market/chart?symbol=${symbol}&range=${timeRange}`);
        const chartData = await response.json();
        setData(chartData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, [symbol, timeRange]);

  // For demo purposes, let's generate some sample data if the API isn't implemented yet
  useEffect(() => {
    if (loading && data.length === 0) {
      const sampleData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.random() * 100 + 100,
      }));
      setData(sampleData);
      setLoading(false);
    }
  }, [loading, data]);

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-x-2">
          {TIME_RANGES.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickMargin={10}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius)",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}