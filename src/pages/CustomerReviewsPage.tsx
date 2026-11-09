/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertCircle,
  Search,
  Filter,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { SalesRecord, ReviewTheme } from '../types/analytics';
import { computeReviewThemes } from '../utils/analyticsEngine';

interface CustomerReviewsPageProps {
  records: SalesRecord[];
}

export const CustomerReviewsPage: React.FC<CustomerReviewsPageProps> = ({ records }) => {
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');

  const { themes, ratingCounts, sentimentBreakdown, monthlySentiment } = useMemo(() => {
    return computeReviewThemes(records);
  }, [records]);

  // Review items with text or rating
  const reviewRecords = useMemo(() => {
    return records.filter(r => r.review_text || r.review_rating);
  }, [records]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviewRecords.filter(r => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const text = (r.review_text || "").toLowerCase();
        const prod = r.product_name.toLowerCase();
        const cust = (r.customer_name || "").toLowerCase();
        if (!text.includes(q) && !prod.includes(q) && !cust.includes(q)) {
          return false;
        }
      }

      if (sentimentFilter !== 'all') {
        if (sentimentFilter === 'positive' && (r.review_sentiment !== 'positive' && (r.review_rating || 0) < 4)) return false;
        if (sentimentFilter === 'negative' && (r.review_sentiment !== 'negative' && (r.review_rating || 5) > 2)) return false;
        if (sentimentFilter === 'neutral' && r.review_rating !== 3 && r.review_sentiment !== 'neutral') return false;
      }

      if (starFilter !== 'all') {
        if (r.review_rating !== starFilter) return false;
      }

      return true;
    });
  }, [reviewRecords, search, sentimentFilter, starFilter]);

  // Calculate average rating
  const avgRating = useMemo(() => {
    const valid = reviewRecords.filter(r => r.review_rating);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, r) => acc + (r.review_rating || 0), 0);
    return Math.round((sum / valid.length) * 10) / 10;
  }, [reviewRecords]);

  const SENTIMENT_COLORS = ['#16A36A', '#94A3B8', '#E65353'];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Total Customer Reviews
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono tabular-nums">
            {reviewRecords.length.toLocaleString()}
          </div>
          <p className="text-xs text-[#697586] mt-1">Verified purchaser feedback events</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Average Star Rating
          </div>
          <div className="text-2xl font-bold text-amber-500 font-mono tabular-nums flex items-center gap-1.5">
            <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            <span>{avgRating} / 5.0</span>
          </div>
          <p className="text-xs text-[#697586] mt-1">Customer satisfaction benchmark</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Positive Sentiment
          </div>
          <div className="text-2xl font-bold text-[#16A36A] font-mono tabular-nums">
            {sentimentBreakdown.find(s => s.sentiment === 'Positive')?.percentage || 0}%
          </div>
          <p className="text-xs text-[#697586] mt-1">4-star and 5-star commendations</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Negative / At-Risk Feedback
          </div>
          <div className="text-2xl font-bold text-[#E65353] font-mono tabular-nums">
            {sentimentBreakdown.find(s => s.sentiment === 'Negative')?.percentage || 0}%
          </div>
          <p className="text-xs text-[#697586] mt-1">1-star and 2-star feedback requiring action</p>
        </div>
      </div>

      {/* Sentiment & Rating Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution (1-5 stars) */}
        <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#172033]">Star Rating Distribution</h2>
            <p className="text-xs text-[#697586]">Breakdown from 1 star to 5 stars</p>
          </div>
          <div className="space-y-3 pt-2">
            {ratingCounts.map(rc => (
              <div key={rc.rating} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-[#172033] flex items-center gap-1">
                  {rc.rating} <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                </span>
                <div className="flex-1 h-3 bg-[#F7F9FC] rounded-full overflow-hidden border border-[#E7ECF3]">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${rc.percentage}%` }}
                  />
                </div>
                <span className="w-16 text-right font-mono tabular-nums text-[#697586]">
                  {rc.count} ({rc.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Common Complaint & Feedback Themes */}
        <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#172033]">NLP Categorized Themes</h2>
            <p className="text-xs text-[#697586]">Extracted via natural language keyword parsing</p>
          </div>
          <div className="space-y-3">
            {themes.map(t => (
              <div key={t.theme} className="p-3 rounded-lg bg-[#F7F9FC] border border-[#E7ECF3] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#172033]">{t.theme}</span>
                  <span className="font-mono tabular-nums font-semibold text-[#172033]">
                    {t.count} reviews ({t.percentage}%)
                  </span>
                </div>
                {t.sampleFeedback[0] && (
                  <p className="text-[11px] text-[#697586] italic truncate">
                    Sample: "{t.sampleFeedback[0]}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Callout */}
      <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-[#3867F5] mt-0.5" />
        <span>
          <strong>Data Governance Note:</strong> Customer complaints concerning product quality represent customer-reported feedback. In accordance with enterprise analytics standards, these are classified as user-reported sentiment rather than confirmed engineering defects unless physical QA laboratory inspection records exist.
        </span>
      </div>

      {/* Searchable Customer Review Log */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Customer Review Ledger</h2>
            <p className="text-xs text-[#697586]">Filter reviews by sentiment, star rating, or product</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#697586] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg text-[#172033] focus:outline-none focus:border-[#3867F5]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg text-xs">
              {['all', 'positive', 'neutral', 'negative'].map(s => (
                <button
                  key={s}
                  onClick={() => setSentimentFilter(s as any)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-all ${
                    sentimentFilter === s
                      ? 'bg-white text-[#3867F5] shadow-xs font-semibold'
                      : 'text-[#697586] hover:text-[#172033]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7ECF3] text-[#697586]">
                <th className="py-2.5 font-semibold">Date</th>
                <th className="py-2.5 font-semibold">Customer / Market</th>
                <th className="py-2.5 font-semibold">Product</th>
                <th className="py-2.5 font-semibold text-center">Rating</th>
                <th className="py-2.5 font-semibold">Customer Review Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredReviews.slice(0, 15).map((r, idx) => (
                <tr key={idx} className="hover:bg-[#F7F9FC]/60 transition-colors">
                  <td className="py-3 font-mono tabular-nums text-[#697586] whitespace-nowrap">
                    {r.order_date}
                  </td>
                  <td className="py-3 text-[#172033]">
                    <div className="font-semibold">{r.customer_name || r.customer_id}</div>
                    <div className="text-[11px] text-[#697586]">{r.country}</div>
                  </td>
                  <td className="py-3 font-medium text-[#172033] max-w-[180px] truncate">
                    {r.product_name}
                  </td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-500 font-mono tabular-nums">
                      {r.review_rating} <Star className="w-3 h-3 fill-amber-500" />
                    </span>
                  </td>
                  <td className="py-3 text-[#172033] max-w-md leading-relaxed">
                    "{r.review_text || 'No comment provided'}"
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
