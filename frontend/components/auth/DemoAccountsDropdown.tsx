'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Zap, User as UserIcon, Building2, ArrowRight } from 'lucide-react';

interface DemoAccountsDropdownProps {
  onSelect: (email: string, password: string) => void;
}

export function DemoAccountsDropdown({ onSelect }: DemoAccountsDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const accounts = [
    { label: 'Procurement Officer', email: 'officer@gem.gov.in', pass: 'Officer@123', color: 'blue' as const },
    { label: 'System Administrator', email: 'admin@gem.gov.in', pass: 'Admin@123', color: 'purple' as const },
    { label: 'Demo Bidder (Contractor)', email: 'demo.bidder@bidguard.local', pass: 'Bidder@123', color: 'emerald' as const },
  ];

  const colorMap = {
    blue:    { avatar: 'bg-blue-100 text-blue-600 border-blue-200',    btn: 'bg-blue-600' },
    purple:  { avatar: 'bg-purple-100 text-purple-600 border-purple-200', btn: 'bg-purple-600' },
    emerald: { avatar: 'bg-emerald-100 text-emerald-600 border-emerald-200', btn: 'bg-emerald-600' },
  };

  return (
    <div ref={ref} className="relative mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 text-xs font-bold text-[#0A2E5C] transition-all shadow-sm"
      >
        <span className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-[#1D64EC] shrink-0" />
          QUICK 1-CLICK DEMO ACCOUNTS
        </span>
        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
          Click to sign in instantly
          <ChevronDown className={'h-3.5 w-3.5 text-[#1D64EC] transition-transform duration-200' + (open ? ' rotate-180' : '')} />
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-blue-200 bg-white shadow-xl overflow-hidden">
          <div className="p-2 space-y-1.5">
            {accounts.map((acc) => {
              const c = colorMap[acc.color];
              const Icon = acc.color === 'emerald' ? Building2 : UserIcon;
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { onSelect(acc.email, acc.pass); setOpen(false); }}
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50 p-2.5 text-left flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={'h-7 w-7 rounded-full flex items-center justify-center shrink-0 border ' + c.avatar}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-[#0A2540] text-[11px] leading-tight">{acc.label}</span>
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{acc.email} &bull; {acc.pass}</span>
                    </div>
                  </div>
                  <span className={'rounded-md text-white px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 shrink-0 ' + c.btn}>
                    Sign In <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
