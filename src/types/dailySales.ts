/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DailySalesEntry {
  id: string;
  dayName: string;
  sales: number;
}

export interface DailySalesCalculationResult {
  totalSales: number;
  averageSales: number;
  highestSalesAmount: number;
  highestSellingDays: string[];
  lowestSalesAmount: number;
  lowestSellingDays: string[];
  count: number;
}
