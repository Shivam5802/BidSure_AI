'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { api } from '@/lib/api/client';
import { toast } from '@/components/ui/Toast';
import {
  Building2,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Globe,
  MapPin,
  Calendar,
  Briefcase,
  FileBadge,
  Phone,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BidderProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'REPRESENTATIVE'>('COMPANY');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Company Information State
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [businessType, setBusinessType] = useState('Private Limited');
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState('');
  const [dateOfEstablishment, setDateOfEstablishment] = useState('');
  const [category, setCategory] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  // Turnover Details
  const [turnoverList, setTurnoverList] = useState<Array<{ financialYear: string; turnoverInCrores: number; audited: boolean }>>([]);

  // Authorized Representative State
  const [repName, setRepName] = useState('');
  const [repDesignation, setRepDesignation] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [signatoryDetails, setSignatoryDetails] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [profileData, repData] = await Promise.all([
          api.getBidderProfile().catch(() => null),
          api.getBidderRepresentative().catch(() => null),
        ]);

        if (isMounted) {
          if (profileData) {
            setLegalName(profileData.legalName || profileData.companyName || user?.name || '');
            setTradeName(profileData.tradeName || '');
            setBusinessType(profileData.businessType || 'Private Limited');
            setCompanyRegistrationNumber(profileData.companyRegistrationNumber || '');
            setDateOfEstablishment(profileData.dateOfEstablishment ? profileData.dateOfEstablishment.split('T')[0] : '');
            setCategory(profileData.category || '');
            setRegisteredAddress(profileData.registeredAddress || '');
            setState(profileData.state || '');
            setDistrict(profileData.district || '');
            setCity(profileData.city || '');
            setPinCode(profileData.pinCode || '');
            setWebsiteUrl(profileData.websiteUrl || '');
            setCompanyDescription(profileData.companyDescription || '');
            if (profileData.turnoverDetails && Array.isArray(profileData.turnoverDetails)) {
              setTurnoverList(profileData.turnoverDetails);
            }
          }

          if (repData) {
            setRepName(repData.fullName || user?.name || '');
            setRepDesignation(repData.designation || '');
            setRepEmail(repData.officialEmail || user?.email || '');
            setRepPhone(repData.mobileNumber || user?.phone || '');
            setSignatoryDetails(repData.signatoryDetails || '');
          } else if (user) {
            setRepName(user.name || '');
            setRepEmail(user.email || '');
            setRepPhone(user.phone || '');
            setRepDesignation(user.designation || '');
            setSignatoryDetails('');
          }
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load organization profile.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName.trim()) {
      toast.error('Legal company name is required.');
      return;
    }
    try {
      setIsSaving(true);
      await api.updateBidderProfile({
        legalName: legalName.trim(),
        tradeName: tradeName.trim() || undefined,
        businessType,
        companyRegistrationNumber: companyRegistrationNumber.trim() || undefined,
        dateOfEstablishment: dateOfEstablishment || undefined,
        category: category.trim() || undefined,
        registeredAddress: registeredAddress.trim(),
        state: state.trim() || undefined,
        district: district.trim() || undefined,
        city: city.trim() || undefined,
        pinCode: pinCode.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        companyDescription: companyDescription.trim() || undefined,
        turnoverDetails: turnoverList,
      });
      toast.success('Company profile updated successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update company profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRepresentative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName.trim() || !repEmail.trim() || !repPhone.trim()) {
      toast.error('Representative name, email, and phone number are required.');
      return;
    }
    try {
      setIsSaving(true);
      await api.updateBidderRepresentative({
        fullName: repName.trim(),
        designation: repDesignation.trim(),
        officialEmail: repEmail.trim(),
        mobileNumber: repPhone.trim(),
        signatoryDetails: signatoryDetails.trim() || undefined,
      });
      toast.success('Authorized representative details saved.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update representative details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-8 w-8 animate-spin text-[#1464B4]" />
          <p className="text-xs text-slate-500">Loading vendor company dossier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Bidder / Vendor Profile
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage statutory organizational data, authorized signatories, and annual business turnover for GeM compliance.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('COMPANY')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'COMPANY'
              ? 'bg-[#1464B4] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Company Information & Turnover
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('REPRESENTATIVE')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'REPRESENTATIVE'
              ? 'bg-[#1464B4] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Authorized Representative
        </button>
      </div>

      {activeTab === 'COMPANY' && (
        <form onSubmit={handleSaveCompany} className="space-y-6">
          {/* Basic Entity Information */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#1464B4]" />
              Entity Classification & Registration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Legal Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Apex Infrastructure Solutions Ltd"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Trade Name / Brand (if applicable)
                </label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="e.g. Apex Infra"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business Entity Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Private Limited">Private Limited Company</option>
                  <option value="Public Limited">Public Limited Company</option>
                  <option value="LLP">Limited Liability Partnership (LLP)</option>
                  <option value="Partnership">Partnership Firm</option>
                  <option value="Proprietorship">Sole Proprietorship</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Registration Number (CIN / LLPIN)
                </label>
                <input
                  type="text"
                  value={companyRegistrationNumber}
                  onChange={(e) => setCompanyRegistrationNumber(e.target.value)}
                  placeholder="e.g. U72200MH2016PTC284910"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Establishment / Incorporation
                </label>
                <input
                  type="date"
                  value={dateOfEstablishment}
                  onChange={(e) => setDateOfEstablishment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business Category & Industry
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Civil Engineering & Heavy Infrastructure"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Registered Office Address */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#1464B4]" />
              Registered Office Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  placeholder="Office / Building, Street, Area"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City / District</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://company.co.in"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company Description & Core Capabilities
                </label>
                <textarea
                  rows={3}
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Turnover Details Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#1464B4]" />
              Annual Financial Turnover (Past 3 FYs)
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Financial Year</th>
                    <th className="px-4 py-3">Annual Turnover (₹ Crores)</th>
                    <th className="px-4 py-3">Audited Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {turnoverList.map((row, idx) => (
                    <tr key={row.financialYear} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{row.financialYear}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.1"
                          value={row.turnoverInCrores}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const next = [...turnoverList];
                            next[idx]!.turnoverInCrores = val;
                            setTurnoverList(next);
                          }}
                          className="w-32 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-mono"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" /> CA Audited
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Company Profile
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'REPRESENTATIVE' && (
        <form onSubmit={handleSaveRepresentative} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-4 w-4 text-[#1464B4]" />
              Authorized Signatory Details
            </h2>
            <p className="text-xs text-slate-500">
              The authorized representative possesses legal standing to submit GeM bids, sign digital declarations, and submit tender securities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="e.g. Rajesh Singhania"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={repDesignation}
                  onChange={(e) => setRepDesignation(e.target.value)}
                  placeholder="e.g. Managing Director / Partner"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={repEmail}
                  onChange={(e) => setRepEmail(e.target.value)}
                  placeholder="representative@apexinfra.co.in"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={repPhone}
                  onChange={(e) => setRepPhone(e.target.value)}
                  placeholder="+91 98201 44520"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Authorization Authority Reference / Power of Attorney Notes
                </label>
                <textarea
                  rows={2}
                  value={signatoryDetails}
                  onChange={(e) => setSignatoryDetails(e.target.value)}
                  placeholder="Authorized by Board Resolution dated 12th Jan 2021 / Registered Power of Attorney"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Representative...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Authorized Representative
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
