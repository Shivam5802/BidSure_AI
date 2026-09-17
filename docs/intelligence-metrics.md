# BidGuard AI — Intelligence & Impact Metric Dictionary

This document provides the definitive specification for all intelligence, risk indicator, and impact metrics computed and displayed across the BidGuard AI platform.

---

## Metric Governance Principles

1. **Deterministic & Auditable**: Every metric is calculated via an open, transparent formula grounded in immutable database records or verified facts. No opaque "AI risk scores" or arbitrary 0–100 scales are used.
2. **Strict Non-Preference**: Priority and indicator metrics indicate **where attention is needed first**; they NEVER express bidder preference or predetermine procurement decisions.
3. **Traceable Lineage**: Metrics link directly to underlying facts, rules, evidence extractions, and document source pages.
4. **Separation of Measured vs. Projected Impact**: Actual prototype metrics measured from system execution are strictly segregated from projected SIH benchmark savings and interactive demo estimates.

---

## Core Metrics Index

| # | Metric Name | Category | Primary Data Source | Default Direction |
|---|-------------|----------|---------------------|-------------------|
| 1 | Evidence Coverage Rate (5-State) | Coverage | `BidderRequirementMapping`, `EvidenceFact` | Higher = Better |
| 2 | Compliance Evaluation Distribution | Compliance | `EvaluationResult` | Contextual |
| 3 | Evidence Traceability Score | Auditability | Full lineage chain: Requirement → Rule → Fact → Document → Page | Higher = Better |
| 4 | Automation Coverage Rate | Auditability | `ComplianceRule`, `TenderRequirement` | Higher = Better |
| 5 | Human Review Rate | Auditability | `EvaluationResult` (`REVIEW` state) | Lower = Higher Automation |
| 6 | External Verification Coverage | Verification | `ExternalVerificationRecord` | Higher = Better |
| 7 | Conflict Rate | Risk / Integrity | `ContradictionDetectionRecord` | Lower = Better |
| 8 | Investigation Load | Risk / Integrity | `InvestigationSession`, `TenderRequirement` | Contextual |
| 9 | System Processing Time | Effort / Efficiency | Ingestion, Extraction, Rule, and Evaluation Run Logs | Lower = Faster |
| 10 | Benchmark & Impact Methodology | Effort / Impact | Time Tracking Logs vs. Baseline Parameters | Higher Savings = Better |

---

## Detailed Metric Specifications

### 1. Evidence Coverage Rate (5-State Breakdown)

* **Category**: Coverage
* **Definition**: Measures the degree to which required tender specifications have corresponding factual evidence extracted from submitted bidder documents.
* **Calculation Logic & Formula**:
  * **5-State Distribution**:
    * `FULLY_SUPPORTED`: Mapped evidence directly satisfies all required fields of the requirement.
    * `PARTIALLY_SUPPORTED`: Mapped evidence satisfies some but not all required fields or conditions.
    * `POTENTIAL_MATCH`: Candidate evidence detected by semantic/keyword mapping awaiting officer confirmation.
    * `NO_EVIDENCE`: No evidence facts mapped or extracted for this requirement from the bidder's submissions.
    * `CONTRADICTORY`: Multiple extracted evidence facts for this requirement disagree or conflict.
  * **Aggregate Coverage %**:
    $$\text{Evidence Coverage Rate} = \frac{\text{Fully Supported} + \text{Partially Supported}}{\text{Total Tender Requirements}} \times 100\%$$
* **Data Sources**: `BidderRequirementMapping`, `EvidenceFact`, `TenderRequirement`.
* **Interpretation Guidance**:
  * **Good (>= 90%)**: High document completeness; bidder provided substantiating evidence for almost all clauses.
  * **Low (< 70%)**: High risk of missing documentation or severe evidence gaps. Flagged as `EVIDENCE_GAP` in priority action queue.
* **Limitations**: High coverage indicates presence of evidence, not whether the evidence passes the deterministic threshold.

---

### 2. Compliance Evaluation Distribution

* **Category**: Compliance
* **Definition**: The quad-state breakdown of deterministic evaluation results across all evaluated requirements and bidders.
* **Calculation Logic & Formula**:
  * `PASS`: Evidence satisfies all rule conditions deterministically.
  * `FAIL`: Evidence exists and explicitly violates rule condition.
  * `REVIEW`: Evidence is ambiguous, borderline, or involves unparseable text format.
  * `NOT_EVALUABLE`: Evidence is missing (`NO_EVIDENCE`) or rule condition cannot be computed.
  * **Percentages**:
    $$\% \text{State} = \frac{\text{Count of State}}{\text{Total Evaluated Criteria}} \times 100\%$$
