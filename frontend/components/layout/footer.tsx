import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#0b1b36] text-slate-300 pt-12 pb-6 border-t border-blue-900/60 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 pb-10 border-b border-slate-800">
          {/* Column 1: Brand & Subtitle */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" strokeWidth="1.5">
                  <path
                    d="M12 2.5C7.5 4.5 3.5 3.5 3.5 3.5C3.5 13.5 7.5 19.5 12 21.5C16.5 19.5 20.5 13.5 20.5 3.5C20.5 3.5 16.5 4.5 12 2.5Z"
                    fill="currentColor"
                    fillOpacity="0.2"
                    stroke="currentColor"
                  />
                  <path d="M12 7L13.2 10.8L17 12L13.2 13.2L12 17L10.8 10.8L12 7Z" fill="white" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight font-serif">
                BidSure
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI Powered Compliance for GeM
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
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
                <a href="#contact" className="hover:text-white transition">Contact</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <a href="#" className="hover:text-white transition">Terms & Conditions</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Disclaimer</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <a href="#" className="hover:text-white transition">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">FAQs</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Grievance Redressal</a>
              </li>
            </ul>
          </div>

          {/* Column 5: GeM & Govt Logo Attribution */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-3">
              {/* GeM Graphic */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">
                  GeM
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[11px] font-bold text-white">GeM</span>
                  <span className="text-[8px] text-slate-400 font-medium">Government e-Marketplace</span>
                </div>
              </div>
              {/* Lion Emblem SVG */}
              <div className="h-8 w-8 text-slate-300">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2L15 8H9L12 2Z" fill="currentColor" />
                  <circle cx="12" cy="14" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M12 9V19M7 14H17" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Powered by Government of India<br />
              Ministry of Finance | Department of Expenditure
            </p>
          </div>
        </div>

        {/* Bottom copyright & Digital India logo */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2025 <strong className="text-white font-semibold">BidSure</strong>. All rights reserved. This is a Government of India initiative.</p>
          
          {/* Digital India emblem */}
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-200 tracking-wide">Digital India</span>
            <span className="text-[9px] text-slate-400 font-normal">Power To Empower</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

