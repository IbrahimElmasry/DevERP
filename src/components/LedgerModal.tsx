import React, { useState } from 'react';
import { CashFlowLedgerEntry, Currency, LedgerCategory, LedgerType, DeveloperProfile } from '../types/erp';
import { X, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface LedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<CashFlowLedgerEntry, 'id'>) => void;
  profile: DeveloperProfile;
  initialData?: CashFlowLedgerEntry | null;
}

export const LedgerModal: React.FC<LedgerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profile,
  initialData,
}) => {
  const [type, setType] = useState<LedgerType>(initialData?.type || 'Outflow');
  const [category, setCategory] = useState<LedgerCategory>(initialData?.category || 'Subscription');
  const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'USD');
  const [originalAmount, setOriginalAmount] = useState<number>(initialData?.originalAmount || 20);
  const [exchangeRate, setExchangeRate] = useState<number>(
    initialData?.exchangeRate || profile.exchangeRates[currency] || 1
  );
  const [date, setDate] = useState<string>(
    initialData?.date || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || '');

  if (!isOpen) return null;

  const handleCurrencyChange = (newCurr: Currency) => {
    setCurrency(newCurr);
    if (newCurr === 'EGP') {
      setExchangeRate(1);
    } else {
      setExchangeRate(profile.exchangeRates[newCurr] || 1);
    }
  };

  const baseAmount = Number(originalAmount) * Number(exchangeRate);

  const applyPreset = (
    pNotes: string,
    pAmount: number,
    pCurr: Currency,
    pCategory: LedgerCategory
  ) => {
    setType('Outflow');
    setCategory(pCategory);
    setNotes(pNotes);
    setOriginalAmount(pAmount);
    setCurrency(pCurr);
    setExchangeRate(profile.exchangeRates[pCurr] || 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || originalAmount <= 0) return;

    onSave({
      date,
      type,
      category,
      originalAmount: Number(originalAmount),
      currency,
      exchangeRate: Number(exchangeRate),
      baseAmount,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#111827] border border-slate-800 rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <h2 className="text-base font-semibold text-white">
              {initialData ? 'Edit Cash Flow Record' : 'Log Cash Flow Transaction'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Multi-currency ledger with real-time base conversion.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Presets Row */}
          {!initialData && (
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-md p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Developer Presets:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('GitHub Copilot Business seat', 19, 'USD', 'Subscription')}
                  className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  GitHub Copilot ($19)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('AWS Cloud Infrastructure & DB', 145, 'USD', 'Hosting')}
                  className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  AWS Hosting ($145)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('JetBrains All Products pack', 39, 'EUR', 'Subscription')}
                  className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  JetBrains (€39)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Vercel Pro Subscription', 20, 'USD', 'Hosting')}
                  className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  Vercel Pro ($20)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Internet line & Workspace dedicated desk', 3200, 'EGP', 'Overhead')}
                  className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  Workspace (3.2k EGP)
                </button>
              </div>
            </div>
          )}

          {/* Type Segmented Buttons */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Flow Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('Inflow')}
                className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition-colors cursor-pointer ${
                  type === 'Inflow'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Inflow (Income / Receipt)
              </button>
              <button
                type="button"
                onClick={() => setType('Outflow')}
                className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition-colors cursor-pointer ${
                  type === 'Outflow'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Outflow (Expense / Burn)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LedgerCategory)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Client Payment">Client Payment</option>
                <option value="Subscription">Software Subscription</option>
                <option value="Hosting">Hosting & Cloud Infrastructure</option>
                <option value="Hardware">Hardware & Equipment</option>
                <option value="Overhead">Office & Operational Overhead</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Transaction Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Amount and Currency */}
          <div className={`grid grid-cols-1 ${currency === 'EGP' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
              <input
                type="number"
                step="any"
                required
                value={originalAmount}
                onChange={(e) => setOriginalAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="EGP">EGP (E£ - Base Currency)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
              </select>
            </div>

            {currency !== 'EGP' && (
              <div>
                <label className="block text-xs font-medium text-amber-400/90 mb-1">
                  FX Rate (to EGP) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400 pr-12"
                  />
                  <span className="absolute right-3 top-2 text-xs text-amber-400/70 font-mono">
                    EGP
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Converted Summary Banner */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-md flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              {currency === 'EGP' ? 'Transaction Total (EGP):' : 'Equivalent in Base Currency (EGP):'}
            </span>
            <div className="text-right">
              <span className={`text-sm font-bold ${type === 'Inflow' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {type === 'Inflow' ? '+' : '-'}
                {formatCurrency(baseAmount, 'EGP')}
              </span>
              {currency !== 'EGP' && (
                <div className="text-[10px] text-slate-500">
                  @ 1 {currency} = {exchangeRate.toFixed(2)} EGP
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description / Memo *</label>
            <input
              type="text"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. AWS production clusters & RDS instance"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              {initialData ? 'Update Record' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
