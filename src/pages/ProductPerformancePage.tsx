/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertOctagon,
  Percent,
  RotateCcw,
  Star,
  Search,
  Filter,
  ArrowDownRight,
  TrendingDown,
  Layers
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
import { ProductMetric, SalesRecord } from '../types/analytics';

interface ProductPerformancePageProps {
  products: ProductMetric[];
  records: SalesRecord[];
}

export const ProductPerformancePage: React.FC<ProductPerformancePageProps> = ({
  products,
  records
}) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'profitable' | 'loss' | 'low_margin' | 'declining'>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductMetric | null>(null);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.productName.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) {
          return false;
        }
      }

      if (filterType === 'profitable') return p.profit > 0;
      if (filterType === 'loss') return p.profit < 0;
      if (filterType === 'low_margin') return p.margin > 0 && p.margin < 18;
      if (filterType === 'declining') return p.momTrend === 'declining';

      return true;
    });
  }, [products, search, filterType]);

  // Product drilldown monthly data
  const productMonthlyHistory = useMemo(() => {
    if (!selectedProduct) return [];
    const prodRecs = records.filter(r => r.product_id === selectedProduct.productId);
    const map = new Map<string, { label: string; revenue: number; profit: number; qty: number }>();
    for (const r of prodRecs) {
      const item = map.get(r.year_month) || { label: r.month_name, revenue: 0, profit: 0, qty: 0 };
      item.revenue += r.revenue;
      item.profit += r.profit;
      item.qty += r.quantity;
      map.set(r.year_month, item);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, data]) => data);
  }, [selectedProduct, records]);

  return (
    <div className="space-y-6">
      {/* Product Category Insights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Active Catalog Size
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono tabular-nums">
            {products.length} SKUs
          </div>
          <p className="text-xs text-[#697586] mt-1">Monitored enterprise catalog items</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Top Revenue Driver
          </div>
          <div className="text-lg font-bold text-[#3867F5] truncate">
            {products[0]?.productName || 'N/A'}
          </div>
          <p className="text-xs text-[#697586] mt-1 font-mono tabular-nums">
            ${products[0]?.revenue.toLocaleString()} sales ({products[0]?.margin}% margin)
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Loss-Making Items
          </div>
          <div className="text-2xl font-bold text-[#E65353] font-mono tabular-nums">
            {products.filter(p => p.profit < 0).length} SKUs
          </div>
          <p className="text-xs text-[#697586] mt-1">Generating negative net margins</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Low Margin / High Volume
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
            {products.filter(p => p.margin > 0 && p.margin < 18).length} SKUs
          </div>
          <p className="text-xs text-[#697586] mt-1">Margins under 18% threshold</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#697586] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SKU name or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg text-[#172033] focus:outline-none focus:border-[#3867F5]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg">
          {[
            { id: 'all', label: `All (${products.length})` },
            { id: 'profitable', label: 'Profitable' },
            { id: 'loss', label: `Loss-Making (${products.filter(p => p.profit < 0).length})` },
            { id: 'low_margin', label: 'Low Margin (<18%)' },
            { id: 'declining', label: 'Declining Volume' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                filterType === f.id
                  ? 'bg-white text-[#3867F5] shadow-xs'
                  : 'text-[#697586] hover:text-[#172033]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7ECF3] text-[#697586]">
                <th className="py-2.5 font-semibold">SKU / Product Name</th>
                <th className="py-2.5 font-semibold">Category</th>
                <th className="py-2.5 font-semibold text-right">Revenue</th>
                <th className="py-2.5 font-semibold text-right">Unit Cost</th>
                <th className="py-2.5 font-semibold text-right">Gross Profit</th>
                <th className="py-2.5 font-semibold text-right">Margin %</th>
                <th className="py-2.5 font-semibold text-right">Units Sold</th>
                <th className="py-2.5 font-semibold text-right">Return Rate</th>
                <th className="py-2.5 font-semibold text-center">Trend</th>
                <th className="py-2.5 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredProducts.map(p => {
                const isLoss = p.profit < 0;
                const isLowMargin = p.margin > 0 && p.margin < 18;
                return (
                  <tr key={p.productId} className="hover:bg-[#F7F9FC]/60 transition-colors">
                    <td className="py-3 font-semibold text-[#172033] max-w-[220px]">
                      <div className="truncate">{p.productName}</div>
                      <div className="text-[10px] text-[#697586] font-mono">{p.productId}</div>
                    </td>
                    <td className="py-3 text-[#697586]">
                      {p.category}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#172033] font-medium">
                      ${p.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#697586]">
                      ${(p.cost / Math.max(1, p.quantity)).toFixed(2)}
                    </td>
                    <td className={`py-3 text-right font-mono tabular-nums font-semibold ${isLoss ? 'text-[#E65353]' : 'text-[#16A36A]'}`}>
                      {isLoss ? `-$${Math.abs(p.profit).toLocaleString()}` : `$${p.profit.toLocaleString()}`}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums">
                      <span className={`font-semibold ${isLoss ? 'text-[#E65353]' : isLowMargin ? 'text-amber-600' : 'text-[#172033]'}`}>
                        {p.margin}%
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#172033]">
                      {p.quantity.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#697586]">
                      {p.returnRate}%
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        p.momTrend === 'increasing'
                          ? 'text-[#16A36A] bg-emerald-50'
                          : p.momTrend === 'declining'
                          ? 'text-[#E65353] bg-rose-50'
                          : 'text-[#697586] bg-slate-50'
                      }`}>
                        {p.momTrend}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#3867F5] bg-white border border-[#E7ECF3] hover:bg-[#F7F9FC] rounded-md transition-colors"
                      >
                        Drilldown
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Drilldown Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E7ECF3] p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF3]">
              <div>
                <h3 className="text-base font-bold text-[#172033]">{selectedProduct.productName}</h3>
                <p className="text-xs text-[#697586]">SKU: {selectedProduct.productId} · Category: {selectedProduct.category}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-xs px-2.5 py-1 rounded-md border border-[#E7ECF3] hover:bg-[#F7F9FC]"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#F7F9FC] rounded-lg">
                <span className="text-[#697586]">Total Revenue</span>
                <div className="font-bold font-mono tabular-nums text-[#172033] mt-0.5">${selectedProduct.revenue.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-[#F7F9FC] rounded-lg">
                <span className="text-[#697586]">Gross Profit</span>
                <div className={`font-bold font-mono tabular-nums mt-0.5 ${selectedProduct.profit >= 0 ? 'text-[#16A36A]' : 'text-[#E65353]'}`}>
                  ${selectedProduct.profit.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-[#F7F9FC] rounded-lg">
                <span className="text-[#697586]">Realized Margin</span>
                <div className="font-bold font-mono tabular-nums text-[#172033] mt-0.5">{selectedProduct.margin}%</div>
              </div>
              <div className="p-3 bg-[#F7F9FC] rounded-lg">
                <span className="text-[#697586]">Return Rate</span>
                <div className="font-bold font-mono tabular-nums text-[#697586] mt-0.5">{selectedProduct.returnRate}%</div>
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div>
              <div className="text-xs font-semibold text-[#172033] uppercase tracking-wider mb-2">
                Monthly Performance Trajectory
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productMonthlyHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#697586', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#697586', fontSize: 10 }} tickFormatter={val => `$${(val / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Monthly Sales']} />
                    <Bar dataKey="revenue" fill="#3867F5" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
