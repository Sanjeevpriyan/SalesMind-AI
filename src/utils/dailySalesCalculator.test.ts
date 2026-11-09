/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  calculateDailySalesSummary,
  validateDailySalesInput,
  SAMPLE_WEEKDAY_ENTRIES,
  formatINR
} from './dailySalesCalculator';
import { DailySalesEntry } from '../types/dailySales';

function runTests() {
  console.log("=== Running Daily Sales Array Calculation Tests ===");

  // 1. Normal Daily Sales Input (Sample Weekday: Mon to Fri)
  const sampleResult = calculateDailySalesSummary(SAMPLE_WEEKDAY_ENTRIES);
  // Total: 5000 + 7500 + 4000 + 9000 + 6500 = 32,000
  console.assert(sampleResult.totalSales === 32000, `Expected total 32000, got ${sampleResult.totalSales}`);
  // Average: 32000 / 5 = 6400
  console.assert(sampleResult.averageSales === 6400, `Expected avg 6400, got ${sampleResult.averageSales}`);
  // Highest: Thursday (9000)
  console.assert(sampleResult.highestSalesAmount === 9000, `Expected max 9000, got ${sampleResult.highestSalesAmount}`);
  console.assert(sampleResult.highestSellingDays.length === 1 && sampleResult.highestSellingDays[0] === 'Thursday', `Expected Thursday, got ${sampleResult.highestSellingDays}`);
  console.log("✓ Test 1 Passed: Normal Weekday Array Calculations");

  // 2. Empty Sales Array
  const emptyResult = calculateDailySalesSummary([]);
  console.assert(emptyResult.totalSales === 0, `Expected 0, got ${emptyResult.totalSales}`);
  console.assert(emptyResult.averageSales === 0, `Expected 0, got ${emptyResult.averageSales}`);
  console.assert(emptyResult.highestSalesAmount === 0, `Expected 0, got ${emptyResult.highestSalesAmount}`);
  console.assert(emptyResult.highestSellingDays.length === 0, `Expected empty array, got ${emptyResult.highestSellingDays}`);
  console.log("✓ Test 2 Passed: Empty Sales Array Handling");

  // 3. One-Day Sales Input
  const singleDay: DailySalesEntry[] = [{ id: 'd1', dayName: 'Monday', sales: 8200 }];
  const singleResult = calculateDailySalesSummary(singleDay);
  console.assert(singleResult.totalSales === 8200, `Expected 8200, got ${singleResult.totalSales}`);
  console.assert(singleResult.averageSales === 8200, `Expected 8200, got ${singleResult.averageSales}`);
  console.assert(singleResult.highestSalesAmount === 8200, `Expected 8200, got ${singleResult.highestSalesAmount}`);
  console.assert(singleResult.highestSellingDays[0] === 'Monday', `Expected Monday, got ${singleResult.highestSellingDays[0]}`);
  console.log("✓ Test 3 Passed: One-Day Sales Input");

  // 4. Two Days with Equal Highest Sales (Tied Peak Day)
  const tiedDays: DailySalesEntry[] = [
    { id: 'd1', dayName: 'Tuesday', sales: 9000 },
    { id: 'd2', dayName: 'Thursday', sales: 9000 },
    { id: 'd3', dayName: 'Friday', sales: 4500 }
  ];
  const tiedResult = calculateDailySalesSummary(tiedDays);
  console.assert(tiedResult.totalSales === 22500, `Expected 22500, got ${tiedResult.totalSales}`);
  console.assert(tiedResult.highestSalesAmount === 9000, `Expected 9000, got ${tiedResult.highestSalesAmount}`);
  console.assert(tiedResult.highestSellingDays.length === 2, `Expected 2 tied days, got ${tiedResult.highestSellingDays.length}`);
  console.assert(tiedResult.highestSellingDays.includes('Tuesday') && tiedResult.highestSellingDays.includes('Thursday'), 'Expected Tuesday and Thursday');
  console.log("✓ Test 4 Passed: Equal Highest Sales (Tied Peak Days)");

  // 5. Input Validation Tests
  const validCheck = validateDailySalesInput('Saturday', '12000');
  console.assert(validCheck.valid && validCheck.cleanSales === 12000, 'Valid input failed');

  const negativeCheck = validateDailySalesInput('Sunday', '-500');
  console.assert(!negativeCheck.valid, 'Negative input should be rejected');

  const emptyDayCheck = validateDailySalesInput('', '4000');
  console.assert(!emptyDayCheck.valid, 'Empty day name should be rejected');

  const nanCheck = validateDailySalesInput('Monday', 'abc');
  console.assert(!nanCheck.valid, 'Non-numeric sales should be rejected');
  console.log("✓ Test 5 Passed: Input Validation (Prevent negative and invalid data)");

  // 6. Indian Rupee Formatter
  console.assert(formatINR(9000) === '₹9,000', `Expected ₹9,000, got ${formatINR(9000)}`);
  console.assert(formatINR(0) === '₹0', `Expected ₹0, got ${formatINR(0)}`);
  console.log("✓ Test 6 Passed: Indian Rupee (₹) formatting");

  console.log("=== All Daily Sales Array Tests Passed Successfully ===");
}

runTests();
