import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Client, Project, Milestone } from '../../types/erp';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  FolderGit2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Building,
  Mail,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ClientsProjectsViewProps {
  onOpenNewClient: () => void;
  onEditClient: (client: Client) => void;
  onOpenNewProject: () => void;
  onEditProject: (project: Project) => void;
  onOpenInvoiceModal: () => void;
}

export const ClientsProjectsView: React.FC<ClientsProjectsViewProps> = ({
  onOpenNewClient,
  onEditClient,
  onOpenNewProject,
  onEditProject,
  onOpenInvoiceModal,
}) => {
  const {
    clients,
    projects,
    deleteClient,
    deleteProject,
    updateMilestoneStatus,
    addMilestone,
    deleteMilestone,
    setQuickInvoiceMilestone,
  } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [viewSection, setViewSection] = useState<'projects' | 'clients'>('projects');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    'p1-distributed-cache': true,
    'p2-kinetix-crm': true,
    'p3-nilepay-gateway': true,
  });

  // New inline milestone draft per project
  const [addingMilestoneToProject, setAddingMilestoneToProject] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState<number>(1000);
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  const toggleExpand = (id: string) => {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveInlineMilestone = (projectId: string) => {
    if (!newMilestoneTitle.trim()) return;
    addMilestone(projectId, {
      title: newMilestoneTitle.trim(),
      amount: Number(newMilestoneAmount) || 0,
      dueDate: newMilestoneDueDate,
      status: 'Pending',
    });
    setNewMilestoneTitle('');
    setAddingMilestoneToProject(null);
  };

  // Filtered lists
  const filteredProjects = projects.filter((p) => {
    const client = clients.find((c) => c.id === p.clientId);
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client?.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient = selectedClientId === 'all' || p.clientId === selectedClientId;
    return matchesSearch && matchesClient;
  });

  const filteredClients = clients.filter(
    (c) =>
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Clients & Project Operations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deliverable roadmaps, milestone progress, and client account terms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewClient}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Client</span>
          </button>
          <button
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-lg">
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setViewSection('projects')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewSection === 'projects'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Projects & Milestones ({projects.length})</span>
          </button>
          <button
            onClick={() => setViewSection('clients')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewSection === 'clients'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Clients Directory ({clients.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:max-w-md justify-end">
          {viewSection === 'projects' && (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Clients ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, title, email..."
              className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: PROJECTS & MILESTONES */}
      {viewSection === 'projects' && (
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="bg-[#111827] border border-slate-800 rounded-lg p-10 text-center text-xs text-slate-400">
              No matching projects found. Click "New Project" to define your first deliverable roadmap.
            </div>
          ) : (
            filteredProjects.map((project) => {
              const client = clients.find((c) => c.id === project.clientId);
              const currency = client?.defaultCurrency || 'USD';
              const isExpanded = !!expandedProjects[project.id];

              const totalMilestones = project.milestones.length;
              const completedMilestones = project.milestones.filter(
                (m) => m.status === 'Completed' || m.status === 'Billed'
              ).length;
              const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

              return (
                <div
                  key={project.id}
                  className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden transition-all"
                >
                  {/* Project Header Bar */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleExpand(project.id)}
                          className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <h2 className="text-base font-bold text-white tracking-tight">{project.title}</h2>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">
                          {project.billingType}
                        </span>
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                            project.status === 'Active'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 ml-6">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          {client?.company || 'Unknown Client'} ({client?.name})
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono">
                          Total Budget:{' '}
                          <strong className="text-slate-200">
                            {formatCurrency(project.totalBudget, currency)}
                          </strong>
                        </span>
                        {project.billingType === 'Hourly' && project.hourlyRate && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span className="font-mono text-slate-400">
                              @{formatCurrency(project.hourlyRate, currency)}/hr ({project.estimatedHours}h est)
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:justify-end ml-6 sm:ml-0">
                      {/* Mini Progress */}
                      <div className="w-32 hidden md:block">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => onEditProject(project)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete project "${project.title}"?`)) {
                            deleteProject(project.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Milestones Checklist Container */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
                          Milestones & Deliverables ({project.milestones.length})
                        </span>
                        <button
                          onClick={() => setAddingMilestoneToProject(project.id)}
                          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Milestone</span>
                        </button>
                      </div>

                      {/* Inline Milestone Creation Row */}
                      {addingMilestoneToProject === project.id && (
                        <div className="p-3 bg-slate-900 border border-emerald-500/40 rounded-md space-y-3 text-xs">
                          <div className="font-semibold text-slate-200">New Milestone Deliverable</div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={newMilestoneTitle}
                              onChange={(e) => setNewMilestoneTitle(e.target.value)}
                              placeholder="Milestone description"
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                            <div className="relative">
                              <input
                                type="number"
                                value={newMilestoneAmount}
                                onChange={(e) => setNewMilestoneAmount(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono pr-8"
                              />
                              <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-mono">
                                {currency}
                              </span>
                            </div>
                            <input
                              type="date"
                              value={newMilestoneDueDate}
                              onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setAddingMilestoneToProject(null)}
                              className="px-2.5 py-1 text-slate-400 hover:text-white rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveInlineMilestone(project.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium cursor-pointer"
                            >
                              Save Milestone
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Milestones list */}
                      <div className="space-y-2">
                        {project.milestones.map((m) => {
                          const isBilled = m.status === 'Billed';
                          const isCompleted = m.status === 'Completed';

                          return (
                            <div
                              key={m.id}
                              className={`p-3 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                                isBilled
                                  ? 'bg-slate-900/30 border-slate-800/50 opacity-75'
                                  : isCompleted
                                  ? 'bg-emerald-950/20 border-emerald-900/40'
                                  : 'bg-slate-900/70 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  disabled={isBilled}
                                  onClick={() =>
                                    updateMilestoneStatus(
                                      project.id,
                                      m.id,
                                      m.status === 'Pending' ? 'Completed' : 'Pending'
                                    )
                                  }
                                  className={`p-1 rounded cursor-pointer transition-colors ${
                                    isBilled
                                      ? 'text-slate-600 cursor-not-allowed'
                                      : isCompleted
                                      ? 'text-emerald-400 hover:text-slate-400'
                                      : 'text-slate-500 hover:text-emerald-400'
                                  }`}
                                  title={
                                    isBilled
                                      ? 'Already billed'
                                      : isCompleted
                                      ? 'Click to reset to Pending'
                                      : 'Click to mark Completed'
                                  }
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>

                                <div className="space-y-0.5 truncate flex-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-medium truncate ${
                                        isBilled ? 'line-through text-slate-400' : 'text-slate-200'
                                      }`}
                                    >
                                      {m.title}
                                    </span>
                                    <span
                                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                        isBilled
                                          ? 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                                          : isCompleted
                                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40'
                                          : 'bg-slate-800 text-slate-400 border-slate-700/60'
                                      }`}
                                    >
                                      {m.status}
                                    </span>
                                  </div>
                                  <div className="text-slate-400 text-[11px] flex items-center gap-2 font-mono">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-500" />
                                      Due {formatDate(m.dueDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                <span className="font-mono font-semibold text-slate-200">
                                  {formatCurrency(m.amount, currency)}
                                </span>

                                {!isBilled ? (
                                  <button
                                    onClick={() => {
                                      setQuickInvoiceMilestone({ project, milestone: m });
                                      onOpenInvoiceModal();
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors shadow-xs cursor-pointer"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>Invoice Milestone</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] font-mono text-slate-500 px-2 py-0.5 bg-slate-800/50 rounded">
                                    Billed in Invoice
                                  </span>
                                )}

                                <button
                                  disabled={project.milestones.length <= 1}
                                  onClick={() => deleteMilestone(project.id, m.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded disabled:opacity-20 cursor-pointer"
                                  title="Delete milestone"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SECTION 2: CLIENTS DIRECTORY */}
      {viewSection === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.length === 0 ? (
            <div className="col-span-full bg-[#111827] border border-slate-800 rounded-lg p-10 text-center text-xs text-slate-400">
              No clients found. Click "Add Client" to register a client organization.
            </div>
          ) : (
            filteredClients.map((client) => {
              const clientProjects = projects.filter((p) => p.clientId === client.id);
              const activeCount = clientProjects.filter((p) => p.status === 'Active').length;
              const totalClientBudget = clientProjects.reduce((sum, p) => sum + p.totalBudget, 0);

              return (
                <div
                  key={client.id}
                  className="bg-[#111827] border border-slate-800 rounded-lg p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-white tracking-tight">{client.company}</h2>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>{client.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditClient(client)}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Client"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete client "${client.company}"?`)) {
                              deleteClient(client.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 font-mono text-[11px]">
                        <span className="text-slate-500">Terms:</span>
                        <span className="text-slate-300">Net {client.paymentTermsDays} days</span>
                      </div>
                      <div className="flex justify-between items-center font-mono text-[11px]">
                        <span className="text-slate-500">Default Currency:</span>
                        <span className="text-emerald-400 font-semibold">{client.defaultCurrency}</span>
                      </div>
                      {client.taxId && (
                        <div className="flex justify-between items-center font-mono text-[11px]">
                          <span className="text-slate-500">Tax / VAT ID:</span>
                          <span className="text-slate-300">{client.taxId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      {activeCount} Active / {clientProjects.length} Total Projects
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {formatCurrency(totalClientBudget, client.defaultCurrency)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
