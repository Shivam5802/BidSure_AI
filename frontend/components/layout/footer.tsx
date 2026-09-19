import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#082B4C] text-slate-300 pt-16 pb-8 border-t border-[#123B63]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 pb-12 border-b border-slate-800">
          
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1464B4] text-white shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight font-serif">
                  BidSure
                </span>
                <p className="text-[11px] font-bold text-amber-300 tracking-wide">
                  Procurement. Verified.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Powered Bid Compliance & Intelligence Platform for GeM and GFR 2017 public procurement.
            </p>
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Core Principle:
              </span>
              <p className="text-[11px] font-semibold text-white mt-0.5">
                AI Assists → Rules Verify → Officer Decides
              </p>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition">About Us</a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
              </li>
              <li>
                <a href="#ai-rules" className="hover:text-white transition">Deterministic Rules</a>
              </li>
              <li>
                <a href="#evidence" className="hover:text-white transition">Evidence Verification</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <a href="#support" className="hover:text-white transition">Help & Support</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Documentation</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">FAQs</a>
              </li>
              <li>
                <a href="#governance" className="hover:text-white transition">Governance & Audit</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">Contact</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Terms & Conditions</a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition">Security by Design</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Disclaimer</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Audit Integrity</a>
              </li>
            </ul>
          </div>

          {/* Column 5: Government / Procurement */}
          <div className="space-y-3 lg:col-span-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Government / Procurement
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <a href="https://gem.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition">
                  Government e-Marketplace (GeM)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">GFR 2017 Rules (Rule 144, 149)</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Department of Expenditure</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">CVC Guidelines Alignment</a>
              </li>
            </ul>

            {/* GeM & Institutional Mark */}
            <div className="pt-2">
              <div className="flex items-center gap-2 bg-[#082B4C] border border-slate-700/80 p-2 rounded-lg">
                <div className="h-6 w-6 rounded bg-[#B83232] flex items-center justify-center text-white text-[10px] font-bold">
                  GeM
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[11px] font-bold text-white">GeM Compliant</span>
                  <span className="text-[8px] text-slate-400">Department of Expenditure</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer */}
        <div className="py-4 border-b border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Disclaimer:</strong> BidSure is an enterprise bid compliance and analytical verification technology platform engineered for procurement authorities. Official government portals and regulatory citations (such as GeM and GFR 2017) are referenced for operational standard alignment. BidSure does not claim sovereign endorsement unless authorized by relevant ministerial authorities.
        </div>

        {/* Bottom Bar: Copyright, Accessibility & Digital India */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <p>© 2026 <strong className="text-white font-semibold">BidSure</strong>. All rights reserved.</p>
            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <a href="#main-content" className="hover:text-white transition">Accessibility</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition">Sitemap</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition">Screen Reader</a>
            </div>
          </div>
          
          {/* Digital India Emblem */}
          <div className="flex items-center gap-2.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700">
            <span className="h-2 w-2 rounded-full bg-[#FF9933] animate-pulse" />
            <span className="text-[11px] font-bold text-slate-200 tracking-wider uppercase">Digital India</span>
            <span className="text-[9px] text-slate-400">Power To Empower</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
