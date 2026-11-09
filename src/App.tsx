/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Sidebar, PageId } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { GlobalFilterBar } from './components/GlobalFilterBar';
import { AiAssistantModal } from './components/AiAssistantModal';

import { ExecutiveOverviewPage } from './pages/ExecutiveOverviewPage';
import { MonthlySalesPage } from './pages/MonthlySalesPage';
import { DailySalesCalculatorPage } from './pages/DailySalesCalculatorPage';
import { CountryIntelligencePage } from './pages/CountryIntelligencePage';
import { ProductPerformancePage } from './pages/ProductPerformancePage';
import { ProfitLossPage } from './pages/ProfitLossPage';
import { CustomerReviewsPage } from './pages/CustomerReviewsPage';
import { CustomerIntelligencePage } from './pages/CustomerIntelligencePage';
import { SalesForecastPage } from './pages/SalesForecastPage';
import { BusinessRecommendationsPage } from './pages/BusinessRecommendationsPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { SettingsPage } from './pages/SettingsPage';

import { SalesRecord, GlobalFilterState, DataQualityReport } from './types/analytics';
import { generateSampleDataset } from './data/sampleDataset';
import {
  filterRecords,
  computeExecutiveKPIs,
  computeMonthlyMetrics,
  computeCountryMetrics,
  computeProductMetrics,
  computeReviewThemes,
  generateRecommendations
} from './utils/analyticsEngine';

const INITIAL_FILTERS: GlobalFilterState = {
  dateStart: '',
  dateEnd: '',
  selectedYears: [],
  selectedCountries: [],
  selectedCategories: [],
  selectedProducts: [],
  selectedSentiments: [],
  searchQuery: ''
};

