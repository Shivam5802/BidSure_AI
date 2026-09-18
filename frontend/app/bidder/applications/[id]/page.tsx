'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { TenderApplicationData, PublishedTenderDetail } from '@/types/application';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Trash2,
  Lock,
  ShieldCheck,
  Building2,
  Loader2,
  Clock,
  ArrowRight,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ApplicationWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<TenderApplicationData | null>(null);
  const [tender, setTender] = useState<PublishedTenderDetail | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state for Step 1
  const [companyDetails, setCompanyDetails] = useState({
    companyName: '',
    companyType: '',
    gstin: '',
    pan: '',
    registeredAddress: '',
    contactEmail: '',
    contactPhone: '',
  });

  // Document upload state for Step 2
  const [selectedDocType, setSelectedDocType] = useState('TECHNICAL_PROPOSAL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Attestation state for Step 3 & 4
  const [selfAttestations, setSelfAttestations] = useState<Record<string, boolean>>({});
  const [legalDeclarationChecked, setLegalDeclarationChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadApplication() {
      try {
        setIsLoading(true);
        setError(null);
        const appData = await api.getApplication(applicationId);
        if (isMounted) {
          setApplication(appData);
          setCompanyDetails({
            companyName: appData.companyDetails?.companyName || '',
            companyType: appData.companyDetails?.companyType || 'Private Limited',
            gstin: appData.companyDetails?.gstin || '',
            pan: appData.companyDetails?.pan || '',
            registeredAddress: appData.companyDetails?.registeredAddress || '',
            contactEmail: appData.companyDetails?.contactEmail || '',
            contactPhone: appData.companyDetails?.contactPhone || '',
          });

          // Fetch associated tender details for requirements
          if (appData.tenderId) {
            const tenderData = await api.getPublishedTender(appData.tenderId).catch(() => null);
            if (isMounted && tenderData) {
              setTender(tenderData);
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load application workspace.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (applicationId) {
      loadApplication();
    }
    return () => {
      isMounted = false;
    };
  }, [applicationId]);

  const isLocked = application ? application.status !== 'DRAFT' : false;

  // Handle saving Step 1 details
  const handleSaveCompanyDetails = async () => {
    if (isLocked) return;
    try {
      setIsSaving(true);
      setError(null);
      const updated = await api.saveApplicationDraft(applicationId, { companyDetails });
      setApplication(updated);
      setSuccessMsg('Company details saved successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to save company details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle uploading document in Step 2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isLocked) return;

    try {
      setIsUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', selectedDocType);

      const updated = await api.uploadApplicationDocument(applicationId, formData);
      setApplication(updated);
      setSuccessMsg(`Document "${file.name}" uploaded successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle deleting document in Step 2
  const handleDeleteDocument = async (documentId: string) => {
    if (isLocked) return;
    try {
      setIsSaving(true);
      setError(null);
      await api.deleteApplicationDocument(applicationId, documentId);
      setApplication((prev) =>
        prev ? { ...prev, documents: prev.documents.filter((d) => d.id !== documentId) } : null
      );
      setSuccessMsg('Document removed.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete document.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle final submission in Step 4
  const handleSubmitApplication = async () => {
    if (isLocked || !legalDeclarationChecked) return;
    if (!application?.documents || application.documents.length === 0) {
      setError('You must upload at least one evidence document before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const submitted = await api.submitApplication(applicationId);
      setApplication(submitted);
      setSuccessMsg('Application successfully submitted and locked for evaluation.');
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please verify requirements.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading application workspace...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
        <h2 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Application Not Found</h2>
        <Link href="/bidder/applications" className="mt-4 inline-block">
          <Button size="sm" variant="outline" className="rounded-xl text-xs">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to My Applications
          </Button>
        </Link>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Company Profile' },
    { num: 2, label: 'Evidence Documents' },
    { num: 3, label: 'Self-Check' },
    { num: 4, label: 'Final Review & Submit' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/bidder/applications"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft className="h-4 w-4" /> My Applications
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Application <span className="font-mono text-indigo-600 dark:text-indigo-400">{application.applicationNumber}</span>
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                application.status === 'QUALIFIED'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : application.status === 'DRAFT'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
              }`}
            >
              {application.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tender: <strong className="text-slate-700 dark:text-slate-300">{tender?.title || application.tenderId}</strong>
          </p>
        </div>

        {isLocked && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Lock className="h-4 w-4 text-amber-500" />
            <span>Immutable Submission Locked</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 4-Step Progress Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step) => {
            const isCompleted = step.num < currentStep || isLocked;
            const isCurrent = step.num === currentStep && !isLocked;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-2.5 rounded-xl p-2.5 text-left transition ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.num}
                </div>
                <div className="hidden sm:block truncate">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Step {step.num}
                  </div>
                  <div className={`text-xs font-bold truncate ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {step.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 1: Company Profile */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Step 1: Contractor & Signatory Information</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Confirm your legal organization details to be stamped onto the tender submission.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Company Legal Name
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={companyDetails.companyName}
                onChange={(e) => setCompanyDetails({ ...companyDetails, companyName: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Company Type
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={companyDetails.companyType}
                onChange={(e) => setCompanyDetails({ ...companyDetails, companyType: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                GSTIN
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={companyDetails.gstin}
                onChange={(e) => setCompanyDetails({ ...companyDetails, gstin: e.target.value.toUpperCase() })}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs uppercase font-mono text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                PAN
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={companyDetails.pan}
                onChange={(e) => setCompanyDetails({ ...companyDetails, pan: e.target.value.toUpperCase() })}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs uppercase font-mono text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Authorized Signatory Phone
              </label>
              <input
                type="tel"
                disabled={isLocked}
                value={companyDetails.contactPhone}
                onChange={(e) => setCompanyDetails({ ...companyDetails, contactPhone: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Registered Office Address
              </label>
              <textarea
                rows={2}
                disabled={isLocked}
                value={companyDetails.registeredAddress}
                onChange={(e) => setCompanyDetails({ ...companyDetails, registeredAddress: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 text-xs text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              onClick={handleSaveCompanyDetails}
              disabled={isSaving}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              {isSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              {isLocked ? 'Next: View Documents' : 'Save Details & Proceed'}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Documents & Evidence Upload */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Step 2: Evidence Document Dossier</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload original audited statements, technical bids, and certification documents for automated extraction.
            </p>
          </div>

          {/* Upload Zone (enabled only if DRAFT) */}
          {!isLocked ? (
            <div className="rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/20 p-6 text-center space-y-4">
              <UploadCloud className="mx-auto h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Upload New Evidence Document</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Supported formats: PDF, DOCX, TXT, PNG, JPG (up to 50MB)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs text-slate-900 dark:text-white"
                >
                  <option value="TECHNICAL_PROPOSAL">Technical Proposal / RFP Response</option>
                  <option value="FINANCIAL_AUDIT_REPORT">Financial Audit & Turnover Statement</option>
                  <option value="ANNUAL_BALANCE_SHEET">Audited Balance Sheet</option>
                  <option value="EXPERIENCE_CERTIFICATE">Past Experience / Completion Certificate</option>
                  <option value="GST_DECLARATION">GST Clearance & Tax Compliance</option>
                  <option value="HSE_SAFETY_MANUAL">HSE & Safety Manual / ISO Cert</option>
                  <option value="OTHER_SUPPORTING">Other Supporting Evidence</option>
                </select>

                <label className="cursor-pointer">
                  <Button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Select File & Upload'
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-500" />
              <span>Document upload is disabled because this application has already been submitted.</span>
            </div>
          )}

          {/* Uploaded Documents List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Uploaded Dossier Files ({application.documents?.length || 0})
            </h3>

            {application.documents?.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
                No documents uploaded yet. Please upload required evidence files above.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {application.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {doc.originalFilename}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {doc.documentType}
                          </span>
                          <span>•</span>
                          <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition"
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="rounded-xl text-xs"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Previous Step
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Proceed to Self-Check
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Self-Attestation Checklist */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Step 3: Eligibility & Criteria Self-Attestation</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Confirm your proposal adheres to all published tender conditions before final lock.
            </p>
          </div>

          <div className="space-y-3">
            {tender?.eligibilityChecklist && tender.eligibilityChecklist.length > 0 ? (
              tender.eligibilityChecklist.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition"
                >
                  <input
                    type="checkbox"
                    checked={selfAttestations[idx] || isLocked}
                    disabled={isLocked}
                    onChange={(e) =>
                      setSelfAttestations({ ...selfAttestations, [idx]: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      {item.mandatory && (
                        <span className="rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 text-[9px] font-bold">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                      Evidence Attached: {item.recommendedDocument}
                    </p>
                  </div>
                </label>
              ))
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-xs text-slate-600">
                General compliance self-check will be completed during automated OCR processing.
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="rounded-xl text-xs"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Documents
            </Button>
            <Button
              onClick={() => setCurrentStep(4)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Review & Final Submission
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Final Non-Repudiation & Submission */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 4: Non-Repudiation Review & Formal Electronic Submission
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify your submission package. Once submitted, documents are immutably locked for officer evaluation.
            </p>
          </div>

          {/* Submission Summary Box */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Organization</span>
                <span className="font-bold text-slate-900 dark:text-white">{companyDetails.companyName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{companyDetails.gstin || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Uploaded Documents</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{application.documents?.length || 0} Files</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Status</span>
                <span className="font-bold text-slate-900 dark:text-white">{application.status}</span>
              </div>
            </div>
          </div>

          {/* Legal Non-Repudiation Declaration */}
          {!isLocked ? (
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={legalDeclarationChecked}
                  onChange={(e) => setLegalDeclarationChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  I, the authorized representative of <strong>{companyDetails.companyName || 'our organization'}</strong>, hereby affirm under the GeM Public Procurement Terms that all statements and attached evidence documents are genuine, authentic, and free from falsification. I understand that upon submission, this application is permanently locked and non-repudiable.
                </span>
              </label>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>Application Officially Submitted & Locked</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Submitted on {application.submittedAt ? new Date(application.submittedAt).toLocaleString() : 'N/A'}.
                Your submission has entered the automated compliance evaluation queue and officer review panel.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(3)}
              className="rounded-xl text-xs"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Self-Check
            </Button>

            {!isLocked ? (
              <Button
                onClick={handleSubmitApplication}
                disabled={!legalDeclarationChecked || isSubmitting || application.documents?.length === 0}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Submitting & Locking Application...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-1.5 h-4 w-4" />
                    Submit Formal Bid Application
                  </>
                )}
              </Button>
            ) : (
              <Link href="/bidder/applications">
                <Button className="rounded-xl bg-indigo-600 text-white text-xs font-bold">
                  View in My Applications Directory
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
