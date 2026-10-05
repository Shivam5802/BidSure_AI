'use client';

import React, { useEffect, useState, useTransition } from 'react';
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
  MoreVertical,
  Plus,
  Eye,
  FileText,
  Loader2,
  UserCheck,
  UserX,
  Shield,
  MessageSquare,
  Clock,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected User for Detail Drawer / Modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Action Modals State
  const [actionTarget, setActionTarget] = useState<AdminUserRecord | null>(null);
  const [actionType, setActionType] = useState<'SUSPEND' | 'ACTIVATE' | 'ROLE_CHANGE' | 'NOTE' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [newRole, setNewRole] = useState<string>('BIDDER');
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
    setIsLoadingDetail(true);
    try {
      const data = await adminApi.getUserDetail(userId);
      setUserDetail(data);
    } catch (err: any) {
      alert(`Could not load details: ${err.message}`);
    } finally {
      setIsLoadingDetail(false);
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
      {/* Page Title & Stats */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Central User Directory</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage accounts, assign roles, monitor profile completeness, and audit account status
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchUsers(pagination.page)}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl p-4 text-xs border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-bold underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, official email, department, or User ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#1464B4]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
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
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DISABLED">Suspended Only</option>
            </select>

            <Button type="submit" className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold px-4">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">User Identity & ID</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Department / Organization</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5">Completeness</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1464B4] mb-2" />
                    Loading platform user records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No users matching the specified search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{u.name}</span>
                        {u.role === 'SUPER_ADMIN' && (
                          <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-1.5 py-0.2 text-[9px] font-bold">
                            ROOT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                      <div className="font-mono text-[9px] text-slate-400 mt-0.5">{u.id}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          u.role === 'SUPER_ADMIN'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                            : u.role === 'ADMIN'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                            : u.role === 'PROCUREMENT_OFFICER'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                        }`}
                      >
                        {u.role === 'SUPER_ADMIN'
                          ? 'Super Admin'
                          : u.role === 'ADMIN'
                          ? 'Admin'
                          : u.role === 'PROCUREMENT_OFFICER'
                          ? 'Officer'
                          : 'Bidder / Vendor'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900 dark:text-white">{u.department || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">{u.designation || 'N/A'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              u.completeness >= 80 ? 'bg-emerald-500' : u.completeness >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${u.completeness}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{u.completeness}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(u.id)}
                          className="h-8 px-2 text-[11px] rounded-lg"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500 mr-1" />
                          View
                        </Button>

                        {u.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActionTarget(u);
                              setActionType('SUSPEND');
                              setActionReason('');
                            }}
                            className="h-8 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
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
                            className="h-8 px-2 text-[11px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
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
                          className="h-8 px-2 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
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
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{users.length}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{pagination.total}</span> platform users
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="h-8 rounded-lg text-xs"
            >
              Previous
            </Button>
            <span className="px-2 text-slate-500 font-mono text-xs">
              Page {pagination.page} / {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="h-8 rounded-lg text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* User Detail Drawer / Modal */}
      {selectedUserId && userDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-slate-800 p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{userDetail.user.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{userDetail.user.email}</p>
                <div className="font-mono text-[10px] text-slate-400 mt-1">ID: {userDetail.user.id}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(null)} className="rounded-lg h-8 w-8 p-0">
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3">
                <span className="text-[11px] text-slate-400">Assigned Role</span>
                <div className="font-semibold text-slate-900 dark:text-white mt-1">{userDetail.user.role}</div>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3">
                <span className="text-[11px] text-slate-400">Account Status</span>
                <div className="font-semibold text-slate-900 dark:text-white mt-1">{userDetail.user.status}</div>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3">
                <span className="text-[11px] text-slate-400">Department / Org</span>
                <div className="font-semibold text-slate-900 dark:text-white mt-1">{userDetail.user.department || 'N/A'}</div>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3">
                <span className="text-[11px] text-slate-400">Official Designation</span>
                <div className="font-semibold text-slate-900 dark:text-white mt-1">{userDetail.user.designation || 'N/A'}</div>
              </div>
            </div>

            {/* Profile Specific Information */}
            {userDetail.profile && (
              <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 p-4 space-y-2">
                <div className="text-xs font-bold text-[#1464B4] dark:text-[#58A6FF] flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  Vendor Corporate Profile
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>GSTIN: <span className="font-mono font-semibold">{userDetail.profile.gstin || 'N/A'}</span></div>
                  <div>PAN: <span className="font-mono font-semibold">{userDetail.profile.pan || 'N/A'}</span></div>
                  <div>Udyam: <span className="font-mono">{userDetail.profile.udyamNumber || 'N/A'}</span></div>
                  <div>Company Type: <span className="font-semibold">{userDetail.profile.companyType || 'N/A'}</span></div>
                </div>
              </div>
            )}

            {/* Internal Notes Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  Internal Administrative Notes ({userDetail.internalNotes.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActionTarget(userDetail.user as any);
                    setActionType('NOTE');
                    setNewNote('');
                  }}
                  className="rounded-lg h-7 text-[11px]"
                >
                  + Add Note
                </Button>
              </div>

              {userDetail.internalNotes.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No administrative notes recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {userDetail.internalNotes.map((n) => (
                    <div key={n.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{n.authorName}</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setSelectedUserId(null)} className="rounded-xl text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation & Input Action Modal */}
      {actionTarget && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {actionType === 'SUSPEND' && 'Confirm Account Suspension'}
              {actionType === 'ACTIVATE' && 'Confirm Account Activation'}
              {actionType === 'ROLE_CHANGE' && 'Modify User Role'}
              {actionType === 'NOTE' && 'Add Administrative Note'}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target: <span className="font-semibold text-slate-900 dark:text-white">{actionTarget.name}</span> ({actionTarget.email})
            </p>

            {actionType === 'ROLE_CHANGE' && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Platform Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="BIDDER">Bidder / Commercial Vendor</option>
                  <option value="PROCUREMENT_OFFICER">Procurement Officer (GeM)</option>
                  <option value="ADMIN">Platform System Administrator</option>
                  <option value="SUPER_ADMIN">Root Super Administrator (Restricted)</option>
                </select>
              </div>
            )}

            {actionType === 'NOTE' ? (
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Administrative Note Content
                </label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter internal administrative note regarding this account..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mandatory Audit Reason / Justification
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Specify the operational or compliance reason for this modification..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setActionTarget(null);
                  setActionType(null);
                }}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={handleExecuteAction}
                className={`rounded-xl text-xs text-white font-semibold ${
                  actionType === 'SUSPEND' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#1464B4] hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Confirm Action
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