export default function App() {
  // Main dataset state
  const [rawRecords, setRawRecords] = useState<SalesRecord[]>(() => generateSampleDataset());
  const [isSyntheticData, setIsSyntheticData] = useState<boolean>(true);
  const [qualityReport, setQualityReport] = useState<DataQualityReport>({
    totalRows: 780,
    validRows: 780,
    invalidRows: 0,
    duplicateRows: 0,
    missingCostCount: 0,
    missingReviewCount: 0,
    dateRange: { min: '2024-01-01', max: '2025-12-31' },
    detectedColumns: {
      order_date: 'order_date',
      country: 'country',
      product_name: 'product_name',
      quantity: 'quantity',
      unit_price: 'unit_price',
      cost: 'cost',
      profit: 'profit'
    },
    warnings: []
  });

  // UI Navigation & Modals
  const [currentPage, setCurrentPage] = useState<PageId>('executive');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(false);

  // Global Filters
  const [filters, setFilters] = useState<GlobalFilterState>(INITIAL_FILTERS);

  // Available Filter Options from Raw Dataset
  const { availableYears, availableCountries, availableCategories, availableProducts } = useMemo(() => {
    const years = new Set<number>();
    const countries = new Set<string>();
    const categories = new Set<string>();
    const products = new Set<string>();

    for (const r of rawRecords) {
      years.add(r.year);
      countries.add(r.country);
      categories.add(r.category);
      products.add(r.product_name);
    }

    return {
      availableYears: Array.from(years).sort((a, b) => a - b),
      availableCountries: Array.from(countries).sort(),
      availableCategories: Array.from(categories).sort(),
      availableProducts: Array.from(products).sort()
    };
  }, [rawRecords]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateStart || filters.dateEnd) count++;
    if (filters.selectedYears.length > 0) count++;
    if (filters.selectedCountries.length > 0) count++;
    if (filters.selectedCategories.length > 0) count++;
    if (filters.selectedProducts.length > 0) count++;
    if (filters.selectedSentiments.length > 0) count++;
    if (filters.searchQuery.trim()) count++;
    return count;
  }, [filters]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return filterRecords(rawRecords, filters);
  }, [rawRecords, filters]);

  // Analytical derivations
  const kpis = useMemo(() => computeExecutiveKPIs(filteredRecords), [filteredRecords]);
  const monthly = useMemo(() => computeMonthlyMetrics(filteredRecords), [filteredRecords]);
  const countries = useMemo(() => computeCountryMetrics(filteredRecords), [filteredRecords]);
  const products = useMemo(() => computeProductMetrics(filteredRecords), [filteredRecords]);
  const { themes } = useMemo(() => computeReviewThemes(filteredRecords), [filteredRecords]);
  const recommendations = useMemo(() => {
    return generateRecommendations(kpis, monthly, countries, products, themes);
  }, [kpis, monthly, countries, products, themes]);

  // CSV Export
  const handleExportCsv = () => {
    const csv = Papa.unparse(filteredRecords);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `salesmind_analytics_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleDatasetReplaced = (
    newRecords: SalesRecord[],
    newReport: DataQualityReport,
    isSynthetic: boolean
  ) => {
    setRawRecords(newRecords);
    setQualityReport(newReport);
    setIsSyntheticData(isSynthetic);
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isSyntheticData={isSyntheticData}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        {/* Top Navbar */}
        <TopNavbar
          currentPage={currentPage}
          totalFilteredRecords={filteredRecords.length}
          totalRawRecords={rawRecords.length}
          activeFilterCount={activeFilterCount}
          onOpenFilters={() => setFilterDrawerOpen(true)}
          onResetFilters={handleResetFilters}
          onOpenAiCopilot={() => setAiAssistantOpen(true)}
          onExportCsv={handleExportCsv}
          isSyntheticData={isSyntheticData}
        />

        {/* Page Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-fade-in">
          {currentPage === 'executive' && (
            <ExecutiveOverviewPage
              kpis={kpis}
              monthly={monthly}
              countries={countries}
              products={products}
              recommendations={recommendations}
              onNavigatePage={setCurrentPage}
            />
          )}

          {currentPage === 'monthly' && (
            <MonthlySalesPage
              monthly={monthly}
              availableYears={availableYears}
            />
          )}

          {currentPage === 'dailysales' && (
            <DailySalesCalculatorPage
              records={filteredRecords}
            />
          )}

          {currentPage === 'countries' && (
            <CountryIntelligencePage
              countries={countries}
              records={filteredRecords}
            />
          )}

          {currentPage === 'products' && (
            <ProductPerformancePage
              products={products}
              records={filteredRecords}
            />
          )}

          {currentPage === 'profitloss' && (
            <ProfitLossPage
              kpis={kpis}
              monthly={monthly}
              countries={countries}
              products={products}
            />
          )}

          {currentPage === 'reviews' && (
            <CustomerReviewsPage
              records={filteredRecords}
            />
          )}

          {currentPage === 'customers' && (
            <CustomerIntelligencePage
              records={filteredRecords}
            />
          )}

          {currentPage === 'forecast' && (
            <SalesForecastPage
              monthly={monthly}
            />
          )}

          {currentPage === 'recommendations' && (
            <BusinessRecommendationsPage
              recommendations={recommendations}
              kpis={kpis}
            />
          )}

          {currentPage === 'explorer' && (
            <DataExplorerPage
              records={filteredRecords}
              onExportCsv={handleExportCsv}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              qualityReport={qualityReport}
              isSyntheticData={isSyntheticData}
              onDatasetReplaced={handleDatasetReplaced}
            />
          )}
        </main>
      </div>

      {/* Global Filter Drawer */}
      <GlobalFilterBar
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        availableYears={availableYears}
        availableCountries={availableCountries}
        availableCategories={availableCategories}
        availableProducts={availableProducts}
      />

      {/* AI Analyst Assistant Modal */}
      <AiAssistantModal
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        datasetContext={{
          kpis,
          countries,
          products,
          monthly
        }}
      />
    </div>
  );
}
