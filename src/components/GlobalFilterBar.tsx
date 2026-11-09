/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, RotateCcw, Search, Check } from 'lucide-react';
import { GlobalFilterState } from '../types/analytics';

interface GlobalFilterBarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: GlobalFilterState;
  onFilterChange: (updater: (prev: GlobalFilterState) => GlobalFilterState) => void;
  onReset: () => void;
  availableYears: number[];
  availableCountries: string[];
  availableCategories: string[];
  availableProducts: string[];
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  availableYears,
  availableCountries,
  availableCategories,
  availableProducts
}) => {
  if (!isOpen) return null;

  const toggleYear = (year: number) => {
    onFilterChange(prev => {
      const exists = prev.selectedYears.includes(year);
      return {
        ...prev,
        selectedYears: exists
          ? prev.selectedYears.filter(y => y !== year)
          : [...prev.selectedYears, year]
      };
    });
  };

  const toggleCountry = (country: string) => {
    onFilterChange(prev => {
      const exists = prev.selectedCountries.includes(country);
      return {
        ...prev,
        selectedCountries: exists
          ? prev.selectedCountries.filter(c => c !== country)
          : [...prev.selectedCountries, country]
      };
    });
  };

  const toggleCategory = (category: string) => {
    onFilterChange(prev => {
      const exists = prev.selectedCategories.includes(category);
      return {
        ...prev,
        selectedCategories: exists
          ? prev.selectedCategories.filter(c => c !== category)
          : [...prev.selectedCategories, category]
      };
    });
  };

  const toggleSentiment = (sent: string) => {
    onFilterChange(prev => {
      const exists = prev.selectedSentiments.includes(sent);
      return {
        ...prev,
        selectedSentiments: exists
          ? prev.selectedSentiments.filter(s => s !== sent)
          : [...prev.selectedSentiments, sent]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Background click to dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-[#E7ECF3] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7ECF3]">
          <div>
            <h3 className="text-base font-bold text-[#172033]">Global Dataset Filters</h3>
            <p className="text-xs text-[#697586]">Updates KPIs, charts, and recommendations synchronously</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#697586] hover:text-[#172033] hover:bg-[#F7F9FC] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Universal Search */}
          <div>
            <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#697586] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Product name, country, customer, order ID..."
                value={filters.searchQuery}
                onChange={e => onFilterChange(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg text-[#172033] placeholder-[#697586] focus:outline-none focus:border-[#3867F5] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-[#697586]">From</span>
                <input
                  type="date"
                  value={filters.dateStart}
                  onChange={e => onFilterChange(prev => ({ ...prev, dateStart: e.target.value }))}
                  className="w-full mt-0.5 px-2.5 py-1.5 text-xs bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg text-[#172033] focus:outline-none focus:border-[#3867F5]"
                />
              </div>
              <div>
                <span className="text-[11px] text-[#697586]">To</span>
                <input
                  type="date"
                  value={filters.dateEnd}
                  onChange={e => onFilterChange(prev => ({ ...prev, dateEnd: e.target.value }))}
                  className="w-full mt-0.5 px-2.5 py-1.5 text-xs bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg text-[#172033] focus:outline-none focus:border-[#3867F5]"
                />
              </div>
            </div>
          </div>

          {/* Years */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#172033] uppercase tracking-wider">
                Financial Year
              </label>
              {filters.selectedYears.length > 0 && (
                <button
                  onClick={() => onFilterChange(prev => ({ ...prev, selectedYears: [] }))}
                  className="text-[11px] text-[#3867F5] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableYears.map(year => {
                const isSelected = filters.selectedYears.includes(year);
                return (
                  <button
                    key={year}
                    onClick={() => toggleYear(year)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#3867F5] border-[#3867F5] text-white'
                        : 'bg-white border-[#E7ECF3] text-[#172033] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#172033] uppercase tracking-wider">
                Product Categories
              </label>
              {filters.selectedCategories.length > 0 && (
                <button
                  onClick={() => onFilterChange(prev => ({ ...prev, selectedCategories: [] }))}
                  className="text-[11px] text-[#3867F5] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {availableCategories.map(cat => {
                const isSelected = filters.selectedCategories.includes(cat);
                return (
                  <label
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#F7F9FC] cursor-pointer"
                  >
                    <span className="text-[#172033]">{cat}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-[#3867F5] border-[#3867F5] text-white' : 'border-[#cbd5e1]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Countries */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#172033] uppercase tracking-wider">
                Countries & Territories
              </label>
              {filters.selectedCountries.length > 0 && (
                <button
                  onClick={() => onFilterChange(prev => ({ ...prev, selectedCountries: [] }))}
                  className="text-[11px] text-[#3867F5] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {availableCountries.map(c => {
                const isSelected = filters.selectedCountries.includes(c);
                return (
                  <label
                    key={c}
                    onClick={() => toggleCountry(c)}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#F7F9FC] cursor-pointer"
                  >
                    <span className="text-[#172033]">{c}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-[#3867F5] border-[#3867F5] text-white' : 'border-[#cbd5e1]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Review Sentiment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#172033] uppercase tracking-wider">
                Review Sentiment
              </label>
              {filters.selectedSentiments.length > 0 && (
                <button
                  onClick={() => onFilterChange(prev => ({ ...prev, selectedSentiments: [] }))}
                  className="text-[11px] text-[#3867F5] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'positive', label: 'Positive', color: 'border-emerald-300' },
                { id: 'neutral', label: 'Neutral', color: 'border-slate-300' },
                { id: 'negative', label: 'Negative', color: 'border-rose-300' },
              ].map(s => {
                const isSelected = filters.selectedSentiments.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSentiment(s.id)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-[#3867F5] text-white border-[#3867F5]'
                        : 'bg-white text-[#172033] border-[#E7ECF3] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E7ECF3] bg-[#F7F9FC]">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#E65353] hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#3867F5] hover:bg-[#2e57d8] rounded-lg shadow-sm shadow-[#3867F5]/20"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
