'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Building2,
  FileCheck,
  Scale,
  ExternalLink,
  Info,
  Filter,
  Search,
  BadgeAlert,
  Sparkles,
} from 'lucide-react';
import { officerApi, OfficerBidItem } from '@/lib/api/officer.api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ComplianceFinding {
  id: string;
  requirement: string;
  category: 'STATUTORY' | 'TECHNICAL' | 'FINANCIAL' | 'LOCAL_CONTENT' | 'REPUTATION';
  bidderName: string;
  bidderCode: string;
  status: 'VERIFIED' | 'FAILED' | 'MISSING' | 'MANUAL_REVIEW' | 'NOT_APPLICABLE';
  observedValue: string;
  expectedValue: string;
  evidenceDocument: string;
  verificationSource: string;
  isSimulated: boolean;
  confidence: number;
  reason: string;
  recommendedAction: string;
}

export default function OfficerComplianceReviewPage() {
  const [bids, setBids] = useState<OfficerBidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await officerApi.getReceivedBids('tnd_1789567202603_77g22a');
        setBids(list);
      } catch (err) {
        console.error('Failed to load bids:', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const findings: ComplianceFinding[] = [
    {
      id: 'fnd_01',
      requirement: 'Udyam / MSME Registration Certificate Active Status',
      category: 'STATUTORY',
      bidderName: 'Larsen & Toubro Heavy Engineering Ltd.',
      bidderCode: 'BDR-001',
      status: 'VERIFIED',
      observedValue: 'UDYAM-MH-12-0049281 (Active Medium Enterprise)',
      expectedValue: 'Active Udyam Registration on MSME Databank',
      evidenceDocument: 'Udyam_Registration_Certificate_2025.pdf',
      verificationSource: 'Udyam API Gateway (Simulated Verification)',
      isSimulated: true,
      confidence: 99,
      reason: 'Valid registration identified with matched legal entity name and active status.',
      recommendedAction: 'Requirement satisfied. No manual intervention needed.',
    },
    {
      id: 'fnd_02',
      requirement: 'Make in India Local Content ≥ 50% Declaration',
      category: 'LOCAL_CONTENT',
      bidderName: 'Larsen & Toubro Heavy Engineering Ltd.',
      bidderCode: 'BDR-001',
      status: 'VERIFIED',
      observedValue: '68.5% Domestic Value Addition (Class-I Local Supplier)',
      expectedValue: 'Minimum 50.0% Class-I Local Supplier',
      evidenceDocument: 'Local_Content_Self_Declaration_CA_Certified.pdf',
      verificationSource: 'DPIIT Form-I Verification Engine',
      isSimulated: true,
      confidence: 96,
      reason: 'CA certified break-up matches RFP requirements with location details at Hazira Complex.',
      recommendedAction: 'Class-I purchase preference criteria satisfied.',
    },
    {
      id: 'fnd_03',
      requirement: 'Clean Non-Blacklisting / Debarment Affidavit',
      category: 'REPUTATION',
      bidderName: 'Reliance Industrial Infrastructure Ltd.',
      bidderCode: 'BDR-003',
      status: 'MANUAL_REVIEW',
      observedValue: 'Affidavit dated Nov 2024 without active CA/Notary verification seal',
      expectedValue: 'Non-debarment declaration notarized within past 90 days',
      evidenceDocument: 'Non_Blacklisting_Undertaking.pdf',
      verificationSource: 'Central Vigilance Commission (CVC) Debarment Check',
      isSimulated: true,
      confidence: 72,
      reason: 'Document date precedes RFP release date and lacks required executive stamp.',
      recommendedAction: 'Issue formal clarification request to submit updated notarized affidavit.',
    },
    {
      id: 'fnd_04',
      requirement: 'Average Annual Financial Turnover (FY 2021-24) ≥ ₹150 Crores',
      category: 'FINANCIAL',
      bidderName: 'Tata Projects Limited',
      bidderCode: 'BDR-002',
      status: 'VERIFIED',
      observedValue: 'Average Turnover: ₹412.50 Cr across audited years',
      expectedValue: 'Minimum ₹150.00 Cr in past 3 financial years',
      evidenceDocument: 'Audited_Turnover_Certificate_FY22_24.pdf',
      verificationSource: 'MCA21 Database & UDIN Cross-check (Simulated)',
      isSimulated: true,
      confidence: 98,
      reason: 'Audited balance sheets with valid CA UDIN codes verify annual revenues exceeding threshold.',
      recommendedAction: 'Financial eligibility criteria verified.',
    },
    {
      id: 'fnd_05',
      requirement: 'OEM Warranty & Service Authorization Undertaking',
      category: 'TECHNICAL',
      bidderName: 'Tata Projects Limited',
      bidderCode: 'BDR-002',
      status: 'MISSING',
      observedValue: 'No OEM Authorization Document Submitted',
      expectedValue: 'Original Equipment Manufacturer authorization for High-Pressure Piping Valves',
      evidenceDocument: 'Missing Document',
      verificationSource: 'RFP Mandatory Annexure-IV Checklist',
      isSimulated: false,
      confidence: 100,
      reason: 'Required manufacturer authorization schedule was omitted from technical submission envelope.',
      recommendedAction: 'Request clarification or mark as technical deficiency if non-waivable.',
    },
    {
      id: 'fnd_06',
      requirement: 'EPFO & ESIC Compliance Active Code',
      category: 'STATUTORY',
      bidderName: 'Reliance Industrial Infrastructure Ltd.',
      bidderCode: 'BDR-003',
      status: 'VERIFIED',
      observedValue: 'EPFO Code: MH/BAN/0034928 | Active returns filed',
      expectedValue: 'Valid EPFO & ESIC Code with prompt contribution records',
      evidenceDocument: 'EPFO_Challan_Last_Quarter.pdf',
      verificationSource: 'EPFO Unified Portal Verification (Simulated)',
      isSimulated: true,
      confidence: 94,
      reason: 'Last quarterly ECR payment verified with zero overdue contributions.',
      recommendedAction: 'Statutory labor compliance verified.',
    },
  ];

  const filteredFindings = findings.filter((f) => {
    if (selectedCategory !== 'ALL' && f.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && f.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.requirement.toLowerCase().includes(q) ||
        f.bidderName.toLowerCase().includes(q) ||
        f.observedValue.toLowerCase().includes(q)
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
              AI Compliance Review & Verification Center
            </h1>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300">
              Deterministic Rule Engine
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explainable AI-assisted clause verification for CPCL Infrastructure Procurement (CPCL-INFRA-DEMO-2026).
          </p>
        </div>

        <Link href="/officer/bids">
          <Button variant="outline" size="sm" className="gap-2">
            <Scale className="w-4 h-4 text-blue-600" />
            Go to Bids Decision
          </Button>
        </Link>
      </div>

      {/* Simulated Verification Notice */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/60 rounded-xl flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Transparent Demonstration Notice:</span> External government portal verifications (GSTN, MCA21, EPFO, Udyam) in this prototype environment use deterministic simulated connectors. Per BidSure governance policies, AI results serve solely as advisory evidence to assist the Procurement Officer; final qualification authority resides strictly with the human officer.
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search requirement, bidder, finding..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Requirement Categories</option>
            <option value="STATUTORY">Statutory & Registrations</option>
            <option value="FINANCIAL">Financial Eligibility</option>
            <option value="TECHNICAL">Technical & OEM</option>
            <option value="LOCAL_CONTENT">Make in India / Local Content</option>
            <option value="REPUTATION">Non-Blacklisting / Debarment</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="FAILED">Failed Verification</option>
            <option value="MANUAL_REVIEW">Manual Review Required</option>
            <option value="MISSING">Missing Information</option>
          </select>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding) => (
          <div
            key={finding.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            {/* Top row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {finding.category}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {finding.requirement}
                  </h3>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>Bidder: <strong className="text-slate-700 dark:text-slate-300">{finding.bidderName}</strong> ({finding.bidderCode})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold px-2.5 py-1 ${
                    finding.status === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : finding.status === 'MANUAL_REVIEW'
                      ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}
                >
                  {finding.status === 'VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  {finding.status === 'MANUAL_REVIEW' && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                  {finding.status === 'MISSING' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                  {finding.status.replace(/_/g, ' ')}
                </Badge>

                {finding.isSimulated && (
                  <Badge variant="neutral" className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800">
                    Simulated Integration
                  </Badge>
                )}
              </div>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Observed Value from Bid</div>
                <div className="font-mono text-slate-800 dark:text-slate-200">{finding.observedValue}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                  Source Document: {finding.evidenceDocument}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Tender Expected Standard</div>
                <div className="font-mono text-slate-800 dark:text-slate-200">{finding.expectedValue}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                  Verification Authority: {finding.verificationSource}
                </div>
              </div>
            </div>

            {/* Explanation and Recommended Action */}
            <div className="space-y-1.5 text-xs">
              <div>
                <strong className="text-slate-700 dark:text-slate-300">Finding Analysis:</strong>{' '}
                <span className="text-slate-600 dark:text-slate-400">{finding.reason}</span>
              </div>
              <div>
                <strong className="text-slate-700 dark:text-slate-300">Officer Recommended Action:</strong>{' '}
                <span className="text-blue-600 dark:text-blue-400 font-medium">{finding.recommendedAction}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
