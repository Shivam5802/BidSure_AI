'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, AdminUserRecord, AdminUserDetail } from '@/lib/api/admin.api';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Loader2,
  UserCheck,
  UserX,
  Shield,
  MessageSquare,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);

  const [actionTarget, setActionTarget] = useState<AdminUserRecord | null>(null);
  const [actionType, setActionType] = useState<'SUSPEND' | 'ACTIVATE' | 'ROLE_CHANGE' | 'NOTE' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [newRole, setNewRole] = useState<string>('ADMIN');
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await adminApi.listUsers({
        search: search.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 15,
      });
      setUsers(res.users);
      setPagination(res.pagination);
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to retrieve platform users.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleOpenDetail = async (userId: string) => {
    setSelectedUserId(userId);
    try {
      const data = await adminApi.getUserDetail(userId);
      setUserDetail(data);
    } catch (err: any) {
      alert(`Could not load details: ${err.message}`);
    }
  };

  const handleExecuteAction = async () => {
    if (!actionTarget) return;
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      if (actionType === 'SUSPEND') {
        if (!actionReason.trim() || actionReason.trim().length < 5) {
          throw new Error('Please provide an administrative reason (at least 5 characters) for suspension.');
        }
        await adminApi.updateUserStatus(actionTarget.id, 'DISABLED', actionReason);
        setFeedbackMessage({ type: 'success', text: `Account for ${actionTarget.email} has been suspended.` });
      } else if (actionType === 'ACTIVATE') {
        if (!actionReason.trim() || actionReason.trim().length < 5) {
          throw new Error('Please provide an administrative reason for activation.');
        }
        await adminApi.updateUserStatus(actionTarget.id, 'ACTIVE', actionReason);
        setFeedbackMessage({ type: 'success', text: `Account for ${actionTarget.email} has been activated.` });
      } else if (actionType === 'ROLE_CHANGE') {
        if (!actionReason.trim() || actionReason.trim().length < 5) {
          throw new Error('Please provide an audit justification reason for role modification.');
        }
        await adminApi.updateUserRole(actionTarget.id, newRole, actionReason);
        setFeedbackMessage({ type: 'success', text: `Role updated to ${newRole} for ${actionTarget.email}.` });
      } else if (actionType === 'NOTE') {
        if (!newNote.trim()) {
          throw new Error('Note text cannot be empty.');
        }
        await adminApi.addUserNote(actionTarget.id, newNote);
        setFeedbackMessage({ type: 'success', text: 'Administrative note attached.' });
      }

      setActionTarget(null);
      setActionType(null);
      setActionReason('');
      setNewNote('');
      fetchUsers(pagination.page);
      if (selectedUserId === actionTarget.id) {
        handleOpenDetail(actionTarget.id);
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Operation failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sovereign Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
                  Global User & Organization Registry
                </h1>
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-400 border border-cyan-800/80">
                  ROOT CLEARANCE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect platform accounts, enforce sovereign status states, assign roles, and audit access credentials
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchUsers(pagination.page)}
            className="rounded-xl border-slate-700 bg-slate-900/80 text-xs font-mono text-cyan-400 hover:bg-slate-800 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            SYNC REPO
          </Button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl p-4 text-xs font-mono border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="underline hover:no-underline">Dismiss</button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search users by name, official email, department, or User ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-300 font-mono"
            >
              <option value="ALL">All Roles</option>
              <option value="BIDDER">Bidder / Vendor</option>
              <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
              <option value="ADMIN">Administrator</option>
              <option value="SUPER_ADMIN">Super Administrator</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-300 font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Suspended</option>
            </select>

            <Button type="submit" className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-bold px-4">
              QUERY
            </Button>
          </div>
        </form>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#040812] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">User Identity & ID</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Department / Organization</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Completeness</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Root Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-400 mb-2" />
                    Querying sovereign identity registry...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <span>{u.name}</span>
                        {u.role === 'SUPER_ADMIN' && (
                          <span className="rounded bg-rose-950 text-rose-300 px-1.5 py-0.2 font-mono text-[9px] border border-rose-800 font-bold">
                            ROOT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      <div className="font-mono text-[9px] text-slate-500 mt-0.5">{u.id}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                          u.role === 'SUPER_ADMIN'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                            : u.role === 'ADMIN'
                            ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                            : u.role === 'PROCUREMENT_OFFICER'
                            ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-200">{u.department || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500">{u.designation || 'N/A'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className={`h-full ${u.completeness >= 80 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ width: `${u.completeness}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{u.completeness}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(u.id)}
                          className="h-8 px-2 text-[11px] text-cyan-400 hover:bg-slate-800 rounded-lg"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Inspect
                        </Button>

                        {u.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={u.role === 'SUPER_ADMIN'}
                            onClick={() => {
                              setActionTarget(u);
                              setActionType('SUSPEND');
                              setActionReason('');
                            }}
                            className="h-8 px-2 text-[11px] text-rose-400 hover:bg-rose-950/40 rounded-lg disabled:opacity-30"
                          >
                            <UserX className="h-3.5 w-3.5 mr-1" />
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActionTarget(u);
                              setActionType('ACTIVATE');
                              setActionReason('');
                            }}
                            className="h-8 px-2 text-[11px] text-emerald-400 hover:bg-emerald-950/40 rounded-lg"
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1" />
                            Activate
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActionTarget(u);
                            setActionType('ROLE_CHANGE');
                            setNewRole(u.role);
                            setActionReason('');
                          }}
                          className="h-8 px-2 text-[11px] text-blue-400 hover:bg-blue-950/40 rounded-lg"
                        >
                          <Shield className="h-3.5 w-3.5 mr-1" />
                          Role
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#040812] border-t border-slate-800 text-xs font-mono text-slate-400">
          <div>
            Showing <span className="text-slate-100 font-bold">{users.length}</span> of{' '}
            <span className="text-slate-100 font-bold">{pagination.total}</span> users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="h-8 border-slate-800 bg-slate-900 text-xs text-slate-300"
            >
              Prev
            </Button>
            <span className="text-xs font-mono text-cyan-400">
              {pagination.page} / {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="h-8 border-slate-800 bg-slate-900 text-xs text-slate-300"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUserId && userDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs font-mono">
          <div className="w-full max-w-2xl rounded-2xl bg-[#060c18] border border-cyan-500/30 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{userDetail.user.name}</h3>
                <p className="text-xs text-slate-400 font-sans">{userDetail.user.email}</p>
                <div className="text-[10px] text-slate-500 mt-0.5">UID: {userDetail.user.id}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(null)} className="h-8 w-8 text-slate-400 hover:text-white">✕</Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-500 text-[10px]">ROLE</span>
                <div className="text-slate-100 font-bold mt-1">{userDetail.user.role}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-500 text-[10px]">STATUS</span>
                <div className="text-slate-100 font-bold mt-1">{userDetail.user.status}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-500 text-[10px]">DEPARTMENT</span>
                <div className="text-slate-100 font-sans text-xs mt-1">{userDetail.user.department || 'N/A'}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-500 text-[10px]">DESIGNATION</span>
                <div className="text-slate-100 font-sans text-xs mt-1">{userDetail.user.designation || 'N/A'}</div>
              </div>
            </div>

            {userDetail.profile && (
              <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-4 space-y-1 text-xs">
                <div className="text-cyan-400 font-bold text-xs uppercase mb-2">Corporate Profile Attributes</div>
                <div>GSTIN: <span className="text-slate-200">{userDetail.profile.gstin || 'N/A'}</span></div>
                <div>PAN: <span className="text-slate-200">{userDetail.profile.pan || 'N/A'}</span></div>
                <div>Udyam: <span className="text-slate-200">{userDetail.profile.udyamNumber || 'N/A'}</span></div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button variant="outline" onClick={() => setSelectedUserId(null)} className="rounded-xl border-slate-700 text-xs">
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionTarget && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs font-mono">
          <div className="w-full max-w-md rounded-2xl bg-[#060c18] border border-cyan-500/40 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
              {actionType === 'SUSPEND' && 'Account Suspension'}
              {actionType === 'ACTIVATE' && 'Account Activation'}
              {actionType === 'ROLE_CHANGE' && 'Role Reassignment'}
            </h3>

            <p className="text-xs text-slate-400 font-sans">
              Target: <span className="font-bold text-slate-100">{actionTarget.name}</span> ({actionTarget.email})
            </p>

            {actionType === 'ROLE_CHANGE' && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Target Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-100"
                >
                  <option value="BIDDER">BIDDER</option>
                  <option value="PROCUREMENT_OFFICER">PROCUREMENT_OFFICER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Mandatory Sovereign Audit Reason
              </label>
              <textarea
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="State the justification reason..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setActionTarget(null);
                  setActionType(null);
                }}
                className="rounded-xl border-slate-700 text-xs"
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={handleExecuteAction}
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold font-mono"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Execute Action
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
