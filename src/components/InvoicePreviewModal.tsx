import React from 'react';
import { Invoice, Client, DeveloperProfile } from '../types/erp';
import { X, Download, Printer, CheckCircle2, Send, Building2, User, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { exportInvoicePDF } from '../utils/pdfGenerator';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  client?: Client;
  profile: DeveloperProfile;
  onStatusChange: (invoiceId: string, status: any) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  client,
  profile,
  onStatusChange,
}) => {
  if (!isOpen || !invoice) return null;

  const handleDownloadPDF = () => {
    exportInvoicePDF(invoice, client, profile);
  };

  const handlePrint = () => {
    window.print();
  };

  const statusColors = {
    Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Sent: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    Overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const convertedEGP = invoice.total * (invoice.exchangeRateToLocal || 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl w-full max-w-4xl my-auto overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white font-mono">{invoice.invoiceNumber}</span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${statusColors[invoice.status]}`}>
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status !== 'Paid' && (
              <button
                onClick={() => onStatusChange(invoice.id, 'Paid')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 rounded-md transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Paid</span>
              </button>
            )}

            {invoice.status === 'Draft' && (
              <button
                onClick={() => onStatusChange(invoice.id, 'Sent')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/40 rounded-md transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Mark Sent</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Paper Document Area */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-slate-950 text-slate-100 flex-1">
          <div className="max-w-3xl mx-auto bg-[#111827] border border-slate-800/90 rounded-lg p-6 sm:p-10 shadow-lg print:border-none print:shadow-none print:bg-white print:text-black">
            {/* Top Brand Bar */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <h1 className="text-2xl font-bold tracking-tight text-white font-mono">INVOICE</h1>
                </div>
                <p className="text-xs text-slate-400 mt-1">DevERP Software & Cloud Engineering</p>
              </div>

              <div className="text-left sm:text-right space-y-1 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Invoice No: </span>
                  <span className="text-white font-semibold">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400">Issue Date: </span>
                  <span className="text-slate-300">{invoice.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Due Date: </span>
                  <span className={invoice.status === 'Overdue' ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                    {invoice.dueDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Status: </span>
                  <span className="uppercase text-emerald-400 font-bold">{invoice.status}</span>
                </div>
              </div>
            </div>

            {/* From & To Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-800 text-xs">
              <div>
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  <User className="w-3.5 h-3.5" />
                  <span>Billed By (Developer)</span>
                </div>
                <div className="text-sm font-semibold text-white">{profile.developerName}</div>
                <div className="text-slate-400">{profile.developerTitle}</div>
                <div className="text-slate-400 mt-1">{profile.developerEmail}</div>
                {profile.developerPhone && (
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">{profile.developerPhone}</div>
                )}
                {profile.developerTaxId && (
                  <div className="text-slate-400 font-mono mt-0.5">Tax ID: {profile.developerTaxId}</div>
                )}
                {profile.developerAddress && (
                  <div className="text-slate-500 mt-1 whitespace-pre-line">{profile.developerAddress}</div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Billed To (Client)</span>
                </div>
                <div className="text-sm font-semibold text-white">
                  {client?.company || 'Client Organization'}
                </div>
                {client?.name && <div className="text-slate-300">Attn: {client.name}</div>}
                {client?.email && <div className="text-slate-400 mt-1">{client.email}</div>}
                {client?.taxId && (
                  <div className="text-slate-400 font-mono mt-0.5">Client Tax ID: {client.taxId}</div>
                )}
                {client?.address && (
                  <div className="text-slate-500 mt-1 whitespace-pre-line">{client.address}</div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 font-medium uppercase tracking-wider">Description</th>
                    <th className="py-2 text-center font-medium uppercase tracking-wider">Qty / Hrs</th>
                    <th className="py-2 text-right font-medium uppercase tracking-wider">Unit Price</th>
                    <th className="py-2 text-right font-medium uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/30">
                      <td className="py-3 font-sans text-slate-200 pr-2">{item.description}</td>
                      <td className="py-3 text-center text-slate-400">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-300">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-100">
                        {formatCurrency(item.amount, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                  </div>
                  {invoice.taxRate > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Tax ({Math.round(invoice.taxRate * 100)}%):</span>
                      <span className="font-mono text-slate-200">
                        {formatCurrency(invoice.subtotal * invoice.taxRate, invoice.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                    <span>Total Due:</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(invoice.total, invoice.currency)}</span>
                  </div>
                  {invoice.currency !== 'EGP' && (
                    <div className="pt-2 mt-1 border-t border-slate-800/80 text-right">
                      <div className="text-xs text-amber-300 font-mono font-semibold">
                        Local Total: {formatCurrency(convertedEGP, 'EGP')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Exchange Rate: 1 {invoice.currency} = {invoice.exchangeRateToLocal.toFixed(2)} EGP
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Wire Payment Details */}
            <div className="mt-4 p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-white mb-2 uppercase tracking-wide">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Payment Instructions (Wire / Swift)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400 font-mono">
                <div>
                  <span className="text-slate-500">Bank Name: </span>
                  <span className="text-slate-200">{invoice.paymentDetails.bankName || profile.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Account Holder: </span>
                  <span className="text-slate-200">{invoice.paymentDetails.accountHolder || profile.accountHolder}</span>
                </div>
                <div>
                  <span className="text-slate-500">IBAN: </span>
                  <span className="text-slate-200">{invoice.paymentDetails.iban || profile.iban}</span>
                </div>
                <div>
                  <span className="text-slate-500">SWIFT / BIC: </span>
                  <span className="text-slate-200">{invoice.paymentDetails.swift || profile.swift}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
                <span className="font-medium text-slate-300">Notes & Terms: </span>
                {invoice.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
