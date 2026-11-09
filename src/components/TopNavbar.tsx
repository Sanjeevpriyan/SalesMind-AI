/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Filter, Sparkles, RotateCcw, Download } from 'lucide-react';
import { PageId } from './Sidebar';

interface TopNavbarProps {
  currentPage: PageId;
  totalFilteredRecords: number;
  totalRawRecords: number;
  activeFilterCount: number;
  onOpenFilters: () => void;
  onResetFilters: () => void;
  onOpenAiCopilot: () => void;
  onExportCsv: () => void;
  isSyntheticData: boolean;
}

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  executive: {
    title: 'Executive Overview',
    subtitle: 'Strategic revenue performance, profit margins, and key enterprise milestones'
  },
  monthly: {
    title: 'Monthly Sales Analysis',
    subtitle: 'Chronological time-series revenue, profit, quantity, and month-over-month growth'
  },
  dailysales: {
    title: 'Daily Sales Calculator Using Arrays',
    subtitle: 'Dynamic array operations computing Total Sales, Average Daily Sales, and Peak Selling Day'
  },
  countries: {
    title: 'Country Intelligence',
    subtitle: 'Geographic market performance, profit concentrations, and regional loss identification'
  },
  products: {
    title: 'Product Performance',
    subtitle: 'SKU unit economics, margin ranking, return rates, and volume velocity'
  },
  profitloss: {
    title: 'Profit & Loss Analysis',
    subtitle: 'Financial decomposition, gross vs net margins, and operational root-cause diagnostics'
  },
  reviews: {
    title: 'Customer Reviews & Feedback',
    subtitle: 'Customer sentiment distribution, rating correlation, and complaint theme categorization'
  },
  customers: {
    title: 'Customer Intelligence',
    subtitle: 'Customer segmentation, repeat purchase patterns, and RFM behavioral analysis'
  },
  forecast: {
    title: 'Sales Forecasting & Projections',
    subtitle: 'Statistical time-series forecasting (Holt-Winters & Linear Trend) with prediction bounds'
  },
  recommendations: {
    title: 'Business Recommendations & Simulator',
    subtitle: 'Grounded strategic priorities and interactive What-If scenario financial projection'
  },
  explorer: {
    title: 'Data Explorer',
    subtitle: 'Granular dataset inspection, column filtering, search, and filtered record export'
  },
  settings: {
    title: 'Settings & Data Quality',
    subtitle: 'Dataset upload, column mapping validation, health diagnostics, and system configuration'
  }
};

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentPage,
  totalFilteredRecords,
  totalRawRecords,
  activeFilterCount,
  onOpenFilters,
  onResetFilters,
  onOpenAiCopilot,
  onExportCsv,
  isSyntheticData
}) => {
  const pageMeta = PAGE_TITLES[currentPage] || { title: 'SalesMind AI', subtitle: 'Data Intelligence' };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-8 h-16 px-6 bg-white border-b border-[#E7ECF3]">
      {/* Zone 1: Page Title */}
      <div className="flex items-center gap-4 min-w-0">
        <div>
          <h1 className="text-lg font-bold text-[#172033] tracking-tight whitespace-nowrap">
            {pageMeta.title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Informational Unboxed Metadata (NO PILLS) */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-[#697586] whitespace-nowrap">
        <span>Active records: <strong className="text-[#172033] tabular-nums font-semibold">{totalFilteredRecords.toLocaleString()}</strong> of {totalRawRecords.toLocaleString()}</span>
        <span aria-hidden="true">·</span>
        <span>Source: <strong className="text-[#172033] font-medium">{isSyntheticData ? 'Synthetic Demo' : 'Custom Upload'}</strong></span>
        <span aria-hidden="true">·</span>
        <span>Python Analytics v2.4</span>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Reset filter button if filters are active */}
        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#E65353] hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
            title="Reset all active filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}

        {/* Global Filter Toggle */}
        <button
          onClick={onOpenFilters}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
            activeFilterCount > 0
              ? 'bg-[#3867F5]/5 border-[#3867F5] text-[#3867F5]'
              : 'bg-white border-[#E7ECF3] text-[#172033] hover:bg-[#F7F9FC]'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 text-[10px] font-bold text-white bg-[#3867F5] rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Export CSV Action */}
        <button
          onClick={onExportCsv}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#172033] bg-[#F7F9FC] border border-[#E7ECF3] hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
          title="Export current filtered records as CSV"
        >
          <Download className="w-3.5 h-3.5 text-[#697586]" />
          <span>Export</span>
        </button>

        {/* AI Copilot Button */}
        <button
          onClick={onOpenAiCopilot}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#3867F5] hover:bg-[#2e57d8] rounded-lg shadow-sm shadow-[#3867F5]/20 transition-all whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Analyst</span>
        </button>
      </div>
    </header>
  );
};
