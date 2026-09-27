import React from 'react';
import { useErp } from '../context/ErpContext';
import { Plus, ArrowDownRight, Layers, FileText, Users, DollarSign, Settings as SettingsIcon } from 'lucide-react';

interface NavbarProps {
  onOpenNewInvoice: () => void;
  onOpenNewLedger: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewInvoice, onOpenNewLedger }) => {
  const { activeTab, setActiveTab, profile, invoices } = useErp();

  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;

  interface NavItem {
    id: 'dashboard' | 'clients' | 'invoices' | 'ledger' | 'settings';
    label: string;
    icon: any;
    count?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: Layers },
    { id: 'clients', label: 'Clients & Projects', icon: Users },
    { id: 'invoices', label: 'Invoices', icon: FileText, count: overdueCount },
    { id: 'ledger', label: 'Cash Flow Ledger', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0d131f]/95 backdrop-blur border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity text-left cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50"></span>
          DevERP
        </button>

        {/* Zone 2: Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4 opacity-75" />
                <span>{item.label}</span>
                {item.count && item.count > 0 ? (
                  <span className="ml-1 text-[11px] font-mono px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Live FX Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-md">
            <span className="text-slate-500">FX</span>
            <span>$1 = {profile.exchangeRates.USD.toFixed(1)} EGP</span>
            <span className="text-slate-600">·</span>
            <span>€1 = {profile.exchangeRates.EUR.toFixed(1)} EGP</span>
          </div>

          <button
            onClick={onOpenNewLedger}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
            <span>Log Flow</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm shadow-emerald-950 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="md:hidden flex items-center gap-1 mt-2.5 pt-2 border-t border-slate-800/60 overflow-x-auto pb-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
              {item.count && item.count > 0 ? ` (${item.count})` : ''}
            </button>
          );
        })}
      </div>
    </header>
  );
};
