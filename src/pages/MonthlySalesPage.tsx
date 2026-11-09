/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  BarChart2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area
} from 'recharts';
import { MonthlyMetric } from '../types/analytics';

interface MonthlySalesPageProps {
  monthly: MonthlyMetric[];
  availableYears: number[];
}

export const MonthlySalesPage: React.FC<MonthlySalesPageProps> = ({
  monthly,
  availableYears
}) => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [activeChartTab, setActiveChartTab] = useState<'comparison' | 'revenue' | 'profit' | 'volume' | 'growth'>('comparison');

  // Filter chronologically by year if selected
  const displayedMonthly = useMemo(() => {
    if (selectedYear === 'all') return monthly;
    return monthly.filter(m => m.year === selectedYear);
  }, [monthly, selectedYear]);

  // Identify Best and Worst Months
  const { bestMonth, worstMonth } = useMemo(() => {
    if (displayedMonthly.length === 0) return { bestMonth: null, worstMonth: null };
    let best = displayedMonthly[0];
    let worst = displayedMonthly[0];

    for (const m of displayedMonthly) {
      if (m.revenue > best.revenue) best = m;
      if (m.revenue < worst.revenue) worst = m;
    }
    return { bestMonth: best, worstMonth: worst };
  }, [displayedMonthly]);

  // Total sums for the selected period
  const totalRev = displayedMonthly.reduce((acc, m) => acc + m.revenue, 0);
  const totalProf = displayedMonthly.reduce((acc, m) => acc + m.profit, 0);
  const totalQty = displayedMonthly.reduce((acc, m) => acc + m.quantity, 0);
  const avgMargin = totalRev > 0 ? (totalProf / totalRev) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar: Year Selection & View Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#3867F5]" />
          <span className="text-xs font-bold text-[#172033] uppercase tracking-wider">
            Period Filter:
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedYear === 'all'
                  ? 'bg-white text-[#3867F5] shadow-xs'
                  : 'text-[#697586] hover:text-[#172033]'
              }`}
            >
              All Years ({monthly.length} mo)
            </button>
            {availableYears.map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedYear === yr
                    ? 'bg-white text-[#3867F5] shadow-xs'
                    : 'text-[#697586] hover:text-[#172033]'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Period Summary */}
        <div className="flex items-center gap-3 text-xs text-[#697586]">
          <span>Total Rev: <strong className="text-[#172033] font-mono tabular-nums">${totalRev.toLocaleString()}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Profit: <strong className="text-[#16A36A] font-mono tabular-nums">${totalProf.toLocaleString()}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Margin: <strong className="text-[#172033] font-mono tabular-nums">{avgMargin.toFixed(1)}%</strong></span>
        </div>
      </div>

      {/* Best & Worst Month Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Month */}
        {bestMonth && (
          <div className="p-5 bg-gradient-to-r from-emerald-50/70 via-white to-white rounded-xl border border-emerald-100 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-[#16A36A] rounded-xl shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#16A36A] uppercase tracking-wider">
                  Peak Performing Month
                </span>
                <span className="text-xs font-bold text-[#172033]">{bestMonth.label}</span>
              </div>
              <div className="text-xl font-bold text-[#172033] font-mono tabular-nums">
                ${bestMonth.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-[#697586]">
                Realized profit of <strong className="text-[#16A36A]">${bestMonth.profit.toLocaleString()}</strong> ({bestMonth.margin}% margin) with {bestMonth.orders} orders and {bestMonth.quantity} units sold.
              </p>
            </div>
          </div>
        )}

        {/* Worst Month */}
        {worstMonth && (
          <div className="p-5 bg-gradient-to-r from-rose-50/70 via-white to-white rounded-xl border border-rose-100 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-rose-100 text-[#E65353] rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#E65353] uppercase tracking-wider">
                  Lowest Volume Month
                </span>
                <span className="text-xs font-bold text-[#172033]">{worstMonth.label}</span>
              </div>
              <div className="text-xl font-bold text-[#172033] font-mono tabular-nums">
                ${worstMonth.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-[#697586]">
                Generated <strong className="text-[#172033]">${worstMonth.profit.toLocaleString()}</strong> profit ({worstMonth.margin}% margin). Influenced by seasonal lull and distributor inventory cycles.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Charts Section with Tabs */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-[#172033]">
              Chronological Performance Visualizer
            </h2>
            <p className="text-xs text-[#697586]">
              Months sorted strictly chronologically (Jan &rarr; Dec). Select a visualization mode below:
            </p>
          </div>

          {/* Segmented Controls for Chart Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg shrink-0">
            {[
              { id: 'comparison', label: 'Rev vs Profit' },
              { id: 'revenue', label: 'Revenue Line' },
              { id: 'profit', label: 'Profit Line' },
              { id: 'volume', label: 'Quantity Bar' },
              { id: 'growth', label: 'MoM Growth %' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeChartTab === tab.id
                    ? 'bg-white text-[#3867F5] shadow-xs font-semibold'
                    : 'text-[#697586] hover:text-[#172033]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === 'comparison' ? (
              <ComposedChart data={displayedMonthly} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#697586', fontSize: 11 }} axisLine={{ stroke: '#E7ECF3' }} tickLine={false} />
                <YAxis
                  tick={{ fill: '#697586', fontSize: 11 }}
                  axisLine={{ stroke: '#E7ECF3' }}
                  tickLine={false}
                  tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`$${Number(val).toLocaleString()}`, name === 'revenue' ? 'Sales Revenue' : 'Gross Profit']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Sales Revenue" fill="#3867F5" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Line type="monotone" dataKey="profit" name="Gross Profit" stroke="#16A36A" strokeWidth={2.5} dot={{ r: 4, fill: '#16A36A' }} />
              </ComposedChart>
            ) : activeChartTab === 'revenue' ? (
              <LineChart data={displayedMonthly} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#697586', fontSize: 11 }} axisLine={{ stroke: '#E7ECF3' }} tickLine={false} />
                <YAxis
                  tick={{ fill: '#697586', fontSize: 11 }}
                  axisLine={{ stroke: '#E7ECF3' }}
                  tickLine={false}
                  tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Monthly Revenue']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="revenue" name="Monthly Revenue" stroke="#3867F5" strokeWidth={3} dot={{ r: 4, fill: '#3867F5' }} />
              </LineChart>
            ) : activeChartTab === 'profit' ? (
              <LineChart data={displayedMonthly} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#697586', fontSize: 11 }} axisLine={{ stroke: '#E7ECF3' }} tickLine={false} />
                <YAxis
                  tick={{ fill: '#697586', fontSize: 11 }}
                  axisLine={{ stroke: '#E7ECF3' }}
                  tickLine={false}
                  tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Monthly Profit']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="profit" name="Monthly Profit" stroke="#16A36A" strokeWidth={3} dot={{ r: 4, fill: '#16A36A' }} />
              </LineChart>
            ) : activeChartTab === 'volume' ? (
              <BarChart data={displayedMonthly} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#697586', fontSize: 11 }} axisLine={{ stroke: '#E7ECF3' }} tickLine={false} />
                <YAxis tick={{ fill: '#697586', fontSize: 11 }} axisLine={{ stroke: '#E7ECF3' }} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), 'Units Sold']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="quantity" name="Units Sold" fill="#13B8A6" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            ) : (
              <BarChart data={displayedMonthly} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#697586', fontSize: 11 }} axisLine={{ stroke: '#E7ECF3' }} tickLine={false} />
                <YAxis
                  tick={{ fill: '#697586', fontSize: 11 }}
                  axisLine={{ stroke: '#E7ECF3' }}
                  tickLine={false}
                  tickFormatter={val => `${val}%`}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'MoM Revenue Growth']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar
                  dataKey="momRevenueGrowth"
                  name="MoM Growth %"
                  fill="#3867F5"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Monthly Data Table */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Chronological Ledger & Growth Table</h2>
            <p className="text-xs text-[#697586]">Exact figures by period with Month-over-Month changes</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7ECF3] text-[#697586]">
                <th className="py-2.5 font-semibold">Month</th>
                <th className="py-2.5 font-semibold text-right">Revenue</th>
                <th className="py-2.5 font-semibold text-right">Cost</th>
                <th className="py-2.5 font-semibold text-right">Profit</th>
                <th className="py-2.5 font-semibold text-right">Margin %</th>
                <th className="py-2.5 font-semibold text-right">Orders</th>
                <th className="py-2.5 font-semibold text-right">Units Sold</th>
                <th className="py-2.5 font-semibold text-right">MoM Rev Growth</th>
                <th className="py-2.5 font-semibold text-right">MoM Profit Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {displayedMonthly.map(m => (
                <tr key={m.yearMonth} className="hover:bg-[#F7F9FC]/60 transition-colors">
                  <td className="py-3 font-semibold text-[#172033]">
                    {m.label}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-[#172033] font-medium">
                    ${m.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-[#697586]">
                    ${m.cost.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-[#16A36A] font-semibold">
                    ${m.profit.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-[#172033]">
                    {m.margin}%
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-[#172033]">
                    {m.orders.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-[#172033]">
                    {m.quantity.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums">
                    {m.momRevenueGrowth !== null ? (
                      <span className={`inline-flex items-center gap-0.5 font-semibold ${m.momRevenueGrowth >= 0 ? 'text-[#16A36A]' : 'text-[#E65353]'}`}>
                        {m.momRevenueGrowth >= 0 ? '+' : ''}{m.momRevenueGrowth}%
                      </span>
                    ) : (
                      <span className="text-[#697586]">-</span>
                    )}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums">
                    {m.momProfitGrowth !== null ? (
                      <span className={`inline-flex items-center gap-0.5 font-semibold ${m.momProfitGrowth >= 0 ? 'text-[#16A36A]' : 'text-[#E65353]'}`}>
                        {m.momProfitGrowth >= 0 ? '+' : ''}{m.momProfitGrowth}%
                      </span>
                    ) : (
                      <span className="text-[#697586]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
