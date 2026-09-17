'use client';

import React, { useState, useEffect } from 'react';
import { BenchmarkSession, BenchmarkRecordInput } from '@/types/intelligence';
import { intelligenceApi } from '@/lib/api/intelligence.api';
import { X, Plus, Clock, CheckCircle2, AlertCircle, PlayCircle, Shield } from 'lucide-react';

interface BenchmarkSessionModalProps {
  tenderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkSessionModal: React.FC<BenchmarkSessionModalProps> = ({
  tenderId,
  isOpen,
  onClose,
}) => {
  const [sessions, setSessions] = useState<BenchmarkSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [scenarioName, setScenarioName] = useState('Benchmark Scenario 35 Requirements');
  const [baselineDurationSeconds, setBaselineDurationSeconds] = useState(2700); // 45 mins
  const [bidguardDurationSeconds, setBidguardDurationSeconds] = useState(480); // 8 mins
  const [requirementsCount, setRequirementsCount] = useState(35);
  const [documentsCount, setDocumentsCount] = useState(40);
  const [operators, setOperators] = useState('Procurement Officer + Evaluation Member');
  const [notes, setNotes] = useState('Measured prototype trial during evaluation sandbox testing');

  const fetchBenchmarks = async () => {
    setIsLoading(true);
    try {
      const res = await intelligenceApi.getBenchmarks(tenderId);
      if (res.benchmarks) {
        setSessions(res.benchmarks);
      }
    } catch (e) {
      console.error('Failed to load benchmarks', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchBenchmarks();
    }
  }, [isOpen, tenderId]);

  const handleCreateBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const input: BenchmarkRecordInput = {
        scenarioName,
        baselineMethod: 'MANUAL_SIMULATION',
        baselineDurationSeconds: Number(baselineDurationSeconds),
        bidguardDurationSeconds: Number(bidguardDurationSeconds),
        requirementsCount: Number(requirementsCount),
        documentsCount: Number(documentsCount),
        operators,
        notes,
      };
      await intelligenceApi.recordBenchmark(tenderId, input);
      setShowAddForm(false);
      await fetchBenchmarks();
    } catch (e) {
      console.error('Failed to record benchmark session', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Prototype Benchmark Sessions</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical measurements recorded during prototype testing trials.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-slate-50 dark:bg-slate-850 px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong className="text-slate-800 dark:text-slate-200">Controlled prototype benchmark</strong>; not an official government procurement claim.
          </span>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {showAddForm ? (
            <form onSubmit={handleCreateBenchmark} className="space-y-4 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Record New Trial Measurement
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Scenario Title</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Manual Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    value={baselineDurationSeconds}
                    onChange={(e) => setBaselineDurationSeconds(Number(e.target.value))}
                    required
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 2700s = 45 mins</span>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    BidGuard Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    value={bidguardDurationSeconds}
                    onChange={(e) => setBidguardDurationSeconds(Number(e.target.value))}
                    required
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 480s = 8 mins</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Requirements Count</label>
                  <input
                    type="number"
                    value={requirementsCount}
                    onChange={(e) => setRequirementsCount(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Documents Count</label>
                  <input
                    type="number"
                    value={documentsCount}
                    onChange={(e) => setDocumentsCount(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Operators / Evaluators</label>
                <input
                  type="text"
                  value={operators}
                  onChange={(e) => setOperators(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Observational Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
              >
                {isSubmitting ? 'Recording...' : 'Save Benchmark Record'}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Prototype Trial Measurement</span>
            </button>
          )}

          {/* Sessions List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recorded Benchmark Trials ({sessions.length})
            </h3>

            {sessions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No benchmark sessions recorded for this tender yet.</p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{s.scenarioName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Manual Baseline</div>
                      <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {Math.round(s.baselineDurationSeconds / 60)} mins
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30">
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-semibold">
                        BidGuard Pipeline
                      </div>
                      <div className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300">
                        {Math.round(s.bidguardDurationSeconds / 60)} mins
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Requirements</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {s.requirementsCount}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Documents</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{s.documentsCount}</div>
                    </div>
                  </div>

                  {s.notes && <p className="text-[11px] text-slate-500 italic mt-1">{s.notes}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
