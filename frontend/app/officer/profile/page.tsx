'use client';

import React, { useState } from 'react';
import {
  User,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Key,
  Calendar,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function OfficerProfilePage() {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Senior Procurement Officer',
    email: user?.email || 'officer@gem.gov.in',
    department: 'Refinery Infrastructure & Contracts Group',
    organization: 'Chennai Petroleum Corporation Limited (CPCL) / MoPNG',
    designation: 'Executive Engineer / Senior Procurement Officer',
    employeeCode: 'CPCL-EMP-201948',
    phone: '+91 44 2594 4000',
    gemOfficerId: 'GEM-OFF-TN-04921',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Procurement Officer Profile & Settings
          </h1>
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Verified GeM Procurement Official
          </Badge>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your departmental profile, procurement authority delegation, and security credentials.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          Officer profile details updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md mb-3">
              {formData.name.charAt(0)}
            </div>
            <CardTitle className="text-lg font-bold">{formData.name}</CardTitle>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{formData.designation}</div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400">Employee Code:</span>
                <span className="font-mono font-semibold">{formData.employeeCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400">GeM Officer ID:</span>
                <span className="font-mono font-semibold">{formData.gemOfficerId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Authority Role:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">PROCUREMENT_OFFICER</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl space-y-1">
              <div className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                Delegated Procurement Power
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300">
                Authorized for Turnkey EPC, High-Pressure Infrastructure, and Technical Equipment procurement up to ₹500 Crores under MoPNG procurement delegation rules.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Details Form */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Officer Information & Official Department</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Procuring Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Organization / PSU</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Official Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Save Officer Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
