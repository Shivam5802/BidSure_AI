'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle, Trash2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { tenderApi } from '../api';

interface FileUploadDropzoneProps {
  tenderId: string;
  onUploadSuccess: () => void;
}

interface StagedFile {
  id: string;
  file: File;
  status: 'valid' | 'duplicate' | 'invalid';
  errorMessage?: string;
}

export function FileUploadDropzone({ tenderId, onUploadSuccess }: FileUploadDropzoneProps) {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE_MB = 50;

  const validateFile = (file: File, existing: StagedFile[]): { status: 'valid' | 'duplicate' | 'invalid'; error?: string } => {
    // 1. Extension & MIME
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return { status: 'invalid', error: 'Only PDF files are supported.' };
    }

    // 2. Size
    if (file.size === 0) {
      return { status: 'invalid', error: 'File is empty (0 bytes).' };
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return { status: 'invalid', error: `File size exceeds ${MAX_SIZE_MB}MB limit.` };
    }

    // 3. Duplicate check in current selection
    const isDup = existing.some(
      (s) => s.file.name === file.name && s.file.size === file.size
    );
    if (isDup) {
      return { status: 'duplicate', error: 'Duplicate file already selected in batch.' };
    }

    return { status: 'valid' };
  };

  const handleFiles = (incoming: FileList | File[]) => {
    setUploadError(null);
    const filesArray = Array.from(incoming);
    const updated = [...stagedFiles];

    for (const file of filesArray) {
      const { status, error } = validateFile(file, updated);
      updated.push({
        id: `stage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        status,
        errorMessage: error,
      });
    }

    setStagedFiles(updated);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setStagedFiles(stagedFiles.filter((f) => f.id !== id));
  };

  const handleUploadSubmit = async () => {
    const validFiles = stagedFiles.filter((f) => f.status === 'valid').map((f) => f.file);
    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await tenderApi.uploadDocuments(tenderId, validFiles);
      setStagedFiles([]);
      onUploadSuccess();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  const validCount = stagedFiles.filter((f) => f.status === 'valid').length;

  return (
    <div className="space-y-6">
      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition ${
          isDragging
            ? 'border-brand-600 bg-brand-50/60'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 mb-4">
          <UploadCloud className="h-6 w-6" />
        </div>

        <h3 className="text-base font-semibold text-slate-900">
          Drop tender PDFs here or click to browse
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Multiple PDF files supported (RFP, General Conditions, BoQ, Specifications). Max {MAX_SIZE_MB}MB per file.
        </p>
      </div>

      {uploadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Staged File Cards */}
      {stagedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Selected Documents ({stagedFiles.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStagedFiles([])}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {stagedFiles.map((item) => {
              const sizeMb = (item.file.size / (1024 * 1024)).toFixed(2);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="truncate text-left">
                      <p className="truncate text-xs font-medium text-slate-900" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{sizeMb} MB • PDF</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'valid' && (
                      <Badge variant="success" className="text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-0.5" /> Valid
                      </Badge>
                    )}
                    {item.status === 'duplicate' && (
                      <Badge variant="warning" className="text-[10px]">
                        <AlertTriangle className="h-3 w-3 mr-0.5" /> Duplicate
                      </Badge>
                    )}
                    {item.status === 'invalid' && (
                      <Badge variant="error" className="text-[10px]">
                        <XCircle className="h-3 w-3 mr-0.5" /> Invalid
                      </Badge>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      disabled={isUploading}
                      className="text-slate-400 hover:text-red-600 transition"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              disabled={validCount === 0 || isUploading}
              onClick={handleUploadSubmit}
            >
              {isUploading ? (
                'Uploading & Storing Documents...'
              ) : (
                <>
                  Upload {validCount} Document{validCount === 1 ? '' : 's'}
                  <ArrowUpRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
