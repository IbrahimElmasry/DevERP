import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Invoice, InvoiceStatus } from '../../types/erp';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportInvoicePDF } from '../../utils/pdfGenerator';
import {
  FileText,
  Plus,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Send,
  AlertTriangle,
} from 'lucide-react';

interface InvoicesViewProps {
  onOpenNewInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  onOpenNewInvoice,
  onEditInvoice,
  onViewInvoice,
}) => {
  const { invoices, clients, profile, deleteInvoice, markInvoiceStatus } = useErp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status counters
  const draftCount = invoices.filter((i) => i.status === 'Draft').length;
  const sentCount = invoices.filter((i) => i.status === 'Sent').length;
  const paidCount = invoices.filter((i) => i.status === 'Paid').length;
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;

  // Outstanding in EGP
  const totalReceivablesEGP = invoices
    .filter((i) => i.status === 'Sent' || i.status === 'Overdue')
    .reduce((sum, i) => sum + i.total * (i.exchangeRateToLocal || profile.exchangeRates[i.currency] || 1), 0);

  // Total collected in EGP
  const totalCollectedEGP = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + i.total * (i.exchangeRateToLocal || profile.exchangeRates[i.currency] || 1), 0);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const client = clients.find((c) => c.id === inv.clientId);
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesClient = clientFilter === 'all' || inv.clientId === clientFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client?.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesClient && matchesSearch;
  });

  const statusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-emerald-950/50 text-emerald-400 border-emerald-800/40">
            Paid
          </span>
        );
      case 'Sent':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-blue-950/50 text-blue-400 border-blue-800/40">
            Sent
          </span>
        );
      case 'Overdue':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-rose-950/60 text-rose-400 border-rose-800/50 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-slate-800 text-slate-400 border-slate-700">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Invoices & Billing Terminal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deliverable invoice generation, locked FX exchange records, and PDF exports.
          </p>
        </div>

        <button
          onClick={onOpenNewInvoice}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Invoice</span>
        </button>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium">Outstanding Receivables</div>
          <div className="text-lg font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {formatCurrency(totalReceivablesEGP, 'EGP')}
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
            {sentCount + overdueCount} unpaid invoices
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium">Collected Revenue</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatCurrency(totalCollectedEGP, 'EGP')}
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
            {paidCount} settled invoices
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium">Overdue Invoices</div>
          <div className={`text-lg font-bold font-mono mt-1 tabular-nums ${overdueCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {overdueCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Past client payment terms</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium">Draft Pipeline</div>
          <div className="text-lg font-bold font-mono text-slate-300 mt-1 tabular-nums">
            {draftCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending client dispatch</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-lg">
        {/* Status segment buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter('Draft')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'Draft' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Draft ({draftCount})
          </button>
          <button
            onClick={() => setStatusFilter('Sent')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'Sent' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sent ({sentCount})
          </button>
          <button
            onClick={() => setStatusFilter('Paid')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'Paid' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paid ({paidCount})
          </button>
          <button
            onClick={() => setStatusFilter('Overdue')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'Overdue' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overdue ({overdueCount})
          </button>
        </div>

        {/* Search & Client Filter */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-md justify-end">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice # or client..."
              className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Invoices High-Density Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60 font-mono text-[11px]">
              <th className="py-3 px-4 font-medium uppercase tracking-wider">Invoice #</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider">Client & Company</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider">Dates</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Amount (Billed)</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Base Equiv (EGP)</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider text-center">Status</th>
              <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                  No invoices match your active filters.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const client = clients.find((c) => c.id === inv.clientId);
                const rate = inv.exchangeRateToLocal || profile.exchangeRates[inv.currency] || 1;
                const convertedEGP = inv.total * rate;

                return (
                  <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Invoice # */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="hover:underline hover:text-emerald-400 text-left cursor-pointer"
                      >
                        {inv.invoiceNumber}
                      </button>
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-medium text-slate-200">{client?.company || 'Client'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{client?.name}</div>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div>Issued: {inv.issueDate}</div>
                      <div className={inv.status === 'Overdue' ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
                        Due: {inv.dueDate}
                      </div>
                    </td>

                    {/* Amount Billed */}
                    <td className="py-3.5 px-4 text-right text-slate-100 font-semibold text-sm">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>

                    {/* Base Equivalent */}
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      <div>{formatCurrency(convertedEGP, 'EGP')}</div>
                      {inv.currency !== 'EGP' && (
                        <div className="text-[10px] text-slate-500">
                          @ {rate.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {statusBadge(inv.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Preview Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => exportInvoicePDF(inv, client, profile)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => markInvoiceStatus(inv.id, 'Paid')}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {inv.status === 'Draft' && (
                          <button
                            onClick={() => markInvoiceStatus(inv.id, 'Sent')}
                            className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Mark as Sent"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                              deleteInvoice(inv.id);
                            }
                          }}
                          className="p-1.5 text-slate-600 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