* **Category Filtering**: Available by requirement category (`TECHNICAL`, `FINANCIAL`, `LEGAL`, `EXPERIENCE`, `ADMINISTRATIVE`, `SIMULATION`).
* **Data Sources**: `EvaluationResult`, `ComplianceRule`.
* **Interpretation Guidance**:
  * High `FAIL` on mandatory rules flags potential non-responsiveness.
  * `REVIEW` items require human procurement officer adjudication before final decision.
* **Limitations**: Evaluation results are deterministic outputs based strictly on currently ingested and mapped evidence.

---

### 3. Evidence Traceability Score

* **Category**: Auditability
* **Definition**: The proportion of compliance evaluation results that maintain an unbroken 5-link audit lineage:
  $$\text{Tender Requirement} \longrightarrow \text{Deterministic Rule} \longrightarrow \text{Evidence Fact} \longrightarrow \text{Source Document} \longrightarrow \text{Exact Page Number}$$
* **Calculation Logic & Formula**:
  $$\text{Traceability Score} = \frac{N_{\text{fully\_traced}}}{N_{\text{evaluated}}} \times 100\%$$
  Where $N_{\text{fully\_traced}}$ is the count of evaluation records having:
  1. Valid `requirementId`
  2. Valid approved `ruleId`
  3. At least 1 `evidenceFactId`
  4. Resolved `documentId`
  5. Page number $> 0$
* **Data Sources**: `EvaluationResult`, `ComplianceRule`, `EvidenceFact`, `DocumentChunk`, `BidDocument`.
* **Interpretation Guidance**:
  * **Target = 100%**: In BidGuard AI, all automated findings must be traceable to the exact PDF page and source paragraph for judicial and CVC audit readiness.
* **Limitations**: Informational requirements without corresponding rules or evidence are excluded from the denominator.

---

### 4. Automation Coverage Rate

* **Category**: Auditability / Operations
* **Definition**: Percentage of extracted tender requirements that have approved, active deterministic compliance rules attached to them.
* **Calculation Logic & Formula**:
  $$\text{Automation Coverage} = \frac{\text{Requirements with Active Approved Rules}}{\text{Total Active Requirements}} \times 100\%$$
* **Data Sources**: `ComplianceRule`, `TenderRequirement`.
* **Interpretation Guidance**:
  * **Good (>= 80%)**: The vast majority of criteria can be verified automatically by the deterministic rule engine.
  * **Low (< 50%)**: Many clauses are subjective, narrative, or unformatted, requiring manual officer rule definition or manual evaluation.
* **Limitations**: Does not measure rule quality or precision, only coverage.

---

### 5. Human Review Rate

* **Category**: Auditability / Effort
* **Definition**: Percentage of criteria evaluations that require officer intervention, adjudication, or discretionary judgment.
* **Calculation Logic & Formula**:
  $$\text{Human Review Rate} = \frac{\text{Evaluations in REVIEW Status} + \text{Open Officer Discrepancies}}{\text{Total Evaluated Criteria}} \times 100\%$$
* **Data Sources**: `EvaluationResult`, `ContradictionDetectionRecord`.
* **Interpretation Guidance**:
  * Reflects the true human-in-the-loop governance requirement.
  * Values between 5% and 20% represent the ideal balance where AI assists with heavy data extraction and deterministic matching, leaving genuine edge cases to the procurement officer.
* **Limitations**: Highly complex or non-standard tenders with bespoke formats will naturally have higher review rates.

---

### 6. External Verification Coverage

* **Category**: Verification / Integrity
* **Definition**: Percentage of verifiable external claims (GSTIN, PAN, MSME Udyam, ISO, GeM portal standing, bank guarantees) subjected to simulated or live verification.
* **Calculation Logic & Formula**:
  $$\text{Verification Coverage} = \frac{\text{Verified Claims}}{\text{Total Verifiable Claims}} \times 100\%$$
  *(Records not requiring external verification are excluded from the denominator; when no external claims exist, returns `N/A`).*
* **Provider Mode Flag**: Every record clearly displays whether verification was executed via `MOCK / SYNTHETIC` provider or live government sandbox.
* **Data Sources**: `ExternalVerificationRecord`.
* **Interpretation Guidance**:
  * 100% coverage indicates all statutory entity credentials have been cross-checked against authoritative registries.
