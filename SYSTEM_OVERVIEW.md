# BidSure AI (BidGuard) — Comprehensive Platform Guide

**AI-Powered Integrated Bid Compliance Verification & Intelligence Platform for GeM Procurement**

---

## Table of Contents
1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [User Roles & RBAC Matrix](#2-user-roles--rbac-matrix)
3. [Architectural Division of Responsibilities](#3-architectural-division-of-responsibilities)
4. [Complete Feature Breakdown (Modules 1 to 18)](#4-complete-feature-breakdown)
5. [End-to-End Procurement Workflow](#5-end-to-end-procurement-workflow)
6. [Data Models & Core Entities](#6-data-models--core-entities)
7. [Security & Tenancy Guardrails](#7-security--tenancy-guardrails)
8. [API Reference & Key Endpoints](#8-api-reference--key-endpoints)
9. [Pre-Seeded Demonstration Dossier & Testing Runbook](#9-pre-seeded-demonstration-dossier--testing-runbook)
10. [Current Frontend Experience](#10-current-frontend-experience)

---

## 1. Executive Summary & Core Philosophy

**BidSure AI** (engineered as **BidGuard AI**) is an enterprise-grade compliance intelligence and verification platform purpose-built for high-value public procurement under the **Government e-Marketplace (GeM)** and **General Financial Rules (GFR 2017)**.

Public sector bid evaluation historically suffers from three critical bottlenecks:
1. **Unstructured Voluminous Documentation**: Hundreds of pages of technical specifications, audited financial balance sheets, CA certificates, and OEM authorisations must be manually cross-referenced against stringent RFP clauses.
2. **Subtle Inconsistencies & Fraud**: Cross-document contradictions (e.g., turnover declared as ₹510 Cr in a CA certificate but stated as ₹380 Cr in audited financial statements) easily escape human review.
3. **Lack of Explainable Traceability**: Traditional "black box" AI tools output arbitrary hallucinated risk scores (e.g., `87/100`), which cannot hold up in administrative tribunal appeals or CAG audits.

### The Procurement Officer Primacy Principle
To solve these challenges legally and constitutionally, BidSure AI enforces the strict **Primacy Principle**:

$$\mathbf{\text{AI Assists}} \quad \longrightarrow \quad \mathbf{\text{Rules Verify}} \quad \longrightarrow \quad \mathbf{\text{Officer Decides}}$$

* **AI Subsystem**: Ingests, parses, and proposes structured candidate criteria, extracted facts, and investigation hypotheses. **It never passes, fails, or ranks bidders.**
* **Deterministic Rule Engine**: Evaluates declarative, mathematical AST logic against normalized facts. Emits **quad-state** outputs (`PASS`, `FAIL`, `REVIEW`, `NOT_EVALUABLE`) with 100% citation grounding.
* **Human Procurement Officer**: Holds constitutional authority to approve criteria, adjudicate discrepancies, override machine suggestions, and make final qualification awards.

---

## 2. User Roles & RBAC Matrix

BidSure AI enforces strict **Role-Based Access Control (RBAC)** across the application, backed by signed JWT/HMAC tokens and route-level authorization middleware.

### 2.1 Role Definitions

| Role | Target Persona | Primary Responsibilities |
| :--- | :--- | :--- |
| **`PROCUREMENT_OFFICER`** | GeM Tender Evaluator, Ministry Tender Committee Member, Chief Vigilance Officer | - Create and configure tenders<br>- Approve or edit AI-extracted RFP requirements<br>- Inspect and finalize deterministic compliance rules<br>- Review bidder dossiers and page-level evidence citations<br>- Adjudicate cross-document conflicts and anomalies<br>- Execute officer overrides with mandatory recorded justifications<br>- Sign off on final bidder qualification status and export evaluation summaries |
| **`ADMIN`** | System Administrator, Platform IT Custodian, Technical Auditor | - Monitor system health, memory, and database connectivity<br>- Perform platform-level configuration and maintenance<br>- Execute canonical SIH demonstration resets (`POST /api/admin/demo-reset`)<br>- Inspect raw immutable audit logs and system telemetry<br>- Manage enterprise user accounts and status toggles |
| **`BIDDER`** | Registered Vendor / Contractor | - Maintain organization profile<br>- Browse published tenders<br>- Submit and track tender applications<br>- Upload bidder evidence through the vendor portal<br>- View application status and submission details |

### 2.2 RBAC Permission Matrix

| Capability / Action | Endpoint / Surface | `PROCUREMENT_OFFICER` | `ADMIN` | `BIDDER` |
| :--- | :--- | :---: | :---: | :---: |
| **User Sign-In & Profile** | `/api/auth/login`, `/api/auth/me` | Allowed | Allowed | Allowed |
| **View Dashboard & Metrics** | `/dashboard`, `/api/health` | Allowed | Allowed | Denied (403) |
| **Create / Update Tender** | `POST /api/tenders`, `PUT /api/tenders/:id` | Allowed | Allowed | Denied (403) |
| **Upload Tender Documents** | `POST /api/tenders/:id/documents` | Allowed | Allowed | Denied (403) |
| **Approve / Edit Requirements** | `PUT /api/tenders/:id/requirements/:reqId` | Allowed | Denied (403) | Denied (403) |
| **Configure / Test Rules** | `POST /api/tenders/:id/rules` | Allowed | Denied (403) | Denied (403) |
| **Upload Bidder Submissions** | `POST /api/tenders/:id/bidders/:bId/documents` | Allowed | Allowed | Denied (403) |
| **Run Deterministic Evaluation**| `POST /api/tenders/:id/evaluations/run` | Allowed | Allowed | Denied (403) |
| **Adjudicate Conflicts** | `POST /api/tenders/:id/conflicts/:cId/resolve`| Allowed | Denied (403) | Denied (403) |
| **Officer Qualification Sign-off** | `POST /api/tenders/:id/workspace/decide` | Allowed | Denied (403) | Denied (403) |
| **Download Audit Reports** | `GET /api/tenders/:id/reports/export` | Allowed | Allowed | Denied (403) |
| **Reset Demo State to Golden Seed**| `POST /api/admin/demo-reset` | Denied (403) | Allowed | Denied (403) |
| **Browse / Apply to Published Tenders** | `/bidder/tenders`, `/bidder/applications` | Denied (403) | Denied (403) | Allowed |

### 2.3 Seeded Demonstration Credentials

| Role | Email Address | Password | Usage Context |
| :--- | :--- | :--- | :--- |
| **Procurement Officer** | `officer@gem.gov.in` | `Officer@123` | Canonical SIH live evaluation flow & officer adjudication |
| **Demo Officer (Alternate)** | `demo.officer@bidguard.local`| `Officer@123` | Local development and offline staging testing |
| **System Administrator** | `admin@gem.gov.in` | `Admin@123` | System health checks, audit reviews, and instant demo resets |
| **Demo Bidder (Vendor)** | `demo.bidder@bidguard.local` | `Bidder@123` | Vendor portal browsing and application workflow |

---

## 3. Architectural Division of Responsibilities

```
                                  ┌─────────────────────────────────────────────────────────────┐
                                  │                       AI SUBSYSTEM                          │
                                  │  • Clause parsing & candidate requirement extraction        │
                                  │  • Multilingual OCR & document structure recognition        │
                                  │  • Candidate evidence extraction with bounding-box tags     │
                                  │  • Safe hypothesis synthesis for anomaly investigation      │
                                  │  • STRICT BOUNDARY: Never computes scores or decisions      │
                                  └──────────────────────────────┬──────────────────────────────┘
                                                                 │ Normalized Facts & Hypotheses
                                                                 ▼
                                  ┌─────────────────────────────────────────────────────────────┐
                                  │                 DETERMINISTIC RULE ENGINE                   │
                                  │  • Declarative AST mathematical & boolean evaluation        │
                                  │  • Indian unit/currency normalization (Crores, Lakhs, INR)  │
                                  │  • Quad-State Output: PASS | FAIL | REVIEW | NOT_EVALUABLE  │
                                  │  • Conflict Graph: Detects cross-document contradictions    │
                                  │  • Zero dynamic code execution (No eval(), No shell)        │
                                  └──────────────────────────────┬──────────────────────────────┘
                                                                 │ Verified Findings & Citations
                                                                 ▼
                                  ┌─────────────────────────────────────────────────────────────┐
                                  │                  HUMAN PROCUREMENT OFFICER                  │
                                  │  • Validates/refines AI extracted requirements & rules      │
                                  │  • Evaluates cross-document discrepancies with legal context │
                                  │  • Adjudicates borderline or anomalous submissions         │
                                  │  • Applies authoritative sign-off with recorded audit notes │
                                  │  • Legally responsible for final tender award               │
                                  └─────────────────────────────────────────────────────────────┘
```

---

## 4. Complete Feature Breakdown

The platform is structured into **18 distinct functional modules** bridging frontend user experiences and backend domain services.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   BIDGUARD PLATFORM MODULES                                  │
├───────────────────────────────┬───────────────────────────────┬──────────────────────────────┤
│ 1. Tender & RFP Management    │ 2. Document Parsing & OCR     │ 3. AI Requirement Blueprint  │
│ 4. Deterministic Rule Engine  │ 5. Bidder Dossier Management  │ 6. Evidence Fact Ingestion   │
│ 7. Requirement-to-Fact Mapper │ 8. Quad-State Evaluator       │ 9. Contradiction Detection   │
│ 10. AI Investigation Agent    │ 11. External Verification     │ 12. Comparative Matrix       │
│ 13. Officer Adjudication      │ 14. Executive Audit Reports   │ 15. Real-Time Intelligence   │
│ 16. Tamper-Evident Audit Log  │ 17. Admin & State Reset       │ 18. System Health Telemetry  │
└───────────────────────────────┴───────────────────────────────┴──────────────────────────────┘
```

### Module 1: Tender & RFP Management (`/tenders`, `/tenders/create`)
- Enables creation, metadata tagging, and lifecycle tracking of public tenders (`DRAFT` $\rightarrow$ `PROCESSING` $\rightarrow$ `READY` $\rightarrow$ `PARTIAL` $\rightarrow$ `FAILED`).
- Captures GeM Reference Numbers, procuring authority (e.g., Chennai Petroleum Corporation Limited - CPCL), estimated contract values, closing deadlines, and tender categories.
- Provides context-aware tender switching across the application dashboard.

### Module 2: Document Processing & OCR (`/tenders/[id]/documents`)
- Ingests single and multi-volume tender specifications and addenda.
- Employs a multi-stage document processing pipeline:
  `UPLOADED` $\rightarrow$ `VALIDATING` $\rightarrow$ `STORED` $\rightarrow$ `OCR_PROCESSING` $\rightarrow$ `EXTRACTING` $\rightarrow$ `COMPLETED`.
- Generates layout-aware structural blocks: `PARAGRAPH`, `HEADING`, `TABLE`, `TABLE_ROW`, `TABLE_CELL`, `LIST`, `HEADER`, `FOOTER`, and `IMAGE`.
- Calculates cryptographic SHA-256 hashes per document to instantly reject exact duplicates.

### Module 3: AI Requirement Extraction & Blueprint Builder (`/tenders/[id]/requirements`)
- Analyzes complex tender documents using LLM-assisted structural comprehension.
- Categorizes criteria according to GeM and GFR 2017 norms:
  - **Technical**: Machinery capacity, ISO certifications, project experience.
  - **Financial**: Annual turnover, net worth, solvency certificate limits, working capital.
  - **Regulatory / Statutory**: GSTIN compliance, PAN, EPFO, ESI registration, Non-blacklisting affidavit.
- Assigns priority tiers (`MANDATORY`, `CRITICAL`, `OPTIONAL`).
- Allows the Procurement Officer to accept, modify, or delete extracted criteria. Once finalized, the blueprint can be **locked** to prevent tampering during active evaluation.

### Module 4: Declarative Compliance Rule Engine (`/tenders/[id]/rules`)
- Translates approved human criteria into declarative **Abstract Syntax Tree (AST)** compliance rules.
- Supported deterministic operators:
  - Numerical: `>`, `>=`, `<`, `<=`, `==`, `BETWEEN`, `SUM`, `AVERAGE`.
  - String & Pattern: `EQUALS`, `CONTAINS`, `REGEX`, `IN_LIST`, `STARTS_WITH`.
  - Date & Temporal: `DATE_AFTER`, `DATE_BEFORE`, `WITHIN_YEARS`.
  - Boolean: `ALL_OF`, `ANY_OF`, `NONE_OF`.
- **Value Normalizer Engine**: Translates Indian financial idioms into standardized mathematical numbers:
  - *"500 Crores"* $\rightarrow$ `5000000000`
  - *"25 Lakhs"* $\rightarrow$ `2500000`
  - Indian Rupee strings (`₹ 1,50,00,000`), date formats (`DD/MM/YYYY`, `YYYY-MM-DD`), and GSTIN/PAN regex checks.
- **Strict AST Sandbox**: Completely eliminates dynamic JavaScript evaluation (`eval()`, `new Function()`, `vm.runInContext`).

### Module 5: Bidder Dossier Management (`/tenders/[id]/bidders`)
- Tracks competing vendors (e.g., L&T Heavy Engineering, BHEL, Reliance Infrastructure).
- Manages bidder classification, submission timestamps, technical proposal volumes, financial bids, and OEM authorizations.
- Aggregates overall compliance stance, total extracted facts, and identified risk flags per vendor.

### Module 6: Bid Evidence Fact Ingestion (`/tenders/[id]/bidders/[id]/documents/.../evidence`)
- Parses bidder submissions and extracts discrete **Evidence Facts**.
- Every extracted fact carries 5-tier audit provenance:
  1. `sourceDocumentId` (Exact uploaded document)
  2. `pageNumber` (Verified page location)
  3. `boundingBox` (Precise geometric coordinates on the page)
  4. `rawSnippet` (Verbatim excerpt from the document)
  5. `confidenceScore` (Quality score of the extraction)
- Extracted facts are classified into types: `NUMERIC`, `TEXT`, `DATE`, `BOOLEAN`, `CERTIFICATE`, or `TABLE`.

### Module 7: Requirement-to-Fact Mapping Engine
- Connects tender requirements to the corresponding bidder facts.
- Proposes candidate linkages with confidence scores.
- Allows officers to manually bind, remap, or unlink evidence facts to requirements.

### Module 8: Deterministic Quad-State Evaluation Engine
- Runs the rule engine against mapped bidder evidence facts.
- Produces unambiguous **quad-state** evaluation outcomes:
  - **`PASS`**: All rule criteria are satisfied with verified documentary proof.
  - **`FAIL`**: Evidence mathematically or logically fails to meet RFP threshold.
  - **`REVIEW`**: Missing documentation, low extraction confidence, or conflicting evidence facts.
  - **`NOT_EVALUABLE`**: Prerequisite criteria not met or unmapped requirement.
- Computes aggregated compliance percentages without arbitrary scoring.

### Module 9: Contradiction Detection & Evidence Conflict Graph (`/tenders/[id]/workspace`)
- Performs automated cross-document consistency checks across a bidder's submission.
- **Real-World Anomaly Detection**:
  - *Turnover Contradiction*: Detects when an Audited Balance sheet states ₹380 Cr turnover while an accompanying CA Certificate asserts ₹510 Cr.
  - *Date Chronology Mismatches*: Completion certificates dated prior to work order issuance dates.
  - *Identity Variations*: Discrepancies between PAN card legal name and GSTIN registration.
- Categorizes conflicts by severity: `CRITICAL`, `WARNING`, `INFORMATIONAL`.
- Generates a visual bipartite graph linking conflicting documents, facts, and affected criteria.

### Module 10: AI Investigation Agent
- Available on-demand to assist officers in analyzing anomalies.
- Operates under strict safety guardrails:
  - **Hypothesis Formulation**: Proposes structured hypotheses on why numbers diverge (e.g., consolidated vs. standalone turnover).
  - **Allowlisted Tools**: Can only read extracted facts, search document pages, or query external verification results.
  - **Mandatory Disclaimers**: Every finding is framed as an investigatory recommendation; final validation requires officer confirmation.

### Module 11: External Verification Adapters
- Provides verification checks against external registries:
  - **GSTIN Portal**: Active status, registered address, return filing compliance.
  - **MCA21 / RoC**: Company status, active directors, paid-up capital.
  - **Income Tax PAN**: PAN-Aadhaar linking status, entity name match.
  - **EPFO / ESIC**: Workforce registration and monthly contribution currency.
- **Simulation Transparency**: To prevent misleading evaluators, all simulated registry connectors are marked with `isSimulation: true` and rendered with amber **`MOCK / SYNTHETIC`** badges.

### Module 12: Comparative Scoring & Evaluation Matrix (`/tenders/[id]/comparison`)
- Provides a side-by-side compliance grid across all bidders.
- Enables committee members to filter by requirement category (Technical, Financial, Statutory).
- Highlights disqualified bidders in red, compliant bidders in emerald, and items requiring officer review in amber.
- Generates an executive summary table comparing L1/L2 pricing eligibility with technical compliance status.

### Module 13: Officer Adjudication Workspace (`/tenders/[id]/workspace`)
- The central command center where human decision-making occurs.
- Key capabilities:
  - View priority-ranked pending decisions.
  - Inspect split-pane source evidence: extracted fact on the left, PDF page preview with highlight bounding boxes on the right.
  - Adjudicate conflicts: Mark as `RESOLVED`, `DISMISSED`, or `UPHELD`.
  - Override rule evaluations: Change `FAIL` to `PASS` (or vice-versa) with a **mandatory written justification note**.
  - Execute formal **Qualification / Disqualification Sign-off**.

### Module 14: Executive Audit Reports (`/tenders/[id]/reports`)
- Generates comprehensive procurement dossiers ready for review:
  - **Bid Evaluation Report (BER)**: Summarizes all evaluated criteria, bidder statuses, and rule evaluations.
  - **Bidder Fact Dossier**: Complete dossier of all verified citations for a specific bidder.
  - **Non-Compliance Notice**: Automatically drafts clause-specific rejection grounds grounded in RFP citations for disqualified vendors.
- Formats: PDF documents, CSV/Excel summaries, and JSON audit dumps.

### Module 15: Real-Time Intelligence & Analytics Dashboard (`/tenders/[id]/intelligence`)
- Visualizes procurement metrics:
  - **GFR 2017 Compliance Distribution**: Proportions of Technical, Financial, and Statutory compliance across bidders.
  - **Dossier Progression Funnel**: Ingestion $\rightarrow$ Blueprint $\rightarrow$ Facts $\rightarrow$ Rules $\rightarrow$ Adjudication $\rightarrow$ Final Sign-Off.
  - **Evidence Citation Coverage**: Percentage of requirements supported by page-level proof (targets 100%).
  - **Deterministic Rule Distribution**: Overview of pass/fail/review distribution.

### Module 16: Tamper-Evident Audit Log
- Records every state change as an immutable `AuditEvent`:
  - User ID, IP address, timestamp, event type, entity ID, previous value, new value, and justification comments.
- **SHA-256 Hash Chaining**: Each audit record includes a cryptographic hash of the preceding record, creating a tamper-evident audit ledger that detects post-hoc database alterations.

### Module 17: Administrative Operations & Demo Reset (`/api/admin/demo-reset`)
- Allows system administrators to reset the entire database to a verified, golden-state demonstration dataset in one click.
- Cleanses test artifacts, re-seeds the canonical `CPCL-INFRA-DEMO-2026` tender with 22 requirements, 3 bidders, pre-computed evidence citations, and active conflict scenarios.

### Module 18: System Health & Diagnostic Telemetry (`/health`, `/health/ready`)
- Exposes health endpoints checking:
  - Database (PostgreSQL/Prisma) latency.
  - Memory usage (RSS, heap total, heap used).
  - Process uptime and Node.js environment information.
  - Storage connectivity (MinIO/S3 adapter readiness).

---

## 5. End-to-End Procurement Workflow

```
 ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
 │ 1. TENDER SETUP │ ────> │ 2. BLUEPRINT    │ ────> │ 3. BIDDER FACTS │ ────> │ 4. RULE RUN     │
 │ Create tender & │       │ AI extracts reqs│       │ Upload bidder   │       │ Deterministic   │
 │ upload RFP spec │       │ Officer approves│       │ docs & citations│       │ AST evaluation  │
 └─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
                                                                                        │
                                                                                        ▼
 ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
 │ 8. FINAL AWARD  │ <──── │ 7. AUDIT REPORT │ <──── │ 6. HUMAN SIGN-OFF│ <────│ 5. CONFLICTS    │
 │ GeM award sync  │       │ Export signed   │       │ Officer overrides│       │ Cross-doc check │
 │ & portal notify │       │ BER & dossier   │       │ & adjudications │       │ & investigations│
 └─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Step 1: RFP Publishing & Document Ingestion
The Procurement Officer signs into BidSure AI and creates a new tender dossier specifying the GeM reference number (e.g. `CPCL-INFRA-DEMO-2026`), organization, closing date, and estimated budget. The official tender notice and technical specifications PDF are uploaded.

### Step 2: AI Requirement Blueprint Extraction
The AI Subsystem parses the tender documentation, extracting technical parameters (e.g., minimum 50,000 MT storage tank construction experience), financial thresholds (annual turnover $\ge$ ₹500 Cr in 3 preceding financial years), and statutory requirements (valid GSTIN, ISO 9001). The officer reviews the list, adjusts thresholds if needed, and locks the blueprint.

### Step 3: Bidder Submission Ingestion
Bids from participating vendors (e.g., L&T Heavy Engineering, BHEL, Reliance Infrastructure) are uploaded. The document processor indexes each submission, extracts text and tables, and computes cryptographic hashes.

### Step 4: Evidence Extraction & Mapping
The extraction pipeline identifies relevant evidence facts within each bidder's submission and maps them to the corresponding tender requirements. Each fact links directly to its source document, page number, and bounding box coordinates.

### Step 5: Deterministic Compliance Evaluation
The deterministic rule engine runs the AST rules against the mapped facts, producing quad-state outcomes:
- **L&T**: Passes all financial, technical, and statutory criteria.
- **BHEL**: Fails on the net worth threshold requirement (₹420 Cr vs. ₹500 Cr required).
- **Reliance**: Flags a `REVIEW` state due to a cross-document turnover contradiction.

### Step 6: Contradiction Investigation & Conflict Resolution
The conflict graph identifies that Reliance's Audited Balance Sheet reports ₹380 Cr turnover, while its CA Certificate claims ₹510 Cr. The officer reviews the conflicting documents side-by-side using the Investigation Workspace, identifies that the CA certificate included unapproved subsidiary numbers, and upholds the contradiction.

### Step 7: Officer Adjudication & Formal Sign-off
The officer records an adjudication entry disqualifying Reliance on financial criteria, and confirms BHEL's technical failure. L&T is formally marked as **`QUALIFIED`**. All decisions, along with the officer's written remarks, are appended to the immutable SHA-256 audit ledger.

### Step 8: Audit Dossier Export & GeM Submission
The officer exports the complete **Bid Evaluation Report (BER)** with full citation lineage for submission to the procurement committee and archive in the GeM portal.

---

## 6. Data Models & Core Entities

```
┌──────────────┐         1:N         ┌──────────────────┐
│    Tender    │────────────────────<│  TenderDocument  │
└──────┬───────┘                     └──────────────────┘
       │
       │ 1:N
       ├────────────────────────────<┌──────────────────┐
       │                             │   Requirement    │
       │                             └────────┬─────────┘
       │ 1:N                                  │ 1:N
       ├────────────────────────────<┌────────┴─────────┐
       │                             │  ComplianceRule  │
       │                             └────────┬─────────┘
       │ 1:N                                  │ 1:N
       ├────────────────────────────<┌────────┴─────────┐
       │                             │ EvaluationResult │
       │ 1:N                         └────────┬─────────┘
       ├────────────────────────────<         │
       │                             ┌────────┴─────────┐
       │                             │  EvidenceMapping │
       │ 1:N                         └────────┬─────────┘
       ├────────────────────────────<         │
       │                             ┌────────┴─────────┐
       │                             │   EvidenceFact   │
       │ 1:N                         └────────┬─────────┘
       ├────────────────────────────<         │ 1:N
       │                             ┌────────┴─────────┐
       │                             │ ConflictFinding  │
       │ 1:N                         └──────────────────┘
       └────────────────────────────<┌──────────────────┐
                                     │     AuditEvent   │
                                     └──────────────────┘
```

### Entity Reference Summary

| Entity | Purpose | Key Attributes |
| :--- | :--- | :--- |
| **`User`** | System actors | `id`, `email`, `name`, `role` (`PROCUREMENT_OFFICER`, `ADMIN`), `status` |
| **`Tender`** | Root procurement dossier | `id`, `referenceNumber`, `title`, `organization`, `status`, `closingDate` |
| **`TenderDocument`** | Uploaded RFP specification | `id`, `storageKey`, `originalFilename`, `pageCount`, `processingStatus`, `fileHash` |
| **`Requirement`** | Extracted compliance criterion | `id`, `category` (Technical, Financial, Statutory), `description`, `priority`, `isApproved` |
| **`ComplianceRule`** | Declarative AST evaluation rule | `id`, `expression` (AST JSON), `operator`, `thresholdValue`, `unit`, `version` |
| **`Bidder`** | Vendor submitting a proposal | `id`, `legalName`, `gstin`, `pan`, `incorporationCountry`, `overallStatus` |
| **`BidDocument`** | Uploaded bidder submission file | `id`, `bidderId`, `documentType` (Balance Sheet, CA Cert, ISO, etc.), `fileHash` |
| **`EvidenceFact`** | Grounded datum from bidder file | `id`, `factType`, `normalizedValue`, `pageNumber`, `boundingBox`, `snippet` |
| **`EvidenceMapping`** | Requirement-to-Fact connection | `id`, `requirementId`, `evidenceFactId`, `confidence`, `isManual`, `verifiedBy` |
| **`EvaluationResult`** | Quad-state rule evaluation output | `id`, `status` (`PASS`, `FAIL`, `REVIEW`, `NOT_EVALUABLE`), `actualValue`, `officerOverride` |
| **`ConflictFinding`** | Cross-document contradiction | `id`, `factAId`, `factBId`, `severity`, `status` (`OPEN`, `RESOLVED`, `UPHELD`), `resolutionNotes` |
| **`AuditEvent`** | Cryptographic audit ledger entry| `id`, `eventType`, `userId`, `previousState`, `newState`, `previousHash`, `currentHash` |

---

## 7. Security & Tenancy Guardrails

### 7.1 Multi-Tenant Isolation (IDOR Defense)
- All repository queries and mutation handlers strictly enforce tender scoping by mandatory `tenderId` parameter.
- Cross-tender resource access returns `404 NOT FOUND` to prevent information leakage across independent procurement actions.

### 7.2 Authentication & Cryptographic Session Security
- Stateless authentication uses **HMAC-SHA256 signed JWT tokens** with 24-hour expiration windows.
- Passwords are encrypted using salted multi-round hashing; tokens are validated on every request through Fastify pre-handler hooks.

### 7.3 AST Sandbox & Zero-Eval Enforcement
- Absolute prohibition of dynamic JavaScript code evaluation: no `eval()`, `Function()`, `setTimeout(string)`, or Node.js `vm` contexts.
- All evaluation rules are evaluated as strict, tree-walked declarative Abstract Syntax Trees with pre-defined, typed operators.

### 7.4 Prompt Injection & AI Hallucination Controls
- Bidder documents and external inputs are treated strictly as untrusted data strings.
- System prompts are strictly separated from data contexts with clear demarcation delimiters.
- If documentary proof is missing or ambiguous, the engine defaults to `INSUFFICIENT_EVIDENCE` or `REVIEW` rather than inferring values.

### 7.5 File Upload Validation
- Strict MIME-type allowlisting (`application/pdf`, `image/tiff`, `image/png`).
- Path-traversal sanitization on all file names (preventing `../` directory traversal attacks).
- Maximum file size ceilings enforced at the HTTP gateway level (10MB limit).

---

## 8. API Reference & Key Endpoints

| Category | Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user and obtain Bearer JWT token |
| **Auth** | `GET` | `/api/auth/me` | Retrieve profile and assigned role for current token |
| **Tenders** | `GET` | `/api/tenders` | List all tenders with document and status summaries |
| **Tenders** | `POST` | `/api/tenders` | Create a new tender dossier |
| **Tenders** | `GET` | `/api/tenders/:id` | Fetch complete tender metadata and statistics |
| **Requirements** | `GET` | `/api/tenders/:id/requirements` | Retrieve all extracted requirements |
| **Requirements** | `PUT` | `/api/tenders/:id/requirements/:reqId` | Officer approval or modification of requirement |
| **Rules** | `GET` | `/api/tenders/:id/rules` | List all declarative AST compliance rules |
| **Rules** | `POST` | `/api/tenders/:id/rules` | Create or update a declarative compliance rule |
| **Bidders** | `GET` | `/api/tenders/:id/bidders` | List participating bidders and status indicators |
| **Bidders** | `POST` | `/api/tenders/:id/bidders` | Register a new bidder in the tender |
| **Evidence** | `GET` | `/api/tenders/:id/bidders/:bId/evidence` | Fetch all extracted facts with page citations |
| **Evaluations** | `POST` | `/api/tenders/:id/evaluations/run` | Execute deterministic evaluation across all bidders |
| **Conflicts** | `GET` | `/api/tenders/:id/conflicts` | List detected cross-document contradictions |
| **Conflicts** | `POST` | `/api/tenders/:id/conflicts/:cId/resolve` | Officer adjudication of cross-document conflict |
| **Workspace** | `GET` | `/api/tenders/:id/workspace/summary` | Consolidated state for officer decision dashboard |
| **Workspace** | `POST` | `/api/tenders/:id/workspace/decide` | Officer final qualification sign-off with audit notes |
| **Reports** | `GET` | `/api/tenders/:id/reports/export` | Download complete Bid Evaluation Report (PDF/JSON) |
| **Admin** | `POST` | `/api/admin/demo-reset` | Reset database to canonical SIH demonstration seed |
| **Health** | `GET` | `/health` | System health check, database, and memory telemetry |

---

## 9. Pre-Seeded Demonstration Dossier & Testing Runbook

### 9.1 Canonical SIH Demonstration Dossier
The platform includes a pre-seeded, production-grade demonstration dossier designed for live demonstrations:

- **Tender ID**: `tnd_1789567202603_77g22a`
- **Reference Number**: `CPCL-INFRA-DEMO-2026`
- **Title**: Engineering, Procurement & Construction (EPC) of Crude Oil Storage Tank Terminal
- **Procuring Organization**: Chennai Petroleum Corporation Limited (CPCL)
- **Configured Requirements**: 22 requirements covering Technical, Financial, and Statutory categories.
- **Participating Bidders (3)**:
  1. **Larsen & Toubro Heavy Engineering (L&T)**: Compliant across all criteria.
  2. **Bharat Heavy Electricals Limited (BHEL)**: Non-compliant on net worth threshold.
  3. **Reliance Infrastructure Ltd**: Triggers a critical turnover contradiction between Audited Balance Sheet (₹380 Cr) and CA Certificate (₹510 Cr).

### 9.2 Verification Commands

```bash
# 1. Run all Frontend Unit & Integration Tests (12 suites, 44 tests)
cd frontend
npm test

# 2. Verify Frontend Next.js Production Build
npm run build

# 3. Run all Backend Unit, Security & E2E Tests (25 suites, 179 tests)
cd ../backend
npm test

# 4. Verify Backend TypeScript Compilation & Prisma Code-Gen
npm run build
```

### 9.3 Launching the Application Locally

```bash
# Terminal 1: Launch Backend API Server (Port 5000)
cd backend
npm run dev

# Terminal 2: Launch Frontend Next.js Server (Port 3000)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Officer Login**: `officer@gem.gov.in` / `Officer@123`
- **Admin Login**: `admin@gem.gov.in` / `Admin@123`

---

## 10. Current Frontend Experience

The Next.js frontend provides role-aware entry points and shared navigation across the public landing page and authenticated workspaces.

### 10.1 Authentication and Role Routing

- The landing-page **Start New Tender** action routes unauthenticated users to `/login?next=%2Fdashboard`.
- Successful login routes `PROCUREMENT_OFFICER` users to `/dashboard`, `ADMIN` users to `/admin/dashboard`, and `BIDDER` users to `/bidder/dashboard`.
- The procurement dashboard layout permits only `PROCUREMENT_OFFICER` and `ADMIN` roles. A bidder attempting to open `/dashboard` is redirected to `/bidder/dashboard` before procurement content is rendered.
- The bidder workspace is protected by an `AuthGuard` restricted to the `BIDDER` role and exposes `/bidder/dashboard`, `/bidder/tenders`, `/bidder/applications`, and `/bidder/profile`.
- The login panel includes a back action that returns to browser history or the public landing page when no usable history exists.

### 10.2 Multilingual Interface

- `LanguageSelector` is available in the landing-page navbar and authenticated workspace topbars.
- The selector exposes English plus 22 Google Translate languages: Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Urdu, Kannada, Malayalam, Odia, Punjabi, Assamese, Nepali, Sanskrit, Spanish, French, German, Portuguese, Arabic, Simplified Chinese, Japanese, and Korean.
- Google Website Translator is loaded client-side through its official widget. The application keeps the custom language list in English using `notranslate` and `translate="no"`.
- Google’s generated translation banner and page offset are suppressed. Selecting English clears the Google translation state and restores the original page language.
- Translation depends on browser access to `translate.google.com`; the application remains usable in English if that external script is unavailable.

---

*BidSure AI Platform Documentation • Standard Operating Manual • GeM & GFR 2017 Compliant*
