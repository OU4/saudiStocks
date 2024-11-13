// components/stock/StockTabs.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { StockChart } from "./StockChart";
import { StockFinancials } from "./StockFinancials";
// import { StockNews } from "./StockNews";

interface StockTabsProps {
  stock: {
    symbol: string;
    tickerSymbol: string;
    name: string;
    sector: string;
  };
}

export function StockTabs({ stock }: StockTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="chart">Chart</TabsTrigger>
        <TabsTrigger value="financials">Financials</TabsTrigger>
        <TabsTrigger value="news">News</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold mb-4">Company Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Sector</div>
                  <div className="mt-1">{stock.sector}</div>
                </div>
                {/* Add more company information here */}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Statistics</h3>
              {/* Add key statistics here */}
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="chart">
        <Card className="p-6">
          <StockChart symbol={stock.symbol} />
        </Card>
      </TabsContent>

      <TabsContent value="financials">
        <Card className="p-6">
          <StockFinancials stock={stock} />
        </Card>
      </TabsContent>

      <TabsContent value="news">
        <Card className="p-6">
          {/* <StockNews stock={stock} /> */}
        </Card>
      </TabsContent>
    </Tabs>
  );
}