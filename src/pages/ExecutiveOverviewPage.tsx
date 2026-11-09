/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Package,
  Percent,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  AlertCircle,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  ExecutiveKPIs,
  MonthlyMetric,
  CountryMetric,
  ProductMetric,
  RecommendationItem
} from '../types/analytics';

interface ExecutiveOverviewPageProps {
  kpis: ExecutiveKPIs;
  monthly: MonthlyMetric[];
  countries: CountryMetric[];
  products: ProductMetric[];
  recommendations: RecommendationItem[];
  onNavigatePage: (page: any) => void;
}

export const ExecutiveOverviewPage: React.FC<ExecutiveOverviewPageProps> = ({
  kpis,
  monthly,
  countries,
  products,
  recommendations,
  onNavigatePage
}) => {
  const topCountries = countries.slice(0, 5);
  const topProducts = products.slice(0, 5);
  const bottomProducts = [...products].sort((a, b) => a.profit - b.profit).slice(0, 4);

  // Derivations for Monthly Revenue Trend Line Chart
  const peakMonth = React.useMemo(() => {
    if (monthly.length === 0) return null;
    return [...monthly].sort((a, b) => b.revenue - a.revenue)[0];
  }, [monthly]);

  const worstMonth = React.useMemo(() => {
    if (monthly.length === 0) return null;
    return [...monthly].sort((a, b) => a.revenue - b.revenue)[0];
  }, [monthly]);

  const avgMonthlyRevenue = React.useMemo(() => {
    if (monthly.length === 0) return 0;
    const sum = monthly.reduce((acc, m) => acc + m.revenue, 0);
    return Math.round(sum / monthly.length);
  }, [monthly]);

  const latestMonth = monthly[monthly.length - 1];

  return (
    <div className="space-y-6">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between text-[#697586] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-blue-50 text-[#3867F5] rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172033] tabular-nums font-mono tracking-tight">
            ${kpis.totalRevenue.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {kpis.growthRevenuePct !== null ? (
              <span className={`flex items-center font-semibold ${kpis.growthRevenuePct >= 0 ? 'text-[#16A36A]' : 'text-[#E65353]'}`}>
                {kpis.growthRevenuePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpis.growthRevenuePct > 0 ? `+${kpis.growthRevenuePct}%` : `${kpis.growthRevenuePct}%`}
              </span>
            ) : (
              <span className="text-[#697586]">Not enough data</span>
            )}
            <span className="text-[#697586]">vs prior period</span>
          </div>
        </div>

        {/* Total Profit */}
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between text-[#697586] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Profit</span>
            <div className="p-2 bg-emerald-50 text-[#16A36A] rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172033] tabular-nums font-mono tracking-tight">
            ${kpis.totalProfit.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {kpis.growthProfitPct !== null ? (
              <span className={`flex items-center font-semibold ${kpis.growthProfitPct >= 0 ? 'text-[#16A36A]' : 'text-[#E65353]'}`}>
                {kpis.growthProfitPct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpis.growthProfitPct > 0 ? `+${kpis.growthProfitPct}%` : `${kpis.growthProfitPct}%`}
              </span>
            ) : (
              <span className="text-[#697586]">Not enough data</span>
            )}
            <span className="text-[#697586]">vs prior period</span>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between text-[#697586] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Profit Margin</span>
            <div className="p-2 bg-teal-50 text-[#13B8A6] rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172033] tabular-nums font-mono tracking-tight">
            {kpis.profitMargin}%
          </div>
          <div className="mt-2 text-xs text-[#697586]">
            Net realized margin
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between text-[#697586] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172033] tabular-nums font-mono tracking-tight">
            {kpis.totalOrders.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {kpis.growthOrdersPct !== null ? (
              <span className={`flex items-center font-semibold ${kpis.growthOrdersPct >= 0 ? 'text-[#16A36A]' : 'text-[#E65353]'}`}>
                {kpis.growthOrdersPct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpis.growthOrdersPct > 0 ? `+${kpis.growthOrdersPct}%` : `${kpis.growthOrdersPct}%`}
              </span>
            ) : (
              <span className="text-[#697586]">Not enough data</span>
            )}
            <span className="text-[#697586]">vs prior period</span>
          </div>
        </div>

        {/* Units Sold */}
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between text-[#697586] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Units Sold</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172033] tabular-nums font-mono tracking-tight">
            {kpis.totalQuantity.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-[#697586]">
            Total quantity delivered
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between text-[#697586] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
            <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172033] tabular-nums font-mono tracking-tight">
            ${kpis.avgOrderValue.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-[#697586]">
            Revenue per transaction
          </div>
        </div>
      </div>

      {/* Monthly Revenue Trend Line Chart */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E7ECF3]">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-[#3867F5] rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#172033]">
                Monthly Revenue Trend
              </h2>
            </div>
            <p className="text-xs text-[#697586] mt-0.5">
              Historical monthly performance trajectory for quick visual analysis ({monthly.length} months chronological)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {peakMonth && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#697586]">Historical Peak:</span>
                <span className="font-bold text-[#172033] font-mono tabular-nums">
                  ${peakMonth.revenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-[#697586]">({peakMonth.label})</span>
              </div>
            )}
            <span className="hidden sm:inline text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#697586]">Avg Monthly Revenue:</span>
              <span className="font-bold text-[#3867F5] font-mono tabular-nums">
                ${avgMonthlyRevenue.toLocaleString()}
              </span>
            </div>
            <span className="hidden sm:inline text-slate-300">|</span>
            <button
              onClick={() => onNavigatePage('monthly')}
              className="font-semibold text-[#3867F5] hover:underline whitespace-nowrap"
            >
              Detailed Analysis &rarr;
            </button>
          </div>
        </div>

        {/* Recharts Line Chart Viewport */}
        <div className="h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly} margin={{ top: 12, right: 15, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="revenueTrendGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3867F5" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#3867F5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#697586', fontSize: 11 }}
                axisLine={{ stroke: '#E7ECF3' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#697586', fontSize: 11 }}
                axisLine={{ stroke: '#E7ECF3' }}
                tickLine={false}
                tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as MonthlyMetric;
                    return (
                      <div className="p-3 bg-white rounded-lg border border-[#E7ECF3] shadow-md text-xs space-y-1.5 min-w-[170px]">
                        <div className="font-bold text-[#172033] border-b border-[#E7ECF3] pb-1">
                          {label}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[#697586]">Revenue:</span>
                          <span className="font-mono tabular-nums font-bold text-[#3867F5]">
                            ${data.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[#697586]">Net Profit:</span>
                          <span className="font-mono tabular-nums font-semibold text-[#16A36A]">
                            ${data.profit.toLocaleString()} ({data.margin}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[#697586]">Orders:</span>
                          <span className="font-mono tabular-nums text-[#172033]">
                            {data.orders.toLocaleString()}
                          </span>
                        </div>
                        {data.momRevenueGrowth !== null && (
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#F1F5F9]">
                            <span className="text-[#697586]">MoM Growth:</span>
                            <span className={`font-mono tabular-nums font-bold ${
                              data.momRevenueGrowth >= 0 ? 'text-[#16A36A]' : 'text-[#E65353]'
                            }`}>
                              {data.momRevenueGrowth >= 0 ? '+' : ''}{data.momRevenueGrowth}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {avgMonthlyRevenue > 0 && (
                <ReferenceLine
                  y={avgMonthlyRevenue}
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  label={{
                    value: `Avg: $${(avgMonthlyRevenue / 1000).toFixed(0)}k`,
                    fill: '#697586',
                    fontSize: 10,
                    position: 'insideTopRight'
                  }}
                />
              )}
              {/* Subtle area gradient glow */}
              <Area
                type="monotone"
                dataKey="revenue"
                fill="url(#revenueTrendGlow)"
                stroke="none"
              />
              {/* Primary Trend Line */}
              <Line
                type="monotone"
                dataKey="revenue"
                name="Monthly Revenue"
                stroke="#3867F5"
                strokeWidth={3}
                dot={{
                  r: 3.5,
                  fill: '#3867F5',
                  stroke: '#FFFFFF',
                  strokeWidth: 2
                }}
                activeDot={{
                  r: 6,
                  fill: '#3867F5',
                  stroke: '#FFFFFF',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Micro-Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E7ECF3] text-xs">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#697586]">Latest Month Revenue</span>
            <div className="font-mono tabular-nums font-bold text-[#172033] mt-0.5">
              ${latestMonth?.revenue.toLocaleString() || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#697586]">MoM Velocity</span>
            <div className={`font-mono tabular-nums font-bold mt-0.5 ${
              (latestMonth?.momRevenueGrowth ?? 0) >= 0 ? 'text-[#16A36A]' : 'text-[#E65353]'
            }`}>
              {latestMonth?.momRevenueGrowth !== null && latestMonth?.momRevenueGrowth !== undefined
                ? `${latestMonth.momRevenueGrowth >= 0 ? '+' : ''}${latestMonth.momRevenueGrowth}%`
                : 'Baseline'}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#697586]">Historical Range (Peak / Low)</span>
            <div className="font-mono tabular-nums font-medium text-[#172033] mt-0.5">
              ${peakMonth?.revenue ? (peakMonth.revenue / 1000).toFixed(0) : '0'}k / ${worstMonth?.revenue ? (worstMonth.revenue / 1000).toFixed(0) : '0'}k
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#697586]">Timeline Scope</span>
            <div className="font-mono tabular-nums font-bold text-[#3867F5] mt-0.5">
              {monthly.length} Chronological Months
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Timeline */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Monthly Revenue & Profit Dynamics</h2>
              <p className="text-xs text-[#697586]">Chronological time-series comparison across monitored periods</p>
            </div>
            <button
              onClick={() => onNavigatePage('monthly')}
              className="text-xs font-semibold text-[#3867F5] hover:underline"
            >
              Detailed Breakdown &rarr;
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#697586', fontSize: 11 }} axisLine={{ stroke: '#E7ECF3' }} tickLine={false} />
                <YAxis
                  tick={{ fill: '#697586', fontSize: 11 }}
                  axisLine={{ stroke: '#E7ECF3' }}
                  tickLine={false}
                  tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [`$${Number(value).toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Profit']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#3867F5" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#16A36A" strokeWidth={2.5} dot={{ r: 3, fill: '#16A36A' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Countries */}
        <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Top Market Regions</h2>
              <p className="text-xs text-[#697586]">By cumulative sales volume</p>
            </div>
            <button
              onClick={() => onNavigatePage('countries')}
              className="text-xs font-semibold text-[#3867F5] hover:underline"
            >
              All &rarr;
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {topCountries.map((c, idx) => {
              const maxRev = topCountries[0]?.revenue || 1;
              const pct = Math.round((c.revenue / maxRev) * 100);
              return (
                <div key={c.country} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#172033] flex items-center gap-1.5">
                      <span className="text-[#697586] font-mono">{idx + 1}.</span>
                      {c.country}
                    </span>
                    <span className="font-mono tabular-nums text-[#172033] font-bold">
                      ${c.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F7F9FC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3867F5] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#697586]">
                    <span>Profit: <strong className="text-[#16A36A] font-semibold">${c.profit.toLocaleString()}</strong></span>
                    <span>Margin: <strong>{c.margin}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Highlights & Underperformers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Products */}
        <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Best-Selling SKUs</h2>
              <p className="text-xs text-[#697586]">Highest revenue contributors in dataset</p>
            </div>
            <button
              onClick={() => onNavigatePage('products')}
              className="text-xs font-semibold text-[#3867F5] hover:underline"
            >
              View Products &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E7ECF3] text-[#697586]">
                  <th className="pb-2.5 font-semibold">Product Name</th>
                  <th className="pb-2.5 font-semibold text-right">Revenue</th>
                  <th className="pb-2.5 font-semibold text-right">Profit</th>
                  <th className="pb-2.5 font-semibold text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {topProducts.map(p => (
                  <tr key={p.productId} className="hover:bg-[#F7F9FC]/60 transition-colors">
                    <td className="py-2.5 font-medium text-[#172033] max-w-[200px] truncate">
                      {p.productName}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-[#172033]">
                      ${p.revenue.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-[#16A36A] font-semibold">
                      ${p.profit.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-[#172033]">
                      {p.margin}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lowest Performing / Negative Margin Products */}
        <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Loss-Making & Margin Pressure SKUs</h2>
              <p className="text-xs text-[#697586]">Products requiring pricing or supply-chain intervention</p>
            </div>
            <button
              onClick={() => onNavigatePage('profitloss')}
              className="text-xs font-semibold text-[#E65353] hover:underline"
            >
              P&L Analysis &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E7ECF3] text-[#697586]">
                  <th className="pb-2.5 font-semibold">Product Name</th>
                  <th className="pb-2.5 font-semibold text-right">Net Profit</th>
                  <th className="pb-2.5 font-semibold text-right">Return Rate</th>
                  <th className="pb-2.5 font-semibold text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {bottomProducts.map(p => {
                  const isNegative = p.profit < 0;
                  return (
                    <tr key={p.productId} className="hover:bg-[#F7F9FC]/60 transition-colors">
                      <td className="py-2.5 font-medium text-[#172033] max-w-[200px] truncate">
                        {p.productName}
                      </td>
                      <td className={`py-2.5 text-right font-mono tabular-nums font-semibold ${isNegative ? 'text-[#E65353]' : 'text-[#172033]'}`}>
                        {isNegative ? `-$${Math.abs(p.profit).toLocaleString()}` : `$${p.profit.toLocaleString()}`}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-[#697586]">
                        {p.returnRate}%
                      </td>
                      <td className={`py-2.5 text-right font-mono tabular-nums font-semibold ${isNegative ? 'text-[#E65353]' : 'text-[#172033]'}`}>
                        {p.margin}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Strategic Findings Banner */}
      {recommendations.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white rounded-xl border border-blue-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#3867F5] uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Grounded Business Takeaway</span>
            </div>
            <button
              onClick={() => onNavigatePage('recommendations')}
              className="text-xs font-semibold text-[#3867F5] hover:underline"
            >
              View Strategic Recommendations &rarr;
            </button>
          </div>
          <div className="text-sm font-semibold text-[#172033] mb-1">
            {recommendations[0].title}
          </div>
          <p className="text-xs text-[#697586] leading-relaxed">
            {recommendations[0].evidence}
          </p>
        </div>
      )}
    </div>
  );
};
