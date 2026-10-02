 package com.bidsure.ai.data.model

import com.google.gson.annotations.SerializedName

// ==========================================
// 1. Executive Reports Models
// ==========================================

data class ReportMetadataItem(
    @SerializedName("id") val id: String,
    @SerializedName("tenderId") val tenderId: String,
    @SerializedName("bidderId") val bidderId: String? = null,
    @SerializedName("reportType") val reportType: String,
    @SerializedName("status") val status: String,
    @SerializedName("reportVersion") val reportVersion: String = "1.0",
    @SerializedName("engineVersion") val engineVersion: String = "1.0",
    @SerializedName("generatedBy") val generatedBy: String = "system",
    @SerializedName("generatedAt") val generatedAt: String? = null,
    @SerializedName("reportChecksum") val reportChecksum: String? = null,
    @SerializedName("snapshotId") val snapshotId: String? = null,
    @SerializedName("isStale") val isStale: Boolean = false,
    @SerializedName("completenessStatus") val completenessStatus: String = "COMPLETE",
    @SerializedName("fileKey") val fileKey: String? = null
)

data class ReportTenderHeader(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("referenceNumber") val referenceNumber: String,
    @SerializedName("organization") val organization: String = "",
    @SerializedName("closingDate") val closingDate: String? = null,
    @SerializedName("description") val description: String? = null
)

data class ReportBidderHeader(
    @SerializedName("id") val id: String,
    @SerializedName("bidderCode") val bidderCode: String,
    @SerializedName("legalName") val legalName: String,
    @SerializedName("displayName") val displayName: String? = null,
    @SerializedName("submissionStatus") val submissionStatus: String = "",
    @SerializedName("submittedAt") val submittedAt: String? = null,
    @SerializedName("documentCount") val documentCount: Int = 0
)

data class ReportExecutiveSummary(
    @SerializedName("totalRequirements") val totalRequirements: Int = 0,
    @SerializedName("passCount") val passCount: Int = 0,
    @SerializedName("failCount") val failCount: Int = 0,
    @SerializedName("reviewCount") val reviewCount: Int = 0,
    @SerializedName("notEvaluableCount") val notEvaluableCount: Int = 0,
    @SerializedName("notApplicableCount") val notApplicableCount: Int = 0,
    @SerializedName("conflictCount") val conflictCount: Int = 0,
    @SerializedName("unresolvedConflictCount") val unresolvedConflictCount: Int = 0,
    @SerializedName("investigationCount") val investigationCount: Int = 0,
    @SerializedName("activeInvestigationCount") val activeInvestigationCount: Int = 0,
    @SerializedName("coveragePercentage") val coveragePercentage: Double = 0.0
)

data class ReportEvidenceItem(
    @SerializedName("id") val id: String,
    @SerializedName("fieldKey") val fieldKey: String = "",
    @SerializedName("fieldLabel") val fieldLabel: String = "",
    @SerializedName("rawValue") val rawValue: String = "",
    @SerializedName("documentName") val documentName: String = "",
    @SerializedName("pageNumber") val pageNumber: Int = 0,
    @SerializedName("confidence") val confidence: Double = 0.0,
    @SerializedName("status") val status: String = "",
    @SerializedName("conflictFlag") val conflictFlag: Boolean = false,
    @SerializedName("conflictReason") val conflictReason: String? = null
)

data class ReportConflictItem(
    @SerializedName("id") val id: String,
    @SerializedName("conflictType") val conflictType: String = "",
    @SerializedName("severity") val severity: String = "",
    @SerializedName("status") val status: String = "",
    @SerializedName("fieldKey") val fieldKey: String = "",
    @SerializedName("description") val description: String = "",
    @SerializedName("fingerprint") val fingerprint: String? = null,
    @SerializedName("resolvedBy") val resolvedBy: String? = null,
    @SerializedName("resolvedAt") val resolvedAt: String? = null,
    @SerializedName("resolutionReason") val resolutionReason: String? = null
)

data class ReportInvestigationItem(
    @SerializedName("id") val id: String,
    @SerializedName("triggerType") val triggerType: String = "",
    @SerializedName("status") val status: String = "",
    @SerializedName("severity") val severity: String = "",
    @SerializedName("question") val question: String? = null,
    @SerializedName("summary") val summary: String? = null,
    @SerializedName("finding") val finding: String? = null,
    @SerializedName("recommendation") val recommendation: String? = null,
    @SerializedName("confidence") val confidence: Double? = null,
    @SerializedName("reviewedBy") val reviewedBy: String? = null,
    @SerializedName("reviewDecision") val reviewDecision: String? = null
)

