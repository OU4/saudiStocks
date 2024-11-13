// app/api/market/stock/[symbol]/route.ts
import { NextResponse } from "next/server";
import { API_KEY, API_URL } from "@/app/config/market";

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    // Fetch data from multiple endpoints
    const [quoteRes, statsRes, timeSeriesRes] = await Promise.all([
      fetch(`${API_URL}/quote?symbol=${params.symbol}&apikey=${API_KEY}`),
      fetch(`${API_URL}/statistics?symbol=${params.symbol}&apikey=${API_KEY}`),
      fetch(`${API_URL}/time_series?symbol=${params.symbol}&interval=1day&outputsize=90&apikey=${API_KEY}`)
    ]);

    // Check responses
    if (!quoteRes.ok || !statsRes.ok || !timeSeriesRes.ok) {
      throw new Error('Failed to fetch data from API');
    }

    const [quote, statistics, timeSeries] = await Promise.all([
      quoteRes.json(),
      statsRes.json(),
      timeSeriesRes.json()
    ]);

    // Extract statistics data for easier access
    const stats = statistics.statistics || {};
    const valuations = stats.valuations_metrics || {};
    const financials = stats.financials || {};
    const income = financials.income_statement || {};
    const returns = financials.returns || {};
    const growth = financials.growth || {};
    const dividends = stats.dividends_and_splits || {};

    // Transform and combine data
    const stockData = {
      quote: {
        symbol: params.symbol,
        name: quote.name || '',
        close: quote.close || quote.price?.toString() || '0',
        change: quote.change?.toString() || '0',
        percent_change: quote.percent_change?.toString() || '0',
        high: quote.high?.toString() || '0',
        low: quote.low?.toString() || '0',
        open: quote.open?.toString() || '0',
        volume: quote.volume?.toString() || '0'
      },
      stats: {
        // Profile
        market_cap: valuations.market_capitalization || 0,
        enterprise_value: valuations.enterprise_value || 0,
        shares_outstanding: stats.stock_statistics?.shares_outstanding || 0,
        revenue: income.revenue_ttm || 0,
        employees: stats.employees || 0,

        // Margins
        gross_margin: financials.gross_margin || 0,
        ebitda_margin: financials.ebitda_margin || 0,
        operating_margin: financials.operating_margin || 0,
        pretax_margin: financials.pretax_margin || 0,
        net_margin: financials.profit_margin || 0,
        fcf_margin: financials.fcf_margin || 0,

        // Returns (5Yr Avg)
        roa: returns.return_on_assets_5yr || 0,
        rota: returns.return_on_total_assets_5yr || 0,
        roe: returns.return_on_equity_5yr || 0,
        roce: returns.return_on_capital_employed_5yr || 0,
        roic: returns.return_on_invested_capital_5yr || 0,

        // Valuation (TTM)
        pe_ratio: valuations.trailing_pe || 0,
        pb_ratio: valuations.price_to_book_mrq || 0,
        ev_sales: valuations.enterprise_to_revenue || 0,
        ev_ebitda: valuations.enterprise_to_ebitda || 0,
        pfcf_ratio: valuations.price_to_fcf || 0,
        ev_gross_profit: valuations.enterprise_to_gross_profit || 0,

        // Valuation (NTM)
        price_target: valuations.analyst_target_price || 0,
        forward_pe: valuations.forward_pe || 0,
        peg_ratio: valuations.peg_ratio || 0,
        forward_ev_sales: valuations.forward_ev_to_revenue || 0,
        forward_ev_ebitda: valuations.forward_ev_to_ebitda || 0,
        forward_pfcf: valuations.forward_price_to_fcf || 0,

        // Financial Health
        cash: financials.total_cash || 0,
        net_debt: financials.net_debt || 0,
        debt_to_equity: financials.debt_to_equity || 0,
        interest_coverage: financials.interest_coverage || 0,

        // Growth (CAGR)
        revenue_growth_3y: growth.revenue_growth_3y || 0,
        revenue_growth_5y: growth.revenue_growth_5y || 0,
        revenue_growth_10y: growth.revenue_growth_10y || 0,
        eps_growth_3y: growth.eps_growth_3y || 0,
        eps_growth_5y: growth.eps_growth_5y || 0,
        eps_growth_10y: growth.eps_growth_10y || 0,
        revenue_growth_fwd_2y: growth.revenue_growth_fwd_2y || 0,
        ebitda_growth_fwd_2y: growth.ebitda_growth_fwd_2y || 0,
        eps_growth_fwd_2y: growth.eps_growth_fwd_2y || 0,
        eps_growth_lt: growth.eps_growth_lt || 0,

        // Dividends
        dividend_yield: dividends.trailing_annual_dividend_yield || 0,
        payout_ratio: dividends.payout_ratio || 0,
        dps: dividends.trailing_annual_dividend_rate || 0,
        dps_growth_3y: dividends.dividend_growth_3y || 0,
        dps_growth_5y: dividends.dividend_growth_5y || 0,
        dps_growth_10y: dividends.dividend_growth_10y || 0,
        dps_growth_fwd_2y: dividends.dividend_growth_fwd_2y || 0,
      },
      timeSeries: {
        values: timeSeries.values?.map((item: any) => ({
          datetime: item.datetime,
          open: item.open?.toString() || '0',
          high: item.high?.toString() || '0',
          low: item.low?.toString() || '0',
          close: item.close?.toString() || '0',
          volume: item.volume?.toString() || '0'
        })) || []
      }
    };

    return NextResponse.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}