// components/stock/StockFinancials.tsx
"use client";

import { useState, useEffect } from "react";
import { formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StockFinancialsProps {
  stock: {
    symbol: string;
    tickerSymbol: string;
    name: string;
    sector: string;
  };
}

interface FinancialData {
  income_statement: {
    revenue: number[];
    operating_income: number[];
    net_income: number[];
    eps: number[];
    periods: string[];
  };
  balance_sheet: {
    total_assets: number[];
    total_liabilities: number[];
    shareholders_equity: number[];
    cash: number[];
    periods: string[];
  };
  cash_flow: {
    operating_cash_flow: number[];
    investing_cash_flow: number[];
    financing_cash_flow: number[];
    free_cash_flow: number[];
    periods: string[];
  };
  key_metrics: {
    pe_ratio: number;
    price_to_book: number;
    debt_to_equity: number;
    current_ratio: number;
    profit_margin: number;
    return_on_equity: number;
  };
}

export function StockFinancials({ stock }: StockFinancialsProps) {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFinancialData() {
      try {
        const response = await fetch(`/api/market/financials?symbol=${stock.symbol}`);
        const data = await response.json();
        setFinancialData(data);
      } catch (error) {
        console.error("Error fetching financial data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFinancialData();
  }, [stock.symbol]);

  if (loading) {
    return <div>Loading financial data...</div>;
  }

  if (!financialData) {
    return <div>No financial data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm font-medium text-muted-foreground">P/E Ratio</div>
            <div className="mt-2 text-2xl font-bold">
              {formatNumber(financialData.key_metrics.pe_ratio)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Profit Margin</div>
            <div className="mt-2 text-2xl font-bold">
              {formatNumber(financialData.key_metrics.profit_margin, "%")}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-muted-foreground">ROE</div>
            <div className="mt-2 text-2xl font-bold">
              {formatNumber(financialData.key_metrics.return_on_equity, "%")}
            </div>
          </Card>
        </div>
      </div>

      {/* Financial Statements Section */}
      <Tabs defaultValue="income" className="space-y-4">
        <TabsList>
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Operating Income</TableHead>
                  <TableHead className="text-right">Net Income</TableHead>
                  <TableHead className="text-right">EPS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialData.income_statement.periods.map((period, index) => (
                  <TableRow key={period}>
                    <TableCell>{period}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.income_statement.revenue[index], "SAR", true)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.income_statement.operating_income[index], "SAR", true)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.income_statement.net_income[index], "SAR", true)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.income_statement.eps[index], "SAR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Total Assets</TableHead>
                  <TableHead className="text-right">Total Liabilities</TableHead>
                  <TableHead className="text-right">Equity</TableHead>
                  <TableHead className="text-right">Cash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialData.balance_sheet.periods.map((period, index) => (
                  <TableRow key={period}>
                    <TableCell>{period}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.balance_sheet.total_assets[index], "SAR", true)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.balance_sheet.total_liabilities[index], "SAR", true)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.balance_sheet.shareholders_equity[index], "SAR", true)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.balance_sheet.cash[index], "SAR", true)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="cash">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Operating CF</TableHead>
                  <TableHead className="text-right">Investing CF</TableHead>
                  <TableHead className="text-right">Financing CF</TableHead>
                  <TableHead className="text-right">Free CF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialData.cash_flow.periods.map((period, index) => (
                  <TableRow key={period}>
                    <TableCell>{period}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.cash_flow.operating_cash_flow[index], "SAR", true)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.cash_flow.investing_cash_flow[index], "SAR", true)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.cash_flow.financing_cash_flow[index], "SAR", true)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(financialData.cash_flow.free_cash_flow[index], "SAR", true)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}