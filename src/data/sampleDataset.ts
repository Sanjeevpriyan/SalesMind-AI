/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SalesRecord } from '../types/analytics';

export const SAMPLE_DATASET_LABEL = "Synthetic Global Sales & Customer Intelligence Benchmark (2024-2025)";

/**
 * Generates a realistic, deterministic 24-month multi-regional benchmark sales dataset.
 * Includes chronological distribution, real price-cost variations, customer reviews,
 * ratings, return statuses, and genuine business patterns (e.g. seasonal peaks,
 * loss-making clearance items, and regional variations).
 */
export function generateSampleDataset(): SalesRecord[] {
  const records: SalesRecord[] = [];

  const countries = [
    { name: "United States", region: "North America", weight: 0.28 },
    { name: "Germany", region: "Europe", weight: 0.16 },
    { name: "United Kingdom", region: "Europe", weight: 0.14 },
    { name: "France", region: "Europe", weight: 0.09 },
    { name: "Japan", region: "Asia Pacific", weight: 0.08 },
    { name: "Canada", region: "North America", weight: 0.07 },
    { name: "Australia", region: "Asia Pacific", weight: 0.06 },
    { name: "Singapore", region: "Asia Pacific", weight: 0.04 },
    { name: "Netherlands", region: "Europe", weight: 0.03 },
    { name: "Sweden", region: "Europe", weight: 0.03 },
    { name: "India", region: "Asia Pacific", weight: 0.02 },
  ];

  interface RawProduct {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    baseCost: number;
    returnRate: number;
    lossRiskCountry?: string; // intentional realistic business anomaly
  }

  const products: RawProduct[] = [
    { id: "PROD-101", name: "UltraWide 38\" Curved Display", category: "Displays & Workstations", basePrice: 949.00, baseCost: 590.00, returnRate: 0.04 },
    { id: "PROD-102", name: "Ergonomic Mesh Pro Chair", category: "Office Ergonomics", basePrice: 429.00, baseCost: 310.00, returnRate: 0.08, lossRiskCountry: "Germany" },
    { id: "PROD-103", name: "Noise-Cancelling Executive Headset", category: "Audio & Peripherals", basePrice: 289.00, baseCost: 115.00, returnRate: 0.03 },
    { id: "PROD-104", name: "Thunderbolt 4 Multi-Port Dock", category: "Connectivity & Power", basePrice: 199.00, baseCost: 95.00, returnRate: 0.05 },
    { id: "PROD-105", name: "Mechanical Studio Keyboard RGB", category: "Audio & Peripherals", basePrice: 159.00, baseCost: 72.00, returnRate: 0.04 },
    { id: "PROD-106", name: "Enterprise NVMe Storage Array 4TB", category: "Storage & Servers", basePrice: 1199.00, baseCost: 1080.00, returnRate: 0.02 }, // high revenue, low margin
    { id: "PROD-107", name: "Motorized Dual-Motor Standing Desk", category: "Office Ergonomics", basePrice: 689.00, baseCost: 520.00, returnRate: 0.06 },
    { id: "PROD-108", name: "Precision Wireless Ergonomic Mouse", category: "Audio & Peripherals", basePrice: 89.00, baseCost: 34.00, returnRate: 0.02 },
    { id: "PROD-109", name: "AI Conference Soundbar 4K", category: "Audio & Peripherals", basePrice: 549.00, baseCost: 480.00, returnRate: 0.09, lossRiskCountry: "France" },
    { id: "PROD-110", name: "Heavy Duty Dual Monitor Arm", category: "Office Ergonomics", basePrice: 139.00, baseCost: 65.00, returnRate: 0.03 },
  ];

  const customers = [
    { id: "CUST-8001", name: "Apex Technologies Corp" },
    { id: "CUST-8002", name: "Nordic Media Labs" },
    { id: "CUST-8003", name: "Bavaria Cloud Engineering" },
    { id: "CUST-8004", name: "Horizon Health Systems" },
    { id: "CUST-8005", name: "Pacific Rim Logistics" },
    { id: "CUST-8006", name: "Vanguard Wealth Analytics" },
    { id: "CUST-8007", name: "Thames Digital Partners" },
    { id: "CUST-8008", name: "Solaria Clean Energy" },
    { id: "CUST-8009", name: "Kyoto Robotics Studio" },
    { id: "CUST-8010", name: "Alpine Software AG" },
    { id: "CUST-8011", name: "Montreal Creative Agency" },
    { id: "CUST-8012", name: "Sydney Fintech Labs" },
    { id: "CUST-8013", name: "Lyon BioTech Research" },
    { id: "CUST-8014", name: "Rotterdam Shipping Group" },
    { id: "CUST-8015", name: "Stockholm Gaming Interactive" },
  ];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const reviewTemplates = [
    { rating: 5, sentiment: 'positive' as const, text: "Exceptional build quality and rock-solid performance across all workstations." },
    { rating: 5, sentiment: 'positive' as const, text: "Shipped ahead of schedule. Build standard exceeds enterprise expectations." },
    { rating: 4, sentiment: 'positive' as const, text: "Solid hardware with great ergonomics. Setup guide could be clearer for Mac users." },
    { rating: 4, sentiment: 'positive' as const, text: "Very good value for money. Reliable daily workhorse for our distributed team." },
    { rating: 3, sentiment: 'neutral' as const, text: "Average product quality. Packaging arrived slightly scuffed but device functions properly." },
    { rating: 3, sentiment: 'neutral' as const, text: "Functions as described. Cable length is somewhat short for executive standing setups." },
    { rating: 2, sentiment: 'negative' as const, text: "Delivery delayed by 12 days and logistics tracking was unresponsive during customs." },
    { rating: 1, sentiment: 'negative' as const, text: "Product quality issue: arm tension screw stripped within first week of operation." },
    { rating: 2, sentiment: 'negative' as const, text: "Severe delivery delay and customer service took 4 days to provide replacement parts." },
    { rating: 1, sentiment: 'negative' as const, text: "Price is excessively steep compared to the flimsy plastic finish on the bezel." },
  ];

  let orderSeq = 10001;

  // 24 months: 2024-01 to 2025-12
  const years = [2024, 2025];

  for (const year of years) {
    for (let m = 1; m <= 12; m++) {
      const monthStr = m < 10 ? `0${m}` : `${m}`;
      const yearMonth = `${year}-${monthStr}`;
      const monthLabel = `${monthNames[m - 1]} ${year}`;

      // Seasonal volume factor: Q4 spike (Nov/Dec), summer dip (Jul/Aug)
      let seasonMultiplier = 1.0;
      if (m === 11) seasonMultiplier = 1.35; // Nov
      if (m === 12) seasonMultiplier = 1.48; // Dec holiday surge
      if (m === 7 || m === 8) seasonMultiplier = 0.88; // summer lull
      if (year === 2025) seasonMultiplier *= 1.14; // Year-over-Year organic business growth

      // Number of orders per month: ~25-45
      const ordersInMonth = Math.round(30 * seasonMultiplier);

      for (let o = 0; o < ordersInMonth; o++) {
        orderSeq++;
        const day = Math.min(28, (o % 28) + 1);
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const orderDate = `${year}-${monthStr}-${dayStr}`;

        // Select country based on weights
        const cIndex = (o + m * 3 + (year % 2000)) % countries.length;
        const country = countries[cIndex];

        // Select product
        const pIndex = (o * 2 + m + orderSeq) % products.length;
        const prod = products[pIndex];

        // Select customer
        const custIndex = (o + cIndex * 2) % customers.length;
        const cust = customers[custIndex];

        // Quantity: mostly 1-12 units
        const quantity = ((orderSeq % 5) + 1) * (o % 3 === 0 ? 2 : 1);

        let unitPrice = prod.basePrice;
        let unitCost = prod.baseCost;

        // Apply realistic discount or freight cost pressure
        let discountPct = 0;
        if (m === 11 || m === 12) {
          discountPct = 0.10; // holiday promotion
        }

        // Loss risk scenario: If Germany and Ergonomic Chair, high return/shipping costs in late 2024
        if (prod.lossRiskCountry === country.name && (m >= 8 && m <= 11)) {
          unitCost = unitPrice * 1.08; // intentional negative margin
          discountPct = 0.15;
        }

        const discountedPrice = Math.round(unitPrice * (1 - discountPct) * 100) / 100;
        const revenue = Math.round(discountedPrice * quantity * 100) / 100;
        const cost = Math.round(unitCost * quantity * 100) / 100;
        const profit = Math.round((revenue - cost) * 100) / 100;
        const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;

        // Returns
        const isReturned = (orderSeq % 17 === 0);
        const returnStatus = isReturned ? 'Returned' : 'Delivered';

        // Reviews (some orders have reviews)
        let review_rating: number | undefined;
        let review_text: string | undefined;
        let review_sentiment: 'positive' | 'neutral' | 'negative' | undefined;

        if (orderSeq % 2 === 0) {
          const revTemplate = reviewTemplates[(orderSeq + m) % reviewTemplates.length];
          // If returned, skew negative
          if (isReturned) {
            review_rating = 1;
            review_sentiment = 'negative';
            review_text = "Return requested: item had manufacturing defects and shipping packaging was severely compromised.";
          } else {
            review_rating = revTemplate.rating;
            review_sentiment = revTemplate.sentiment;
            review_text = revTemplate.text;
          }
        }

        records.push({
          order_id: `ORD-${year}-${orderSeq}`,
          order_date: orderDate,
          year,
          month: m,
          month_name: monthLabel,
          year_month: yearMonth,
          country: country.name,
          region: country.region,
          product_id: prod.id,
          product_name: prod.name,
          category: prod.category,
          quantity,
          unit_price: discountedPrice,
          unit_cost: unitCost,
          revenue,
          cost,
          profit,
          profit_margin: profitMargin,
          customer_id: cust.id,
          customer_name: cust.name,
          review_rating,
          review_text,
          review_sentiment,
          return_status: returnStatus,
          discount_pct: Math.round(discountPct * 100)
        });
      }
    }
  }

  // Chronological sort guarantee
  return records.sort((a, b) => a.order_date.localeCompare(b.order_date));
}
