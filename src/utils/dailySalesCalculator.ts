/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailySalesEntry, DailySalesCalculationResult } from '../types/dailySales';

export const SAMPLE_WEEKDAY_ENTRIES: DailySalesEntry[] = [
  { id: 'day-1', dayName: 'Monday', sales: 5000 },
  { id: 'day-2', dayName: 'Tuesday', sales: 7500 },
  { id: 'day-3', dayName: 'Wednesday', sales: 4000 },
  { id: 'day-4', dayName: 'Thursday', sales: 9000 },
  { id: 'day-5', dayName: 'Friday', sales: 6500 },
];

/**
 * Perform pure mathematical calculations on a daily sales array.
 * Demonstrates:
 * 1. Total Sales = sum of all array elements
 * 2. Average Sales = totalSales / array.length
 * 3. Highest Selling Day = maximum array element and corresponding day name(s)
 * Handles empty arrays and duplicate maximum values safely.
 */
export function calculateDailySalesSummary(entries: DailySalesEntry[]): DailySalesCalculationResult {
  if (!entries || entries.length === 0) {
    return {
      totalSales: 0,
      averageSales: 0,
      highestSalesAmount: 0,
      highestSellingDays: [],
      lowestSalesAmount: 0,
      lowestSellingDays: [],
      count: 0
    };
  }

  // 1. Extract pure numerical sales array
  const salesArray = entries.map(e => e.sales);

  // 2. Total Sales: sum of all daily sales values using array reduce
  const totalSales = salesArray.reduce((acc, curr) => acc + curr, 0);

  // 3. Average Sales: totalSales / numberOfDays
  const averageSales = Math.round((totalSales / entries.length) * 100) / 100;

  // 4. Highest Selling Day: Find maximum value and corresponding day(s)
  const highestSalesAmount = Math.max(...salesArray);
  const highestSellingDays = entries
    .filter(e => e.sales === highestSalesAmount)
    .map(e => e.dayName);

  // 5. Lowest Selling Day: Find minimum value
  const lowestSalesAmount = Math.min(...salesArray);
  const lowestSellingDays = entries
    .filter(e => e.sales === lowestSalesAmount)
    .map(e => e.dayName);

  return {
    totalSales,
    averageSales,
    highestSalesAmount,
    highestSellingDays,
    lowestSalesAmount,
    lowestSellingDays,
    count: entries.length
  };
}

/**
 * Validates day name and sales amount before insertion or update in array.
 * Prevents negative, NaN, or infinite sales values.
 */
export function validateDailySalesInput(
  dayName: string,
  salesInput: string | number
): { valid: boolean; error?: string; cleanSales?: number } {
  const trimmedName = dayName.trim();
  if (!trimmedName) {
    return { valid: false, error: 'Day name is required (e.g., "Monday", "Saturday", "Day 6").' };
  }

  const num = typeof salesInput === 'number' ? salesInput : parseFloat(String(salesInput).replace(/,/g, '').trim());

  if (isNaN(num)) {
    return { valid: false, error: 'Sales amount must be a valid numerical value.' };
  }

  if (num < 0) {
    return { valid: false, error: 'Sales amount cannot be negative. Please enter ₹0 or a positive number.' };
  }

  if (!isFinite(num)) {
    return { valid: false, error: 'Sales amount exceeds acceptable numerical bounds.' };
  }

  return { valid: true, cleanSales: Math.round(num * 100) / 100 };
}

/**
 * Formats a numerical value into standard Indian Rupee notation (₹).
 */
export function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  return '₹' + val.toLocaleString('en-IN', {
    maximumFractionDigits: 0
  });
}
