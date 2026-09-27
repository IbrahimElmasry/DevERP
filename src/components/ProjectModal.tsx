import React, { useState } from 'react';
import { Project, Client, BillingType, Milestone } from '../types/erp';
import { X, Plus, Trash2 } from 'lucide-react';
import { generateUUID } from '../utils/formatters';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id'>) => void;
  clients: Client[];
  initialData?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  initialData,
}) => {
  const [clientId, setClientId] = useState(initialData?.clientId || (clients[0]?.id || ''));
  const [title, setTitle] = useState(initialData?.title || '');
  const [billingType, setBillingType] = useState<BillingType>(initialData?.billingType || 'Fixed');
  const [totalBudget, setTotalBudget] = useState<number>(initialData?.totalBudget || 5000);
  const [hourlyRate, setHourlyRate] = useState<number>(initialData?.hourlyRate || 100);
  const [estimatedHours, setEstimatedHours] = useState<number>(initialData?.estimatedHours || 40);
  const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Active' | 'Completed' | 'On Hold'>(initialData?.status || 'Active');
  const [description, setDescription] = useState(initialData?.description || '');

  const [milestones, setMilestones] = useState<Milestone[]>(
    initialData?.milestones || [
      {
        id: generateUUID(),
        title: 'Initial Deliverable & Architecture Sprint',
        amount: 2500,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'Pending',
      },
    ]
  );

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.id === clientId);
  const currency = selectedClient?.defaultCurrency || 'USD';

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: generateUUID(),
        title: `Milestone ${milestones.length + 1}`,
        amount: Math.max(0, Math.round(totalBudget / (milestones.length + 1))),
        dueDate: new Date(Date.now() + (milestones.length + 1) * 14 * 86400000).toISOString().split('T')[0],
        status: 'Pending',
      },
    ]);
  };

  const handleRemoveMilestone = (id: string) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleUpdateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId) return;

    onSave({
      clientId,
      title: title.trim(),
      billingType,
      totalBudget: Number(totalBudget),
      hourlyRate: billingType === 'Hourly' ? Number(hourlyRate) : undefined,
      estimatedHours: billingType === 'Hourly' ? Number(estimatedHours) : undefined,
      status,
      startDate,
      description: description.trim(),
      milestones,
    });
    onClose();
  };

  const milestonesSum = milestones.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#111827] border border-slate-800 rounded-lg w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">
            {initialData ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Associated Client *</label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name} - {c.defaultCurrency})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Event-Driven Engine"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Billing Contract Type</label>
              <select
                value={billingType}
                onChange={(e) => setBillingType(e.target.value as BillingType)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Fixed">Fixed-Price</option>
                <option value="Hourly">Hourly Rate</option>
                <option value="Retainer">Monthly Retainer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Total Budget ({currency})
              </label>
              <input
                type="number"
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {billingType === 'Hourly' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-3 rounded-md border border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Hourly Rate ({currency})</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => {
                    const r = Number(e.target.value);
                    setHourlyRate(r);
                    setTotalBudget(r * estimatedHours);
                  }}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    setEstimatedHours(h);
                    setTotalBudget(hourlyRate * h);
                  }}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Project Scope / Technical Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Architecture details, tech stack, deliverables..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Milestones Checklist Builder */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Project Milestones & Deliverables
                </span>
                <span className="ml-2 text-xs font-mono text-slate-400">
                  Allocated: {milestonesSum} / {totalBudget} {currency}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-900/80 border border-slate-800 rounded-md flex flex-col sm:flex-row sm:items-center gap-2"
                >
                  <span className="text-xs font-mono text-slate-500 w-6">#{idx + 1}</span>

                  <input
                    type="text"
                    required
                    value={m.title}
                    onChange={(e) => handleUpdateMilestone(m.id, 'title', e.target.value)}
                    placeholder="Milestone title"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                  />

                  <div className="flex items-center gap-2">
                    <div className="relative w-28">
                      <input
                        type="number"
                        required
                        value={m.amount}
                        onChange={(e) => handleUpdateMilestone(m.id, 'amount', Number(e.target.value))}
                        placeholder="Amount"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono pr-8"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-mono">
                        {currency}
                      </span>
                    </div>

                    <input
                      type="date"
                      value={m.dueDate}
                      onChange={(e) => handleUpdateMilestone(m.id, 'dueDate', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                    />

                    <select
                      value={m.status}
                      onChange={(e) => handleUpdateMilestone(m.id, 'status', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Billed">Billed</option>
                    </select>

                    <button
                      type="button"
                      disabled={milestones.length <= 1}
                      onClick={() => handleRemoveMilestone(m.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              {initialData ? 'Save Project' : 'Launch Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
