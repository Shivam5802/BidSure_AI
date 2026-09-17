import React, { useState, useEffect } from 'react';
import {
  ComplianceEvaluation,
  EvaluationRunSummary,
  ComplianceInvestigation,
} from '@/types';
import { evaluationApi } from '@/lib/api/evaluation.api';
import { investigationApi } from '@/lib/api/investigation.api';
import { EvaluationStatusBadge } from './EvaluationStatusBadge';
import { EvaluationDetailDrawer } from './EvaluationDetailDrawer';
import { InvestigationDrawer } from '@/features/investigation';
import {
  Calculator,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Search,
  Info,
  Bot,
  Sparkles,
} from 'lucide-react';

interface ComplianceEvaluationMatrixProps {
  bidderId: string;
  bidderName?: string;
}

export const ComplianceEvaluationMatrix: React.FC<ComplianceEvaluationMatrixProps> = ({
  bidderId,
  bidderName,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<EvaluationRunSummary | null>(null);
  const [evaluations, setEvaluations] = useState<ComplianceEvaluation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedEval, setSelectedEval] = useState<ComplianceEvaluation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // AI Investigation drawer states
  const [activeInvestigation, setActiveInvestigation] = useState<ComplianceInvestigation | null>(null);
  const [investigationDrawerOpen, setInvestigationDrawerOpen] = useState<boolean>(false);
  const [investigatingId, setInvestigatingId] = useState<string | null>(null);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await evaluationApi.getBidderEvaluations(bidderId);
      if (res) {
        setSummary(res.summary);
        setEvaluations(res.evaluations || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch bidder evaluations:', err);
      setError(err.message || 'Failed to load evaluation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bidderId) {
      fetchEvaluations();
    }
  }, [bidderId]);

  const handleRunEvaluation = async () => {
    try {
      setRunning(true);
      setError(null);
      const res = await evaluationApi.runBidderEvaluation(bidderId);
      if (res) {
        setSummary(res);
        setEvaluations(res.evaluations || []);
      }
    } catch (err: any) {
      console.error('Failed to run compliance evaluation:', err);
      setError(err.message || 'Error executing compliance engine evaluation.');
    } finally {
      setRunning(false);
    }
  };

  const handleTriggerInvestigation = async (evalItem: ComplianceEvaluation) => {
    try {
      setInvestigatingId(evalItem.id);
      setError(null);

      // Check if an investigation already exists or trigger a new one
      const existingRes = await investigationApi.getEvaluationInvestigations(evalItem.id);
      if (existingRes && existingRes.investigations && existingRes.investigations.length > 0) {
        setActiveInvestigation(existingRes.investigations[0]);
      } else {
        const newInv = await investigationApi.startInvestigation(evalItem.id);
        setActiveInvestigation(newInv);
      }
      setInvestigationDrawerOpen(true);
    } catch (err: any) {
      console.error('Failed to trigger investigation:', err);
      setError(err.message || 'Failed to trigger AI Compliance Investigation.');
    } finally {
      setInvestigatingId(null);
    }
  };

  const filteredEvaluations = evaluations.filter((item) => {
    const matchesStatus = filterStatus === 'ALL' || item.result === filterStatus;
    const matchesSearch =
      !searchQuery ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reasonCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const passCount = summary?.passCount ?? evaluations.filter((e) => e.result === 'PASS').length;
  const failCount = summary?.failCount ?? evaluations.filter((e) => e.result === 'FAIL').length;
  const reviewCount = summary?.reviewCount ?? evaluations.filter((e) => e.result === 'REVIEW').length;
  const notEvalCount = summary?.notEvaluableCount ?? evaluations.filter((e) => e.result === 'NOT_EVALUABLE').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Compliance Intelligence Workspace
                </h2>
                <p className="text-xs text-slate-400">
                  {bidderName ? `Evaluating Bidder: ${bidderName}` : 'Bid Compliance Matrix'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchEvaluations}
              disabled={loading || running}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleRunEvaluation}
              disabled={running || loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {running ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Engine...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Run Compliance Engine
                </>
              )}
            </button>
          </div>
        </div>

        {/* Engine Assurance Banner */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Deterministic Guarantee:</strong> Evaluates <code className="text-amber-300">APPROVED</code> rules against <code className="text-cyan-300 font-mono">CONFIRMED</code> evidence. AI Investigation Agent provides decision-support for difficult cases.
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <strong>Evaluation Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* PASS */}
        <div
          onClick={() => setFilterStatus('PASS')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            filterStatus === 'PASS'
              ? 'bg-emerald-950/50 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">PASS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-300">{passCount}</span>
            <span className="text-[11px] text-slate-500">Satisfied</span>
          </div>
        </div>

        {/* FAIL */}
        <div
          onClick={() => setFilterStatus('FAIL')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            filterStatus === 'FAIL'
              ? 'bg-rose-950/50 border-rose-500/60 shadow-lg shadow-rose-950/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">FAIL</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-300">{failCount}</span>
            <span className="text-[11px] text-slate-500">Unmet</span>
          </div>
        </div>

        {/* REVIEW */}
        <div
          onClick={() => setFilterStatus('REVIEW')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            filterStatus === 'REVIEW'
              ? 'bg-amber-950/50 border-amber-500/60 shadow-lg shadow-amber-950/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">NEEDS REVIEW</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-300">{reviewCount}</span>
            <span className="text-[11px] text-slate-500">Officer Review</span>
          </div>
        </div>

        {/* NOT EVALUABLE */}
        <div
          onClick={() => setFilterStatus('NOT_EVALUABLE')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            filterStatus === 'NOT_EVALUABLE'
              ? 'bg-indigo-950/50 border-indigo-500/60 shadow-lg shadow-indigo-950/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">NOT EVALUABLE</span>
            <HelpCircle className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-300">{notEvalCount}</span>
            <span className="text-[11px] text-slate-500">Missing Evidence</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PASS', 'FAIL', 'REVIEW', 'NOT_EVALUABLE'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {st === 'NOT_EVALUABLE' ? 'NOT EVALUABLE' : st === 'REVIEW' ? 'NEEDS REVIEW' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search evaluation summaries or codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Evaluation Results List */}
      {loading ? (
        <div className="p-12 text-center space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading compliance evaluation results...</p>
        </div>
      ) : filteredEvaluations.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Info className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">No Evaluations Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {evaluations.length === 0
              ? 'Click "Run Compliance Engine" to perform deterministic rule evaluation against confirmed bidder evidence.'
              : 'No evaluations match your current filter or search criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvaluations.map((evalItem) => {
            const isDifficult =
              evalItem.result === 'REVIEW' || evalItem.result === 'NOT_EVALUABLE';
            const isInvestigatingThis = investigatingId === evalItem.id;

            return (
              <div
                key={evalItem.id}
                className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <EvaluationStatusBadge
                      status={evalItem.result}
                      applicability={evalItem.applicability}
                    />
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Reason: {evalItem.reasonCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Investigate Case / Why? Button */}
                    <button
                      onClick={() => handleTriggerInvestigation(evalItem)}
                      disabled={isInvestigatingThis}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                        isDifficult
                          ? 'bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white shadow-indigo-900/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
                      }`}
                    >
                      {isInvestigatingThis ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      {isDifficult ? 'Investigate Case' : 'Why? (AI Explanation)'}
                    </button>

                    {/* View Trace Button */}
                    <button
                      onClick={() => {
                        setSelectedEval(evalItem);
                        setDrawerOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      Trace
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">{evalItem.summary}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{evalItem.explanation}</p>
                </div>

                {/* Quick Math Trace Preview */}
                {evalItem.calculationTrace && (
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-xs flex flex-wrap items-center justify-between gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Formula / Rule:</span>
                      <span className="text-emerald-400">
                        {evalItem.calculationTrace.formula || 'Direct Operator Compare'}
                      </span>
                    </div>
                    {evalItem.calculationTrace.calculatedValue !== undefined && (
                      <div className="text-right">
                        <span className="text-slate-500 text-[11px] block">Output Value:</span>
                        <span className="font-bold text-amber-300">
                          {String(evalItem.calculationTrace.calculatedValue)}{' '}
                          {evalItem.calculationTrace.unit || ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Deterministic Evaluation Detail Drawer */}
      <EvaluationDetailDrawer
        evaluation={selectedEval}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEval(null);
        }}
      />

      {/* AI Compliance Investigation Drawer */}
      <InvestigationDrawer
        investigation={activeInvestigation}
        isOpen={investigationDrawerOpen}
        onClose={() => {
          setInvestigationDrawerOpen(false);
          setActiveInvestigation(null);
        }}
        onReviewSubmitted={(updated) => {
          setActiveInvestigation(updated);
          void fetchEvaluations();
        }}
      />
    </div>
  );
};
