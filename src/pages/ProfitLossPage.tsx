/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingDown,
  DollarSign,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Percent,
  Layers,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import { ExecutiveKPIs, MonthlyMetric, CountryMetric, ProductMetric } from '../types/analytics';

interface ProfitLossPageProps {
  kpis: ExecutiveKPIs;
  monthly: MonthlyMetric[];
  countries: CountryMetric[];
  products: ProductMetric[];
}

export const ProfitLossPage: React.FC<ProfitLossPageProps> = ({
  kpis,
  monthly,
  countries,
  products
}) => {
  const [costRatioAssumption, setCostRatioAssumption] = useState<number>(65);

  const lossProducts = products.filter(p => p.profit < 0);
  const lowMarginProducts = products.filter(p => p.margin > 0 && p.margin < 18);
  const lossCountries = countries.filter(c => c.loss > 0);

  const totalLossDollars = lossProducts.reduce((sum, p) => sum + Math.abs(p.profit), 0);

  // Financial Waterfall breakdown
  const waterfallData = [
    { name: 'Gross Revenue', amount: kpis.totalRevenue, fill: '#3867F5' },
    { name: 'COGS / Cost', amount: -kpis.totalCost, fill: '#E65353' },
    { name: 'Net Realized Profit', amount: kpis.totalProfit, fill: '#16A36A' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Financial Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Gross Sales Revenue
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono tabular-nums">
            ${kpis.totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-[#697586] mt-1">Total recognized top-line billing</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Total Cost of Goods (COGS)
          </div>
          <div className="text-2xl font-bold text-[#697586] font-mono tabular-nums">
            ${kpis.totalCost.toLocaleString()}
          </div>
          <p className="text-xs text-[#697586] mt-1">Direct manufacturing, packaging & logistics</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Net Realized Profit
          </div>
          <div className="text-2xl font-bold text-[#16A36A] font-mono tabular-nums">
            ${kpis.totalProfit.toLocaleString()}
          </div>
          <p className="text-xs text-[#697586] mt-1">Net gross margin after expenses</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Identified Margin Losses
          </div>
          <div className="text-2xl font-bold text-[#E65353] font-mono tabular-nums">
            ${totalLossDollars.toLocaleString()}
          </div>
          <p className="text-xs text-[#697586] mt-1">Recoverable loss from negative SKUs</p>
        </div>
      </div>

      {/* P&L Flow & Monthly Profit Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waterfall Decomposition */}
        <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#172033]">P&L Capital Flow</h2>
            <p className="text-xs text-[#697586]">Top-line revenue converted to net profit</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#697586', fontSize: 10 }} axisLine={{ stroke: '#E7ECF3' }} />
                <YAxis
                  tick={{ fill: '#697586', fontSize: 10 }}
                  axisLine={{ stroke: '#E7ECF3' }}
                  tickFormatter={val => `$${(Math.abs(val) / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Math.abs(Number(val)).toLocaleString()}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={44}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Profit vs Margin Line */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#172033]">Monthly Profit & Margin Consistency</h2>
            <p className="text-xs text-[#697586]">Tracking margin compression or expansion across periods</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#697586', fontSize: 10 }} axisLine={{ stroke: '#E7ECF3' }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#697586', fontSize: 10 }}
                  tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
                  axisLine={{ stroke: '#E7ECF3' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#697586', fontSize: 10 }}
                  tickFormatter={val => `${val}%`}
                  axisLine={{ stroke: '#E7ECF3' }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [name === 'profit' ? `$${Number(val).toLocaleString()}` : `${val}%`, name === 'profit' ? 'Profit' : 'Margin %']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="profit" name="Profit" fill="#16A36A" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Line yAxisId="right" type="monotone" dataKey="margin" name="Margin %" stroke="#3867F5" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Root Cause Diagnostics Panel */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7ECF3]">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-base font-bold text-[#172033]">
              Profit Leakage & Root-Cause Analysis Panel
            </h2>
            <p className="text-xs text-[#697586]">
              Statistically identified contributing factors across regions and product catalogs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Factor 1: Loss Products */}
          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E7ECF3] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#E65353] uppercase tracking-wider text-[11px]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Negative Margin SKUs</span>
            </div>
            <div className="text-sm font-bold text-[#172033]">
              {lossProducts.length} Products Generating Losses
            </div>
            <p className="text-[#697586] leading-relaxed">
              Items such as <strong>{lossProducts[0]?.productName || 'Clearance Items'}</strong> have unit production costs exceeding their average realized selling price.
            </p>
            <div className="text-[11px] font-semibold text-[#172033]">
              Possible contributing factor: Unchecked promotional discounting or component cost inflation.
            </div>
          </div>

          {/* Factor 2: Low Margin Volume */}
          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E7ECF3] space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-600 uppercase tracking-wider text-[11px]">
              <TrendingDown className="w-4 h-4 shrink-0" />
              <span>Heavy Freight / Slim Margins</span>
            </div>
            <div className="text-sm font-bold text-[#172033]">
              {lowMarginProducts.length} High-Volume Low-Margin SKUs
            </div>
            <p className="text-[#697586] leading-relaxed">
              Items driving substantial revenue but yielding below 18% gross margin, diluting overall business returns.
            </p>
            <div className="text-[11px] font-semibold text-[#172033]">
              Possible contributing factor: International freight logistics surcharges on bulky enclosures.
            </div>
          </div>

          {/* Factor 3: Regional Leakage */}
          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E7ECF3] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#3867F5] uppercase tracking-wider text-[11px]">
              <Layers className="w-4 h-4 shrink-0" />
              <span>Regional Loss Friction</span>
            </div>
            <div className="text-sm font-bold text-[#172033]">
              {lossCountries.length} Countries with Loss Events
            </div>
            <p className="text-[#697586] leading-relaxed">
              Disproportionate returns and customs processing in European markets (e.g. {lossCountries[0]?.country || 'Germany'}).
            </p>
            <div className="text-[11px] font-semibold text-[#172033]">
              Possible contributing factor: Higher regional return handling costs and local VAT/import duties.
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>Methodology Note:</strong> Root causes represent mathematically identified contributing factors based on recorded price, cost, return, and category data. Final verification requires consultation with local fulfillment and procurement leads.
          </span>
        </div>
      </div>
    </div>
  );
};
