/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Papa from 'papaparse';
import { SalesRecord, DataQualityReport } from '../types/analytics';

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Flexible header normalizer
function matchHeader(headers: string[], candidates: string[]): string | null {
  for (const candidate of candidates) {
    const found = headers.find(h => {
      const clean = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const candClean = candidate.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean === candClean || clean.includes(candClean);
    });
    if (found) return found;
  }
  return null;
}

export function parseCSVFile(
  csvText: string,
  userColumnMap?: Record<string, string>
): { records: SalesRecord[]; report: DataQualityReport } {
  const parsed = Papa.parse<Record<string, any>>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  const rawRows = parsed.data;
  const headers = parsed.meta.fields || [];

  // Detect mapping
  const colMap = {
    order_id: userColumnMap?.order_id || matchHeader(headers, ['order id', 'order_id', 'orderid', 'invoice', 'transaction id', 'id']) || 'order_id',
    order_date: userColumnMap?.order_date || matchHeader(headers, ['order date', 'order_date', 'date', 'invoicedate', 'timestamp', 'transaction date']) || 'order_date',
    country: userColumnMap?.country || matchHeader(headers, ['country', 'region', 'ship country', 'market', 'location']) || 'country',
    product_name: userColumnMap?.product_name || matchHeader(headers, ['product name', 'product', 'item name', 'item', 'description', 'title']) || 'product_name',
    product_id: userColumnMap?.product_id || matchHeader(headers, ['product id', 'product_id', 'sku', 'item id', 'prod id']) || 'product_id',
    category: userColumnMap?.category || matchHeader(headers, ['category', 'product category', 'department', 'type', 'group']) || 'category',
    quantity: userColumnMap?.quantity || matchHeader(headers, ['quantity', 'qty', 'units', 'count', 'amount sold']) || 'quantity',
    unit_price: userColumnMap?.unit_price || matchHeader(headers, ['unit price', 'price', 'unit_price', 'sale price', 'rate']) || 'unit_price',
    unit_cost: userColumnMap?.unit_cost || matchHeader(headers, ['unit cost', 'cost', 'cogs', 'unit_cost', 'cost price', 'expense']) || 'unit_cost',
    revenue: userColumnMap?.revenue || matchHeader(headers, ['revenue', 'sales', 'total sales', 'total amount', 'total revenue', 'gross sales']) || 'revenue',
    profit: userColumnMap?.profit || matchHeader(headers, ['profit', 'net profit', 'margin', 'gross profit', 'net gain']) || 'profit',
    customer_id: userColumnMap?.customer_id || matchHeader(headers, ['customer id', 'customer_id', 'client id', 'user id', 'account id']) || 'customer_id',
    customer_name: userColumnMap?.customer_name || matchHeader(headers, ['customer name', 'customer', 'client', 'company name']) || 'customer_name',
    review_rating: userColumnMap?.review_rating || matchHeader(headers, ['review rating', 'rating', 'stars', 'score', 'feedback rating']) || 'review_rating',
    review_text: userColumnMap?.review_text || matchHeader(headers, ['review text', 'review', 'comment', 'feedback', 'notes', 'customer review']) || 'review_text',
    return_status: userColumnMap?.return_status || matchHeader(headers, ['return status', 'returned', 'return', 'delivery status', 'status']) || 'return_status'
  };

  const records: SalesRecord[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();
  let duplicateCount = 0;
  let missingCostCount = 0;
  let missingReviewCount = 0;
  let invalidRows = 0;

  let minDate = '9999-99-99';
  let maxDate = '0000-00-00';

  rawRows.forEach((row, index) => {
    // Extract Order Date
    const rawDate = row[colMap.order_date];
    let dateStr = "";

    if (rawDate) {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        const y = parsedDate.getFullYear();
        const m = parsedDate.getMonth() + 1;
        const d = parsedDate.getDate();
        dateStr = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
      }
    }

    if (!dateStr || dateStr.startsWith('NaN')) {
      invalidRows++;
      return;
    }

    const [yearPart, monthPart] = dateStr.split('-');
    const year = parseInt(yearPart, 10);
    const month = parseInt(monthPart, 10);
    const monthName = `${MONTH_NAMES[month - 1] || 'Month'} ${year}`;
    const yearMonth = `${yearPart}-${monthPart}`;

    if (dateStr < minDate) minDate = dateStr;
    if (dateStr > maxDate) maxDate = dateStr;

    // Order ID
    const rawId = row[colMap.order_id];
    const order_id = rawId ? String(rawId).trim() : `ORD-UP-${index + 1000}`;
    if (seenIds.has(order_id)) {
      duplicateCount++;
    } else {
      seenIds.add(order_id);
    }

    // Country
    const country = row[colMap.country] ? String(row[colMap.country]).trim() : "Unspecified";

    // Product info
    const product_name = row[colMap.product_name] ? String(row[colMap.product_name]).trim() : "Standard Item";
    const product_id = row[colMap.product_id] ? String(row[colMap.product_id]).trim() : `SKU-${product_name.replace(/\s+/g, '-').toUpperCase()}`;
    const category = row[colMap.category] ? String(row[colMap.category]).trim() : "General";

    // Quantity, Price, Cost, Revenue, Profit
    const rawQty = parseFloat(row[colMap.quantity]);
    const quantity = isNaN(rawQty) || rawQty <= 0 ? 1 : rawQty;

    const rawPrice = parseFloat(row[colMap.unit_price]);
    let unit_price = !isNaN(rawPrice) && rawPrice >= 0 ? rawPrice : 0;

    const rawRev = parseFloat(row[colMap.revenue]);
    let revenue = !isNaN(rawRev) ? rawRev : Math.round(quantity * unit_price * 100) / 100;
    if (unit_price === 0 && quantity > 0 && revenue > 0) {
      unit_price = Math.round((revenue / quantity) * 100) / 100;
    }

    const rawCost = parseFloat(row[colMap.unit_cost]);
    let unit_cost = !isNaN(rawCost) && rawCost >= 0 ? rawCost : -1;
    if (unit_cost < 0) {
      missingCostCount++;
      // If user uploaded data has no cost, provide a default industry standard margin estimate (65% COGS)
      // but warn them in the quality report
      unit_cost = Math.round(unit_price * 0.65 * 100) / 100;
    }

    let cost = Math.round(quantity * unit_cost * 100) / 100;
    let profit = Math.round((revenue - cost) * 100) / 100;

    const rawProfit = parseFloat(row[colMap.profit]);
    if (!isNaN(rawProfit)) {
      profit = rawProfit;
    }

    const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;

    // Customer
    const customer_id = row[colMap.customer_id] ? String(row[colMap.customer_id]).trim() : `CUST-${(index % 25) + 100}`;
    const customer_name = row[colMap.customer_name] ? String(row[colMap.customer_name]).trim() : undefined;

    // Review & Sentiment
    const rawRating = parseFloat(row[colMap.review_rating]);
    const review_rating = !isNaN(rawRating) && rawRating >= 1 && rawRating <= 5 ? rawRating : undefined;
    const review_text = row[colMap.review_text] ? String(row[colMap.review_text]).trim() : undefined;

    if (!review_text && !review_rating) {
      missingReviewCount++;
    }

    let review_sentiment: 'positive' | 'neutral' | 'negative' | undefined;
    if (review_rating) {
      if (review_rating >= 4) review_sentiment = 'positive';
      else if (review_rating <= 2) review_sentiment = 'negative';
      else review_sentiment = 'neutral';
    }

    // Return status
    const rawReturn = row[colMap.return_status];
    let return_status: 'Delivered' | 'Returned' | 'Pending' = 'Delivered';
    if (rawReturn) {
      const retLower = String(rawReturn).toLowerCase();
      if (retLower.includes('return') || retLower === 'yes' || retLower === '1' || retLower === 'true') {
        return_status = 'Returned';
      }
    }

    records.push({
      order_id,
      order_date: dateStr,
      year,
      month,
      month_name: monthName,
      year_month: yearMonth,
      country,
      product_id,
      product_name,
      category,
      quantity,
      unit_price,
      unit_cost,
      revenue,
      cost,
      profit,
      profit_margin: profitMargin,
      customer_id,
      customer_name,
      review_rating,
      review_text,
      review_sentiment,
      return_status
    });
  });

  if (missingCostCount > 0) {
    warnings.push(`${missingCostCount} rows lacked an explicit Unit Cost / COGS column; estimated using 65% standard cost ratio.`);
  }
  if (duplicateCount > 0) {
    warnings.push(`${duplicateCount} duplicate order IDs detected and handled.`);
  }
  if (invalidRows > 0) {
    warnings.push(`${invalidRows} rows had invalid or missing dates and were excluded from time-series metrics.`);
  }

  // Sort chronologically
  records.sort((a, b) => a.order_date.localeCompare(b.order_date));

  const report: DataQualityReport = {
    totalRows: rawRows.length,
    validRows: records.length,
    invalidRows,
    duplicateRows: duplicateCount,
    missingCostCount,
    missingReviewCount,
    dateRange: { min: minDate, max: maxDate },
    detectedColumns: colMap,
    warnings
  };

  return { records, report };
}

