'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, RolePermissionMatrix, AdminUserRecord } from '@/lib/api/admin.api';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  XCircle,
  Users,
  AlertTriangle,
  Info,
  RefreshCw,
  Loader2,
  KeyRound,
  FileCheck,
  Search,
  Eye,
  Shield,
  Layers,
  Check,
  X,
  ArrowRight,
  UserCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RolesAndPermissionsPage() {
  const [matrixData, setMatrixData] = useState<RolePermissionMatrix | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'USERS' | 'MATRIX'>('USERS');

  // Search & Role Filter
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Inspect User Permissions Modal
  const [inspectedUser, setInspectedUser] = useState<AdminUserRecord | null>(null);

  // Role Change Modal
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUserRecord | null>(null);
  const [targetRole, setTargetRole] = useState<string>('PROCUREMENT_OFFICER');
  const [changeReason, setChangeReason] = useState<string>('');
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [matrix, usersRes] = await Promise.all([
        adminApi.getRolesMatrix(),
        adminApi.listUsers({ includeAdmins: true, limit: 100 }),
      ]);
      setMatrixData(matrix);
      const userList = Array.isArray(usersRes) ? usersRes : usersRes?.users || [];
      // Exclude Super Admin from user list (Super Admin is ROOT in .env)
      setUsers(userList.filter((u) => u.role !== 'SUPER_ADMIN'));
    } catch (err: any) {
      setError(err.message || 'Failed to load sovereign access governance policies.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const roles = (matrixData?.roles || []).filter((r) => r.role !== 'SUPER_ADMIN');
  const permissions = (matrixData?.permissions || []).filter((p) => p.id !== 'system.disaster_recovery');
  const matrix = matrixData?.matrix || {};

  // Helper to get granted permissions count and list for a user
  const getUserPermissions = (role: string) => {
    let grantedIds = matrix[role];
    if (!grantedIds || grantedIds.length === 0) {
      if (role === 'ADMIN') {
        grantedIds = permissions.length > 0
          ? permissions.map((p) => p.id)
          : [
              'users.read',
              'users.update',
              'users.suspend',
              'users.manage_roles',
              'tenders.read',
              'tenders.manage',
              'bids.read',
              'bids.evaluate',
              'compliance.read',
              'compliance.rules.manage',
              'integrations.manage',
              'audit.read',
              'reports.export',
              'system.settings.manage',
            ];
      } else if (role === 'PROCUREMENT_OFFICER') {
        grantedIds = [
          'tenders.read',
          'tenders.manage',
          'bids.read',
          'bids.evaluate',
          'compliance.read',
          'audit.read',
          'reports.export',
        ];
      } else if (role === 'BIDDER') {
        grantedIds = ['tenders.read'];
      } else {
        grantedIds = [];
      }
    }
    const totalCount = permissions.length > 0 ? permissions.length : 14;
    return {
      count: grantedIds.length,
      total: totalCount,
      percentage: totalCount > 0 ? Math.round((grantedIds.length / totalCount) * 100) : 0,
      grantedList: permissions.filter((p) => grantedIds.includes(p.id)),
      deniedList: permissions.filter((p) => !grantedIds.includes(p.id)),
    };
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const handleExecuteRoleChange = async () => {
    if (!roleChangeUser) return;
    if (!changeReason.trim() || changeReason.trim().length < 5) {
      setError('Please provide an audit justification reason (minimum 5 characters) for role modification.');
      return;
    }

    try {
      setIsSubmittingRole(true);
      setError(null);
      await adminApi.updateUserRole(roleChangeUser.id, targetRole, changeReason.trim());
      setSuccessMsg(`Role for ${roleChangeUser.name} updated to ${targetRole}. Permissions recalculated.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setRoleChangeUser(null);
      setChangeReason('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update user role.');
    } finally {
      setIsSubmittingRole(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-8 w-8 animate-spin text-[#1464B4]" />
          <p className="text-xs text-slate-500">Loading user role assignments and permission grants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                User Roles & Permissions Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit assigned roles, inspect granular platform capabilities, and govern user access boundaries
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={loadData}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl p-4 text-xs border bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-bold underline hover:no-underline">
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between gap-3 rounded-xl p-4 text-xs border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs font-bold underline hover:no-underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Platform Users Monitored</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Operational & Administrative accounts</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>System Administrator Grants</span>
            <Shield className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {matrix.ADMIN?.length || 14} / {permissions.length || 14}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Full governance & lifecycle scope</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Procurement Officer Grants</span>
            <FileCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {matrix.PROCUREMENT_OFFICER?.length || 7} / {permissions.length || 14}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tenders, rules & bid qualification</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Commercial Bidder Scope</span>
            <Lock className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            {matrix.BIDDER?.length || 1} / {permissions.length || 14}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Self-service submission sandbox</p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'USERS'
              ? 'bg-[#1464B4] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          User Access & Permission Grants ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MATRIX')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'MATRIX'
              ? 'bg-[#1464B4] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          System RBAC Capability Matrix
        </button>
      </div>

      {/* 4. TAB CONTENT 1: USER ROLES & ACCESS GRANTS */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* Search & Role Filter Bar */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name, email, department, or User ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#1464B4]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
              {['ALL', 'PROCUREMENT_OFFICER', 'ADMIN', 'BIDDER'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedRoleFilter === role
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {role === 'ALL'
                    ? 'All Users'
                    : role === 'PROCUREMENT_OFFICER'
                    ? 'Officers'
                    : role === 'ADMIN'
                    ? 'Administrators'
                    : 'Bidders'}
                </button>
              ))}
            </div>
          </div>

          {/* User List Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">User Identity</th>
                    <th className="px-5 py-3.5">Assigned Role</th>
                    <th className="px-5 py-3.5">Platform Access Level</th>
                    <th className="px-5 py-3.5">Key Capability Entitlements</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-mono">
                        No users matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const userPerms = getUserPermissions(u.role);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{u.department || 'General Services'}</div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : u.role === 'PROCUREMENT_OFFICER'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              {u.role === 'ADMIN'
                                ? 'Administrator'
                                : u.role === 'PROCUREMENT_OFFICER'
                                ? 'Procurement Officer'
                                : 'Bidder / Vendor'}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="space-y-1.5 w-40">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {userPerms.count} / {userPerms.total}
                                </span>
                                <span className="font-mono text-[10px] text-slate-500">
                                  {userPerms.percentage}% Scope
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    userPerms.percentage >= 70
                                      ? 'bg-indigo-600 dark:bg-indigo-500'
                                      : userPerms.percentage >= 40
                                      ? 'bg-emerald-600 dark:bg-emerald-500'
                                      : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${userPerms.percentage}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap gap-1 max-w-md">
                              {userPerms.grantedList.slice(0, 3).map((p) => (
                                <span
                                  key={p.id}
                                  className={`rounded px-2 py-0.5 text-[10px] font-medium border ${
                                    u.role === 'ADMIN'
                                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                      : u.role === 'PROCUREMENT_OFFICER'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                      : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                  }`}
                                >
                                  {p.label}
                                </span>
                              ))}
                              {userPerms.grantedList.length > 3 && (
                                <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                                  +{userPerms.grantedList.length - 3} more capabilities
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setInspectedUser(u)}
                                className="h-8 px-2.5 text-[11px] rounded-lg text-[#1464B4] hover:bg-blue-50 dark:hover:bg-blue-950/40"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Inspect Access
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setRoleChangeUser(u);
                                  setTargetRole(u.role);
                                  setChangeReason('');
                                }}
                                className="h-8 px-2.5 text-[11px] rounded-lg hover:border-[#1464B4] hover:text-[#1464B4]"
                              >
                                Change Role
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT 2: SYSTEM CAPABILITY MATRIX */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-6">
          {/* Security Safeguards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1464B4] dark:text-[#58A6FF]">
                <KeyRound className="h-4 w-4 shrink-0" />
                Least-Privilege Enforcement
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                All server-side endpoints enforce strict cryptographic Bearer JWT validation. Front-end visibility toggles are backed by mandatory <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded font-mono">requireRole()</code> Fastify middleware guards.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                Privilege Boundary Safeguards
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Role modifications require mandatory audit justifications. Administrators govern operational capabilities according to institutional procurement policies.
              </p>
            </div>
          </div>

          {/* Role Cards Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div
                key={r.role}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role Definition</span>
                    {r.isImmutable && (
                      <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 text-[9px] font-bold">
                        Immutable
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{r.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{r.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Active Grants</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {matrix[r.role]?.length || 0} permissions
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Granular Permission Matrix Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Platform Capability Matrix</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive map of granular permissions assigned to each system role</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Permission Identifier & Scope</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-4 py-3.5 text-center">Bidder</th>
                    <th className="px-4 py-3.5 text-center">Procurement Officer</th>
                    <th className="px-4 py-3.5 text-center">Administrator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {permissions.map((p) => {
                    const hasBidder = matrix.BIDDER?.includes(p.id);
                    const hasOfficer = matrix.PROCUREMENT_OFFICER?.includes(p.id);
                    const hasAdmin = matrix.ADMIN?.includes(p.id);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-5 py-3">
                          <div className="font-semibold text-slate-900 dark:text-white">{p.label}</div>
                          <div className="font-mono text-[10px] text-slate-400">{p.id}</div>
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasBidder ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasOfficer ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasAdmin ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-blue-500" />
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: USER PERMISSION INSPECTOR */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  User Access Entitlement Report
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {inspectedUser.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>{inspectedUser.email}</span>
                  <span>•</span>
                  <span>{inspectedUser.department || 'General Services'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Role & Access Summary */}
            {(() => {
              const perms = getUserPermissions(inspectedUser.role);
              return (
                <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Assigned Platform Role
                      </span>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {inspectedUser.role === 'ADMIN'
                          ? 'Platform System Administrator'
                          : inspectedUser.role === 'PROCUREMENT_OFFICER'
                          ? 'Senior Procurement Officer (GeM)'
                          : 'Commercial Vendor / Bidder'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {perms.count} of {perms.total} Capabilities Granted
                      </span>
                      <div className="text-[10px] text-slate-400">{perms.percentage}% Total Platform Authority</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                      style={{ width: `${perms.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Granular Permission Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Detailed Platform Capability Grants
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto">
                {permissions.map((p) => {
                  const isGranted = (matrix[inspectedUser.role] || []).includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {p.label}
                          <span className="font-mono text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded">
                            {p.id}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">Category: {p.category}</div>
                      </div>

                      {isGranted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Check className="h-3 w-3" /> Granted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <X className="h-3 w-3" /> Restricted
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setInspectedUser(null)}
                className="rounded-xl text-xs"
              >
                Close Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: MODIFY USER ROLE */}
      {roleChangeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Modify Platform Role & Authority
            </h3>

            <p className="text-xs text-slate-500">
              Target User: <span className="font-bold text-slate-900 dark:text-white">{roleChangeUser.name}</span> ({roleChangeUser.email})
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Select New Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="ADMIN">Platform System Administrator — {matrix.ADMIN?.length || 14} Capabilities (Full Platform Scope)</option>
                <option value="PROCUREMENT_OFFICER">Procurement Officer (GeM) — {matrix.PROCUREMENT_OFFICER?.length || 7} Capabilities</option>
                <option value="BIDDER">Commercial Vendor / Bidder — {matrix.BIDDER?.length || 1} Capability</option>
              </select>
            </div>

            {/* Preview of new access scope */}
            {(() => {
              const previewPerms = getUserPermissions(targetRole);
              return (
                <div className="rounded-xl p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs space-y-1">
                  <div className="font-bold text-[#1464B4] dark:text-[#58A6FF]">
                    Impact of Role Modification:
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    This user will receive <span className="font-bold">{previewPerms.count} platform permissions</span> ({previewPerms.percentage}% access authority).
                  </p>
                </div>
              );
            })()}

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Audit Justification *
              </label>
              <textarea
                rows={2}
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Required statutory reason for security and audit log compliance..."
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setRoleChangeUser(null)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecuteRoleChange}
                disabled={isSubmittingRole}
                className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold"
              >
                {isSubmittingRole ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Confirm Role Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
