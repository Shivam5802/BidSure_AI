import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { BidDocument } from '../types';

interface DocumentUploadZoneProps {
  submissionId: string;
  onUploadSuccess: (results: Array<{ document: BidDocument; isDuplicate: boolean; message: string; error?: string }>) => void;
}

interface UploadingFileState {
  file: File;
  progress: number;
  status: 'QUEUED' | 'UPLOADING' | 'COMPLETED' | 'DUPLICATE' | 'FAILED';
  message?: string;
  error?: string;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({ submissionId, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileStates, setFileStates] = useState<UploadingFileState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const initialStates: UploadingFileState[] = fileArray.map((f) => ({
      file: f,
      progress: 0,
      status: 'QUEUED',
    }));

    setFileStates(initialStates);
    setIsUploading(true);

    try {
      const formData = new FormData();
      fileArray.forEach((file) => formData.append('files', file));

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiBase}/api/bid-submissions/${submissionId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'Upload request failed' }));
        throw new Error(errJson.error || 'Upload request failed');
      }

      const json = await res.json();
      const results: Array<{ document: BidDocument; isDuplicate: boolean; message: string; error?: string }> = json.data || [];

      const updatedStates: UploadingFileState[] = fileArray.map((file, idx) => {
        const resItem = results[idx] || results.find((r) => r.document?.originalFilename === file.name);
        if (resItem?.error) {
          return { file, progress: 100, status: 'FAILED', error: resItem.error };
        }
        if (resItem?.isDuplicate) {
          return { file, progress: 100, status: 'DUPLICATE', message: resItem.message };
        }
        return { file, progress: 100, status: 'COMPLETED', message: 'Uploaded & Queued for Classification' };
      });

      setFileStates(updatedStates);
      onUploadSuccess(results);
    } catch (err: unknown) {
      const errMsg = (err as Error).message || 'Upload failed';
      setFileStates((prev) =>
        prev.map((s) => ({ ...s, progress: 100, status: 'FAILED', error: errMsg }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-slate-800'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Upload Bidder Supporting Documents
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Drag & drop multiple PDF files or click to browse. Automatic SHA-256 hash duplicate detection and document classification will execute asynchronously.
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span>Supported: PDF documents</span>
          <span>•</span>
          <span>Max file size: 50 MB</span>
        </div>
      </div>

      {fileStates.length > 0 && (
        <div className="mt-6 space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Upload Status ({fileStates.length} file{fileStates.length > 1 ? 's' : ''})
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {fileStates.map((fs, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <File className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {fs.file.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(fs.file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {fs.status === 'UPLOADING' && (
                    <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading...
                    </span>
                  )}
                  {fs.status === 'COMPLETED' && (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Success
                    </span>
                  )}
                  {fs.status === 'DUPLICATE' && (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Duplicate Hash Detected
                    </span>
                  )}
                  {fs.status === 'FAILED' && (
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                      <XCircle className="w-4 h-4" />
                      {fs.error || 'Failed'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
