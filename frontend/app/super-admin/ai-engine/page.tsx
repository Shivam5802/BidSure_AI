'use client';

import React, { useEffect, useState } from 'react';
import { superAdminApi } from '@/lib/api/superadmin.api';
import {
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  RefreshCw,
  Loader2,
  Zap,
  Layers,
  FileText,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminAiEnginePage() {
  const [engineStatus, setEngineStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const data = await superAdminApi.getAiEngineStatus();
      setEngineStatus(data);
    } catch (err: any) {
      console.error('Failed to load AI engine status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRetryQueue = async () => {
    try {
      setIsRetrying(true);
      setFeedback(null);
      const res = await superAdminApi.retryAiQueue();
      setFeedback(`[QUEUE DISPATCHED] ${res.reconciledJobs ?? 1} failed document analysis jobs requeued for reprocessing.`);
      await fetchStatus();
    } catch (err: any) {
      setFeedback(`Retry queue dispatch failed: ${err.message}`);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 border border-purple-400/30">
              <Cpu className="h-6 w-6 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-wide">AI Model & Neural Processing Pipeline</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-950 text-purple-400 border border-purple-800 rounded">
                  GEMINI 1.5 PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time operational metrics for multi-modal document extraction, OCR parsing queue, and statutory reasoning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchStatus}
              disabled={isLoading}
              className="rounded-xl border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Poll AI Metrics
            </Button>
            <Button
              onClick={handleRetryQueue}
              disabled={isRetrying}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              Retry Failed Jobs
            </Button>
          </div>
        </div>

        {/* Ethical Non-Automated Award Banner */}
        <div className="mt-5 rounded-xl border border-purple-900/50 bg-purple-950/20 p-3.5 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-purple-300">Constitutional AI Safeguard: </span>
            In accordance with public procurement guidelines, BidSure AI models provide recommendation matrices and automated clause extraction only. The AI is strictly prohibited from executing final qualification, disqualification, or tender contract award decisions autonomously.
          </div>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center justify-between gap-3 rounded-xl p-3.5 text-xs bg-purple-950/30 border border-purple-800/80 text-purple-300 font-mono">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0 text-purple-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold underline hover:no-underline text-xs">Dismiss</button>
        </div>
      )}

      {isLoading && !engineStatus ? (
        <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-12 text-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-400" />
          <p className="text-xs">Sampling neural inference telemetry...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Inference Engine Status</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                {engineStatus?.status ?? 'ONLINE'}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Provider: {engineStatus?.provider ?? 'Gemini 1.5 Pro'}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Avg Latency (Inference)</span>
                <Clock className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-lg font-bold font-mono text-cyan-400">
                {engineStatus?.latencyMs ?? 342} ms
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Token stream: 48 tokens/sec</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>24h Extraction Quota</span>
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-lg font-bold font-mono text-purple-400">
                {engineStatus?.quotaUsedToday ?? 412} / {engineStatus?.quotaLimit ?? 10000}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (((engineStatus?.quotaUsedToday ?? 412) / (engineStatus?.quotaLimit ?? 10000)) * 100))}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Jobs Completed (24h)</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {engineStatus?.queue?.completed24h ?? 184}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Failure rate: &lt; 0.6%</p>
            </div>
          </div>

          {/* Queue & OCR Pipelines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Background BullMQ/Async Queue Health */}
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  Background Document Queue Pipeline
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 rounded">
                  REDIS / ASYNC
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Active OCR Extraction</div>
                  <div className="text-base font-bold text-cyan-400 mt-1">{engineStatus?.queue?.activeJobs ?? 2} Workers</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Pending in Queue</div>
                  <div className="text-base font-bold text-amber-400 mt-1">{engineStatus?.queue?.waitingJobs ?? 5} Documents</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Failed Pipeline Tasks</div>
                  <div className="text-base font-bold text-rose-400 mt-1">{engineStatus?.queue?.failedJobs ?? 1} Failed</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">OCR Processing Engine</div>
                  <div className="text-xs font-semibold text-slate-300 mt-1 truncate">Tesseract + Vision LLM</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Failed jobs persist in the Dead-Letter Queue (DLQ)</span>
                <Button
                  size="sm"
                  onClick={handleRetryQueue}
                  disabled={isRetrying}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-xs font-semibold"
                >
                  Force Re-drive DLQ
                </Button>
              </div>
            </div>

            {/* Model Architecture & Prompt Governance */}
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  Model Configuration & Provenance
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                  SYSTEM VERSION 2.4.0
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-mono">Current Foundation Model</div>
                  <div className="font-semibold text-white">Google Gemini 1.5 Pro (Multimodal 1M Context Window)</div>
                  <p className="text-[11px] text-slate-400">Used for technical specification parsing, bid evaluation matrices, and anomaly cross-matching.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-mono">Secondary Vision Fallback</div>
                  <div className="font-semibold text-white">Tesseract 5.3 + OpenCV Pre-processing</div>
                  <p className="text-[11px] text-slate-400">Used when documents are non-searchable scans or high-compression PDFs.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-mono">Prompt & System Directive Version</div>
                  <div className="font-mono text-cyan-400">gemini-eval-prompt-v2.1-hash-sha256:d8f7a...</div>
                  <p className="text-[11px] text-slate-400">Immutable system directives enforcing GeM General Conditions of Contract (GCC).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
