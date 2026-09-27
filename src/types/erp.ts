export type Currency = 'USD' | 'EUR' | 'EGP';

export type BillingType = 'Fixed' | 'Hourly' | 'Retainer';

export type MilestoneStatus = 'Pending' | 'Completed' | 'Billed';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export type LedgerType = 'Inflow' | 'Outflow';

export type LedgerCategory =
  | 'Client Payment'
  | 'Subscription'
  | 'Hosting'
  | 'Hardware'
  | 'Overhead';

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: MilestoneStatus;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  defaultCurrency: Currency;
  paymentTermsDays: number;
  taxId: string;
  address?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  billingType: BillingType;
  totalBudget: number;
  hourlyRate?: number;
  estimatedHours?: number;
  milestones: Milestone[];
  status: 'Active' | 'Completed' | 'On Hold';
  startDate: string;
  description?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-001
  projectId: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  currency: Currency;
  exchangeRateToLocal: number; // Locked exchange rate to base currency EGP
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.14 for 14% or 0
  total: number;
  notes?: string;
  paymentDetails: {
    bankName: string;
    accountHolder: string;
    iban: string;
    swift: string;
  };
  paidDate?: string;
}

export interface CashFlowLedgerEntry {
  id: string;
  date: string;
  type: LedgerType;
  category: LedgerCategory;
  originalAmount: number;
  currency: Currency;
  exchangeRate: number;
  baseAmount: number; // converted to EGP
  notes: string;
  referenceId?: string; // e.g. linked invoiceId
}

export interface DeveloperProfile {
  developerName: string;
  developerTitle: string;
  developerEmail: string;
  developerPhone?: string;
  developerTaxId: string;
  developerAddress: string;
  bankName: string;
  accountHolder: string;
  iban: string;
  swift: string;
  baseCurrency: Currency; // default 'EGP'
  exchangeRates: {
    USD: number; // e.g. 50.5 EGP
    EUR: number; // e.g. 54.2 EGP
    EGP: number; // 1
  };
}
