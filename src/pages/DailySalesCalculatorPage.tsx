/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  TrendingUp,
  Award,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Layers,
  Code,
  ArrowUpRight,
  Database,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import { DailySalesEntry } from '../types/dailySales';
import {
  SAMPLE_WEEKDAY_ENTRIES,
  calculateDailySalesSummary,
  validateDailySalesInput,
  formatINR
} from '../utils/dailySalesCalculator';
import { SalesRecord } from '../types/analytics';

interface DailySalesCalculatorPageProps {
  records?: SalesRecord[];
}

export const DailySalesCalculatorPage: React.FC<DailySalesCalculatorPageProps> = ({
  records = []
}) => {
  // Array state storing daily sales entries
  const [entries, setEntries] = useState<DailySalesEntry[]>(SAMPLE_WEEKDAY_ENTRIES);

  // Form input state
  const [newDayName, setNewDayName] = useState<string>('');
  const [newSalesValue, setNewSalesValue] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDayName, setEditDayName] = useState<string>('');
  const [editSalesValue, setEditSalesValue] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);

  // Active data source tracking
  const [dataSource, setDataSource] = useState<'sample' | 'dataset' | 'manual'>('sample');

  // Perform dynamic array calculations
  const calculation = useMemo(() => {
    return calculateDailySalesSummary(entries);
  }, [entries]);

  // Handle adding a new daily sales entry
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const validation = validateDailySalesInput(newDayName, newSalesValue);
    if (!validation.valid || validation.cleanSales === undefined) {
      setInputError(validation.error || 'Invalid input.');
      return;
    }

    const newEntry: DailySalesEntry = {
      id: `day-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dayName: newDayName.trim(),
      sales: validation.cleanSales
    };

    setEntries(prev => [...prev, newEntry]);
    setNewDayName('');
    setNewSalesValue('');
    setDataSource('manual');
  };

  // Handle deleting an entry
  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(item => item.id !== id));
    setDataSource('manual');
    if (editingId === id) {
      setEditingId(null);
    }
  };

  // Start editing an entry
  const handleStartEdit = (entry: DailySalesEntry) => {
    setEditingId(entry.id);
    setEditDayName(entry.dayName);
    setEditSalesValue(String(entry.sales));
    setEditError(null);
  };

  // Save edited entry
  const handleSaveEdit = (id: string) => {
    const validation = validateDailySalesInput(editDayName, editSalesValue);
    if (!validation.valid || validation.cleanSales === undefined) {
      setEditError(validation.error || 'Invalid input.');
      return;
    }

    setEntries(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, dayName: editDayName.trim(), sales: validation.cleanSales! }
          : item
      )
    );
    setEditingId(null);
    setEditError(null);
    setDataSource('manual');
  };

  // Reset to default sample weekday array (Monday to Friday)
  const handleResetSample = () => {
    setEntries(SAMPLE_WEEKDAY_ENTRIES);
    setDataSource('sample');
    setInputError(null);
    setEditingId(null);
  };

  // Import daily sales aggregated from the active SalesMind AI dataset
  const handleImportFromDataset = () => {
    if (!records || records.length === 0) {
      setInputError('No active dataset records found to import.');
      return;
    }

    // Aggregate sales by date (taking recent 7 unique days)
    const dateMap = new Map<string, number>();
    for (const r of records) {
      const prev = dateMap.get(r.order_date) || 0;
      dateMap.set(r.order_date, prev + r.revenue);
    }

    const sortedDates = Array.from(dateMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const recent7 = sortedDates.slice(-7);

    const imported: DailySalesEntry[] = recent7.map(([dateStr, revenue], idx) => {
      // Format readable day name like "2025-01-15 (Wed)"
      const dateObj = new Date(dateStr);
      const dayOfWeek = isNaN(dateObj.getTime())
        ? `Day ${idx + 1}`
        : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      // Convert dollar revenue into representative Indian Rupee benchmark (e.g. ₹ scaling)
      return {
        id: `import-${dateStr}-${idx}`,
        dayName: dayOfWeek,
        sales: Math.round(revenue)
      };
    });

    setEntries(imported);
    setDataSource('dataset');
    setInputError(null);
    setEditingId(null);
  };

  // Clear all entries (to test empty array handling)
  const handleClearAll = () => {
    setEntries([]);
    setDataSource('manual');
    setInputError(null);
    setEditingId(null);
  };

  // Pure numerical array preview for educational display
  const rawArrayJson = JSON.stringify(entries.map(e => e.sales));

  return (
    <div className="space-y-6">
      {/* Top Header Card with Context & Quick Controls */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#E7ECF3]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#3867F5] text-white flex items-center justify-center shadow-sm shadow-[#3867F5]/20">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#172033]">
                  Daily Sales Calculator Using Arrays
                </h2>
                <p className="text-xs text-[#697586]">
                  Demonstrates fundamental array algorithms: Total Sales (Sum), Average Sales (Mean), and Highest Selling Day (Max)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetSample}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                dataSource === 'sample'
                  ? 'bg-blue-50 border-[#3867F5] text-[#3867F5]'
                  : 'bg-white border-[#E7ECF3] text-[#172033] hover:bg-[#F7F9FC]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Standard Weekday Sample (Mon-Fri)</span>
            </button>

            {records && records.length > 0 && (
              <button
                onClick={handleImportFromDataset}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                  dataSource === 'dataset'
                    ? 'bg-teal-50 border-[#13B8A6] text-[#13B8A6]'
                    : 'bg-white border-[#E7ECF3] text-[#172033] hover:bg-[#F7F9FC]'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Import from Active Dataset</span>
              </button>
            )}

            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E7ECF3] bg-white text-[#E65353] hover:bg-red-50 transition-all flex items-center gap-1.5"
              title="Test empty array calculation state"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Array</span>
            </button>
          </div>
        </div>

        {/* Informational unboxed metadata indicator */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#697586]">
          <span>Data Mode: <strong className="text-[#172033] font-semibold">{
            dataSource === 'sample' ? 'Sample Demonstration Array' : dataSource === 'dataset' ? 'Imported Dataset Timeline' : 'Custom User Array'
          }</strong></span>
          <span aria-hidden="true">·</span>
          <span>Array Length: <strong className="text-[#172033] font-mono tabular-nums">{entries.length} elements</strong></span>
          <span aria-hidden="true">·</span>
          <span>Currency: <strong className="text-[#172033]">Indian Rupee (₹)</strong></span>
        </div>
      </div>

      {/* 4 Interactive KPI Cards with Indian Rupee (₹) Formatting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between text-[#697586] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="p-2 bg-blue-50 text-[#3867F5] rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172033] tabular-nums font-mono tracking-tight">
            {formatINR(calculation.totalSales)}
          </div>
          <div className="mt-2 text-xs text-[#697586]">
            Sum of all daily sales values in array
          </div>
        </div>

        {/* Average Sales Card */}
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between text-[#697586] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Daily Sales</span>
            <div className="p-2 bg-teal-50 text-[#13B8A6] rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172033] tabular-nums font-mono tracking-tight">
            {formatINR(calculation.averageSales)}
          </div>
          <div className="mt-2 text-xs text-[#697586]">
            totalSales / {calculation.count > 0 ? calculation.count : 'N'} days
          </div>
        </div>

        {/* Highest Selling Day Card */}
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between text-[#697586] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Highest Selling Day</span>
            <div className="p-2 bg-emerald-50 text-[#16A36A] rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#16A36A] truncate tracking-tight">
            {calculation.highestSellingDays.length > 0
              ? calculation.highestSellingDays.join(', ')
              : 'None (Array Empty)'}
          </div>
          <div className="mt-2 text-xs text-[#697586]">
            {calculation.highestSellingDays.length > 1
              ? `Tied across ${calculation.highestSellingDays.length} days`
              : 'Peak revenue day in array'}
          </div>
        </div>

        {/* Highest Sales Amount Card */}
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="flex items-center justify-between text-[#697586] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Highest Sales Amount</span>
            <div className="p-2 bg-emerald-50 text-[#16A36A] rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172033] tabular-nums font-mono tracking-tight">
            {formatINR(calculation.highestSalesAmount)}
          </div>
          <div className="mt-2 text-xs text-[#697586]">
            Maximum array element: max(salesArray)
          </div>
        </div>
      </div>

      {/* Visual Chart & Input Form Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Visualization Bar Chart */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-[#172033]">
                Daily Sales Array Visualization
              </h3>
              <p className="text-xs text-[#697586]">
                Interactive bar chart displaying daily sales with dynamic peak day highlight
              </p>
            </div>
            {calculation.count > 0 && (
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[#16A36A]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#16A36A]" />
                  Highest Day
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#3867F5]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3867F5]" />
                  Standard Sales
                </span>
              </div>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="h-72 w-full flex flex-col items-center justify-center text-[#697586] bg-[#F7F9FC] rounded-xl border border-dashed border-[#E7ECF3] p-8 space-y-3">
              <AlertCircle className="w-8 h-8 text-[#697586]" />
              <div className="text-sm font-bold text-[#172033]">Sales Array Is Currently Empty</div>
              <p className="text-xs text-center max-w-sm">
                Add daily sales entries using the form on the right, or click below to restore the standard weekday dataset.
              </p>
              <button
                onClick={handleResetSample}
                className="px-4 py-2 text-xs font-bold text-white bg-[#3867F5] rounded-lg shadow-sm shadow-[#3867F5]/20 hover:bg-[#2e57d8] transition-all"
              >
                Load Sample Weekdays (Mon-Fri)
              </button>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={entries} margin={{ top: 15, right: 15, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    tick={{ fill: '#697586', fontSize: 11 }}
                    axisLine={{ stroke: '#E7ECF3' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#697586', fontSize: 11 }}
                    axisLine={{ stroke: '#E7ECF3' }}
                    tickLine={false}
                    tickFormatter={val => `₹${val.toLocaleString('en-IN')}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DailySalesEntry;
                        const isHighest = data.sales === calculation.highestSalesAmount;
                        const pctOfTotal = calculation.totalSales > 0
                          ? Math.round((data.sales / calculation.totalSales) * 1000) / 10
                          : 0;
                        const diffAvg = calculation.averageSales > 0
                          ? Math.round(((data.sales - calculation.averageSales) / calculation.averageSales) * 100)
                          : 0;

                        return (
                          <div className="p-3 bg-white rounded-lg border border-[#E7ECF3] shadow-md text-xs space-y-1.5 min-w-[170px]">
                            <div className="flex items-center justify-between border-b border-[#E7ECF3] pb-1">
                              <span className="font-bold text-[#172033]">{data.dayName}</span>
                              {isHighest && (
                                <span className="text-[10px] font-bold text-[#16A36A] bg-emerald-50 px-1.5 py-0.5 rounded">
                                  Peak Day ★
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[#697586]">Daily Sales:</span>
                              <span className="font-mono tabular-nums font-bold text-[#172033]">
                                {formatINR(data.sales)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[#697586]">Share of Total:</span>
                              <span className="font-mono tabular-nums text-[#3867F5] font-semibold">
                                {pctOfTotal}%
                              </span>
                            </div>
                            {calculation.averageSales > 0 && (
                              <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#F1F5F9]">
                                <span className="text-[#697586]">vs Average:</span>
                                <span className={`font-mono tabular-nums font-semibold ${diffAvg >= 0 ? 'text-[#16A36A]' : 'text-[#E65353]'}`}>
                                  {diffAvg >= 0 ? `+${diffAvg}%` : `${diffAvg}%`}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {calculation.averageSales > 0 && (
                    <ReferenceLine
                      y={calculation.averageSales}
                      stroke="#13B8A6"
                      strokeDasharray="4 4"
                      label={{
                        value: `Avg: ${formatINR(calculation.averageSales)}`,
                        fill: '#13B8A6',
                        fontSize: 10,
                        position: 'insideTopRight'
                      }}
                    />
                  )}
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]} maxBarSize={44}>
                    {entries.map((entry) => {
                      const isHighest = entry.sales === calculation.highestSalesAmount;
                      return (
                        <Cell
                          key={entry.id}
                          fill={isHighest ? '#16A36A' : '#3867F5'}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Daily Sales Array Input Form */}
        <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-[#E7ECF3]">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#3867F5]" />
                <h3 className="text-base font-bold text-[#172033]">
                  Add Daily Sales Entry
                </h3>
              </div>
              <p className="text-xs text-[#697586] mt-0.5">
                Append a new day and sales amount to the active array
              </p>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1">
                  Day / Label Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saturday, Sunday, Day 6..."
                  value={newDayName}
                  onChange={e => {
                    setNewDayName(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg text-[#172033] focus:outline-none focus:border-[#3867F5] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1">
                  Sales Value (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-[#697586]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 8500"
                    value={newSalesValue}
                    onChange={e => {
                      setNewSalesValue(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    className="w-full pl-7 pr-3 py-2 text-xs bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg text-[#172033] font-mono tabular-nums focus:outline-none focus:border-[#3867F5] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {inputError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-[#E65353] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{inputError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-[#3867F5] hover:bg-[#2e57d8] rounded-lg shadow-sm shadow-[#3867F5]/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Append to Sales Array</span>
              </button>
            </form>
          </div>

          {/* Quick Pre-fill Suggestion */}
          <div className="pt-4 border-t border-[#E7ECF3] mt-4">
            <span className="text-[11px] font-semibold text-[#697586] uppercase tracking-wider">
              Quick Day Shortcuts:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {['Saturday', 'Sunday', 'Holiday Sale', 'Bonus Day'].map(shortcut => (
                <button
                  key={shortcut}
                  type="button"
                  onClick={() => setNewDayName(shortcut)}
                  className="px-2 py-0.5 text-[11px] bg-[#F7F9FC] hover:bg-slate-200 border border-[#E7ECF3] text-[#172033] rounded transition-colors"
                >
                  +{shortcut}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Array Entries Ledger & Inline Editor */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7ECF3]">
          <div>
            <h3 className="text-base font-bold text-[#172033]">
              Daily Sales Array Elements
            </h3>
            <p className="text-xs text-[#697586]">
              Granular view of array elements with zero-based indexes [0 ... {Math.max(0, entries.length - 1)}]
            </p>
          </div>
          <span className="text-xs text-[#697586]">
            Total Entries: <strong className="text-[#172033] font-mono tabular-nums">{entries.length}</strong>
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#697586] bg-[#F7F9FC] rounded-lg border border-[#E7ECF3]">
            No daily sales values in array. Use the form above to add an entry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#E7ECF3] text-[#697586]">
                  <th className="py-2.5 font-semibold w-20">Array Index</th>
                  <th className="py-2.5 font-semibold">Day Name</th>
                  <th className="py-2.5 font-semibold text-right">Daily Sales (₹)</th>
                  <th className="py-2.5 font-semibold text-right">Share of Total</th>
                  <th className="py-2.5 font-semibold text-center">Benchmark Status</th>
                  <th className="py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {entries.map((entry, idx) => {
                  const isEditing = editingId === entry.id;
                  const isHighest = entry.sales === calculation.highestSalesAmount && calculation.highestSalesAmount > 0;
                  const isLowest = entry.sales === calculation.lowestSalesAmount && entries.length > 1;
                  const pct = calculation.totalSales > 0
                    ? Math.round((entry.sales / calculation.totalSales) * 1000) / 10
                    : 0;

                  return (
                    <tr key={entry.id} className="hover:bg-[#F7F9FC]/60 transition-colors">
                      {/* Array Index */}
                      <td className="py-3 font-mono text-[#697586] text-[11px]">
                        [{idx}]
                      </td>

                      {/* Day Name */}
                      <td className="py-3 font-semibold text-[#172033]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDayName}
                            onChange={e => setEditDayName(e.target.value)}
                            className="px-2 py-1 text-xs bg-white border border-[#3867F5] rounded text-[#172033] focus:outline-none"
                          />
                        ) : (
                          <span>{entry.dayName}</span>
                        )}
                      </td>

                      {/* Sales Amount */}
                      <td className="py-3 text-right font-mono tabular-nums text-sm font-bold text-[#172033]">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1 justify-end">
                            <span className="text-[#697586] text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={editSalesValue}
                              onChange={e => setEditSalesValue(e.target.value)}
                              className="w-28 px-2 py-1 text-xs bg-white border border-[#3867F5] rounded text-[#172033] text-right font-mono focus:outline-none"
                            />
                          </div>
                        ) : (
                          <span>{formatINR(entry.sales)}</span>
                        )}
                      </td>

                      {/* Share of Total */}
                      <td className="py-3 text-right font-mono tabular-nums text-[#697586]">
                        {pct}%
                      </td>

                      {/* Status */}
                      <td className="py-3 text-center">
                        {isHighest ? (
                          <span className="text-[11px] font-bold text-[#16A36A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Highest Day
                          </span>
                        ) : isLowest ? (
                          <span className="text-[11px] font-semibold text-[#697586] bg-slate-100 px-2 py-0.5 rounded">
                            Lowest Day
                          </span>
                        ) : entry.sales >= calculation.averageSales ? (
                          <span className="text-[11px] font-semibold text-[#3867F5] bg-blue-50 px-2 py-0.5 rounded">
                            Above Avg
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-[#697586] bg-slate-50 px-2 py-0.5 rounded">
                            Below Avg
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(entry.id)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#16A36A] hover:bg-emerald-700 rounded transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#697586] hover:bg-slate-100 rounded border border-[#E7ECF3] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(entry)}
                              className="p-1.5 text-[#697586] hover:text-[#3867F5] hover:bg-blue-50 rounded transition-colors"
                              title="Edit day or sales amount"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-1.5 text-[#697586] hover:text-[#E65353] hover:bg-red-50 rounded transition-colors"
                              title="Remove from array"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {editError && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-[#E65353]">
            {editError}
          </div>
        )}
      </div>

      {/* Educational Array Algorithm Inspector */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7ECF3]">
          <Code className="w-4 h-4 text-[#3867F5]" />
          <div>
            <h3 className="text-sm font-bold text-[#172033]">
              Array Algorithms & Theoretical Formulation
            </h3>
            <p className="text-xs text-[#697586]">
              Mathematical implementation executed directly on the in-memory JavaScript/TypeScript array
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Total Sales Formula */}
          <div className="p-3.5 bg-[#F7F9FC] rounded-lg border border-[#E7ECF3] space-y-1.5">
            <div className="text-[11px] font-bold text-[#3867F5] font-sans uppercase tracking-wider">
              1. Total Sales (Sum)
            </div>
            <div className="text-[#172033] font-bold">
              totalSales = &sum; sales[i]
            </div>
            <div className="text-[#697586] text-[11px] font-mono whitespace-pre-wrap">
              salesArray.reduce((acc, curr) =&gt; acc + curr, 0)
            </div>
            <div className="text-[#16A36A] font-bold text-[11px]">
              Current Result: {formatINR(calculation.totalSales)}
            </div>
          </div>

          {/* Average Sales Formula */}
          <div className="p-3.5 bg-[#F7F9FC] rounded-lg border border-[#E7ECF3] space-y-1.5">
            <div className="text-[11px] font-bold text-[#13B8A6] font-sans uppercase tracking-wider">
              2. Average Sales (Mean)
            </div>
            <div className="text-[#172033] font-bold">
              averageSales = totalSales / N
            </div>
            <div className="text-[#697586] text-[11px] font-mono whitespace-pre-wrap">
              totalSales / entries.length
            </div>
            <div className="text-[#16A36A] font-bold text-[11px]">
              Current Result: {formatINR(calculation.averageSales)}
            </div>
          </div>

          {/* Highest Selling Day Formula */}
          <div className="p-3.5 bg-[#F7F9FC] rounded-lg border border-[#E7ECF3] space-y-1.5">
            <div className="text-[11px] font-bold text-emerald-600 font-sans uppercase tracking-wider">
              3. Highest Selling Day (Max)
            </div>
            <div className="text-[#172033] font-bold">
              maxSales = Math.max(...sales)
            </div>
            <div className="text-[#697586] text-[11px] font-mono whitespace-pre-wrap">
              entries.filter(e =&gt; e.sales === maxVal)
            </div>
            <div className="text-[#16A36A] font-bold text-[11px]">
              Peak: {calculation.highestSellingDays.join(', ') || 'N/A'} ({formatINR(calculation.highestSalesAmount)})
            </div>
          </div>
        </div>

        {/* Live Array Data State */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#172033]">Live In-Memory Array State:</span>
            <span className="font-mono text-[#3867F5] bg-white px-2 py-0.5 rounded border border-slate-200">
              {rawArrayJson}
            </span>
          </div>
          <span className="text-[#697586] text-[11px]">
            Dynamically recomputed on every array change
          </span>
        </div>
      </div>
    </div>
  );
};
