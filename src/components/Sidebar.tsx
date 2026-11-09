/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Globe,
  Package,
  TrendingDown,
  MessageSquare,
  Users,
  LineChart,
  Lightbulb,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Brain,
  Calculator
} from 'lucide-react';

export type PageId =
  | 'executive'
  | 'monthly'
  | 'dailysales'
  | 'countries'
  | 'products'
  | 'profitloss'
  | 'reviews'
  | 'customers'
  | 'forecast'
  | 'recommendations'
  | 'explorer'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isSyntheticData: boolean;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
  tag?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'executive', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'monthly', label: 'Monthly Sales Analysis', icon: Calendar, tag: 'Core' },
  { id: 'dailysales', label: 'Daily Sales Calculator', icon: Calculator, tag: 'Arrays' },
  { id: 'countries', label: 'Country Intelligence', icon: Globe },
  { id: 'products', label: 'Product Performance', icon: Package },
  { id: 'profitloss', label: 'Profit & Loss Analysis', icon: TrendingDown },
  { id: 'reviews', label: 'Customer Reviews', icon: MessageSquare },
  { id: 'customers', label: 'Customer Intelligence', icon: Users },
  { id: 'forecast', label: 'Sales Forecast', icon: LineChart },
  { id: 'recommendations', label: 'Business Recommendations', icon: Lightbulb },
  { id: 'explorer', label: 'Data Explorer', icon: Database },
  { id: 'settings', label: 'Settings & Quality', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  collapsed,
  onToggleCollapse,
  isSyntheticData
}) => {
  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-white border-r border-[#E7ECF3] transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-[#E7ECF3]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#3867F5] text-white shrink-0 shadow-sm shadow-[#3867F5]/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-[#172033] tracking-tight truncate">
                SalesMind AI
              </span>
              <span className="text-xs text-[#697586] truncate">
                Monthly Sales Intelligence
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-[#697586] hover:text-[#172033] hover:bg-[#F7F9FC] rounded-md transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Dataset Status Banner */}
      {!collapsed && (
        <div className="px-5 py-3 border-b border-[#E7ECF3] bg-[#F7F9FC]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#697586] font-medium">Dataset Mode</span>
            <span className="text-[#3867F5] font-semibold">
              {isSyntheticData ? 'Synthetic Demo' : 'Custom Upload'}
            </span>
          </div>
          <div className="text-[11px] text-[#697586] mt-0.5 truncate">
            {isSyntheticData ? '24-Mo Global Benchmark' : 'Validated Production Data'}
          </div>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={`px-2 mb-2 text-[11px] font-bold text-[#697586] uppercase tracking-wider ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '···' : 'Analytics & Insights'}
        </div>

        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#3867F5] text-white shadow-sm shadow-[#3867F5]/25 font-semibold'
                  : 'text-[#172033] hover:bg-[#F7F9FC] hover:text-[#3867F5]'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#697586]'}`} />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.tag && (
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#3867F5]'
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile / Quick Info */}
      <div className="p-4 border-t border-[#E7ECF3] bg-white">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <img
            src="/src/assets/images/analyst_avatar_1793883563917.jpg"
            alt="Business Analyst"
            className="w-9 h-9 rounded-full object-cover border border-[#E7ECF3]"
            referrerPolicy="no-referrer"
          />
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#172033] truncate">Business Analyst Desk</div>
              <div className="text-[11px] text-[#697586] truncate">Python Analytics v2.4</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
