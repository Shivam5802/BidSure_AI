import React from 'react';
import { Shield, Scale, FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-brand-400" />
              <span className="text-base font-bold">BidGuard AI</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-slate-400">
              Integrated Bid Compliance Verification Platform designed for Government e-Marketplace
              (GeM) public procurement. Built on verifiable evidence and strict officer oversight.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-emerald-400" /> Human-in-the-Loop Governance
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-brand-400" /> Audit-Grade Explainability
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Core Principles
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>AI assists, never decides</li>
              <li>Every score cites page & line</li>
              <li>Cross-bidder contradiction checks</li>
              <li>Immutable audit logs</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>GeM Tender Intelligence</li>
              <li>Evidence Graph Engine</li>
              <li>Officer Workspace</li>
              <li>Verification Architecture</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          BidGuard AI — The Procurement Officer remains the final decision-maker. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
