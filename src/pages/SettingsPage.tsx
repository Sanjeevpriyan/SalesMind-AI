/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Settings,
  HelpCircle,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { DataQualityReport } from '../types/analytics';
import { parseCSVFile, generateSampleCsvTemplate } from '../utils/dataParser';
import { generateSampleDataset } from '../data/sampleDataset';

interface SettingsPageProps {
  qualityReport: DataQualityReport;
  isSyntheticData: boolean;
  onDatasetReplaced: (records: any[], report: DataQualityReport, isSynthetic: boolean) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  qualityReport,
  isSyntheticData,
  onDatasetReplaced
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text || text.trim().length === 0) {
          throw new Error("Uploaded file is empty");
        }

        const { records, report } = parseCSVFile(text);
        if (records.length === 0) {
          throw new Error("No valid transaction rows found. Please check date and numeric formatting.");
        }

        onDatasetReplaced(records, report, false);
        setUploadSuccess(`Successfully ingested and validated ${records.length.toLocaleString()} sales records!`);
      } catch (err: any) {
        console.error("CSV parse error:", err);
        setUploadError(err.message || "Failed to process CSV file.");
      }
    };
    reader.onerror = () => {
      setUploadError("Error reading local file from filesystem.");
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const template = generateSampleCsvTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'salesmind_dataset_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetToDemo = () => {
    const demo = generateSampleDataset();
    const report: DataQualityReport = {
      totalRows: demo.length,
      validRows: demo.length,
      invalidRows: 0,
      duplicateRows: 0,
      missingCostCount: 0,
      missingReviewCount: 0,
      dateRange: { min: '2024-01-01', max: '2025-12-31' },
      detectedColumns: {
        order_date: 'order_date',
        country: 'country',
        product_name: 'product_name',
        revenue: 'revenue',
        cost: 'cost',
        profit: 'profit'
      },
      warnings: []
    };
    onDatasetReplaced(demo, report, true);
    setUploadSuccess("Restored full 24-month synthetic benchmark dataset.");
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone & Actions */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7ECF3]">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Dataset Ingestion & Validation</h2>
            <p className="text-xs text-[#697586]">
              Upload your custom enterprise sales records in CSV format or explore with the benchmark dataset
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#172033] bg-[#F7F9FC] border border-[#E7ECF3] hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-[#697586]" />
              <span>Download CSV Template</span>
            </button>

            <button
              onClick={handleResetToDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3867F5] bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo Benchmark</span>
            </button>
          </div>
        </div>

        {/* Upload Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#cbd5e1] hover:border-[#3867F5] bg-[#F7F9FC] hover:bg-blue-50/30 rounded-xl p-8 text-center cursor-pointer transition-all space-y-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#3867F5] flex items-center justify-center mx-auto">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-[#172033]">
            Click to upload custom sales dataset
          </div>
          <p className="text-xs text-[#697586] max-w-sm mx-auto">
            Supports CSV files containing Order Date, Product, Country, Quantity, Unit Price, Cost, and Customer details.
          </p>
        </div>

        {/* Alerts */}
        {uploadSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A36A]" />
            <span>{uploadSuccess}</span>
          </div>
        )}
        {uploadError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#E65353]" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Data Quality Report */}
      <div className="p-6 bg-white rounded-xl border border-[#E7ECF3] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF3]">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Data Quality & Health Report</h2>
            <p className="text-xs text-[#697586]">Automated integrity checks on current active dataset</p>
          </div>
          <span className="text-xs font-semibold text-[#16A36A] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Integrity Verified</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#E7ECF3]">
            <span className="text-xs text-[#697586]">Valid Processed Rows</span>
            <div className="text-xl font-bold font-mono tabular-nums text-[#172033] mt-1">
              {qualityReport.validRows.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#E7ECF3]">
            <span className="text-xs text-[#697586]">Excluded Invalid Dates</span>
            <div className="text-xl font-bold font-mono tabular-nums text-[#697586] mt-1">
              {qualityReport.invalidRows}
            </div>
          </div>
          <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#E7ECF3]">
            <span className="text-xs text-[#697586]">Duplicate Orders Handled</span>
            <div className="text-xl font-bold font-mono tabular-nums text-[#697586] mt-1">
              {qualityReport.duplicateRows}
            </div>
          </div>
          <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#E7ECF3]">
            <span className="text-xs text-[#697586]">Date Timeframe Range</span>
            <div className="text-xs font-bold font-mono text-[#172033] mt-1.5">
              {qualityReport.dateRange.min} &rarr; {qualityReport.dateRange.max}
            </div>
          </div>
        </div>

        {/* Warnings List */}
        {qualityReport.warnings.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
            <div className="font-bold text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Data Ingestion Observations</span>
            </div>
            <ul className="list-disc list-inside text-amber-700 space-y-0.5">
              {qualityReport.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Detected Column Mapping */}
        <div>
          <div className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
            Automated Column Header Mapping
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
            {Object.entries(qualityReport.detectedColumns).map(([field, rawCol]) => (
              <div key={field} className="p-2 rounded-lg bg-[#F7F9FC] border border-[#E7ECF3] flex flex-col">
                <span className="text-[#697586] text-[10px] font-mono">{field}</span>
                <span className="font-semibold text-[#172033] truncate">&rarr; {rawCol}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
