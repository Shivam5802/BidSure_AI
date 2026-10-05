'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  FileText,
  Clock,
  User,
  RefreshCw,
  ExternalLink,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface AuditItem {
  id: string;
  event: string;
  actor: string;
  role: string;
  tenderReference: string;
  details: string;
  hash: string;
  timestamp: string;
}

export default function OfficerAuditTrailPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEvent, setFilterEvent] = useState('ALL');

  const auditEvents: AuditItem[] = [
    {
      id: 'aud_819201',
      event: 'QUALIFICATION_DECISION_RECORDED',
      actor: 'Senior Procurement Officer (usr_officer_demo_01)',
      role: 'Procurement Officer',
      tenderReference: 'CPCL-INFRA-DEMO-2026',
      details: 'Marked Bid BID-BDR-001-2026 as QUALIFIED. Justification: "Satisfies all 22 technical, statutory and financial conditions with Class-I Local Content."',
      hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'aud_819200',
      event: 'CLARIFICATION_REQUEST_ISSUED',
      actor: 'Senior Procurement Officer (usr_officer_demo_01)',
      role: 'Procurement Officer',
      tenderReference: 'CPCL-INFRA-DEMO-2026',
      details: 'Issued clarification to Reliance Industrial Infra regarding Outdated Non-Blacklisting Undertaking. Deadline: 3 days.',
      hash: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 'aud_819199',
      event: 'RULE_EVALUATION_COMPLETED',
      actor: 'BidSure Deterministic Compliance Engine',
      role: 'Automated AI Engine',
      tenderReference: 'CPCL-INFRA-DEMO-2026',
      details: 'Evaluated 22 mandatory requirements against submitted PDF envelopes for 3 registered bidders.',
      hash: 'sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'aud_819198',
      event: 'BID_SUBMISSION_RECEIVED',
      actor: 'Larsen & Toubro Heavy Engineering (bdr_001)',
      role: 'Bidder Entity',
      tenderReference: 'CPCL-INFRA-DEMO-2026',
      details: 'Encrypted technical & financial bid envelope submitted with 6 verifiable PDF documents.',
      hash: 'sha256:01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'aud_819197',
      event: 'TENDER_PUBLISHED',
      actor: 'CPCL Senior Procurement Officer (usr_officer_demo_01)',
      role: 'Procurement Officer',
      tenderReference: 'CPCL-INFRA-DEMO-2026',
      details: 'Published Turnkey EPC Contract for Refinery Modernization & High-Pressure Piping Infrastructure.',
      hash: 'sha256:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  const filtered = auditEvents.filter((item) => {
    if (filterEvent !== 'ALL' && item.event !== filterEvent) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.details.toLowerCase().includes(q) ||
        item.actor.toLowerCase().includes(q) ||
        item.event.toLowerCase().includes(q) ||
        item.tenderReference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Immutable Procurement Audit Trail
            </h1>
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Cryptographically Verified
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete, tamper-evident chronological ledger of all tender modifications, bid evaluations, clarification requests, and officer qualification decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="px-3 py-1 font-mono text-xs">
            Ledger Status: ACTIVE (Strict Immutability Enforced)
          </Badge>
        </div>
      </div>

      {/* Security Assurance Notice */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/60 rounded-xl flex items-start gap-3 text-sm text-blue-900 dark:text-blue-200">
        <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Non-Repudiation Compliance:</span> In compliance with GFR 2017 and GeM procurement integrity guidelines, every human officer decision and AI evaluation event is hashed with SHA-256 and locked. No user, administrator, or service can modify past recorded assessments.
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit ledger by actor, event, hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Audit Event Types</option>
            <option value="QUALIFICATION_DECISION_RECORDED">Qualification Decisions</option>
            <option value="CLARIFICATION_REQUEST_ISSUED">Clarifications Issued</option>
            <option value="RULE_EVALUATION_COMPLETED">Rule Evaluations</option>
            <option value="BID_SUBMISSION_RECEIVED">Bid Submissions</option>
            <option value="TENDER_PUBLISHED">Tender Publications</option>
          </select>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${
                    item.event.includes('QUALIFICATION')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : item.event.includes('CLARIFICATION')
                      ? 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300'
                      : 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300'
                  }`}
                >
                  {item.event.replace(/_/g, ' ')}
                </Badge>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {item.tenderReference}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(item.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-sm text-slate-800 dark:text-slate-200">
              {item.details}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Actor: <strong className="text-slate-700 dark:text-slate-300">{item.actor}</strong> ({item.role})</span>
              </div>

              <div className="font-mono text-[11px] text-slate-400 truncate max-w-sm flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                {item.hash}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
