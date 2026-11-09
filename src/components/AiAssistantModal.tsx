/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2, TrendingUp, AlertTriangle, Lightbulb, FileText } from 'lucide-react';
import { ExecutiveKPIs, CountryMetric, ProductMetric, MonthlyMetric } from '../types/analytics';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetContext: {
    kpis: ExecutiveKPIs;
    countries: CountryMetric[];
    products: ProductMetric[];
    monthly: MonthlyMetric[];
  };
}

interface AssistantResponse {
  answer?: string;
  figures?: string;
  evidence?: string;
  action?: string;
  rawText?: string;
  source?: string;
}

const PRESET_QUESTIONS = [
  "Which country generated the highest profit?",
  "Which products are generating net financial losses?",
  "Why did profit or margins decline in certain periods?",
  "What are the most common customer complaints?",
  "What sales performance can we expect next month?"
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  datasetContext
}) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: {
            kpis: datasetContext.kpis,
            topCountries: datasetContext.countries.slice(0, 5),
            bottomCountries: datasetContext.countries.slice(-3),
            lossProducts: datasetContext.products.filter(p => p.profit < 0),
            topProducts: datasetContext.products.slice(0, 5),
            monthly: datasetContext.monthly.slice(-6)
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      console.warn("AI Assistant request failed:", err);
      setError("Unable to connect to AI server. Please verify your connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E7ECF3] flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7ECF3] bg-gradient-to-r from-blue-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3867F5] text-white flex items-center justify-center shadow-sm shadow-[#3867F5]/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172033]">SalesMind AI Business Analyst</h3>
              <p className="text-xs text-[#697586]">Grounded dataset analysis & strategic executive consultation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#697586] hover:text-[#172033] hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Prompts */}
          <div>
            <div className="text-xs font-semibold text-[#697586] uppercase tracking-wider mb-2">
              Suggested Business Queries
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_QUESTIONS.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(pq);
                    handleAsk(pq);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#E7ECF3] bg-[#F7F9FC] text-[#172033] hover:border-[#3867F5] hover:text-[#3867F5] hover:bg-white transition-all text-left"
                >
                  {pq}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-[#697586] space-y-3">
              <Loader2 className="w-8 h-8 text-[#3867F5] animate-spin" />
              <div className="text-xs font-medium">Synthesizing dataset metrics & root causes...</div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Response Container */}
          {response && !loading && (
            <div className="space-y-4">
              {/* If rawText returned */}
              {response.rawText ? (
                <div className="p-5 rounded-xl bg-[#F7F9FC] border border-[#E7ECF3] text-sm text-[#172033] whitespace-pre-line leading-relaxed">
                  {response.rawText}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Direct Answer */}
                  {response.answer && (
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#3867F5] uppercase tracking-wider mb-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Executive Summary</span>
                      </div>
                      <div className="text-sm font-semibold text-[#172033] leading-snug">
                        {response.answer}
                      </div>
                    </div>
                  )}

                  {/* Relevant Figures */}
                  {response.figures && (
                    <div className="p-4 rounded-xl bg-white border border-[#E7ECF3]">
                      <div className="text-xs font-bold text-[#697586] uppercase tracking-wider mb-2">
                        Key Grounded Figures
                      </div>
                      <div className="text-xs text-[#172033] whitespace-pre-line font-mono tabular-nums leading-relaxed">
                        {response.figures}
                      </div>
                    </div>
                  )}

                  {/* Supporting Evidence */}
                  {response.evidence && (
                    <div className="p-4 rounded-xl bg-white border border-[#E7ECF3]">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#697586] uppercase tracking-wider mb-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Dataset Evidence</span>
                      </div>
                      <div className="text-xs text-[#697586] leading-relaxed">
                        {response.evidence}
                      </div>
                    </div>
                  )}

                  {/* Suggested Action */}
                  {response.action && (
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#16A36A] uppercase tracking-wider mb-1">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Recommended Business Action</span>
                      </div>
                      <div className="text-xs text-[#172033] leading-relaxed">
                        {response.action}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Source Footnote */}
              <div className="flex items-center justify-between text-[11px] text-[#697586] pt-2 border-t border-[#E7ECF3]">
                <span>Engine: {response.source || 'SalesMind BI Analytics'}</span>
                <span>Calculations strictly derived from active dataset</span>
              </div>
            </div>
          )}

          {!response && !loading && !error && (
            <div className="text-center py-8 text-[#697586] text-xs">
              Select one of the suggested business queries above or type your own question below.
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#E7ECF3] bg-[#F7F9FC]">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question about sales, products, countries, or profits..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-white border border-[#E7ECF3] rounded-xl text-[#172033] placeholder-[#697586] focus:outline-none focus:border-[#3867F5] focus:ring-1 focus:ring-[#3867F5]"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#3867F5] hover:bg-[#2e57d8] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-[#3867F5]/20 transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Analyze</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
