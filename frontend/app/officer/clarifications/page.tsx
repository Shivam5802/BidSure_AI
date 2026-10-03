'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Building2,
  FileText,
  RefreshCw,
  Send,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { officerApi, ClarificationRequestItem } from '@/lib/api/officer.api';
import { tenderApi } from '@/features/tenders/api';
import { Tender } from '@/features/tenders/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function OfficerClarificationsPage() {
  const [clarifications, setClarifications] = useState<ClarificationRequestItem[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClarification, setSelectedClarification] = useState<ClarificationRequestItem | null>(null);

  // New Clarification Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState('');
  const [bidderName, setBidderName] = useState('');
  const [bidderId, setBidderId] = useState('');
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, tenderList] = await Promise.all([
        officerApi.listClarifications(),
        tenderApi.listTenders(),
      ]);
      setClarifications(list);
      setTenders(tenderList);
      if (tenderList.length > 0 && !selectedTenderId) {
        setSelectedTenderId(tenderList[0].id);
      }
    } catch (err) {
      console.error('Failed to load clarifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenderId || !subject.trim() || !question.trim()) return;

    setIsSubmitting(true);
    try {
      await officerApi.createClarification({
        tenderId: selectedTenderId,
        bidderId: bidderId || 'bdr_001',
        subject,
        question,
        deadline: deadline || new Date(Date.now() + 86400000 * 3).toISOString(),
      });
      setIsNewModalOpen(false);
      setSubject('');
      setQuestion('');
      void loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to create clarification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Vendor Clarification Management
            </h1>
            <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">
              Statutory Workflow
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Request formal technical and statutory clarifications from bidders with enforce deadlines and tracked responses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4" />
            Issue Clarification
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests Issued</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{clarifications.length}</div>
            <div className="text-xs text-slate-400 mt-1">Logged in audit trail</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-4">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Awaiting Bidder Reply</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {(clarifications || []).filter((c) => c.status === 'PENDING').length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Within active response window</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-4">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Responses Received</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {(clarifications || []).filter((c) => c.status === 'RESPONDED').length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Ready for officer review</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-4">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Avg Response Time</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">18 Hours</div>
            <div className="text-xs text-slate-400 mt-1">Well ahead of 72h limit</div>
          </CardContent>
        </Card>
      </div>

      {/* Clarifications Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Subject & Query</th>
                <th className="py-3.5 px-4">Bidder Entity</th>
                <th className="py-3.5 px-4">Tender Reference</th>
                <th className="py-3.5 px-4">Response Status</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {clarifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    No clarification requests issued yet.
                  </td>
                </tr>
              ) : (
                clarifications.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">{item.subject}</div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">{item.question}</div>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {item.bidderName}
                    </td>

                    <td className="py-4 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                      {item.tenderReference}
                    </td>

                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          item.status === 'RESPONDED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {item.status === 'RESPONDED' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Responded
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Awaiting Reply
                          </span>
                        )}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-xs font-mono text-slate-500">
                      {new Date(item.deadline).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedClarification(item)}
                        className="h-8 text-xs gap-1 text-purple-700 dark:text-purple-300 hover:bg-purple-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Thread
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Thread Drawer/Modal */}
      {selectedClarification && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedClarification.subject}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bidder: {selectedClarification.bidderName} | Tender: {selectedClarification.tenderReference}
                </p>
              </div>
              <button onClick={() => setSelectedClarification(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl space-y-1">
              <div className="text-xs font-semibold text-purple-900 dark:text-purple-300">Officer Query:</div>
              <p className="text-xs text-purple-800 dark:text-purple-200">{selectedClarification.question}</p>
              <div className="text-[10px] text-purple-600 dark:text-purple-400 pt-1">
                Issued by {selectedClarification.officerName} on {new Date(selectedClarification.createdAt).toLocaleString()}
              </div>
            </div>

            {selectedClarification.bidderResponse ? (
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-1">
                <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Bidder Response:
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-200">{selectedClarification.bidderResponse}</p>
                {selectedClarification.responseSubmittedAt && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 pt-1">
                    Submitted on {new Date(selectedClarification.responseSubmittedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                <Clock className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                Response pending from bidder. Deadline: {new Date(selectedClarification.deadline).toLocaleDateString()}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedClarification(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Clarification Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                New Clarification Request
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Tender</label>
                <select
                  value={selectedTenderId}
                  onChange={(e) => setSelectedTenderId(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                >
                  {tenders.map((t) => (
                    <option key={t.id} value={t.id}>{t.referenceNumber} — {t.title.substring(0, 35)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule-3 CA Attestation Clarification"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Clarification Query</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Specify the exact documentation or clarification required..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Deadline Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {isSubmitting ? 'Sending...' : 'Send Clarification'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
