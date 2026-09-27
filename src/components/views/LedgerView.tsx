import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { CashFlowLedgerEntry, LedgerCategory, LedgerType } from '../../types/erp';
import { formatCurrency } from '../../utils/formatters';
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Layers,
  Server,
  Code2,
  Cpu,
  Coffee,
} from 'lucide-react';

interface LedgerViewProps {
  onOpenNewLedger: () => void;
  onEditLedger: (entry: CashFlowLedgerEntry) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ onOpenNewLedger, onEditLedger }) => {
  const { ledger, deleteLedgerEntry, profile } = useErp();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract available months from ledger
  const availableMonths = Array.from(new Set(ledger.map((e) => e.date.slice(0, 7)))).sort().reverse();

  // Filter ledger
  const filteredLedger = ledger.filter((entry) => {
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
    const matchesMonth = selectedMonth === 'all' || entry.date.startsWith(selectedMonth);
    const matchesSearch =
      entry.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCategory && matchesMonth && matchesSearch;
  });

  // KPI Calculations in Base Currency (EGP)
  const totalInflowsEGP = filteredLedger
    .filter((e) => e.type === 'Inflow')
    .reduce((sum, e) => sum + e.baseAmount, 0);

  const totalOutflowsEGP = filteredLedger
    .filter((e) => e.type === 'Outflow')
    .reduce((sum, e) => sum + e.baseAmount, 0);

  const netCashFlowEGP = totalInflowsEGP - totalOutflowsEGP;

  // Category breakdown for Outflows
  const categoryTotals: Record<string, number> = {};
  filteredLedger
    .filter((e) => e.type === 'Outflow')
    .forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.baseAmount;
    });

  const getCategoryIcon = (cat: LedgerCategory) => {
    switch (cat) {
      case 'Hosting':
        return <Server className="w-3.5 h-3.5 text-blue-400" />;
      case 'Subscription':
        return <Code2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'Hardware':
        return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      case 'Overhead':
        return <Coffee className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  // Currency totals for inflows and outflows
  const inflowByCurrency: Record<string, number> = { USD: 0, EUR: 0, EGP: 0 };
  const outflowByCurrency: Record<string, number> = { USD: 0, EUR: 0, EGP: 0 };

  filteredLedger.forEach((e) => {
    if (e.type === 'Inflow') {
      inflowByCurrency[e.currency] = (inflowByCurrency[e.currency] || 0) + e.originalAmount;
    } else {
      outflowByCurrency[e.currency] = (outflowByCurrency[e.currency] || 0) + e.originalAmount;
    }
  });

  const inflowOriginalsText = [
    inflowByCurrency.USD > 0 ? formatCurrency(inflowByCurrency.USD, 'USD') : null,
    inflowByCurrency.EUR > 0 ? formatCurrency(inflowByCurrency.EUR, 'EUR') : null,
    inflowByCurrency.EGP > 0 ? formatCurrency(inflowByCurrency.EGP, 'EGP') : null,
  ].filter(Boolean).join(' · ');

  const outflowOriginalsText = [
    outflowByCurrency.USD > 0 ? formatCurrency(outflowByCurrency.USD, 'USD') : null,
    outflowByCurrency.EUR > 0 ? formatCurrency(outflowByCurrency.EUR, 'EUR') : null,
    outflowByCurrency.EGP > 0 ? formatCurrency(outflowByCurrency.EGP, 'EGP') : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Multi-Currency Cash Flow Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time transaction tracking with base currency conversion ({profile.baseCurrency}).
          </p>
        </div>

        <button
          onClick={onOpenNewLedger}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Transaction</span>
        </button>
      </div>

      {/* Financial KPIs Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Total Inflows (Base EGP)</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
              Aggregated
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5 tabular-nums">
            +{formatCurrency(totalInflowsEGP, 'EGP')}
          </div>
          <div className="text-xs text-slate-300 font-mono mt-1 font-medium truncate">
            {inflowOriginalsText || 'No inflows recorded'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
            {filteredLedger.filter((e) => e.type === 'Inflow').length} inflow transactions
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Total Outflows (Base EGP)</span>
            </div>
            <span className="text-[10px] font-mono text-rose-400/80 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/40">
              Aggregated
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1.5 tabular-nums">
            -{formatCurrency(totalOutflowsEGP, 'EGP')}
          </div>
          <div className="text-xs text-slate-300 font-mono mt-1 font-medium truncate">
            {outflowOriginalsText || 'No outflows recorded'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
            {filteredLedger.filter((e) => e.type === 'Outflow').length} expense transactions
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Net Period Margin (EGP)</span>
            </div>
            <span className="text-[10px] font-mono text-blue-400/80 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-800/40">
              Inflows - Outflows
            </span>
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-1.5 tabular-nums ${
              netCashFlowEGP >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {netCashFlowEGP >= 0 ? '+' : ''}
            {formatCurrency(netCashFlowEGP, 'EGP')}
          </div>
          <div className="text-xs text-slate-300 font-mono mt-1 font-medium">
            {netCashFlowEGP >= 0 ? 'Net Cash Positive' : 'Deficit / Investment Mode'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Unified in EGP base currency
          </div>
        </div>
      </div>

      {/* Category Expenses Breakdown Ribbon */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
          Expense Category Breakdown (Active Filter)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-md">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>Hosting & Cloud</span>
            </div>
            <div className="font-mono font-bold text-slate-200">
              {formatCurrency(categoryTotals['Hosting'] || 0, 'EGP')}
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-md">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>SaaS Subscriptions</span>
            </div>
            <div className="font-mono font-bold text-slate-200">
              {formatCurrency(categoryTotals['Subscription'] || 0, 'EGP')}
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-md">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Hardware & Gear</span>
            </div>
            <div className="font-mono font-bold text-slate-200">
              {formatCurrency(categoryTotals['Hardware'] || 0, 'EGP')}
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-md">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Coffee className="w-3.5 h-3.5 text-orange-400" />
              <span>Workspace & Overhead</span>
            </div>
            <div className="font-mono font-bold text-slate-200">
              {formatCurrency(categoryTotals['Overhead'] || 0, 'EGP')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-lg">
        {/* Segmented Type controls */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              typeFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Flows ({ledger.length})
          </button>
          <button
            onClick={() => setTypeFilter('Inflow')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              typeFilter === 'Inflow'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Inflows</span>
          </button>
          <button
            onClick={() => setTypeFilter('Outflow')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              typeFilter === 'Outflow'
                ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Outflows</span>
          </button>
        </div>

        {/* Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-2 flex-1 sm:max-w-xl justify-end">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Client Payment">Client Payment</option>
            <option value="Hosting">Hosting</option>
            <option value="Subscription">Subscription</option>
            <option value="Hardware">Hardware</option>
            <option value="Overhead">Overhead</option>
          </select>

          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description..."
              className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* High Density Ledger Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60 font-mono text-[11px]">
              <th className="py-3 px-4 font-medium uppercase tracking-wider">Date</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider">Category</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider">Memo / Notes</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Original Currency</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">FX Rate</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Base Amount (EGP)</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredLedger.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                  No transaction records match the current filters.
                </td>
              </tr>
            ) : (
              filteredLedger.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                  {/* Date */}
                  <td className="py-3 px-4 text-slate-300 font-semibold">{tx.date}</td>

                  {/* Type */}
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                        tx.type === 'Inflow'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                          : 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                      }`}
                    >
                      {tx.type === 'Inflow' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {tx.type}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 font-sans text-slate-300">
                    <div className="flex items-center gap-1.5">
                      {getCategoryIcon(tx.category)}
                      <span>{tx.category}</span>
                    </div>
                  </td>

                  {/* Memo */}
                  <td className="py-3 px-4 font-sans text-slate-200 max-w-xs truncate">
                    {tx.notes}
                  </td>

                  {/* Original Amount */}
                  <td
                    className={`py-3 px-4 text-right font-semibold ${
                      tx.type === 'Inflow' ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {tx.type === 'Inflow' ? '+' : '-'}
                    {formatCurrency(tx.originalAmount, tx.currency)}
                  </td>

                  {/* FX Rate */}
                  <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                    {tx.currency !== 'EGP' ? `@ ${tx.exchangeRate.toFixed(2)}` : '1.00'}
                  </td>

                  {/* Base Amount */}
                  <td
                    className={`py-3 px-4 text-right font-bold text-sm ${
                      tx.type === 'Inflow' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.type === 'Inflow' ? '+' : '-'}
                    {formatCurrency(tx.baseAmount, 'EGP')}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right font-sans">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditLedger(tx)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete transaction "${tx.notes}"?`)) {
                            deleteLedgerEntry(tx.id);
                          }
                        }}
                        className="p-1.5 text-slate-600 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
