// app/market/page.tsx

import { Metadata } from "next";
import { MarketTable } from "@/components/MarketTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Market Data",
  description: "Real-time market data and analysis",
};

export default function MarketPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Market Data</h2>
      </div>
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="space-y-4">
          <MarketTable />
        </TabsContent>
        <TabsContent value="performance">
          <div className="text-muted-foreground">Performance content coming soon...</div>
        </TabsContent>
        <TabsContent value="news">
          <div className="text-muted-foreground">News content coming soon...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}