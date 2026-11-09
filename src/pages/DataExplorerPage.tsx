/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  Check
} from 'lucide-react';
import { SalesRecord } from '../types/analytics';

interface DataExplorerPageProps {
  records: SalesRecord[];
  onExportCsv: () => void;
}

export const DataExplorerPage: React.FC<DataExplorerPageProps> = ({
  records,
  onExportCsv
}) => {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<keyof SalesRecord>('order_date');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(r =>
      r.order_id.toLowerCase().includes(q) ||
      r.order_date.includes(q) ||
      r.country.toLowerCase().includes(q) ||
      r.product_name.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.customer_name || "").toLowerCase().includes(q)
    );
  }, [records, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === undefined || valA === null) return sortAsc ? 1 : -1;
      if (valB === undefined || valB === null) return sortAsc ? -1 : 1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }

      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filtered, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRecords = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof SalesRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#697586] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by order ID, SKU, country, category, customer..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg text-[#172033] focus:outline-none focus:border-[#3867F5]"
            />
          </div>
          <span className="text-xs text-[#697586] whitespace-nowrap">
            Showing <strong className="text-[#172033] font-mono tabular-nums">{sorted.length}</strong> records
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#697586]">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg text-[#172033]"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#3867F5] hover:bg-[#2e57d8] rounded-lg shadow-sm shadow-[#3867F5]/20 transition-all whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#E7ECF3] text-[#697586]">
                <th
                  onClick={() => handleSort('order_id')}
                  className="py-2.5 font-semibold cursor-pointer hover:text-[#172033]"
                >
                  <div className="flex items-center gap-1">
                    <span>Order ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('order_date')}
                  className="py-2.5 font-semibold cursor-pointer hover:text-[#172033]"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('country')}
                  className="py-2.5 font-semibold cursor-pointer hover:text-[#172033]"
                >
                  <div className="flex items-center gap-1">
                    <span>Country</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('product_name')}
                  className="py-2.5 font-semibold cursor-pointer hover:text-[#172033]"
                >
                  <div className="flex items-center gap-1">
                    <span>Product SKU</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-2.5 font-semibold cursor-pointer hover:text-[#172033]"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('quantity')}
                  className="py-2.5 font-semibold text-right cursor-pointer hover:text-[#172033]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Qty</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unit_price')}
                  className="py-2.5 font-semibold text-right cursor-pointer hover:text-[#172033]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('revenue')}
                  className="py-2.5 font-semibold text-right cursor-pointer hover:text-[#172033]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Revenue</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('profit')}
                  className="py-2.5 font-semibold text-right cursor-pointer hover:text-[#172033]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Profit</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('profit_margin')}
                  className="py-2.5 font-semibold text-right cursor-pointer hover:text-[#172033]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Margin %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 font-semibold">Customer</th>
                <th className="py-2.5 font-semibold text-center">Return Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {pageRecords.map(r => (
                <tr key={r.order_id} className="hover:bg-[#F7F9FC]/60 transition-colors">
                  <td className="py-2.5 font-mono text-[#697586] font-medium">
                    {r.order_id}
                  </td>
                  <td className="py-2.5 font-mono tabular-nums text-[#172033]">
                    {r.order_date}
                  </td>
                  <td className="py-2.5 text-[#172033] font-medium">
                    {r.country}
                  </td>
                  <td className="py-2.5 text-[#172033] font-medium max-w-[200px] truncate">
                    {r.product_name}
                  </td>
                  <td className="py-2.5 text-[#697586]">
                    {r.category}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-[#172033]">
                    {r.quantity}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-[#697586]">
                    ${r.unit_price.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-[#172033] font-semibold">
                    ${r.revenue.toLocaleString()}
                  </td>
                  <td className={`py-2.5 text-right font-mono tabular-nums font-semibold ${r.profit >= 0 ? 'text-[#16A36A]' : 'text-[#E65353]'}`}>
                    {r.profit >= 0 ? `$${r.profit.toLocaleString()}` : `-$${Math.abs(r.profit).toLocaleString()}`}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-[#172033]">
                    {r.profit_margin}%
                  </td>
                  <td className="py-2.5 text-[#697586] max-w-[150px] truncate">
                    {r.customer_name || r.customer_id}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      r.return_status === 'Returned'
                        ? 'text-[#E65353] bg-rose-50'
                        : 'text-[#16A36A] bg-emerald-50'
                    }`}>
                      {r.return_status || 'Delivered'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E7ECF3] text-xs text-[#697586]">
          <div>
            Page <strong className="text-[#172033]">{currentPage}</strong> of {totalPages} ({sorted.length} total rows)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-[#E7ECF3] rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F9FC]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono tabular-nums text-[#172033]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-[#E7ECF3] rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F9FC]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
