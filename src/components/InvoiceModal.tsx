import React, { useState, useEffect } from 'react';
import {
  Invoice,
  Client,
  Project,
  DeveloperProfile,
  InvoiceItem,
  Currency,
  InvoiceStatus,
  Milestone,
} from '../types/erp';
import { X, Plus, Trash2, ArrowRight } from 'lucide-react';
import { generateUUID, formatCurrency } from '../utils/formatters';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Omit<Invoice, 'id'>) => Invoice;
  clients: Client[];
  projects: Project[];
  profile: DeveloperProfile;
  initialData?: Invoice | null;
  preselectedMilestone?: { project: Project; milestone: Milestone } | null;
  onPreviewCreated?: (invoice: Invoice) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  projects,
  profile,
  initialData,
  preselectedMilestone,
  onPreviewCreated,
}) => {
  const [clientId, setClientId] = useState<string>(
    initialData?.clientId || preselectedMilestone?.project.clientId || clients[0]?.id || ''
  );
  const [projectId, setProjectId] = useState<string>(
    initialData?.projectId || preselectedMilestone?.project.id || ''
  );

  const selectedClient = clients.find((c) => c.id === clientId);
  const filteredProjects = projects.filter((p) => p.clientId === clientId);

  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    initialData?.invoiceNumber || `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
  );
  const [issueDate, setIssueDate] = useState<string>(
    initialData?.issueDate || new Date().toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState<Currency>(
    initialData?.currency || selectedClient?.defaultCurrency || 'USD'
  );
  const [status, setStatus] = useState<InvoiceStatus>(initialData?.status || 'Draft');

  const termsDays = selectedClient?.paymentTermsDays || 15;
  const [dueDate, setDueDate] = useState<string>(() => {
    if (initialData?.dueDate) return initialData.dueDate;
    const d = new Date();
    d.setDate(d.getDate() + termsDays);
    return d.toISOString().split('T')[0];
  });

  const [exchangeRate, setExchangeRate] = useState<number>(
    initialData?.exchangeRateToLocal || profile.exchangeRates[currency] || 1
  );

  const [taxRate, setTaxRate] = useState<number>(
    initialData?.taxRate !== undefined ? initialData.taxRate : currency === 'EGP' ? 0.14 : 0
  );

  const [notes, setNotes] = useState<string>(
    initialData?.notes || `Payment terms: Net ${termsDays} days. Wire transfer details below.`
  );

  // Line items state
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (initialData?.items && initialData.items.length > 0) return initialData.items;
    if (preselectedMilestone) {
      return [
        {
          id: generateUUID(),
          description: `${preselectedMilestone.project.title}: ${preselectedMilestone.milestone.title}`,
          quantity: 1,
          unitPrice: preselectedMilestone.milestone.amount,
          amount: preselectedMilestone.milestone.amount,
        },
      ];
    }
    return [
      {
        id: generateUUID(),
        description: 'Software Engineering & Cloud Architecture Deliverable',
        quantity: 1,
        unitPrice: 2000,
        amount: 2000,
      },
    ];
  });

  // When client changes, update currency & exchange rate if new invoice
  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    const cl = clients.find((c) => c.id === newClientId);
    if (cl) {
      setCurrency(cl.defaultCurrency);
      setExchangeRate(cl.defaultCurrency === 'EGP' ? 1 : (profile.exchangeRates[cl.defaultCurrency] || 1));
      const proj = projects.find((p) => p.clientId === newClientId);
      setProjectId(proj?.id || '');

      const d = new Date();
      d.setDate(d.getDate() + cl.paymentTermsDays);
      setDueDate(d.toISOString().split('T')[0]);
      setNotes(`Payment terms: Net ${cl.paymentTermsDays} days. Wire transfer details below.`);
    }
  };

  const handleCurrencyChange = (newCurr: Currency) => {
    setCurrency(newCurr);
    if (newCurr === 'EGP') {
      setExchangeRate(1);
      if (taxRate === 0) {
        setTaxRate(0.14);
      }
    } else {
      setExchangeRate(profile.exchangeRates[newCurr] || 1);
    }
  };

  // Line items operations
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: generateUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      })
    );
  };

  const handleImportMilestone = (m: Milestone) => {
    const activeProject = projects.find((p) => p.id === projectId);
    setItems([
      ...items,
      {
        id: generateUUID(),
        description: `${activeProject?.title || 'Project'}: ${m.title}`,
        quantity: 1,
        unitPrice: m.amount,
        amount: m.amount,
      },
    ]);
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  const convertedTotalEGP = total * exchangeRate;

  if (!isOpen) return null;

  const currentProject = projects.find((p) => p.id === projectId);
  const unbilledMilestones = currentProject?.milestones.filter((m) => m.status !== 'Billed') || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || items.length === 0) return;

    const invoiceData: Omit<Invoice, 'id'> = {
      invoiceNumber,
      projectId,
      clientId,
      issueDate,
      dueDate,
      currency,
      exchangeRateToLocal: Number(exchangeRate),
      status,
      items,
      subtotal,
      taxRate,
      total,
      notes,
      paymentDetails: {
        bankName: profile.bankName,
        accountHolder: profile.accountHolder,
        iban: profile.iban,
        swift: profile.swift,
      },
    };

    const savedInvoice = onSave(invoiceData);
    onClose();

    if (onPreviewCreated) {
      onPreviewCreated(savedInvoice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#111827] border border-slate-800 rounded-lg w-full max-w-3xl my-6 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <h2 className="text-base font-semibold text-white">
              {initialData ? 'Edit Invoice' : 'Generate Developer Invoice'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Auto-calculate locked FX rates, milestones, and client-side PDF export.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Client *</label>
              <select
                required
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Associated Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">No linked project / Standalone</option>
                {filteredProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Invoice Number</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className={`grid grid-cols-1 ${currency === 'EGP' ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} gap-4`}>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Billing Currency</label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="EGP">EGP (E£ - Base Currency)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
              </select>
            </div>

            {currency !== 'EGP' && (
              <div>
                <label className="block text-xs font-medium text-amber-400/90 mb-1">
                  Exchange Rate to EGP (1 {currency} = ? EGP) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400 pr-12"
                  />
                  <span className="absolute right-3 top-2 text-[11px] text-amber-400/70 font-mono">
                    EGP
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Issue Date</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Quick Import from Project Milestones */}
          {unbilledMilestones.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-md p-3">
              <span className="text-xs font-medium text-slate-300 block mb-2">
                Import from unbilled milestones in {currentProject?.title}:
              </span>
              <div className="flex flex-wrap gap-2">
                {unbilledMilestones.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleImportMilestone(m)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    <span>{m.title} ({formatCurrency(m.amount, currency)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Invoice Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 p-2.5 bg-slate-900/80 border border-slate-800 rounded-md items-center"
                >
                  <div className="col-span-12 sm:col-span-6">
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description / milestone"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      step="any"
                      required
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                      placeholder="Qty/Hrs"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white font-mono text-center"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      step="any"
                      required
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                      placeholder="Price"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white font-mono text-right"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-1 text-right font-mono text-xs text-slate-200">
                    {formatCurrency(item.amount, currency)}
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 disabled:opacity-20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Calculations Block */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-3 sm:max-w-xs">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Invoice Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white cursor-pointer"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Tax / VAT Rate (e.g. 0.14 for 14%)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setTaxRate(0)}
                    className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                  >
                    0% Exempt
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxRate(0.14)}
                    className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                  >
                    14% VAT
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs min-w-[220px] self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-200">{formatCurrency(subtotal, currency)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Tax ({Math.round(taxRate * 100)}%):</span>
                  <span className="font-mono text-slate-200">{formatCurrency(taxAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-400">{formatCurrency(total, currency)}</span>
              </div>
              {currency !== 'EGP' && (
                <div className="pt-2 mt-1 border-t border-slate-800/80 space-y-1">
                  <div className="flex justify-between text-xs text-amber-300 font-mono font-semibold">
                    <span>Local Base Total (EGP):</span>
                    <span>{formatCurrency(convertedTotalEGP, 'EGP')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono text-right">
                    Converted @ 1 {currency} = {Number(exchangeRate).toFixed(2)} EGP
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Notes & Terms</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              <span>{initialData ? 'Update Invoice' : 'Create & Preview Invoice'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