data class ReportRequirementAuditItem(
    @SerializedName("requirement") val requirement: RequirementAuditItemDetail? = null,
    @SerializedName("rule") val rule: RuleAuditItemDetail? = null,
    @SerializedName("evaluation") val evaluation: EvaluationAuditItemDetail? = null,
    @SerializedName("evidenceList") val evidenceList: List<ReportEvidenceItem> = emptyList(),
    @SerializedName("conflicts") val conflicts: List<ReportConflictItem> = emptyList(),
    @SerializedName("investigations") val investigations: List<ReportInvestigationItem> = emptyList()
)

data class RequirementAuditItemDetail(
    @SerializedName("id") val id: String,
    @SerializedName("requirementCode") val requirementCode: String,
    @SerializedName("clauseReference") val clauseReference: String? = null,
    @SerializedName("requirementText") val requirementText: String,
    @SerializedName("category") val category: String = "",
    @SerializedName("mandatory") val mandatory: String = "MANDATORY"
)

data class RuleAuditItemDetail(
    @SerializedName("id") val id: String,
    @SerializedName("ruleCode") val ruleCode: String,
    @SerializedName("name") val name: String,
    @SerializedName("ruleType") val ruleType: String = "DETERMINISTIC",
    @SerializedName("version") val version: Int = 1
)

data class EvaluationAuditItemDetail(
    @SerializedName("id") val id: String? = null,
    @SerializedName("result") val result: String = "NO_RESULT",
    @SerializedName("reasonCode") val reasonCode: String? = null,
    @SerializedName("summary") val summary: String? = null,
    @SerializedName("explanation") val explanation: String? = null,
    @SerializedName("engineVersion") val engineVersion: String? = null
)

data class ReportAuditTimelineItem(
    @SerializedName("id") val id: String,
    @SerializedName("timestamp") val timestamp: String,
    @SerializedName("actor") val actor: String,
    @SerializedName("event") val event: String,
    @SerializedName("metadata") val metadata: Any? = null
)

data class ReportSystemVersions(
    @SerializedName("bidGuardVersion") val bidGuardVersion: String = "1.0",
    @SerializedName("reportVersion") val reportVersion: String = "1.0",
    @SerializedName("complianceEngineVersion") val complianceEngineVersion: String = "1.0",
    @SerializedName("ruleVersion") val ruleVersion: String = "1.0",
    @SerializedName("evidenceExtractionVersion") val evidenceExtractionVersion: String = "1.0",
    @SerializedName("investigationAgentVersion") val investigationAgentVersion: String = "1.0",
    @SerializedName("conflictDetectorVersion") val conflictDetectorVersion: String = "1.0"
)

data class ReportDataSnapshot(
    @SerializedName("metadata") val metadata: ReportMetadataItem,
    @SerializedName("tender") val tender: ReportTenderHeader,
    @SerializedName("bidder") val bidder: ReportBidderHeader? = null,
    @SerializedName("executiveSummary") val executiveSummary: ReportExecutiveSummary = ReportExecutiveSummary(),
    @SerializedName("requirements") val requirements: List<ReportRequirementAuditItem> = emptyList(),
    @SerializedName("conflicts") val conflicts: List<ReportConflictItem> = emptyList(),
    @SerializedName("investigations") val investigations: List<ReportInvestigationItem> = emptyList(),
    @SerializedName("auditTimeline") val auditTimeline: List<ReportAuditTimelineItem> = emptyList(),
    @SerializedName("systemVersions") val systemVersions: ReportSystemVersions? = null,
    @SerializedName("disclaimer") val disclaimer: String? = null
)

data class ReportStatusResponse(
    @SerializedName("id") val id: String,
    @SerializedName("status") val status: String,
    @SerializedName("completenessStatus") val completenessStatus: String,
    @SerializedName("isStale") val isStale: Boolean,
    @SerializedName("generatedAt") val generatedAt: String? = null,
    @SerializedName("checksum") val checksum: String? = null
)

// ==========================================
// 2. Real-Time Intelligence Models
// ==========================================

