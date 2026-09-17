'use client';

import React, { useState } from 'react';
import { X, Save, RotateCcw, Info } from 'lucide-react';
import { TenderRequirement, RequirementCategory, MandatoryStatus, RuleType } from '../types';

interface RequirementEditModalProps {
  requirement: TenderRequirement;
  onClose: () => void;
  onSave: (updatedPayload: Partial<TenderRequirement>) => void;
}

export const RequirementEditModal: React.FC<RequirementEditModalProps> = ({
  requirement: req,
  onClose,
  onSave,
}) => {
  const [requirementText, setRequirementText] = useState(req.requirementText);
  const [clauseReference, setClauseReference] = useState(req.clauseReference || '');
  const [category, setCategory] = useState<RequirementCategory>(req.category);
  const [mandatory, setMandatory] = useState<MandatoryStatus>(req.mandatory);
  const [condition, setCondition] = useState(req.condition || '');
  const [evidenceRequired, setEvidenceRequired] = useState(req.evidenceRequired.join(', '));
  const [verificationSource, setVerificationSource] = useState(req.verificationSource || '');
  const [ruleType, setRuleType] = useState<RuleType | ''>(req.ruleType || '');
  const [ruleParamsString, setRuleParamsString] = useState(
    req.ruleParameters ? JSON.stringify(req.ruleParameters, null, 2) : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let parsedParams: Record<string, any> | undefined = undefined;
    if (ruleParamsString.trim()) {
      try {
        parsedParams = JSON.parse(ruleParamsString);
      } catch {
        setError('Rule Parameters must be valid JSON format');
        return;
      }
    }

    onSave({
      requirementText,
      clauseReference: clauseReference.trim() || null,
      category,
      mandatory,
      condition: condition.trim() || null,
      evidenceRequired: evidenceRequired
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      verificationSource: verificationSource.trim() || null,
      ruleType: ruleType ? (ruleType as RuleType) : null,
      ruleParameters: parsedParams,
      status: 'DRAFT', // After officer edits, goes back to DRAFT or REVIEW
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <div>
            <span className="font-mono text-xs font-bold text-blue-400">
              Editing Requirement {req.requirementCode}
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">Procurement Officer Modification</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* AI Original vs Modification Notice */}
          <div className="p-3 bg-blue-950/40 border border-blue-800/40 text-blue-300 text-xs rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Modifying an AI extracted requirement creates an auditable officer override. The original AI extraction is preserved in the version history.
            </span>
          </div>

          {/* Requirement Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Requirement Clause Text
            </label>
            <textarea
              rows={3}
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm p-3 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Clause Reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Clause Reference</label>
              <input
                type="text"
                value={clauseReference}
                onChange={(e) => setClauseReference(e.target.value)}
                placeholder="e.g. 4.2.1"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RequirementCategory)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="FINANCIAL">Financial</option>
                <option value="TECHNICAL">Technical</option>
                <option value="STATUTORY">Statutory</option>
                <option value="ELIGIBILITY">Eligibility</option>
                <option value="POLICY">Policy</option>
                <option value="TENDER_SPECIFIC">Tender Specific</option>
              </select>
            </div>

            {/* Mandatory Flag */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mandatory Status</label>
              <select
                value={mandatory}
                onChange={(e) => setMandatory(e.target.value as MandatoryStatus)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="YES">Mandatory (YES)</option>
                <option value="NO">Optional (NO)</option>
                <option value="UNKNOWN">Ambiguous (UNKNOWN)</option>
              </select>
            </div>
          </div>

          {/* Conditional Logic */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Condition / Relaxation Rule</label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. IF bidder is Startup -> relaxation applies"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Evidence Required */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Evidence Required (comma separated)
            </label>
            <input
              type="text"
              value={evidenceRequired}
              onChange={(e) => setEvidenceRequired(e.target.value)}
              placeholder="Audited Balance Sheets, CA Certificate, GST Certificate"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Verification Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Verification Source</label>
            <input
              type="text"
              value={verificationSource}
              onChange={(e) => setVerificationSource(e.target.value)}
              placeholder="GSTN, Income Tax, MCA, EPFO"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Rule Candidate Type & Params */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Candidate Type</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as RuleType)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">None (No quantitative rule candidate)</option>
                <option value="NUMERIC">NUMERIC</option>
                <option value="DATE">DATE</option>
                <option value="BOOLEAN">BOOLEAN</option>
                <option value="TEXT_MATCH">TEXT_MATCH</option>
                <option value="PERCENTAGE">PERCENTAGE</option>
                <option value="COUNT">COUNT</option>
                <option value="COMPOUND">COMPOUND</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Parameters (JSON)</label>
              <textarea
                rows={3}
                value={ruleParamsString}
                onChange={(e) => setRuleParamsString(e.target.value)}
                placeholder='{ "metric": "turnover", "operator": ">=", "value": 100000000 }'
                className="w-full bg-slate-800 border border-slate-700 font-mono text-slate-100 text-xs p-2 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow transition"
            >
              <Save className="w-4 h-4" /> Save Modification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
