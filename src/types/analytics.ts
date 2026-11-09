/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SalesRecord {
  order_id: string;
  order_date: string; // YYYY-MM-DD
  year: number;
  month: number; // 1-12
  month_name: string; // e.g. "Jan 2024"
  year_month: string; // "2024-01"
  country: string;
  region?: string;
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  revenue: number;
  cost: number;
  profit: number;
  profit_margin: number;
  customer_id: string;
  customer_name?: string;
  review_rating?: number; // 1-5
  review_text?: string;
  review_sentiment?: 'positive' | 'neutral' | 'negative';
  return_status?: 'Delivered' | 'Returned' | 'Pending';
  discount_pct?: number;
}

export interface GlobalFilterState {
  dateStart: string;
  dateEnd: string;
  selectedYears: number[];
  selectedCountries: string[];
  selectedCategories: string[];
  selectedProducts: string[];
  selectedSentiments: string[];
  searchQuery: string;
}

export interface ExecutiveKPIs {
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
  totalOrders: number;
  totalQuantity: number;
  avgOrderValue: number;
  profitMargin: number;
  prevRevenue: number | null;
  prevProfit: number | null;
  prevOrders: number | null;
  growthRevenuePct: number | null;
  growthProfitPct: number | null;
  growthOrdersPct: number | null;
}

export interface MonthlyMetric {
  yearMonth: string; // '2024-01'
  label: string; // 'Jan 2024'
  year: number;
  month: number;
  revenue: number;
  profit: number;
  cost: number;
  quantity: number;
  orders: number;
  margin: number;
  momRevenueGrowth: number | null; // %
  momProfitGrowth: number | null; // %
}

export interface CountryMetric {
  country: string;
  revenue: number;
  profit: number;
  loss: number; // negative profit portion
  orders: number;
  quantity: number;
  margin: number;
  avgOrderValue: number;
  topProduct: string;
  sentimentScore: number; // avg rating 1-5
  negativeCount: number;
}

export interface ProductMetric {
  productId: string;
  productName: string;
  category: string;
  revenue: number;
  cost: number;
  profit: number;
  quantity: number;
  margin: number;
  avgUnitPrice: number;
  avgRating: number;
  reviewCount: number;
  returnRate: number; // %
  momTrend: 'increasing' | 'stable' | 'declining';
}

export interface CustomerRFMSegment {
  customerId: string;
  customerName: string;
  orderCount: number;
  totalSpend: number;
  avgOrderValue: number;
  lastOrderDate: string;
  daysSinceLastOrder: number;
  segment: 'Champion' | 'Loyal' | 'Potential' | 'At Risk' | 'Hibernating';
}

export interface ForecastPoint {
  period: string; // "Feb 2025"
  actual: number | null;
  predicted: number | null;
  lowerBound: number | null;
  upperBound: number | null;
  isForecast: boolean;
}

export interface ForecastMetrics {
  modelName: string;
  mae: number;
  rmse: number;
  mape: number;
  dataPointsCount: number;
  trend: 'Upward' | 'Downward' | 'Stable';
  horizonMonths: number;
}

export interface RecommendationItem {
  id: string;
  type: 'risk' | 'opportunity' | 'pricing' | 'inventory' | 'customer';
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  finding: string;
  evidence: string;
  businessImpact: string;
  suggestedAction: string;
}

export interface ReviewTheme {
  theme: string;
  count: number;
  percentage: number;
  sentiment: 'negative' | 'neutral' | 'positive';
  sampleFeedback: string[];
}

export interface DataQualityReport {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  missingCostCount: number;
  missingReviewCount: number;
  dateRange: { min: string; max: string };
  detectedColumns: Record<string, string>;
  warnings: string[];
}