data class TenderHealthSnapshot(
    @SerializedName("tenderId") val tenderId: String,
    @SerializedName("tenderTitle") val tenderTitle: String,
    @SerializedName("referenceNumber") val referenceNumber: String,
    @SerializedName("totalRequirements") val totalRequirements: Int = 0,
    @SerializedName("executableRulesCount") val executableRulesCount: Int = 0,
    @SerializedName("evidenceCoveragePercentage") val evidenceCoveragePercentage: Double = 0.0,
    @SerializedName("passCount") val passCount: Int = 0,
    @SerializedName("failCount") val failCount: Int = 0,
    @SerializedName("reviewCount") val reviewCount: Int = 0,
    @SerializedName("notEvaluableCount") val notEvaluableCount: Int = 0,
    @SerializedName("unresolvedConflictCount") val unresolvedConflictCount: Int = 0,
    @SerializedName("externalMismatchCount") val externalMismatchCount: Int = 0,
    @SerializedName("openInvestigationCount") val openInvestigationCount: Int = 0,
    @SerializedName("dataTimestamp") val dataTimestamp: String = ""
)

data class IntelligenceIndicator(
    @SerializedName("id") val id: String,
    @SerializedName("category") val category: String,
    @SerializedName("code") val code: String,
    @SerializedName("severity") val severity: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String,
    @SerializedName("count") val count: Int = 1,
    @SerializedName("bidderCode") val bidderCode: String? = null,
    @SerializedName("bidderName") val bidderName: String? = null,
    @SerializedName("recommendedAction") val recommendedAction: String? = null,
    @SerializedName("recommendedRoute") val recommendedRoute: String? = null,
    @SerializedName("createdAt") val createdAt: String? = null
)

data class IndicatorsAndActionsResponse(
    @SerializedName("indicators") val indicators: List<IntelligenceIndicator> = emptyList(),
    @SerializedName("priorityQueue") val priorityQueue: List<PriorityActionItem> = emptyList()
)

data class AuditabilityMetrics(
    @SerializedName("requirementProvenancePercentage") val requirementProvenancePercentage: Double = 0.0,
    @SerializedName("evidencePageProvenancePercentage") val evidencePageProvenancePercentage: Double = 0.0,
    @SerializedName("evaluationVersionTracePercentage") val evaluationVersionTracePercentage: Double = 0.0,
    @SerializedName("auditEventsRecordedCount") val auditEventsRecordedCount: Int = 0,
    @SerializedName("evidenceTraceabilityPercentage") val evidenceTraceabilityPercentage: Double = 0.0,
    @SerializedName("automationCoveragePercentage") val automationCoveragePercentage: Double = 0.0,
    @SerializedName("humanReviewRatePercentage") val humanReviewRatePercentage: Double = 0.0,
    @SerializedName("verificationCoveragePercentage") val verificationCoveragePercentage: Double? = null
)

data class AuditabilityMetricsResponse(
    @SerializedName("tenderId") val tenderId: String,
    @SerializedName("auditability") val auditability: AuditabilityMetrics
)

// ==========================================
// 3. Admin & State Reset Models
// ==========================================

data class AdminResetResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: Any? = null,
    @SerializedName("error") val error: ApiErrorDetail? = null
)

data class OfficerItem(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("role") val role: String = "PROCUREMENT_OFFICER",
    @SerializedName("status") val status: String = "ACTIVE",
    @SerializedName("department") val department: String? = null,
    @SerializedName("designation") val designation: String? = null,
    @SerializedName("phone") val phone: String? = null,
    @SerializedName("createdAt") val createdAt: String? = null
)

data class OfficerActivityLogItem(
    @SerializedName("id") val id: String,
    @SerializedName("tenderId") val tenderId: String? = null,
    @SerializedName("event") val event: String,
    @SerializedName("actor") val actor: String,
    @SerializedName("metadata") val metadata: Any? = null,
    @SerializedName("createdAt") val createdAt: String? = null
)

data class OfficerActivityResponse(
    @SerializedName("officer") val officer: OfficerItem,
    @SerializedName("activityLogs") val activityLogs: List<OfficerActivityLogItem> = emptyList()
)

// ==========================================
// 4. Bidder Profile Models
// ==========================================

data class BidderProfileData(
    @SerializedName("id") val id: String? = null,
    @SerializedName("userId") val userId: String? = null,
    @SerializedName("companyName") val companyName: String = "",
    @SerializedName("companyType") val companyType: String? = null,
    @SerializedName("gstin") val gstin: String? = null,
    @SerializedName("pan") val pan: String? = null,
    @SerializedName("registeredAddress") val registeredAddress: String? = null,
    @SerializedName("contactEmail") val contactEmail: String? = null,
    @SerializedName("contactPhone") val contactPhone: String? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("updatedAt") val updatedAt: String? = null
)
