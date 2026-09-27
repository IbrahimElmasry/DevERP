import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { Invoice, Client } from '../types/erp';
import { formatCurrency } from '../utils/formatters';

interface OverdueAlertProps {
  overdueInvoices: Invoice[];
  clients: Client[];
  onViewInvoice: (invoice: Invoice) => void;
  onMarkPaid: (invoiceId: string) => void;
}

export const OverdueAlert: React.FC<OverdueAlertProps> = ({
  overdueInvoices,
  clients,
  onViewInvoice,
  onMarkPaid,
}) => {
  if (overdueInvoices.length === 0) return null;

  return (
    <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-rose-900/30 text-rose-400 rounded-md shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-rose-200">
                Action Required: {overdueInvoices.length} Overdue {overdueInvoices.length === 1 ? 'Invoice' : 'Invoices'}
              </h3>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Outstanding deliverables past payment terms. Review details or trigger reminder.
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {overdueInvoices.map((inv) => {
              const client = clients.find((c) => c.id === inv.clientId);
              const dueDate = new Date(inv.dueDate);
              const today = new Date();
              const diffTime = Math.abs(today.getTime() - dueDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              const reminderMailto = client?.email
                ? `mailto:${client.email}?subject=${encodeURIComponent(`Payment Follow-up: Invoice ${inv.invoiceNumber}`)}&body=${encodeURIComponent(
                    `Hi ${client.name || 'there'},\n\nI hope this email finds you well. This is a gentle reminder regarding invoice ${inv.invoiceNumber} for ${formatCurrency(
                      inv.total,
                      inv.currency
                    )}, which was due on ${inv.dueDate} (${diffDays} days ago).\n\nPlease let me know if you need any additional details or payment confirmations.\n\nBest regards,\nDevERP`
                  )}`
                : '#';

              return (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-rose-950/40 border border-rose-900/30 rounded-md px-3.5 py-2.5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-rose-200">{inv.invoiceNumber}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300 font-medium">{client?.company || client?.name || 'Client'}</span>
                    <span className="text-slate-500">·</span>
                    <span className="font-mono text-rose-300 font-semibold">
                      {formatCurrency(inv.total, inv.currency)}
                    </span>
                    <span className="text-rose-400 font-mono text-[11px] bg-rose-900/30 px-1.5 py-0.5 rounded">
                      {diffDays}d overdue
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {client?.email && (
                      <a
                        href={reminderMailto}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-rose-200 bg-rose-900/30 hover:bg-rose-900/50 rounded border border-rose-800/40 transition-colors"
                        title="Draft email reminder"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Remind</span>
                      </a>
                    )}
                    <button
                      onClick={() => onMarkPaid(inv.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 rounded border border-emerald-800/40 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mark Paid</span>
                    </button>
                    <button
                      onClick={() => onViewInvoice(inv)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
