'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { OfficerItem } from '@/types/application';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Search,
  Edit2,
  Activity,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Lock,
  Sparkles,
  Phone,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState<OfficerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const [selectedOfficer, setSelectedOfficer] = useState<OfficerItem | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  // Form states for Create
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Refinery Infrastructure Directorate',
    designation: 'Senior Procurement Officer',
    phone: '+91 98765 43210',
  });

  // Form states for Edit
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    designation: '',
    phone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOfficers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.listOfficers();
      setOfficers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load officers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOfficers();
  }, []);

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await api.createOfficer({
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password || undefined,
        department: createForm.department.trim(),
        designation: createForm.designation.trim(),
        phone: createForm.phone.trim(),
      });
      setShowCreateModal(false);
      setSuccessMsg(`Officer "${createForm.name}" provisioned successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        department: 'Refinery Infrastructure Directorate',
        designation: 'Senior Procurement Officer',
        phone: '+91 98765 43210',
      });
      await loadOfficers();
    } catch (err: any) {
      setError(err.message || 'Failed to create officer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficer) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await api.updateOfficer(selectedOfficer.id, {
        name: editForm.name.trim(),
        department: editForm.department.trim(),
        designation: editForm.designation.trim(),
        phone: editForm.phone.trim(),
      });
      setShowEditModal(false);
      setSuccessMsg(`Officer details updated.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadOfficers();
    } catch (err: any) {
      setError(err.message || 'Failed to update officer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (officer: OfficerItem) => {
    try {
      setError(null);
      if (officer.isActive) {
        await api.deactivateOfficer(officer.id);
        setSuccessMsg(`Officer ${officer.name} deactivated.`);
      } else {
        await api.activateOfficer(officer.id);
        setSuccessMsg(`Officer ${officer.name} activated.`);
      }
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadOfficers();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle officer status.');
    }
  };

  const handleViewActivity = async (officer: OfficerItem) => {
    setSelectedOfficer(officer);
    setShowActivityModal(true);
    try {
      setIsLoadingActivity(true);
      const logs = await api.getOfficerActivity(officer.id);
      setActivityLogs(logs);
    } catch {
      setActivityLogs([]);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const openEditModal = (officer: OfficerItem) => {
    setSelectedOfficer(officer);
    setEditForm({
      name: officer.name,
      department: officer.department || '',
      designation: officer.designation || '',
      phone: officer.phone || '',
    });
    setShowEditModal(true);
  };

  const fillDemoOfficer = () => {
    const timestamp = Date.now().toString().slice(-4);
    setCreateForm({
      name: 'Pooja Verma',
      email: `pooja.verma_${timestamp}@gem.gov.in`,
      password: 'Officer@12345',
      department: 'Refinery Infrastructure Directorate',
      designation: 'Executive Procurement Officer',
      phone: '+91 98765 11223',
    });
  };

  const filteredOfficers = officers.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      (o.department && o.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Procurement Officer Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Provision, manage credentials, and control access permissions for evaluation officers
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Provision New Officer
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search officers by name, official email, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Officers Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : filteredOfficers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No procurement officers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Officer Profile</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredOfficers.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{o.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{o.email}</div>
                    </td>
                    <td className="py-3 px-4">{o.department || 'Procurement Directorate'}</td>
                    <td className="py-3 px-4">{o.designation || 'Officer'}</td>
                    <td className="py-3 px-4 text-[11px] font-mono">{o.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          o.isActive
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {o.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(o)}
                        className="h-7 text-[11px] px-2 rounded-lg"
                        title="Edit profile"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewActivity(o)}
                        className="h-7 text-[11px] px-2 rounded-lg"
                        title="View audit logs"
                      >
                        <Activity className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleToggleStatus(o)}
                        className={`h-7 text-[11px] px-2.5 rounded-lg font-bold ${
                          o.isActive
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {o.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create New Officer */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Provision New Procurement Officer
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="flex items-center justify-between rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5">
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Fast Demo Fill
              </span>
              <button
                type="button"
                onClick={fillDemoOfficer}
                className="rounded bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-indigo-700"
              >
                Fill Sample Officer
              </button>
            </div>

            <form onSubmit={handleCreateOfficer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g., Pooja Verma"
                  className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Government Email *
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="pooja.verma@gem.gov.in"
                  className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Defaults to Officer@123 if blank"
                  className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <input
                    type="text"
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={createForm.designation}
                    onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  {isSubmitting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  Provision Officer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Officer */}
      {showEditModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Officer Details
              </h2>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditOfficer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Designation</label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Activity Logs */}
      {showActivityModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Officer Activity Stream
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{selectedOfficer.name} ({selectedOfficer.email})</p>
              </div>
              <button
                type="button"
                onClick={() => setShowActivityModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {isLoadingActivity ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  No recorded audit events for this officer.
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.action}</span>
                      <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    {log.details && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setShowActivityModal(false)}
                className="rounded-xl text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
