import React, { useState } from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/views/DashboardView';
import { ClientsProjectsView } from './components/views/ClientsProjectsView';
import { InvoicesView } from './components/views/InvoicesView';
import { LedgerView } from './components/views/LedgerView';
import { SettingsView } from './components/views/SettingsView';
import { ClientModal } from './components/ClientModal';
import { ProjectModal } from './components/ProjectModal';
import { InvoiceModal } from './components/InvoiceModal';
import { InvoicePreviewModal } from './components/InvoicePreviewModal';
import { LedgerModal } from './components/LedgerModal';
import { Client, Project, Invoice, CashFlowLedgerEntry } from './types/erp';

const ErpApp: React.FC = () => {
  const {
    activeTab,
    clients,
    projects,
    profile,
    addClient,
    updateClient,
    addProject,
    updateProject,
    addInvoice,
    updateInvoice,
    markInvoiceStatus,
    addLedgerEntry,
    updateLedgerEntry,
    quickInvoiceMilestone,
    setQuickInvoiceMilestone,
  } = useErp();

  // Modal control states
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewingInvoice, setPreviewingInvoice] = useState<Invoice | null>(null);

  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState<CashFlowLedgerEntry | null>(null);

  // Client modal handlers
  const handleOpenNewClient = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (data: Omit<Client, 'id' | 'createdAt'>) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
    } else {
      addClient(data);
    }
  };

  // Project modal handlers
  const handleOpenNewProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (data: Omit<Project, 'id'>) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
    } else {
      addProject(data);
    }
  };

  // Invoice modal handlers
  const handleOpenNewInvoice = () => {
    setEditingInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setPreviewingInvoice(invoice);
    setIsPreviewModalOpen(true);
  };

  const handleSaveInvoice = (data: Omit<Invoice, 'id'>): Invoice => {
    if (editingInvoice) {
      updateInvoice(editingInvoice.id, data);
      return { ...data, id: editingInvoice.id };
    } else {
      return addInvoice(data);
    }
  };

  // Ledger modal handlers
  const handleOpenNewLedger = () => {
    setEditingLedger(null);
    setIsLedgerModalOpen(true);
  };

  const handleEditLedger = (entry: CashFlowLedgerEntry) => {
    setEditingLedger(entry);
    setIsLedgerModalOpen(true);
  };

  const handleSaveLedger = (data: Omit<CashFlowLedgerEntry, 'id'>) => {
    if (editingLedger) {
      updateLedgerEntry(editingLedger.id, data);
    } else {
      addLedgerEntry(data);
    }
  };

  const previewClient = clients.find((c) => c.id === previewingInvoice?.clientId);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Bar Contract Navbar */}
      <Navbar
        onOpenNewInvoice={handleOpenNewInvoice}
        onOpenNewLedger={handleOpenNewLedger}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenNewInvoice={handleOpenNewInvoice}
            onOpenNewLedger={handleOpenNewLedger}
            onViewInvoice={handleViewInvoice}
          />
        )}

        {(activeTab === 'clients' || activeTab === 'projects') && (
          <ClientsProjectsView
            onOpenNewClient={handleOpenNewClient}
            onEditClient={handleEditClient}
            onOpenNewProject={handleOpenNewProject}
            onEditProject={handleEditProject}
            onOpenInvoiceModal={handleOpenNewInvoice}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesView
            onOpenNewInvoice={handleOpenNewInvoice}
            onEditInvoice={handleEditInvoice}
            onViewInvoice={handleViewInvoice}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerView
            onOpenNewLedger={handleOpenNewLedger}
            onEditLedger={handleEditLedger}
          />
        )}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Quiet Developer Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0d131f] py-4 px-4 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">DevERP</span>
            <span>·</span>
            <span>Client-Side Local Storage</span>
            <span>·</span>
            <span className="text-emerald-400/80">Offline Ready</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Base: {profile.baseCurrency} · FX Rates Locked
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        initialData={editingClient}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        clients={clients}
        initialData={editingProject}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setEditingInvoice(null);
          setQuickInvoiceMilestone(null);
        }}
        onSave={handleSaveInvoice}
        clients={clients}
        projects={projects}
        profile={profile}
        initialData={editingInvoice}
        preselectedMilestone={quickInvoiceMilestone}
        onPreviewCreated={(inv) => {
          setPreviewingInvoice(inv);
          setIsPreviewModalOpen(true);
        }}
      />

      <InvoicePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewingInvoice(null);
        }}
        invoice={previewingInvoice}
        client={previewClient}
        profile={profile}
        onStatusChange={(invId, status) => {
          markInvoiceStatus(invId, status);
          if (previewingInvoice && previewingInvoice.id === invId) {
            setPreviewingInvoice({ ...previewingInvoice, status });
          }
        }}
      />

      <LedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => {
          setIsLedgerModalOpen(false);
          setEditingLedger(null);
        }}
        onSave={handleSaveLedger}
        profile={profile}
        initialData={editingLedger}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErpProvider>
      <ErpApp />
    </ErpProvider>
  );
}