* **Limitations**: In simulated environments, results are synthetic mocks designed for demonstration and security sandbox testing.

---

### 7. Conflict Rate

* **Category**: Risk / Integrity
* **Definition**: Percentage of evaluated criteria or facts where cross-document or inter-bidder contradictions were detected.
* **Calculation Logic & Formula**:
  $$\text{Conflict Rate} = \frac{\text{Criteria with Detected Contradictions}}{\text{Total Evaluated Criteria}} \times 100\%$$
* **Data Sources**: `ContradictionDetectionRecord`.
* **Interpretation Guidance**:
  * Identifies discrepancies such as conflicting turnover figures between audited balance sheets and self-declarations, or inconsistent dates across certificates.
* **Limitations**: Requires multiple documents or facts referencing the same attribute to detect conflicts.

---

### 8. Investigation Load

* **Category**: Risk / Integrity
* **Definition**: Percentage of criteria or bidders that triggered an autonomous AI compliance investigation due to anomalies, conflicting evidence, or ambiguous eligibility.
* **Calculation Logic & Formula**:
  $$\text{Investigation Load} = \frac{\text{Criteria with Triggered AI Investigations}}{\text{Total Evaluated Criteria}} \times 100\%$$
* **Data Sources**: `InvestigationSession`, `InvestigationHypothesis`.
* **Interpretation Guidance**:
  * High investigation load indicates elevated complexity or suspicious documentation in the tender submission.
* **Limitations**: AI investigations generate hypotheses and evidence summaries; final conclusions require human officer confirmation.

---

### 9. System Processing Time

* **Category**: Effort / Efficiency
* **Definition**: Total wall-clock time (in minutes) taken by BidGuard AI to ingest tender PDFs, extract requirements, formulate rules, ingest bidder packets, extract source facts, and run deterministic evaluations.
* **Calculation Logic & Formula**:
  $$\text{Processing Time} = \sum (\text{Tender Ingestion} + \text{Rule Generation} + \text{Bidder Ingestion} + \text{Evaluation Run})$$
* **Data Sources**: Document processing job logs, evaluation execution records.
* **Interpretation Guidance**:
  * Typically under 5 minutes for a full multi-bidder tender packet, compared to 16–30 hours of manual officer review.
* **Limitations**: Network latency and LLM inference concurrency can impact total run duration.

---

### 10. Benchmark & Impact Methodology

* **Category**: Effort / Impact
* **Definition**: Rigorous comparative analysis contrasting traditional manual bid evaluation against the BidGuard AI assisted workflow.
* **Methodology**:
  * **Baseline Manual Effort**: Standard procurement officer review time (derived from historical benchmarks: 120 minutes per bidder packet for technical, financial, and legal verification).
  * **BidGuard AI Measured Effort**: Time spent by the system in automated processing + officer time spent reviewing flagged `REVIEW` and `CONFLICT` items.
  * **Projected Savings Formula**:
    $$\text{Effort Reduction} = \frac{\text{Manual Baseline Hours} - \text{BidGuard Total Hours}}{\text{Manual Baseline Hours}} \times 100\%$$
  * **Official SIH Target**: **60%–80%** reduction in manual verification effort.
  * **UI Segregation**:
    1. *Measured Metrics*: Computed directly from active database records and job timestamps.
    2. *SIH Problem Statement Target*: Fixed target range (60%–80%) clearly labeled as reference benchmark.
    3. *Demo Interactive Calculator*: Real-time parameterized sandbox clearly badged `DEMO ESTIMATE`.

---

## Attention Priority Engine Specification

BidGuard AI does NOT compute a single risk score or rank bidders. Instead, it aggregates factual findings into a **Deterministic Attention Queue**:

```
[CRITICAL] Mandatory requirement FAIL, active contradiction, or simulated verification mismatch
     ↓
[HIGH] Borderline compliance (REVIEW), evidence gap on mandatory requirement, unconfirmed investigation
     ↓
[MEDIUM] Evidence gap on optional/technical requirement, pending external verification
     ↓
[LOW] Informational notice, completed verification match, or document OCR advisory
```

Within each severity tier, items are ordered by:
1. Mandatory / Critical Rule Failure
2. Evidence Contradiction
3. External Verification Mismatch
4. AI Investigation Finding
5. Evidence Gap
6. Document Processing Advisory
7. Audit / Compliance Notice

**Mandatory UI Disclaimer**:
> *"Priority indicates which issues require attention first; it does not indicate bidder preference or procurement outcome."*
