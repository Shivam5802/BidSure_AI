'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, AdminIncident } from '@/lib/api/admin.api';
import {
  Bell,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

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

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, severityFilter]);

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
      alert('Please specify the resolution notes.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-md shadow-red-500/20">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Administrative Incidents & Alerts Desk</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track repeated verification failures, integration outages, security probes, and compliance anomalies
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Report Incident
            </Button>
            <Button
              variant="outline"
              onClick={fetchIncidents}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-4 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-900 dark:text-white">{incidents.length}</span> recorded incident(s)
        </div>
      </div>

      {/* Incident Cards */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#1464B4]" />
        </div>
      ) : incidents.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-12 text-center text-slate-500">
          No operational incidents reported matching the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`rounded px-2 py-0.5 text-[9px] font-bold ${
                      inc.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : inc.severity === 'HIGH'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : inc.severity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {inc.severity}
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      inc.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : inc.status === 'INVESTIGATING'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    {inc.status}
                  </span>

                  <span className="font-mono text-[10px] text-slate-400">{inc.id}</span>
                  <span className="text-[10px] text-slate-400 font-mono">• {inc.category}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{inc.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{inc.description}</p>

                {inc.resolutionNotes && (
                  <div className="mt-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2.5 text-[11px] text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
                    <span className="font-bold">Resolution: </span>
                    {inc.resolutionNotes}
                  </div>
                )}

                <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                  <span>Reported by: {inc.reportedBy}</span>
                  <span>•</span>
                  <span>Created: {new Date(inc.createdAt).toLocaleString()}</span>
                  {inc.assignedTo && <span>• Assigned: {inc.assignedTo}</span>}
                </div>
              </div>

              {inc.status !== 'RESOLVED' && (
                <Button
                  size="sm"
                  onClick={() => {
                    setResolveTarget(inc);
                    setResolutionNotes('');
                  }}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Mark Resolved
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Incident Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <form onSubmit={handleCreateIncident} className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Report New Operational Incident</h3>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Incident Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. GSTN Gateway Timeout Spike on Heavy Machinery RFP"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="SECURITY">Security Threat / Probe</option>
                  <option value="VERIFICATION_FAILURE">Verification Failure</option>
                  <option value="INTEGRATION_ERROR">Integration Error</option>
                  <option value="COMPLIANCE_DISCREPANCY">Compliance Discrepancy</option>
                  <option value="SYSTEM_OUTAGE">System Outage</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="CRITICAL">Critical (Immediate SLA)</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Detailed Diagnostic Description
              </label>
              <textarea
                rows={3}
                required
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe the affected components, observed errors, and potential root cause..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold">
                Submit Report
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Resolve Target Modal */}
      {resolveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resolve Incident: {resolveTarget.title}</h3>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Mandatory Resolution Notes
              </label>
              <textarea
                rows={3}
                required
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="State the actions taken, patch applied, or verification confirmed to close this issue..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setResolveTarget(null)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={handleResolveIncident}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Confirm Resolution
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
