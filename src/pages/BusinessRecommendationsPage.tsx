/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lightbulb,
  Sliders,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Percent,
  DollarSign,
  RotateCcw,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { RecommendationItem, ExecutiveKPIs } from '../types/analytics';
import { simulateWhatIf } from '../utils/analyticsEngine';

interface BusinessRecommendationsPageProps {
  recommendations: RecommendationItem[];
  kpis: ExecutiveKPIs;
}

export const BusinessRecommendationsPage: React.FC<BusinessRecommendationsPageProps> = ({
  recommendations,
  kpis
}) => {
  // What-If Simulator state
  const [salesGrowth, setSalesGrowth] = useState<number>(10);
  const [costReduction, setCostReduction] = useState<number>(5);
  const [discountAdjustment, setDiscountAdjustment] = useState<number>(0);

  const simulation = simulateWhatIf(kpis, salesGrowth, costReduction, discountAdjustment);

  const PRIORITY_BADGES = {
    High: 'text-[#E65353] bg-rose-50 border-rose-200',
    Medium: 'text-amber-700 bg-amber-50 border-amber-200',
    Low: 'text-[#3867F5] bg-blue-50 border-blue-200'
  };

  return (
    <div className="space-y-6">
      {/* What-If Financial Scenario Simulator */}
      <div className="p-6 bg-white rounded-xl border border-[#3867F5]/30 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7ECF3]">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#3867F5]" />
              <h2 className="text-base font-bold text-[#172033]">
                Executive What-If Financial Scenario Simulator
              </h2>
            </div>
            <p className="text-xs text-[#697586]">
              Simulate enterprise financial impact of price shifts, cost-saving initiatives, and volume growth
            </p>
          </div>

          <button
            onClick={() => {
              setSalesGrowth(10);
              setCostReduction(5);
              setDiscountAdjustment(0);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#697586] hover:text-[#172033] bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sales Volume Growth */}
          <div className="p-4 bg-[#F7F9FC] rounded-xl border border-[#E7ECF3] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#172033]">
                Sales Volume Growth (%)
              </label>
              <span className="text-xs font-mono tabular-nums font-bold text-[#3867F5]">
                {salesGrowth > 0 ? `+${salesGrowth}%` : `${salesGrowth}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="50"
              step="1"
              value={salesGrowth}
              onChange={e => setSalesGrowth(parseInt(e.target.value, 10))}
              className="w-full accent-[#3867F5]"
            />
            <div className="flex justify-between text-[11px] text-[#697586]">
              <span>-20% contraction</span>
              <span>Baseline</span>
              <span>+50% scale</span>
            </div>
          </div>

          {/* Cost Reduction */}
          <div className="p-4 bg-[#F7F9FC] rounded-xl border border-[#E7ECF3] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#172033]">
                Cost / Procurement Savings (%)
              </label>
              <span className="text-xs font-mono tabular-nums font-bold text-[#16A36A]">
                {costReduction}% savings
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={costReduction}
              onChange={e => setCostReduction(parseInt(e.target.value, 10))}
              className="w-full accent-[#16A36A]"
            />
            <div className="flex justify-between text-[11px] text-[#697586]">
              <span>0% no change</span>
              <span>10% supplier target</span>
              <span>25% re-engineering</span>
            </div>
          </div>

          {/* Discount Policy Shift */}
          <div className="p-4 bg-[#F7F9FC] rounded-xl border border-[#E7ECF3] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#172033]">
                Discount / Price Shift (%)
              </label>
              <span className="text-xs font-mono tabular-nums font-bold text-amber-600">
                {discountAdjustment > 0 ? `+${discountAdjustment}% discount` : `${discountAdjustment}% price raise`}
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="15"
              step="1"
              value={discountAdjustment}
              onChange={e => setDiscountAdjustment(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-[#697586]">
              <span>-10% price raise</span>
              <span>0% current</span>
              <span>+15% promo</span>
            </div>
          </div>
        </div>

        {/* Projected Simulation Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <span className="text-xs font-semibold text-[#697586] uppercase tracking-wider">
              Simulated Revenue
            </span>
            <div className="text-xl font-bold font-mono tabular-nums text-[#172033] mt-1">
              ${simulation.simRevenue.toLocaleString()}
            </div>
            <div className="text-xs font-semibold mt-1 text-[#3867F5]">
              {simulation.revenueDelta >= 0 ? `+$${simulation.revenueDelta.toLocaleString()}` : `-$${Math.abs(simulation.revenueDelta).toLocaleString()}`} variance
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-[#697586] uppercase tracking-wider">
              Simulated COGS
            </span>
            <div className="text-xl font-bold font-mono tabular-nums text-[#172033] mt-1">
              ${simulation.simCost.toLocaleString()}
            </div>
            <div className="text-xs text-[#697586] mt-1">
              Based on {costReduction}% procurement savings
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-xs font-semibold text-[#697586] uppercase tracking-wider">
              Simulated Profit
            </span>
            <div className="text-xl font-bold font-mono tabular-nums text-[#16A36A] mt-1">
              ${simulation.simProfit.toLocaleString()}
            </div>
            <div className="text-xs font-semibold mt-1 text-[#16A36A]">
              {simulation.profitDelta >= 0 ? `+$${simulation.profitDelta.toLocaleString()}` : `-$${Math.abs(simulation.profitDelta).toLocaleString()}`} net lift
            </div>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100">
            <span className="text-xs font-semibold text-[#697586] uppercase tracking-wider">
              Simulated Margin %
            </span>
            <div className="text-xl font-bold font-mono tabular-nums text-[#13B8A6] mt-1">
              {simulation.simMargin}%
            </div>
            <div className="text-xs font-semibold mt-1 text-[#13B8A6]">
              {simulation.marginDelta >= 0 ? `+${simulation.marginDelta}%` : `${simulation.marginDelta}%`} pts vs actual
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg text-xs text-[#697586] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 text-[#3867F5]" />
          <span>
            <strong>Simulation Governance:</strong> Results displayed in this simulator represent mathematical sensitivity projections based on active filters, not actual historical performance.
          </span>
        </div>
      </div>

      {/* Strategic Action Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#172033]">
              Grounded Strategic Recommendations
            </h2>
            <p className="text-xs text-[#697586]">
              Prioritized operational actions generated strictly from patterns detected in the active dataset
            </p>
          </div>
          <span className="text-xs font-semibold text-[#697586]">
            {recommendations.length} Active Directives
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-12 text-center text-[#697586] bg-white rounded-xl border border-[#E7ECF3]">
            No anomalies or critical risks identified for the current filter selection.
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map(rec => (
              <div
                key={rec.id}
                className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs space-y-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7ECF3]">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${PRIORITY_BADGES[rec.priority]}`}>
                      {rec.priority} Priority
                    </span>
                    <h3 className="text-sm font-bold text-[#172033]">{rec.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#697586]">{rec.id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Finding */}
                  <div className="space-y-1">
                    <div className="font-bold text-[#172033] uppercase tracking-wider text-[11px]">
                      Analytical Finding
                    </div>
                    <p className="text-[#697586] leading-relaxed">{rec.finding}</p>
                  </div>

                  {/* Evidence */}
                  <div className="space-y-1">
                    <div className="font-bold text-[#172033] uppercase tracking-wider text-[11px]">
                      Dataset Evidence
                    </div>
                    <p className="text-[#697586] leading-relaxed">{rec.evidence}</p>
                  </div>

                  {/* Impact */}
                  <div className="space-y-1">
                    <div className="font-bold text-[#172033] uppercase tracking-wider text-[11px]">
                      Financial Impact
                    </div>
                    <p className="text-[#697586] leading-relaxed">{rec.businessImpact}</p>
                  </div>
                </div>

                {/* Suggested Action */}
                <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-lg flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3867F5] mt-0.5" />
                  <div>
                    <span className="font-bold text-[#3867F5]">Suggested Strategic Action: </span>
                    <span className="text-[#172033] font-medium leading-relaxed">{rec.suggestedAction}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
