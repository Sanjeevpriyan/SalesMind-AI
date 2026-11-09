/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  Users,
  Award,
  AlertTriangle,
  Repeat,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { SalesRecord } from '../types/analytics';
import { computeCustomerRFM } from '../utils/analyticsEngine';

interface CustomerIntelligencePageProps {
  records: SalesRecord[];
}

export const CustomerIntelligencePage: React.FC<CustomerIntelligencePageProps> = ({ records }) => {
  const rfmCustomers = useMemo(() => {
    return computeCustomerRFM(records);
  }, [records]);

  // Aggregate stats
  const totalCustomers = rfmCustomers.length;
  const totalRevenue = rfmCustomers.reduce((acc, c) => acc + c.totalSpend, 0);
  const avgSpendPerCustomer = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

  // New vs Returning customer counts (Returning = > 1 orders)
  const returningCount = rfmCustomers.filter(c => c.orderCount > 1).length;
  const newCount = totalCustomers - returningCount;
  const repeatRate = totalCustomers > 0 ? Math.round((returningCount / totalCustomers) * 100) : 0;

  // Segment counts
  const segmentBreakdown = useMemo(() => {
    const map: Record<string, number> = {
      'Champion': 0,
      'Loyal': 0,
      'Potential': 0,
      'At Risk': 0,
      'Hibernating': 0
    };
    for (const c of rfmCustomers) {
      map[c.segment] = (map[c.segment] || 0) + 1;
    }
    return Object.entries(map).map(([segment, count]) => ({
      segment,
      count,
      percentage: totalCustomers > 0 ? Math.round((count / totalCustomers) * 100) : 0
    }));
  }, [rfmCustomers, totalCustomers]);

  const SEGMENT_COLORS: Record<string, string> = {
    'Champion': '#3867F5',
    'Loyal': '#16A36A',
    'Potential': '#13B8A6',
    'At Risk': '#E65353',
    'Hibernating': '#94A3B8'
  };

  return (
    <div className="space-y-6">
      {/* Top Customer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Total Unique Accounts
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono tabular-nums">
            {totalCustomers.toLocaleString()}
          </div>
          <p className="text-xs text-[#697586] mt-1">Direct corporate & retail purchasers</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Repeat Purchase Rate
          </div>
          <div className="text-2xl font-bold text-[#16A36A] font-mono tabular-nums">
            {repeatRate}%
          </div>
          <p className="text-xs text-[#697586] mt-1">
            {returningCount} accounts with 2+ completed orders
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Average Spend / Account
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono tabular-nums">
            ${avgSpendPerCustomer.toLocaleString()}
          </div>
          <p className="text-xs text-[#697586] mt-1">Cumulative account lifetime volume</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            At-Risk Accounts
          </div>
          <div className="text-2xl font-bold text-[#E65353] font-mono tabular-nums">
            {rfmCustomers.filter(c => c.segment === 'At Risk').length} Accounts
          </div>
          <p className="text-xs text-[#697586] mt-1">High historic value, inactive &gt; 120 days</p>
        </div>
      </div>

      {/* RFM Segmentation Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segmentation Bar Chart */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#172033]">RFM Behavioral Cohort Distribution</h2>
            <p className="text-xs text-[#697586]">
              Segmentation based on Recency (days inactive), Frequency (orders), and Monetary (spend)
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="segment" tick={{ fill: '#697586', fontSize: 11 }} axisLine={{ stroke: '#E7ECF3' }} />
                <YAxis tick={{ fill: '#697586', fontSize: 11 }} axisLine={{ stroke: '#E7ECF3' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Accounts`, 'Cohort Size']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {segmentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[entry.segment] || '#3867F5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cohort Definitions */}
        <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#172033] mb-3">Cohort Criteria</h2>
            <div className="space-y-3 text-xs">
              <div>
                <div className="font-bold text-[#3867F5]">Champion Accounts</div>
                <div className="text-[#697586]">10+ orders, &gt;$25k spend, active within 60 days.</div>
              </div>
              <div>
                <div className="font-bold text-[#16A36A]">Loyal Buyers</div>
                <div className="text-[#697586]">5+ orders, steady purchase cadence within 90 days.</div>
              </div>
              <div>
                <div className="font-bold text-amber-600">Potential / Growing</div>
                <div className="text-[#697586]">Moderate frequency with recent expansion.</div>
              </div>
              <div>
                <div className="font-bold text-[#E65353]">At Risk Accounts</div>
                <div className="text-[#697586]">Historically high spend, inactive for &gt;120 days.</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7ECF3] text-[11px] text-[#697586]">
            Strictly computed from transaction dates and customer identifiers.
          </div>
        </div>
      </div>

      {/* High-Value & At-Risk Customer Ledger */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Customer Account Intelligence Ledger</h2>
            <p className="text-xs text-[#697586]">Top accounts ranked by cumulative gross billing and churn risk</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7ECF3] text-[#697586]">
                <th className="py-2.5 font-semibold">Account / Customer ID</th>
                <th className="py-2.5 font-semibold">Segment</th>
                <th className="py-2.5 font-semibold text-right">Total Billing</th>
                <th className="py-2.5 font-semibold text-right">Orders</th>
                <th className="py-2.5 font-semibold text-right">AOV</th>
                <th className="py-2.5 font-semibold text-right">Last Purchase</th>
                <th className="py-2.5 font-semibold text-right">Days Inactive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {rfmCustomers.slice(0, 15).map(c => {
                const isAtRisk = c.segment === 'At Risk';
                return (
                  <tr key={c.customerId} className="hover:bg-[#F7F9FC]/60 transition-colors">
                    <td className="py-3 font-semibold text-[#172033]">
                      <div>{c.customerName}</div>
                      <div className="text-[10px] text-[#697586] font-mono">{c.customerId}</div>
                    </td>
                    <td className="py-3">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${SEGMENT_COLORS[c.segment]}15`,
                          color: SEGMENT_COLORS[c.segment]
                        }}
                      >
                        {c.segment}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#172033] font-medium">
                      ${c.totalSpend.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#172033]">
                      {c.orderCount}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#697586]">
                      ${c.avgOrderValue.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#697586]">
                      {c.lastOrderDate}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums">
                      <span className={isAtRisk ? 'text-[#E65353] font-bold' : 'text-[#697586]'}>
                        {c.daysSinceLastOrder} days
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
