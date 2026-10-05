'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, AdminIncident } from '@/lib/api/admin.api';
import { superAdminApi } from '@/lib/api/superadmin.api';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Filter,
  Search,
  User,
  RefreshCw,
  Loader2,
  ShieldAlert,
  Flame,
  Check,
  X,
  Lock,
  Power
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminIncidentsPage() {
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  // Maintenance mode status
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // New Incident Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<string>('SECURITY');
  const [newSeverity, setNewSeverity] = useState<string>('HIGH');
  const [newDescription, setNewDescription] = useState('');

  // Resolve Modal
  const [resolveTarget, setResolveTarget] = useState<AdminIncident | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getIncidents({
        status: statusFilter,
        severity: severityFilter,
      });
      setIncidents(data);
    } catch (err: any) {
      console.error('Failed to load incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const cfg = await superAdminApi.getSystemConfig();
      setIsMaintenance(!!cfg?.maintenanceMode);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchConfig();
  }, [statusFilter, severityFilter]);

  const handleToggleMaintenance = async () => {
    const nextState = !isMaintenance;
    const confirmMsg = nextState
      ? 'EMERGENCY SHUTDOWN: Are you sure you want to activate Platform Maintenance Mode? All non-admin bidder/officer traffic will be paused.'
      : 'Deactivate Maintenance Mode and restore public platform access?';

    if (!confirm(confirmMsg)) return;

    try {
      setMaintenanceLoading(true);
      const res = await superAdminApi.toggleLockdown();
      setIsMaintenance(res.maintenanceMode);
      alert(`Platform Maintenance Mode is now ${res.maintenanceMode ? 'ACTIVE' : 'DEACTIVATED'}.`);
    } catch (err: any) {
      alert(`Failed to toggle maintenance mode: ${err.message}`);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;
    setIsSubmitting(true);
    try {
      await adminApi.createIncident({
        title: newTitle,
        category: newCategory,
        severity: newSeverity,
        description: newDescription,
      });
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      fetchIncidents();
    } catch (err: any) {
      alert(`Create incident failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveIncident = async () => {
    if (!resolveTarget) return;
    if (!resolutionNotes.trim()) {
      alert('Please specify resolution notes.');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminApi.updateIncident(resolveTarget.id, {
        status: 'RESOLVED',
        resolutionNotes,
      });
      setResolveTarget(null);
      setResolutionNotes('');
      fetchIncidents();
    } catch (err: any) {
      alert(`Resolution update failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminApi.updateIncident(id, { status });
      fetchIncidents();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-rose-950/70 border border-rose-800 text-rose-300">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-950/70 border border-amber-800 text-amber-300">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-yellow-950/70 border border-yellow-800 text-yellow-300">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 border border-slate-700 text-slate-300">LOW</span>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'OPEN':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-950 border border-rose-800 text-rose-400">OPEN</span>;
      case 'INVESTIGATING':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950 border border-amber-800 text-amber-400">INVESTIGATING</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 border border-emerald-800 text-emerald-400">RESOLVED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 border border-slate-700 text-slate-400">DISMISSED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-600 text-white shadow-lg shadow-amber-500/20 border border-amber-400/30">
              <Flame className="h-6 w-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-wide">Incident & Maintenance Operations Desk</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 rounded">
                  ESCALATION CONTROL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Triage administrative security events, statutory API dropouts, and trigger emergency maintenance mode
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleToggleMaintenance}
              disabled={maintenanceLoading}
              className={`rounded-xl text-xs font-semibold gap-1.5 border transition-colors ${
                isMaintenance
                  ? 'border-rose-700 bg-rose-950/80 text-rose-300 hover:bg-rose-900'
                  : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Power className={`h-3.5 w-3.5 ${isMaintenance ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
              {isMaintenance ? 'Emergency Lockout: ACTIVE' : 'Initiate Maintenance Lockout'}
            </Button>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Incident
            </Button>
            <Button
              variant="outline"
              onClick={fetchIncidents}
              disabled={isLoading}
              className="rounded-xl border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Maintenance Banner if Active */}
        {isMaintenance && (
          <div className="mt-4 rounded-xl border border-rose-800/80 bg-rose-950/40 p-3.5 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
              <span>
                <strong>CRITICAL: PLATFORM MAINTENANCE LOCKOUT IS CURRENTLY ENGAGED.</strong> All external bidder portal actions are rejected at the edge middleware.
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleToggleMaintenance}
              className="bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-bold h-7 rounded-lg"
            >
              Lift Lockout
            </Button>
          </div>
        )}
      </div>

      {/* Filter Row */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Incidents:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Only</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-200"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing {incidents.length} administrative events
        </span>
      </div>

      {/* Incidents Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Incident Title & Description</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Assigned To</th>
                <th className="px-5 py-3.5">Logged At</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-400 mb-2" />
                    Loading escalation records...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    No administrative incidents matching filters.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3">{getSeverityBadge(inc.severity)}</td>
                    <td className="px-5 py-3 max-w-sm">
                      <div className="font-bold text-white text-xs">{inc.title}</div>
                      <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{inc.description}</p>
                    </td>
                    <td className="px-5 py-3 font-mono text-[10px] text-cyan-300">
                      {inc.category}
                    </td>
                    <td className="px-5 py-3">{getStatusBadge(inc.status)}</td>
                    <td className="px-5 py-3 text-slate-400">
                      {inc.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-400">
                      {new Date(inc.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inc.status !== 'RESOLVED' && inc.status !== 'DISMISSED' && (
                          <>
                            {inc.status !== 'INVESTIGATING' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusChange(inc.id, 'INVESTIGATING')}
                                className="h-7 px-2 text-[10px] text-amber-300 border border-slate-700 bg-slate-800/50 hover:bg-slate-800"
                              >
                                Triage
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => setResolveTarget(inc)}
                              className="h-7 px-2.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                        {inc.status === 'RESOLVED' && (
                          <span className="text-[10px] font-mono text-emerald-400">Closed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Incident Modal */}
      {resolveTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b1424] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Resolve Incident: {resolveTarget.title}</h3>
              <button onClick={() => setResolveTarget(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Resolution Post-Mortem & Corrective Action</label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail the root cause and mitigation steps taken (e.g. gateway credential rotated, IP blacklisted, model prompt patch applied)..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setResolveTarget(null)}
                className="rounded-xl border border-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResolveIncident}
                disabled={isSubmitting}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Resolution'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Log New Incident Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b1424] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Log Administrative Incident</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Incident Headline</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. High rate of 502 Bad Gateway on GSTN Sandbox"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200"
                  >
                    <option value="SECURITY">Security / Auth</option>
                    <option value="INTEGRATION">Gateway Integration</option>
                    <option value="COMPLIANCE">Compliance Rule Engine</option>
                    <option value="OCR_PIPELINE">OCR / Document Pipeline</option>
                    <option value="INFRASTRUCTURE">Database / Network</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200"
                  >
                    <option value="CRITICAL">Critical (Immediate Lockout)</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low / Advisory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Detailed Incident Narrative</label>
                <textarea
                  rows={4}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Include affected services, error signatures, and preliminary diagnostic observations..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register Incident'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
