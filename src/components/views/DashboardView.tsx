import React from 'react';
import { useErp } from '../../context/ErpContext';
import { MetricCard } from '../MetricCard';
import { CashFlowChart } from '../CashFlowChart';
import { OverdueAlert } from '../OverdueAlert';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  TrendingUp,
  Flame,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Invoice } from '../../types/erp';

interface DashboardViewProps {
  onOpenNewInvoice: () => void;
  onOpenNewLedger: () => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewInvoice,
  onOpenNewLedger,
  onViewInvoice,
}) => {
  const {
    clients,
    projects,
    invoices,
    ledger,
    profile,
    markInvoiceStatus,
    updateMilestoneStatus,
    setQuickInvoiceMilestone,
    setActiveTab,
  } = useErp();

  // 1. Calculate Total Outstanding Receivables (Sent & Overdue invoices)
  const outstandingInvoices = invoices.filter(
    (i) => i.status === 'Sent' || i.status === 'Overdue'
  );

  let totalReceivablesEGP = 0;
  const currencyBreakdown: Record<string, number> = { USD: 0, EUR: 0, EGP: 0 };

  outstandingInvoices.forEach((inv) => {
    const rate = inv.exchangeRateToLocal || profile.exchangeRates[inv.currency] || 1;
    totalReceivablesEGP += inv.total * rate;
    currencyBreakdown[inv.currency] = (currencyBreakdown[inv.currency] || 0) + inv.total;
  });

  const subBreakdownText = [
    currencyBreakdown.USD > 0 ? formatCurrency(currencyBreakdown.USD, 'USD') : null,
    currencyBreakdown.EUR > 0 ? formatCurrency(currencyBreakdown.EUR, 'EUR') : null,
    currencyBreakdown.EGP > 0 ? formatCurrency(currencyBreakdown.EGP, 'EGP') : null,
  ]
    .filter(Boolean)
    .join(' · ');

  // 2. Monthly Burn Rate (Outflows in current calendar month)
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentMonthOutflows = ledger
    .filter((tx) => tx.type === 'Outflow' && tx.date.startsWith(currentMonthKey))
    .reduce((sum, tx) => sum + tx.baseAmount, 0);

  // 3. 30-Day Projected Inflow
  // (Outstanding invoices + milestones due within 30 days that are not yet billed/paid)
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 86400000);

  let projectedInflowEGP = totalReceivablesEGP;

  projects.forEach((proj) => {
    const client = clients.find((c) => c.id === proj.clientId);
    const curr = client?.defaultCurrency || 'USD';
    const rate = profile.exchangeRates[curr] || 1;

    proj.milestones.forEach((m) => {
      if (m.status !== 'Billed') {
        const dueDate = new Date(m.dueDate);
        if (!isNaN(dueDate.getTime()) && dueDate >= now && dueDate <= in30Days) {
          projectedInflowEGP += m.amount * rate;
        }
      }
    });
  });

  // Overdue Invoices
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');

  // Collect all actionable milestones across projects
  const upcomingMilestones: Array<{
    project: (typeof projects)[0];
    milestone: (typeof projects)[0]['milestones'][0];
    clientName: string;
  }> = [];

  projects.forEach((proj) => {
    const client = clients.find((c) => c.id === proj.clientId);
    proj.milestones.forEach((m) => {
      if (m.status === 'Pending' || m.status === 'Completed') {
        upcomingMilestones.push({
          project: proj,
          milestone: m,
          clientName: client?.company || client?.name || 'Client',
        });
      }
    });
  });

  // Sort by due date
  upcomingMilestones.sort(
    (a, b) => new Date(a.milestone.dueDate).getTime() - new Date(b.milestone.dueDate).getTime()
  );

  // Recent ledger entries
  const recentLedger = [...ledger].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Executive Terminal</span>
            <span className="text-xs font-mono font-normal text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              {profile.developerName} · {profile.developerTitle}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {profile.developerAddress} · Base Reporting Currency: EGP (E£) · Multi-currency cash flow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('clients')}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer"
          >
            Manage Clients ({clients.length})
          </button>
          <button
            onClick={onOpenNewInvoice}
            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm cursor-pointer"
          >
            + Create Invoice
          </button>
        </div>
      </div>

      {/* Overdue Alert banner if any */}
      <OverdueAlert
        overdueInvoices={overdueInvoices}
        clients={clients}
        onViewInvoice={onViewInvoice}
        onMarkPaid={(id) => markInvoiceStatus(id, 'Paid')}
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Outstanding Receivables"
          value={formatCurrency(totalReceivablesEGP, 'EGP')}
          subValue={subBreakdownText || 'No pending invoices'}
          icon={TrendingUp}
          badgeText={`${outstandingInvoices.length} Invoices`}
          badgeType={outstandingInvoices.length > 0 ? 'warning' : 'neutral'}
          contextNote="Locked at contracted FX rates"
        />

        <MetricCard
          label="Monthly Burn Rate"
          value={formatCurrency(currentMonthOutflows, 'EGP')}
          subValue={`Current month: ${new Date().toLocaleDateString('en-US', { month: 'long' })}`}
          icon={Flame}
          badgeText="Operational Outflows"
          badgeType="neutral"
          contextNote="Hosting, SaaS licenses & overhead"
        />

        <MetricCard
          label="30-Day Projected Inflow"
          value={formatCurrency(projectedInflowEGP, 'EGP')}
          subValue="Receivables + Upcoming Deliverables"
          icon={Clock}
          badgeText="Forecast"
          badgeType="positive"
          contextNote="Expected within next 30 days"
        />

        <MetricCard
          label="Active Projects & Retainers"
          value={String(projects.filter((p) => p.status === 'Active').length)}
          subValue={`${clients.length} Total Client Accounts`}
          icon={Layers}
          badgeText="Workforce Load"
          badgeType="neutral"
          contextNote="Deliverables in progress"
        />
      </div>

      {/* Interactive Visual Chart: Inflows vs Outflows */}
      <CashFlowChart ledger={ledger} profile={profile} />

      {/* Split Grid: Actionable Deliverables & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Delivery Tracker */}
        <div className="bg-[#111827] border border-slate-800/90 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  Actionable Milestones
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deliverables ready for verification or immediate billing.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                All Projects →
              </button>
            </div>

            {upcomingMilestones.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                All milestones are currently billed or completed.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingMilestones.slice(0, 5).map(({ project, milestone, clientName }) => {
                  const client = clients.find((c) => c.id === project.clientId);
                  const curr = client?.defaultCurrency || 'USD';
                  const isCompleted = milestone.status === 'Completed';

                  return (
                    <div
                      key={milestone.id}
                      className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-semibold text-slate-200 truncate">{milestone.title}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                              isCompleted
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700/60'
                            }`}
                          >
                            {milestone.status}
                          </span>
                        </div>
                        <div className="text-slate-400 flex items-center gap-2 text-[11px]">
                          <span>{project.title}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-500">{clientName}</span>
                          <span className="text-slate-600">·</span>
                          <span className="flex items-center gap-1 font-mono text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {formatDate(milestone.dueDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-200 block">
                            {formatCurrency(milestone.amount, curr)}
                          </span>
                          {curr !== 'EGP' && (
                            <span className="text-[10px] font-mono text-slate-400 block">
                              ~{formatCurrency(milestone.amount * (profile.exchangeRates[curr] || 1), 'EGP')}
                            </span>
                          )}
                        </div>

                        {isCompleted ? (
                          <button
                            onClick={() => {
                              setQuickInvoiceMilestone({ project, milestone });
                              onOpenNewInvoice();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors shadow-xs cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Invoice</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => updateMilestoneStatus(project.id, milestone.id, 'Completed')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Complete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Ledger Inflow/Outflows */}
        <div className="bg-[#111827] border border-slate-800/90 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  Recent Ledger Activity
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest multi-currency income and expense records.
                </p>
              </div>
              <button
                onClick={onOpenNewLedger}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                + Log Entry
              </button>
            </div>

            <div className="space-y-2">
              {recentLedger.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 p-2.5 bg-slate-900/60 border border-slate-800/70 rounded-md text-xs hover:border-slate-700/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded shrink-0 ${
                        tx.type === 'Inflow'
                          ? 'bg-emerald-950/60 text-emerald-400'
                          : 'bg-rose-950/60 text-rose-400'
                      }`}
                    >
                      {tx.type === 'Inflow' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-slate-200 font-medium truncate">{tx.notes}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{tx.category}</span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-slate-500">{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono font-semibold ${
                        tx.type === 'Inflow' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'Inflow' ? '+' : '-'}
                      {formatCurrency(tx.originalAmount, tx.currency)}
                    </div>
                    {tx.currency !== 'EGP' && (
                      <div className="text-[10px] font-mono text-slate-500">
                        ~{formatCurrency(tx.baseAmount, 'EGP')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
            <button
              onClick={() => setActiveTab('ledger')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Open Full Multi-Currency Ledger →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
