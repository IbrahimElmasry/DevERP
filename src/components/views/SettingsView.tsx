import React, { useState, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import { DeveloperProfile, Currency } from '../../types/erp';
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

  // Local state initialized with profile
  const [formData, setFormData] = useState<DeveloperProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Synchronize local form state whenever profile changes (e.g. initial load or reset)
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  // Generic handler for two-way state binding
  const handleChange = <K extends keyof DeveloperProfile>(field: K, value: DeveloperProfile[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExchangeRateChange = (currency: 'USD' | 'EUR', value: number) => {
    setFormData((prev) => ({
      ...prev,
      exchangeRates: {
        ...prev.exchangeRates,
        [currency]: isNaN(value) ? 0 : value,
      },
    }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    // Update context state
    updateProfile(formData);

    // Explicitly guarantee persistence to localStorage
    try {
      localStorage.setItem('deverp_profile_v1', JSON.stringify(formData));
    } catch (err) {
      console.error('Error saving profile to localStorage:', err);
    }

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

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved to localStorage</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSave()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Local-First Security & Setup Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex items-start gap-3 text-xs">
        <div className="p-2 bg-emerald-950/40 text-emerald-400 rounded border border-emerald-800/40 shrink-0 mt-0.5">
          <Database className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-white flex items-center gap-2">
            <span>Client-Side Data Storage & Privacy</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              100% Client-Side
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            All personal identity, tax registration, and banking credentials entered here are stored locally in your app's local storage and persist across app restarts.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
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
                name="developerName"
                required
                value={formData.developerName ?? ''}
                onChange={(e) => handleChange('developerName', e.target.value)}
                placeholder="e.g. Ibrahim Tarek"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Professional Title</label>
              <input
                type="text"
                name="developerTitle"
                value={formData.developerTitle ?? ''}
                onChange={(e) => handleChange('developerTitle', e.target.value)}
                placeholder="e.g. Software Engineer & Consultant"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Billing Email</label>
              <input
                type="email"
                name="developerEmail"
                required
                value={formData.developerEmail ?? ''}
                onChange={(e) => handleChange('developerEmail', e.target.value)}
                placeholder="billing@example.com"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Contact Phone</label>
              <input
                type="text"
                name="developerPhone"
                value={formData.developerPhone ?? ''}
                onChange={(e) => handleChange('developerPhone', e.target.value)}
                placeholder="e.g. +20 101 234 5678"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Developer Tax / VAT ID</label>
              <input
                type="text"
                name="developerTaxId"
                value={formData.developerTaxId ?? ''}
                onChange={(e) => handleChange('developerTaxId', e.target.value)}
                placeholder="e.g. EG-TAX-12345678"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Location / Business Address</label>
              <input
                type="text"
                name="developerAddress"
                value={formData.developerAddress ?? ''}
                onChange={(e) => handleChange('developerAddress', e.target.value)}
                placeholder="e.g. Alexandria, Egypt"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Base Reporting Currency</label>
              <select
                name="baseCurrency"
                value={formData.baseCurrency || 'EGP'}
                onChange={(e) => handleChange('baseCurrency', e.target.value as Currency)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="EGP">EGP (E£) — Egyptian Pound</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
              </select>
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
                name="bankName"
                required
                value={formData.bankName ?? ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="e.g. Commercial International Bank (CIB)"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Account Holder Name</label>
              <input
                type="text"
                name="accountHolder"
                required
                value={formData.accountHolder ?? ''}
                onChange={(e) => handleChange('accountHolder', e.target.value)}
                placeholder="e.g. Ibrahim Tarek"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">IBAN Number</label>
              <input
                type="text"
                name="iban"
                required
                value={formData.iban ?? ''}
                onChange={(e) => handleChange('iban', e.target.value)}
                placeholder="e.g. EG3800100000000000000000000"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">SWIFT / BIC Code</label>
              <input
                type="text"
                name="swift"
                required
                value={formData.swift ?? ''}
                onChange={(e) => handleChange('swift', e.target.value)}
                placeholder="e.g. CIBEEGXXX"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Foreign Exchange Engine Rates */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white pb-3 border-b border-slate-800">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>FX Engine & Default Exchange Rates (to {formData.baseCurrency || 'EGP'})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">1 USD to {formData.baseCurrency || 'EGP'}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.exchangeRates?.USD ?? 50.0}
                  onChange={(e) => handleExchangeRateChange('USD', parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono pr-14 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">{formData.baseCurrency || 'EGP'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">1 EUR to {formData.baseCurrency || 'EGP'}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.exchangeRates?.EUR ?? 54.0}
                  onChange={(e) => handleExchangeRateChange('EUR', parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono pr-14 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">{formData.baseCurrency || 'EGP'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Settings Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settings saved successfully! Changes are persisted across restarts.</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              Click &quot;Save Settings&quot; to apply your details across invoices and reports.
            </div>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm cursor-pointer ml-auto"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
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
          DevERP stores data in your local application sandbox. You can export complete snapshots to JSON
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
