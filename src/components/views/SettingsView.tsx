import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { DeveloperProfile } from '../../types/erp';
import {
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Building2,
  CreditCard,
  DollarSign,
  Database,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    resetToSampleData,
    exportDatabaseJSON,
    importDatabaseJSON,
  } = useErp();

  const [formData, setFormData] = useState<DeveloperProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExport = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deverp-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJSON(content);
      if (success) {
        setImportStatus('Database successfully restored from backup.');
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        alert('Failed to parse backup file. Please ensure valid DevERP JSON structure.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Terminal Settings & Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Developer entity metadata, wire transfer coordinates, and local database backup.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Developer Entity Branding */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white pb-3 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Developer Professional Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={formData.developerName}
                onChange={(e) => setFormData({ ...formData, developerName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Professional Title</label>
              <input
                type="text"
                value={formData.developerTitle}
                onChange={(e) => setFormData({ ...formData, developerTitle: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Billing Email</label>
              <input
                type="email"
                required
                value={formData.developerEmail}
                onChange={(e) => setFormData({ ...formData, developerEmail: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.developerPhone || ''}
                onChange={(e) => setFormData({ ...formData, developerPhone: e.target.value })}
                placeholder="+20 1019804919"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Developer Tax / VAT ID</label>
              <input
                type="text"
                value={formData.developerTaxId}
                onChange={(e) => setFormData({ ...formData, developerTaxId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Location / Business Address</label>
              <input
                type="text"
                value={formData.developerAddress}
                onChange={(e) => setFormData({ ...formData, developerAddress: e.target.value })}
                placeholder="e.g. Alexandria, Egypt"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Base Reporting Currency</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-md text-xs font-mono text-emerald-400">
                <span className="font-bold">EGP (E£)</span>
                <span className="text-slate-500 font-sans">· Fixed base currency for all reporting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banking & Wire Transfer Details */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white pb-3 border-b border-slate-800">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Invoice Wire & Payment Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Beneficiary Bank</label>
              <input
                type="text"
                required
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Account Holder Name</label>
              <input
                type="text"
                required
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">IBAN Number</label>
              <input
                type="text"
                required
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">SWIFT / BIC Code</label>
              <input
                type="text"
                required
                value={formData.swift}
                onChange={(e) => setFormData({ ...formData, swift: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Foreign Exchange Engine Rates */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white pb-3 border-b border-slate-800">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>FX Engine & Default Exchange Rates (to {formData.baseCurrency})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">1 USD to EGP</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.exchangeRates.USD}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exchangeRates: {
                        ...formData.exchangeRates,
                        USD: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono pr-12 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">EGP</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">1 EUR to EGP</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.exchangeRates.EUR}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exchangeRates: {
                        ...formData.exchangeRates,
                        EUR: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono pr-12 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">EGP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Local Storage & Data Management Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white pb-3 border-b border-slate-800">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Local Storage & Backup Management</span>
        </div>

        <p className="text-xs text-slate-400">
          DevERP stores 100% of data in your local browser sandbox. You can export complete snapshots to JSON
          or restore them at any time.
        </p>

        {importStatus && (
          <div className="text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-md">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Database JSON</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Database JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all clients, deliverables, invoices, and ledger to sample developer data?')) {
                resetToSampleData();
                setFormData(profile);
                window.location.reload();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/40 rounded-md transition-colors cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
