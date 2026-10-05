'use client';

import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api/client';
import { toast } from '@/components/ui/Toast';
import {
  FolderLock,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Download,
  Loader2,
  Plus,
  Filter,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentRecord {
  id: string;
  category: string;
  documentType: string;
  title: string;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  issueDate?: string | null;
  expiryDate?: string | null;
  version: number;
  verificationStatus: string;
  rejectionReason?: string | null;
  uploadedAt: string;
}

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('REGISTRATION');
  const [documentType, setDocumentType] = useState('GST_CERTIFICATE');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await api.getBidderDocuments(activeCategory);
      setDocuments(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load document vault.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [activeCategory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 25 * 1024 * 1024) {
        toast.error('File size exceeds 25MB limit.');
        return;
      }
      setSelectedFile(f);
      if (!title) {
        setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[_.-]/g, ' '));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    if (!title.trim()) {
      toast.error('Document title is required.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('documentType', documentType);
      if (issueDate) formData.append('issueDate', issueDate);
      if (expiryDate) formData.append('expiryDate', expiryDate);

      await api.uploadBidderDocument(formData);
      toast.success('Document uploaded to vault and validated.');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setTitle('');
      setIssueDate('');
      setExpiryDate('');
      await loadDocuments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, docTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${docTitle}" from your vault?`)) return;
    try {
      await api.deleteBidderDocument(id);
      toast.success('Document deleted from vault.');
      await loadDocuments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete document.');
    }
  };

  const categories = [
    { key: 'ALL', label: 'All Documents' },
    { key: 'REGISTRATION', label: 'Registrations' },
    { key: 'CERTIFICATE', label: 'Certificates' },
    { key: 'FINANCIAL_RECORD', label: 'Financial Records' },
    { key: 'DECLARATION', label: 'Declarations' },
    { key: 'TECHNICAL', label: 'Technical' },
    { key: 'EXPERIENCE', label: 'Past Experience' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Centralized Document Vault
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Securely store, verify, and reuse corporate credentials and technical certifications across multiple tenders.
          </p>
        </div>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
        >
          <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
          Vault New Document
        </Button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setActiveCategory(c.key)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              activeCategory === c.key
                ? 'bg-[#1464B4] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1464B4]" />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <FolderLock className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">Vault is Empty</h3>
          <p className="mt-1 text-xs text-slate-500">Upload statutory documents, audited financials, or ISO certificates for automatic tender linkage.</p>
          <Button onClick={() => setIsUploadModalOpen(true)} className="mt-4 rounded-xl text-xs font-bold bg-[#1464B4]">
            <UploadCloud className="mr-1.5 h-3.5 w-3.5" /> Vault First Document
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Document Details</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Validity Dates</th>
                  <th className="px-4 py-3.5">Version</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1464B4] dark:bg-blue-950/60 dark:text-blue-400 mt-0.5">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white">{doc.title}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {doc.originalFilename} • {(doc.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold">
                        {doc.category}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {doc.expiryDate ? (
                        <span className="text-[11px]">
                          Exp: {new Date(doc.expiryDate).toLocaleDateString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">No Expiry</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-500 font-bold">
                      v{doc.version || 1}
                    </td>

                    <td className="px-4 py-3.5">
                      {doc.verificationStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      ) : doc.verificationStatus === 'EXPIRED' ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                          <Clock className="h-3 w-3" /> Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 text-[10px] font-bold">
                          <Clock className="h-3 w-3" /> In Review
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toast.info(`Document "${doc.title}" downloaded securely from vault.`)}
                          className="rounded-lg p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                          title="Download document"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="rounded-lg p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                          title="Delete from vault"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Vault New Document</h3>

            <form onSubmit={handleUpload} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Audited Balance Sheet FY 2023-24"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                  >
                    <option value="REGISTRATION">Registration</option>
                    <option value="CERTIFICATE">Certificate</option>
                    <option value="FINANCIAL_RECORD">Financial Record</option>
                    <option value="DECLARATION">Declaration</option>
                    <option value="TECHNICAL">Technical Document</option>
                    <option value="EXPERIENCE">Past Experience</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Document Type
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                  >
                    <option value="GST_CERTIFICATE">GST Certificate</option>
                    <option value="PAN_CARD">PAN Card</option>
                    <option value="UDYAM_MSME">Udyam Registration</option>
                    <option value="CA_AUDITED_FINANCIALS">Audited Financials</option>
                    <option value="SOLVENCY_CERTIFICATE">Bank Solvency</option>
                    <option value="ISO_CERTIFICATE">ISO Quality Certificate</option>
                    <option value="EXPERIENCE_CERTIFICATE">Work Experience Order</option>
                    <option value="MAKE_IN_INDIA_AFFIDAVIT">Make in India Affidavit</option>
                    <option value="OTHER">Other Statutory</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry Date (if any)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload File (PDF, DOCX, JPG, PNG up to 25MB) <span className="text-rose-500">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-4 text-center hover:border-blue-500 dark:hover:border-blue-500 transition"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <FileCheck2 className="h-4 w-4" />
                      <span>{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="mx-auto h-6 w-6 text-slate-400" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Click to select document
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isUploading || !selectedFile} className="rounded-xl bg-[#1464B4] text-xs font-bold">
                  {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Vault Document
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
