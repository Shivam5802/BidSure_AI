import React from 'react';
import Link from 'next/link';
import {
  Shield,
  FileCheck2,
  Scale,
  BrainCircuit,
  SearchCheck,
  AlertTriangle,
  History,
  ArrowRight,
  CheckCircle2,
  FileText,
  Workflow,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              <Badge variant="neutral" className="mb-4 py-1 px-3 text-xs">
                <span className="h-2 w-2 rounded-full bg-brand-600 mr-2" />
                GeM Procurement Compliance Intelligence
              </Badge>

              <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                AI-Powered Bid Compliance Intelligence
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
                Transform complex tender documents into evidence-backed, explainable compliance
                decisions. Built for public procurement officers who demand verifiable audit trails.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="shadow-md">
                    Start New Tender
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    View Demo Workspace
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Key Principles Pills */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Cites Page & Line for Every Finding</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Cross-Bidder Contradiction Discovery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Officer-Controlled Final Determinations</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="neutral" className="mb-2">
                Operational Pipeline
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                How BidGuard AI Works
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                A deterministic, verifiable progression from unstructured tender notices to officer intelligence.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold text-lg mb-4">
                  01
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Tender Ingestion</h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Upload RFP, BoQ, and Corrigenda with high-precision layout preservation.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold text-lg mb-4">
                  02
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Requirements</h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  AI extracts mandatory criteria, technical specs, financial bars, and certifications.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold text-lg mb-4">
                  03
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Evidence Mapping</h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bidder submissions are matched against required clauses with snippet-level anchors.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold text-lg mb-4">
                  04
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Rule Verification</h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Automated checks detect missing documents, expired certificates, and discrepancies.
                </p>
              </div>

              {/* Step 5 */}
              <div className="relative flex flex-col items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-lg mb-4">
                  05
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Compliance Intel</h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Officer receives explainable dossiers, contradiction alerts, and audit recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES SECTION */}
        <section id="capabilities" className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="neutral" className="mb-2">
                System Architecture
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Core Capabilities
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                Engineered for strict accountability, regulatory compliance, and rapid evaluation.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <Card className="hover:border-slate-300">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700 mb-3">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle>Tender Intelligence</CardTitle>
                  <CardDescription>
                    Automated parsing of multi-hundred-page RFP documents, extraction of BoQ parameters, and clause breakdown.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500">
                  Includes Corrigenda change tracking and clause hierarchy construction.
                </CardContent>
              </Card>

              {/* Card 2 */}
              <Card className="hover:border-slate-300">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mb-3">
                    <SearchCheck className="h-5 w-5" />
                  </div>
                  <CardTitle>Evidence Verification</CardTitle>
                  <CardDescription>
                    Bidder claims are paired with exact text, table, or stamp evidence extracted from submitted technical bids.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500">
                  Every compliance status points directly to page, paragraph, and line references.
                </CardContent>
              </Card>

              {/* Card 3 */}
              <Card className="hover:border-slate-300">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 mb-3">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <CardTitle>Compliance Rules</CardTitle>
                  <CardDescription>
                    Deterministic evaluation engine executes mandatory GeM General Financial Rules (GFR) and tender-specific constraints.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500">
                  Rules evaluate turnover thresholds, EMD exemptions, and OEM authorizations.
                </CardContent>
              </Card>

              {/* Card 4 */}
              <Card className="hover:border-slate-300">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 mb-3">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <CardTitle>Contradiction Detection</CardTitle>
                  <CardDescription>
                    Surfaces discrepancies within a single bidder's packet or across competing bids (e.g. conflicting dates, altered certificates).
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500">
                  Flags high-risk anomalies for immediate officer investigation.
                </CardContent>
              </Card>

              {/* Card 5 */}
              <Card className="hover:border-slate-300">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700 mb-3">
                    <Scale className="h-5 w-5" />
                  </div>
                  <CardTitle>Explainable AI</CardTitle>
                  <CardDescription>
                    No black-box answers. Natural language rationales accompany every recommendation, detailing exact reasoning and citations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500">
                  Auditable and defendable during post-procurement inquiries.
                </CardContent>
              </Card>

              {/* Card 6 */}
              <Card className="hover:border-slate-300">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-800 mb-3">
                    <History className="h-5 w-5" />
                  </div>
                  <CardTitle>Audit Trail</CardTitle>
                  <CardDescription>
                    Tamper-evident chronological record of all document accesses, rule executions, officer reviews, and override comments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500">
                  Exportable formal evaluation report ready for committee submission.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* GOVERNANCE & TRUST SECTION */}
        <section id="trust" className="bg-slate-900 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-4 py-1 text-xs font-semibold text-emerald-400">
                <Shield className="h-4 w-4" />
                Fundamental Governance Principle
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl text-white">
                AI assists. Rules verify. Officer decides.
              </h2>

              <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                BidGuard AI is strictly engineered as a decision-support and audit intelligence system.
                The platform will <strong className="text-white">NEVER</strong> autonomously make a final qualification
                or disqualification decision.
              </p>

              <div className="mt-8 rounded-xl border border-slate-700 bg-slate-950 p-6 text-left">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Procurement Officer Primacy
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  In accordance with public procurement guidelines and GeM operational protocols,
                  every AI finding is presented with direct source snippets. The designated
                  Procurement Officer retains sole constitutional and administrative authority to
                  accept, reject, or request clarification on any bid item.
                </p>
              </div>

              <div className="mt-10">
                <Link href="/dashboard">
                  <Button variant="primary" size="lg">
                    Access Officer Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
