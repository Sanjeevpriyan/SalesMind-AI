/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Globe,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Filter,
  Package,
  Star
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import { CountryMetric, SalesRecord } from '../types/analytics';

interface CountryIntelligencePageProps {
  countries: CountryMetric[];
  records: SalesRecord[];
}

export const CountryIntelligencePage: React.FC<CountryIntelligencePageProps> = ({
  countries,
  records
}) => {
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(countries[0]?.country || null);

  // Drilldown records for the selected country
  const selectedCountryMetrics = countries.find(c => c.country === selectedCountryName);
  const countryRecords = records.filter(r => r.country === selectedCountryName);

  // Country products breakdown
  const countryProducts = React.useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; profit: number; qty: number }>();
    for (const r of countryRecords) {
      const item = map.get(r.product_name) || { name: r.product_name, revenue: 0, profit: 0, qty: 0 };
      item.revenue += r.revenue;
      item.profit += r.profit;
      item.qty += r.quantity;
      map.set(r.product_name, item);
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [countryRecords]);

  // Country customer reviews
  const countryReviews = countryRecords.filter(r => r.review_text);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Total Monitored Markets
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono tabular-nums">
            {countries.length} Countries
          </div>
          <p className="text-xs text-[#697586] mt-1">
            Global geographic footprint across North America, Europe & APAC
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Highest Profit Market
          </div>
          <div className="text-2xl font-bold text-[#16A36A] font-mono tabular-nums">
            {countries[0]?.country || 'N/A'}
          </div>
          <p className="text-xs text-[#697586] mt-1">
            Delivered <strong className="text-[#172033]">${countries[0]?.profit.toLocaleString()}</strong> in net profit ({countries[0]?.margin}% margin)
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Markets with Loss Events
          </div>
          <div className="text-2xl font-bold text-[#E65353] font-mono tabular-nums">
            {countries.filter(c => c.loss > 0).length} Regions
          </div>
          <p className="text-xs text-[#697586] mt-1">
            Encountered regional returns, heavy promotional discounting, or tariff spikes
          </p>
        </div>
      </div>

      {/* Revenue & Profit Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Revenue Chart */}
        <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Market Revenue Distribution</h2>
              <p className="text-xs text-[#697586]">Top countries by aggregate transaction revenue</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countries} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="country"
                  tick={{ fill: '#697586', fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  axisLine={{ stroke: '#E7ECF3' }}
                />
                <YAxis
                  tick={{ fill: '#697586', fontSize: 11 }}
                  axisLine={{ stroke: '#E7ECF3' }}
                  tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#3867F5" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Profit & Loss Chart */}
        <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Net Profit by Country</h2>
              <p className="text-xs text-[#697586]">Identifies positive earnings vs margin loss risks</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countries} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="country"
                  tick={{ fill: '#697586', fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  axisLine={{ stroke: '#E7ECF3' }}
                />
                <YAxis
                  tick={{ fill: '#697586', fontSize: 11 }}
                  axisLine={{ stroke: '#E7ECF3' }}
                  tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Net Profit']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {countries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#16A36A' : '#E65353'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Country Ledger Table with Interactive Selection */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Country Intelligence Ledger</h2>
            <p className="text-xs text-[#697586]">Click any country row to drill down into localized SKUs and customer sentiment</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7ECF3] text-[#697586]">
                <th className="py-2.5 font-semibold">Country</th>
                <th className="py-2.5 font-semibold text-right">Revenue</th>
                <th className="py-2.5 font-semibold text-right">Net Profit</th>
                <th className="py-2.5 font-semibold text-right">Loss Events</th>
                <th className="py-2.5 font-semibold text-right">Margin %</th>
                <th className="py-2.5 font-semibold text-right">Orders</th>
                <th className="py-2.5 font-semibold text-right">Avg Rating</th>
                <th className="py-2.5 font-semibold">Top SKU</th>
                <th className="py-2.5 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {countries.map(c => {
                const isSelected = c.country === selectedCountryName;
                const isLoss = c.loss > 0;
                return (
                  <tr
                    key={c.country}
                    onClick={() => setSelectedCountryName(c.country)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70' : 'hover:bg-[#F7F9FC]/60'
                    }`}
                  >
                    <td className="py-3 font-bold text-[#172033] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#3867F5]" />
                      {c.country}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#172033] font-medium">
                      ${c.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#16A36A] font-semibold">
                      ${c.profit.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums">
                      {isLoss ? (
                        <span className="text-[#E65353] font-semibold">
                          ${c.loss.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[#697586]">$0</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#172033] font-medium">
                      {c.margin}%
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#172033]">
                      {c.orders.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums">
                      <span className="inline-flex items-center gap-1 text-[#172033]">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {c.sentimentScore > 0 ? c.sentimentScore : '-'}
                      </span>
                    </td>
                    <td className="py-3 text-[#697586] max-w-[180px] truncate">
                      {c.topProduct}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCountryName(c.country);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all ${
                          isSelected
                            ? 'bg-[#3867F5] border-[#3867F5] text-white'
                            : 'bg-white border-[#E7ECF3] text-[#3867F5] hover:bg-[#F7F9FC]'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Drilldown'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Drill-down Panel for Selected Country */}
      {selectedCountryMetrics && (
        <div className="p-6 bg-white rounded-xl border border-[#3867F5]/30 shadow-xs space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF3]">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#3867F5]" />
                <h3 className="text-base font-bold text-[#172033]">
                  Regional Drilldown: {selectedCountryMetrics.country}
                </h3>
              </div>
              <p className="text-xs text-[#697586]">
                Granular product performance and feedback captured in {selectedCountryMetrics.country}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
              <span>Revenue: <strong className="text-[#172033]">${selectedCountryMetrics.revenue.toLocaleString()}</strong></span>
              <span>Profit: <strong className="text-[#16A36A]">${selectedCountryMetrics.profit.toLocaleString()}</strong></span>
              <span>Margin: <strong>{selectedCountryMetrics.margin}%</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products in Country */}
            <div>
              <div className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#3867F5]" />
                <span>Product Performance in {selectedCountryMetrics.country}</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {countryProducts.slice(0, 6).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F9FC] border border-[#E7ECF3] text-xs">
                    <span className="font-medium text-[#172033] truncate max-w-[220px]">{p.name}</span>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="text-[#172033] font-semibold">${p.revenue.toLocaleString()}</span>
                      <span className={p.profit >= 0 ? 'text-[#16A36A]' : 'text-[#E65353]'}>
                        ${p.profit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Feedback in Country */}
            <div>
              <div className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Customer Feedback ({countryReviews.length} reviews)</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {countryReviews.length > 0 ? (
                  countryReviews.slice(0, 4).map((r, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#F7F9FC] border border-[#E7ECF3] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#172033]">{r.product_name}</span>
                        <span className="text-amber-500 font-bold">{r.review_rating} / 5 ★</span>
                      </div>
                      <p className="text-[#697586] italic text-[11px]">
                        "{r.review_text}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[#697586] bg-[#F7F9FC] rounded-lg border border-[#E7ECF3]">
                    No qualitative review text recorded for this country.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
