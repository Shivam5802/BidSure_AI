'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  RefreshCw,
  Mail,
  Lock,
  Building,
  Phone,
  AlertCircle,
  X,
} from 'lucide-react';
import { superAdminApi, AdminUserRecord } from '@/lib/api/superadmin.api';

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New admin form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' | 'PROCUREMENT_OFFICER',
    department: 'Central Vigilance Unit',
    designation: 'Senior System Administrator',
    phone: '+91 11 2345 6789',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.listAdministrators();
      setAdmins(data);
    } catch (err: any) {
      console.error('Failed to load administrators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleStatus = async (user: AdminUserRecord) => {
    if (user.role === 'SUPER_ADMIN' && user.email === 'superadmin@gem.gov.in') {
      alert('The primary Root Super Administrator account cannot be disabled.');
      return;
    }

    const nextStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const confirmMsg = `Are you sure you want to ${nextStatus === 'DISABLED' ? 'SUSPEND' : 'ACTIVATE'} access for ${user.name} (${user.email})?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await superAdminApi.updateAdminStatus(user.id, nextStatus);
      setActionSuccess(`Status for ${user.name} updated to ${nextStatus}.`);
      setTimeout(() => setActionSuccess(null), 3000);
      fetchStaff();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Name, email, and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await superAdminApi.createAdministrator(formData);
      setIsModalOpen(false);
      setActionSuccess(`Administrator ${formData.name} provisioned successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN',
        department: 'Central Vigilance Unit',
        designation: 'Senior System Administrator',
        phone: '+91 11 2345 6789',
      });
      fetchStaff();
    } catch (err: any) {
      setFormError(err.message || 'Failed to provision administrator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-mono tracking-tight text-white sm:text-2xl">
              ADMINISTRATIVE ROSTER &amp; GOVERNANCE
            </h1>
            <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-800">
              LEVEL-0 DIRECT CONTROL
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Provision, audit, promote, or suspend administrators and procurement officers with real-time database persistence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchStaff}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-mono font-semibold text-slate-300 hover:border-cyan-500 hover:text-cyan-300 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-3.5 py-2 text-xs font-mono font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>PROVISION NEW ADMIN</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs text-emerald-200 font-mono animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-[#070e1c] p-3.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 font-mono focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="ADMIN">Administrators</option>
            <option value="PROCUREMENT_OFFICER">Procurement Officers</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 font-mono focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#070e1c] shadow-xl">
        <table className="w-full border-collapse text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 bg-[#050a16] text-[11px] text-slate-400">
              <th className="p-3.5">PERSONNEL</th>
              <th className="p-3.5">ROLE &amp; CLEARANCE</th>
              <th className="p-3.5">DEPARTMENT</th>
              <th className="p-3.5">STATUS</th>
              <th className="p-3.5">LAST ACTIVE</th>
              <th className="p-3.5 text-right">GOVERNANCE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  <RefreshCw className="mx-auto h-5 w-5 animate-spin text-cyan-400 mb-2" />
                  Synchronizing administrative records...
                </td>
              </tr>
            ) : filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No administrative personnel match your search criteria.
                </td>
              </tr>
            ) : (
              filteredAdmins.map((u) => {
                const isSuperAdmin = u.role === 'SUPER_ADMIN';
                const isAdmin = u.role === 'ADMIN';
                const isActive = u.status === 'ACTIVE';

                return (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm border ${
                            isSuperAdmin
                              ? 'border-cyan-500 bg-cyan-950 text-cyan-300'
                              : isAdmin
                              ? 'border-purple-500 bg-purple-950 text-purple-300'
                              : 'border-blue-500 bg-blue-950 text-blue-300'
                          }`}
                        >
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-bold text-white">{u.name}</span>
                          <span className="block text-[10px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          isSuperAdmin
                            ? 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300'
                            : isAdmin
                            ? 'border-purple-500/40 bg-purple-950/60 text-purple-300'
                            : 'border-blue-500/40 bg-blue-950/60 text-blue-300'
                        }`}
                      >
                        {isSuperAdmin ? 'ROOT SUPER ADMIN' : isAdmin ? 'ADMINISTRATOR' : 'PROCUREMENT OFFICER'}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-300">
                      <div>{u.department}</div>
                      <div className="text-[10px] text-slate-500">{u.designation}</div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          isActive
                            ? 'border-emerald-500/30 bg-emerald-950/50 text-emerald-400'
                            : 'border-rose-500/30 bg-rose-950/50 text-rose-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never logged in'}
                    </td>

                    <td className="p-3.5 text-right">
                      {isSuperAdmin && u.email === 'superadmin@gem.gov.in' ? (
                        <span className="text-[10px] text-slate-500 italic">IMMUTABLE ROOT</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                            isActive
                              ? 'border-rose-800/80 bg-rose-950/40 text-rose-300 hover:bg-rose-950'
                              : 'border-emerald-800/80 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950'
                          }`}
                        >
                          {isActive ? 'SUSPEND' : 'ACTIVATE'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Provision New Administrator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-cyan-900/60 bg-[#091122] p-6 shadow-2xl text-slate-100 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">PROVISION PRIVILEGED PERSONNEL</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">FULL OFFICIAL NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Harish Chandra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">GOVERNMENT / OFFICIAL EMAIL</label>
                <input
                  type="email"
                  required
                  placeholder="harish.c@gem.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">TEMPORARY PASSWORD</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">ASSIGNED ROLE</label>
                  <select
                    value={formData.role}
                    onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ADMIN">System Administrator</option>
                    <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
                    <option value="SUPER_ADMIN">Root Super Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">PHONE NUMBER</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">DEPARTMENT</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">DESIGNATION</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-3.5 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Personnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
