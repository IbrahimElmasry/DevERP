import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Client,
  Project,
  Invoice,
  CashFlowLedgerEntry,
  DeveloperProfile,
  MilestoneStatus,
  InvoiceStatus,
  Milestone,
} from '../types/erp';
import {
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_INVOICES,
  INITIAL_LEDGER,
  INITIAL_DEVELOPER_PROFILE,
} from '../utils/seedData';
import { generateUUID } from '../utils/formatters';

interface ErpContextType {
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  ledger: CashFlowLedgerEntry[];
  profile: DeveloperProfile;
  activeTab: 'dashboard' | 'clients' | 'projects' | 'invoices' | 'ledger' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'clients' | 'projects' | 'invoices' | 'ledger' | 'settings') => void;

  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Project actions
  addProject: (project: Omit<Project, 'id'>) => Project;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateMilestoneStatus: (projectId: string, milestoneId: string, status: MilestoneStatus) => void;
  addMilestone: (projectId: string, milestone: Omit<Milestone, 'id'>) => void;
  deleteMilestone: (projectId: string, milestoneId: string) => void;

  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  markInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  generateInvoiceForMilestone: (projectId: string, milestoneId: string) => Invoice;

  // Ledger actions
  addLedgerEntry: (entry: Omit<CashFlowLedgerEntry, 'id'>) => CashFlowLedgerEntry;
  updateLedgerEntry: (id: string, entry: Partial<CashFlowLedgerEntry>) => void;
  deleteLedgerEntry: (id: string) => void;

  // Profile & settings
  updateProfile: (profile: Partial<DeveloperProfile>) => void;
  resetToSampleData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;

  // Quick action states
  quickInvoiceMilestone: { project: Project; milestone: Milestone } | null;
  setQuickInvoiceMilestone: (val: { project: Project; milestone: Milestone } | null) => void;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLIENTS: 'deverp_clients_v1',
  PROJECTS: 'deverp_projects_v1',
  INVOICES: 'deverp_invoices_v1',
  LEDGER: 'deverp_ledger_v1',
  PROFILE: 'deverp_profile_v1',
};

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'projects' | 'invoices' | 'ledger' | 'settings'>('dashboard');
  const [quickInvoiceMilestone, setQuickInvoiceMilestone] = useState<{ project: Project; milestone: Milestone } | null>(null);

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [ledger, setLedger] = useState<CashFlowLedgerEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEDGER);
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [profile, setProfile] = useState<DeveloperProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_DEVELOPER_PROFILE,
          ...parsed,
          exchangeRates: {
            ...INITIAL_DEVELOPER_PROFILE.exchangeRates,
            ...(parsed.exchangeRates || {}),
          },
        };
      } catch {
        return INITIAL_DEVELOPER_PROFILE;
      }
    }
    return INITIAL_DEVELOPER_PROFILE;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  // Client actions
  const addClient = (data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...data,
      id: `c-${Date.now()}-${generateUUID().slice(0, 4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Project actions
  const addProject = (data: Omit<Project, 'id'>): Project => {
    const newProject: Project = {
      ...data,
      id: `p-${Date.now()}-${generateUUID().slice(0, 4)}`,
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const updateMilestoneStatus = (projectId: string, milestoneId: string, status: MilestoneStatus) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          milestones: proj.milestones.map((m) => (m.id === milestoneId ? { ...m, status } : m)),
        };
      })
    );
  };

  const addMilestone = (projectId: string, milestoneData: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: `m-${Date.now()}-${generateUUID().slice(0, 4)}`,
    };
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          milestones: [...proj.milestones, newMilestone],
        };
      })
    );
  };

  const deleteMilestone = (projectId: string, milestoneId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          milestones: proj.milestones.filter((m) => m.id !== milestoneId),
        };
      })
    );
  };

  // Invoice actions
  const addInvoice = (data: Omit<Invoice, 'id'>): Invoice => {
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}-${generateUUID().slice(0, 4)}`,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...data } : inv)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const markInvoiceStatus = (id: string, status: InvoiceStatus) => {
    const invoice = invoices.find((inv) => inv.id === id);
    if (!invoice) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // If changing to Paid and wasn't previously paid, prompt/add ledger entry
    if (status === 'Paid' && invoice.status !== 'Paid') {
      const exchangeRate = invoice.exchangeRateToLocal || profile.exchangeRates[invoice.currency] || 1;
      const baseAmount = invoice.total * exchangeRate;

      const newLedgerEntry: CashFlowLedgerEntry = {
        id: `tx-${Date.now()}`,
        date: todayStr,
        type: 'Inflow',
        category: 'Client Payment',
        originalAmount: invoice.total,
        currency: invoice.currency,
        exchangeRate: exchangeRate,
        baseAmount: baseAmount,
        notes: `Settled invoice ${invoice.invoiceNumber}`,
        referenceId: invoice.id,
      };

      setLedger((prev) => [newLedgerEntry, ...prev]);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status, paidDate: todayStr } : inv))
      );
    } else {
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)));
    }
  };

  const generateInvoiceForMilestone = (projectId: string, milestoneId: string): Invoice => {
    const project = projects.find((p) => p.id === projectId);
    const client = clients.find((c) => c.id === project?.clientId);
    const milestone = project?.milestones.find((m) => m.id === milestoneId);

    const currency = client?.defaultCurrency || 'USD';
    const rate = currency === 'EGP' ? 1 : (profile.exchangeRates[currency] || 1);
    const issueDate = new Date().toISOString().split('T')[0];
    const terms = client?.paymentTermsDays || 15;

    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + terms);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const invSeq = invoices.length + 1;
    const invNumber = `INV-${new Date().getFullYear()}-${String(invSeq).padStart(3, '0')}`;

    const amount = milestone ? milestone.amount : 0;
    const taxRate = currency === 'EGP' ? 0.14 : 0; // Default VAT for local EGP
    const total = amount * (1 + taxRate);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      projectId: projectId,
      clientId: client?.id || '',
      issueDate,
      dueDate,
      currency,
      exchangeRateToLocal: rate,
      status: 'Draft',
      items: [
        {
          id: `item-${Date.now()}`,
          description: `${project?.title || 'Project'}: ${milestone?.title || 'Milestone Delivery'}`,
          quantity: 1,
          unitPrice: amount,
          amount: amount,
        },
      ],
      subtotal: amount,
      taxRate: taxRate,
      total: total,
      notes: `Net ${terms} terms. Payment expected by ${dueDate}.`,
      paymentDetails: {
        bankName: profile.bankName,
        accountHolder: profile.accountHolder,
        iban: profile.iban,
        swift: profile.swift,
      },
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Mark milestone as Billed
    updateMilestoneStatus(projectId, milestoneId, 'Billed');

    return newInvoice;
  };

  // Ledger actions
  const addLedgerEntry = (data: Omit<CashFlowLedgerEntry, 'id'>): CashFlowLedgerEntry => {
    const newEntry: CashFlowLedgerEntry = {
      ...data,
      id: `tx-${Date.now()}-${generateUUID().slice(0, 4)}`,
    };
    setLedger((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const updateLedgerEntry = (id: string, data: Partial<CashFlowLedgerEntry>) => {
    setLedger((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
  };

  const deleteLedgerEntry = (id: string) => {
    setLedger((prev) => prev.filter((item) => item.id !== id));
  };

  const updateProfile = (data: Partial<DeveloperProfile>) => {
    setProfile((prev) => {
      const updated: DeveloperProfile = {
        ...prev,
        ...data,
        exchangeRates: data.exchangeRates
          ? { ...prev.exchangeRates, ...data.exchangeRates }
          : prev.exchangeRates,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save profile to localStorage:', err);
      }
      return updated;
    });
  };

  const resetToSampleData = () => {
    setClients(INITIAL_CLIENTS);
    setProjects(INITIAL_PROJECTS);
    setInvoices(INITIAL_INVOICES);
    setLedger(INITIAL_LEDGER);
    setProfile(INITIAL_DEVELOPER_PROFILE);
    localStorage.clear();
  };

  const exportDatabaseJSON = (): string => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile,
      clients,
      projects,
      invoices,
      ledger,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.clients && data.projects && data.invoices && data.ledger) {
        setClients(data.clients);
        setProjects(data.projects);
        setInvoices(data.invoices);
        setLedger(data.ledger);
        if (data.profile) setProfile(data.profile);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <ErpContext.Provider
      value={{
        clients,
        projects,
        invoices,
        ledger,
        profile,
        activeTab,
        setActiveTab,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        deleteProject,
        updateMilestoneStatus,
        addMilestone,
        deleteMilestone,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        markInvoiceStatus,
        generateInvoiceForMilestone,
        addLedgerEntry,
        updateLedgerEntry,
        deleteLedgerEntry,
        updateProfile,
        resetToSampleData,
        exportDatabaseJSON,
        importDatabaseJSON,
        quickInvoiceMilestone,
        setQuickInvoiceMilestone,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};
