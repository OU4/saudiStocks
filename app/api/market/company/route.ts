// app/api/market/company/route.ts
import { NextResponse } from "next/server";
import { API_KEY, API_URL } from "@/app/config/market";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    // Fetch fundamental data
    const [statsResponse, incomeResponse, balanceResponse] = await Promise.all([
      fetch(`${API_URL}/statistics?symbol=${symbol}&apikey=${API_KEY}`),
      fetch(`${API_URL}/income_statement?symbol=${symbol}&apikey=${API_KEY}`),
      fetch(`${API_URL}/balance_sheet?symbol=${symbol}&apikey=${API_KEY}`)
    ]);

    const [stats, income, balance] = await Promise.all([
      statsResponse.json(),
      incomeResponse.json(),
      balanceResponse.json()
    ]);

    // Calculate key metrics
    const latestIncome = income.income_statement?.[0] || {};
    const latestBalance = balance.balance_sheet?.[0] || {};

    const revenue = latestIncome.revenue || 0;
    const ebitda = latestIncome.ebitda || 0;
    const netIncome = latestIncome.net_income || 0;
    const totalAssets = latestBalance.total_assets || 0;
    const totalEquity = latestBalance.total_shareholders_equity || 0;

    const response = {
      // Market data
      market_cap: stats.market_cap || 0,
      enterprise_value: stats.enterprise_value || 0,
      shares_outstanding: stats.shares_outstanding || 0,

      // Valuation metrics
      pe_ratio: stats.pe_ratio || 0,
      pb_ratio: stats.price_to_book || 0,
      ev_to_sales: stats.enterprise_value_to_revenue || 0,
      ev_to_ebitda: stats.enterprise_value_to_ebitda || 0,

      // Financial metrics
      revenue: revenue,
      ebitda: ebitda,
      net_income: netIncome,
      total_assets: totalAssets,
      total_equity: totalEquity,

      // Operating metrics
      employees: stats.full_time_employees || 0,

      // Margins
      gross_margin: latestIncome.gross_margin || 0,
      ebitda_margin: ebitda / revenue || 0,
      operating_margin: latestIncome.operating_margin || 0,
      net_margin: netIncome / revenue || 0,
      fcf_margin: (latestIncome.operating_cash_flow - latestIncome.capital_expenditure) / revenue || 0,

      // Growth metrics
      revenue_growth: stats.quarterly_revenue_growth || 0,
      earnings_growth: stats.quarterly_earnings_growth || 0
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching company data:', error);
    return NextResponse.json(
      { error: "Failed to fetch company data" },
      { status: 500 }
    );
  }
}