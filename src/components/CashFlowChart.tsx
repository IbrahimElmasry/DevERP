import React, { useState } from 'react';
import { CashFlowLedgerEntry, DeveloperProfile } from '../types/erp';
import { formatCurrency } from '../utils/formatters';

interface CashFlowChartProps {
  ledger: CashFlowLedgerEntry[];
  profile: DeveloperProfile;
}

interface MonthlyData {
  monthKey: string; // YYYY-MM
  label: string; // e.g. "Aug 2026"
  inflow: number;
  outflow: number;
  net: number;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ ledger }) => {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyData | null>(null);
  const [viewMonthsCount, setViewMonthsCount] = useState<number>(6);

  // Group ledger items by month (using baseAmount in EGP)
  const monthlyMap: Record<string, { inflow: number; outflow: number }> = {};

  // Build last N months array
  const months: string[] = [];
  const now = new Date();
  for (let i = viewMonthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${yyyy}-${mm}`;
    months.push(key);
    monthlyMap[key] = { inflow: 0, outflow: 0 };
  }

  // Populate from ledger
  ledger.forEach((tx) => {
    const txMonth = tx.date.slice(0, 7);
    if (monthlyMap[txMonth]) {
      if (tx.type === 'Inflow') {
        monthlyMap[txMonth].inflow += tx.baseAmount;
      } else {
        monthlyMap[txMonth].outflow += tx.baseAmount;
      }
    }
  });

  const chartData: MonthlyData[] = months.map((mKey) => {
    const [year, month] = mKey.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, 1);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const inflow = monthlyMap[mKey].inflow;
    const outflow = monthlyMap[mKey].outflow;
    return {
      monthKey: mKey,
      label,
      inflow,
      outflow,
      net: inflow - outflow,
    };
  });

  // Calculate scaling max
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.inflow, d.outflow)),
    10000
  );

  const totalInflows = chartData.reduce((acc, d) => acc + d.inflow, 0);
  const totalOutflows = chartData.reduce((acc, d) => acc + d.outflow, 0);
  const netMargin = totalInflows - totalOutflows;

  // Chart SVG dimensions
  const chartHeight = 180;
  const barWidth = 14;
  const groupGap = 52;
  const paddingX = 40;
  const totalWidth = paddingX * 2 + chartData.length * groupGap;

  return (
    <div className="bg-[#111827] border border-slate-800/90 rounded-lg p-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Cash Flow Momentum (Base: EGP)
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              Inflow ({formatCurrency(totalInflows, 'EGP')})
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              Outflow ({formatCurrency(totalOutflows, 'EGP')})
            </span>
            <span className="text-slate-600">·</span>
            <span className={`font-mono font-medium ${netMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Net: {formatCurrency(netMargin, 'EGP')}
            </span>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setViewMonthsCount(4)}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              viewMonthsCount === 4 ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4 Months
          </button>
          <button
            onClick={() => setViewMonthsCount(6)}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              viewMonthsCount === 6 ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            6 Months
          </button>
          <button
            onClick={() => setViewMonthsCount(12)}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              viewMonthsCount === 12 ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative overflow-x-auto pb-2">
        <svg
          viewBox={`0 0 ${totalWidth} ${chartHeight + 35}`}
          className="w-full h-56 select-none"
          style={{ minWidth: `${totalWidth}px` }}
        >
          {/* Subtle Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight - ratio * chartHeight + 10;
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={totalWidth - paddingX}
                  y2={y}
                  stroke="#1f2937"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#64748b"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {Math.round((maxVal * ratio) / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {chartData.map((d, idx) => {
            const centerX = paddingX + idx * groupGap + groupGap / 2;
            const inflowHeight = (d.inflow / maxVal) * chartHeight;
            const outflowHeight = (d.outflow / maxVal) * chartHeight;

            const inflowY = chartHeight - inflowHeight + 10;
            const outflowY = chartHeight - outflowHeight + 10;

            const isHovered = hoveredMonth?.monthKey === d.monthKey;

            return (
              <g
                key={d.monthKey}
                onMouseEnter={() => setHoveredMonth(d)}
                onMouseLeave={() => setHoveredMonth(null)}
                className="cursor-pointer"
              >
                {/* Hover Background Zone */}
                <rect
                  x={centerX - groupGap / 2 + 2}
                  y={5}
                  width={groupGap - 4}
                  height={chartHeight + 30}
                  fill={isHovered ? 'rgba(30, 41, 59, 0.4)' : 'transparent'}
                  rx="4"
                />

                {/* Inflow Bar (Emerald) */}
                <rect
                  x={centerX - barWidth - 1}
                  y={inflowY}
                  width={barWidth}
                  height={Math.max(inflowHeight, 2)}
                  fill="#10b981"
                  rx="2"
                  className="transition-all duration-200"
                />

                {/* Outflow Bar (Rose) */}
                <rect
                  x={centerX + 1}
                  y={outflowY}
                  width={barWidth}
                  height={Math.max(outflowHeight, 2)}
                  fill="#f43f5e"
                  rx="2"
                  className="transition-all duration-200"
                />

                {/* Month Label */}
                <text
                  x={centerX}
                  y={chartHeight + 25}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isHovered ? '#f8fafc' : '#94a3b8'}
                  fontWeight={isHovered ? '600' : '400'}
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Details Card */}
        {hoveredMonth && (
          <div className="absolute top-2 right-4 bg-slate-900 border border-slate-700/80 shadow-xl rounded-md p-3 text-xs z-10 pointer-events-none min-w-[190px]">
            <div className="font-semibold text-slate-200 pb-1.5 mb-1.5 border-b border-slate-800">
              {hoveredMonth.label} Breakdown
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400">Total Inflow:</span>
              <span className="font-mono text-emerald-400 font-medium">
                {formatCurrency(hoveredMonth.inflow, 'EGP')}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400">Total Outflow:</span>
              <span className="font-mono text-rose-400 font-medium">
                {formatCurrency(hoveredMonth.outflow, 'EGP')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1.5 mt-1 border-t border-slate-800 font-semibold">
              <span className="text-slate-300">Net Month:</span>
              <span
                className={`font-mono ${
                  hoveredMonth.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(hoveredMonth.net, 'EGP')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
