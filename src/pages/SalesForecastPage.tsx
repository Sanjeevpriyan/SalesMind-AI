/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Calendar,
  AlertCircle,
  HelpCircle,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { MonthlyMetric } from '../types/analytics';
import { computeSalesForecast } from '../utils/analyticsEngine';

interface SalesForecastPageProps {
  monthly: MonthlyMetric[];
}

export const SalesForecastPage: React.FC<SalesForecastPageProps> = ({ monthly }) => {
  const [horizonMonths, setHorizonMonths] = useState<number>(3);
  const [modelType, setModelType] = useState<'holt_winters' | 'moving_avg' | 'linear_trend'>('holt_winters');

  const { points, metrics } = useMemo(() => {
    return computeSalesForecast(monthly, horizonMonths, modelType);
  }, [monthly, horizonMonths, modelType]);

  const hasSufficientData = monthly.length >= 4;

  return (
    <div className="space-y-6">
      {/* Top Model Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        {/* Horizon selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#3867F5]" />
          <span className="text-xs font-bold text-[#172033] uppercase tracking-wider">
            Projection Horizon:
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg">
            {[
              { months: 1, label: 'Next Month' },
              { months: 3, label: 'Next 3 Months' },
              { months: 6, label: 'Next 6 Months' },
            ].map(h => (
              <button
                key={h.months}
                onClick={() => setHorizonMonths(h.months)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  horizonMonths === h.months
                    ? 'bg-white text-[#3867F5] shadow-xs'
                    : 'text-[#697586] hover:text-[#172033]'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm selector */}
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#697586]" />
          <span className="text-xs font-bold text-[#172033] uppercase tracking-wider">
            Model:
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-[#F7F9FC] border border-[#E7ECF3] rounded-lg">
            {[
              { id: 'holt_winters', label: 'Holt-Winters Smoothing' },
              { id: 'moving_avg', label: '3-Mo Moving Avg' },
              { id: 'linear_trend', label: 'Linear OLS' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setModelType(m.id as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  modelType === m.id
                    ? 'bg-white text-[#3867F5] shadow-xs'
                    : 'text-[#697586] hover:text-[#172033]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Performance Validation Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Active Forecasting Algorithm
          </div>
          <div className="text-sm font-bold text-[#3867F5] truncate">
            {metrics.modelName}
          </div>
          <p className="text-xs text-[#697586] mt-1">Evaluated across {metrics.dataPointsCount} periods</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Mean Absolute Error (MAE)
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono tabular-nums">
            ${metrics.mae.toLocaleString()}
          </div>
          <p className="text-xs text-[#697586] mt-1">Average absolute dollar deviation</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Root Mean Squared Error (RMSE)
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono tabular-nums">
            ${metrics.rmse.toLocaleString()}
          </div>
          <p className="text-xs text-[#697586] mt-1">Penalizes large variance spikes</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
          <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-1">
            Mean Abs % Error (MAPE)
          </div>
          <div className="text-2xl font-bold text-[#16A36A] font-mono tabular-nums">
            {metrics.mape}%
          </div>
          <p className="text-xs text-[#697586] mt-1">Cross-validation accuracy score</p>
        </div>
      </div>

      {/* Forecasting Chart Viewport */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#172033]">
              Actual Historical Sales vs Statistical Projection
            </h2>
            <p className="text-xs text-[#697586]">
              Solid blue line indicates realized sales · Dashed line indicates statistical forecast with 90% prediction intervals
            </p>
          </div>
        </div>

        {!hasSufficientData ? (
          <div className="p-12 text-center text-[#697586] space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="text-sm font-bold text-[#172033]">Insufficient Historical Depth</div>
            <p className="text-xs max-w-md mx-auto">
              Time-series forecasting requires a minimum of 4 chronological monthly observations to train statistical smoothing and regression weights.
            </p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#697586', fontSize: 10 }} axisLine={{ stroke: '#E7ECF3' }} />
                <YAxis
                  tick={{ fill: '#697586', fontSize: 10 }}
                  axisLine={{ stroke: '#E7ECF3' }}
                  tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [val !== null ? `$${Number(val).toLocaleString()}` : '-', name]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7ECF3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                {/* Shaded Prediction Interval Range */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  name="Upper 90% Bound"
                  stroke="none"
                  fill="#3867F5"
                  fillOpacity={0.08}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  name="Lower 90% Bound"
                  stroke="none"
                  fill="#FFFFFF"
                  fillOpacity={1}
                />

                {/* Actual Historicals (Solid Line) */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Historical Actual Sales"
                  stroke="#3867F5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3867F5' }}
                  connectNulls={false}
                />

                {/* Predicted Sales (Dashed Line) */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Forecasted Revenue"
                  stroke="#13B8A6"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#13B8A6' }}
                  connectNulls={true}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Forecast Projections Ledger */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-[#172033]">Forecast Horizon Ledger</h2>
          <p className="text-xs text-[#697586]">Exact projected values with bounded confidence intervals</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7ECF3] text-[#697586]">
                <th className="py-2.5 font-semibold">Period</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold text-right">Projected Revenue</th>
                <th className="py-2.5 font-semibold text-right">Lower Bound (90%)</th>
                <th className="py-2.5 font-semibold text-right">Upper Bound (90%)</th>
                <th className="py-2.5 font-semibold text-right">Spread Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {points.filter(p => p.isForecast).map(p => {
                const spread = (p.upperBound || 0) - (p.lowerBound || 0);
                return (
                  <tr key={p.period} className="hover:bg-[#F7F9FC]/60 transition-colors">
                    <td className="py-3 font-semibold text-[#172033]">
                      {p.period}
                    </td>
                    <td className="py-3">
                      <span className="text-[11px] font-semibold text-[#13B8A6] bg-teal-50 px-2 py-0.5 rounded">
                        Forecasted Estimate
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#172033] font-bold text-sm">
                      ${p.predicted?.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#697586]">
                      ${p.lowerBound?.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#697586]">
                      ${p.upperBound?.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#697586]">
                      &plusmn;${Math.round(spread / 2).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