/**
 * Downloadable CSV sample template generator.
 */
export function generateSampleCsvTemplate(): string {
  const headers = [
    "Order ID",
    "Order Date",
    "Country",
    "Product ID",
    "Product Name",
    "Category",
    "Quantity",
    "Unit Price",
    "Unit Cost",
    "Revenue",
    "Profit",
    "Customer ID",
    "Customer Name",
    "Review Rating",
    "Review Text",
    "Return Status"
  ];

  const rows = [
    [
      "ORD-2025-1001",
      "2025-01-15",
      "United States",
      "PROD-101",
      "UltraWide 38\" Curved Display",
      "Displays & Workstations",
      "3",
      "949.00",
      "590.00",
      "2847.00",
      "1077.00",
      "CUST-8001",
      "Apex Technologies Corp",
      "5",
      "Exceptional build quality and rock-solid performance across all workstations.",
      "Delivered"
    ],
    [
      "ORD-2025-1002",
      "2025-01-18",
      "Germany",
      "PROD-102",
      "Ergonomic Mesh Pro Chair",
      "Office Ergonomics",
      "2",
      "364.65",
      "393.82",
      "729.30",
      "-58.34",
      "CUST-8003",
      "Bavaria Cloud Engineering",
      "1",
      "Product quality issue: arm tension screw stripped within first week of operation.",
      "Returned"
    ],
    [
      "ORD-2025-1003",
      "2025-02-04",
      "United Kingdom",
      "PROD-103",
      "Noise-Cancelling Executive Headset",
      "Audio & Peripherals",
      "5",
      "289.00",
      "115.00",
      "1445.00",
      "870.00",
      "CUST-8007",
      "Thames Digital Partners",
      "4",
      "Solid hardware with great ergonomics. Reliable daily workhorse.",
      "Delivered"
    ],
    [
      "ORD-2025-1004",
      "2025-02-12",
      "Japan",
      "PROD-106",
      "Enterprise NVMe Storage Array 4TB",
      "Storage & Servers",
      "2",
      "1199.00",
      "1080.00",
      "2398.00",
      "238.00",
      "CUST-8009",
      "Kyoto Robotics Studio",
      "5",
      "Fast read/write speeds, compact rack enclosure.",
      "Delivered"
    ]
  ];

  return [headers.join(','), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
}
