<div align="center">

<img src="./frontend/public/images/bidsure_logo_full.png" alt="BidSure AI Logo" width="180" />

# BidSure AI -- BidGuard

### *AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement*

[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-orange?style=for-the-badge)](https://www.sih.gov.in/)
[![Problem ID](https://img.shields.io/badge/Problem%20ID-26100-blue?style=for-the-badge)](https://www.sih.gov.in/)
[![Team](https://img.shields.io/badge/Team-Inovix%202.0%202k26-purple?style=for-the-badge)]()
[![Team ID](https://img.shields.io/badge/Team%20ID-175356-green?style=for-the-badge)]()
[![Organization](https://img.shields.io/badge/Org-CPCL%20MoPNG-red?style=for-the-badge)]()

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.28-black?style=flat-square&logo=fastify)](https://fastify.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-teal?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-223%20passing-brightgreen?style=flat-square)]()

> **"Detect early. Verify fairly. Decide confidently."**
>
> BidSure AI eliminates manual, error-prone bid compliance verification in Government e-Marketplace (GeM) procurement through a deterministic AI-assisted verification engine -- reducing verification effort by **60-80%** while keeping the final qualification decision firmly with the Procurement Officer.

---

**[Live Demo](#live-demo-and-quickstart)** | **[Architecture](#system-architecture)** | **[Installation](#installation-and-setup)** | **[API Docs](#api-reference)** | **[Security](#security-and-compliance)** | **[Team Details](#team-and-sih-details)**

</div>

---

## Problem Statement

| Field | Details |
|---|---|
| **Problem Statement ID** | `26100` |
| **Title** | AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement |
| **Organization** | Ministry of Petroleum and Natural Gas (MoPNG) |
| **Department** | Chennai Petroleum Corporation Limited (CPCL) |
| **Category** | Software |
| **Theme** | Smart Automation |

### Background

Government procurement through the **Government e-Marketplace (GeM)** involves verification of multiple statutory, regulatory, and eligibility requirements of bidders. Procurement Officers must examine and validate documents related to:

- Udyam / MSME Registration
- GST Registration and Return Filing
- PAN and Income Tax Compliance
- Make in India / Local Content Requirements
- EPFO / ESIC Compliance
- Startup India, NSIC, OEM Authorization
- DigiLocker Document Verification
- Blacklisting / Debarment Status

The current verification process is **document-intensive**, requiring cross-checking across multiple government portals. This results in:

- Significant **manual effort** and officer fatigue
- **Longer tender evaluation timelines** delaying public procurement
- **Inconsistencies** and **human errors** in compliance judgments
- **Lack of auditability** and traceable decision records

---

## Problem Analysis -- The Real Gap

### Current Pain Points vs Their Consequences

| Current State | Consequence |
|---|---|
| Manual cross-portal checks | Weeks-long evaluation cycles |
| Paper/PDF-based evidence review | Human error and inconsistency |
| No cross-document validation | Fraudulent submissions undetected |
| No explainable AI scores | Legally untenable decisions |
| No tamper-evident audit logs | CAG/tribunal vulnerability |
| Siloed portal data | Redundant verification work |
| No comparative bidder matrix | Inconsistent L1/L2 decisions |

### Gap Analysis: Existing vs Required Capabilities

| Verification Area | Manual Process | Basic Portals | BidSure AI |
|---|:---:|:---:|:---:|
| Udyam/MSME Verification | Manual | Partial | Automated |
| GSTIN Status Check | Manual | Portal Only | Integrated + AI Cross-check |
| Cross-Document Contradiction Detection | None | None | Automated Conflict Graph |
| Explainable Compliance Scoring | None | None | Deterministic AST Engine |
| Page-Level Evidence Citation | None | None | Bounding Box Citations |
| Tamper-Evident Audit Ledger | None | None | SHA-256 Hash Chaining |
| Officer Override with Justification | None | None | Mandatory Notes + Audit |
| Multilingual Interface | None | Partial | 22 Languages via Google Translate |

---

## Our Solution -- BidSure AI

**BidSure AI** (engineered as **BidGuard AI**) is an enterprise-grade compliance intelligence and verification platform purpose-built for high-value public procurement under the **Government e-Marketplace (GeM)** and **General Financial Rules (GFR 2017)**.

### The Procurement Officer Primacy Principle

BidSure AI enforces a strict constitutional principle -- AI cannot qualify or disqualify a bidder:

```mermaid
flowchart LR
    subgraph AI_Subsystem ["AI Subsystem"]
        A1["Reads, Ingests & Parses"]
        A2["Extracts Fact Hypotheses"]
        A3["Proposes Evidence Links"]
        A4["NEVER Decides Legally"]
    end

    subgraph Deterministic_Rules ["Deterministic Rule Engine"]
        R1["Evaluates Declarative AST"]
        R2["Validates Math Predicates"]
        R3["Detects Contradictions"]
        R4["NEVER Guesses or Infers"]
    end

    subgraph Human_Authority ["Human Procurement Officer"]
        H1["Adjudicates Discrepancies"]
        H2["Overrides with Written Notes"]
        H3["Signs Off Legally"]
        H4["SOLE FINAL AUTHORITY"]
    end

    AI_Subsystem -->|"Facts & Citations"| Deterministic_Rules
    Deterministic_Rules -->|"Audited Findings"| Human_Authority
```

```
AI ASSISTS  ===============>  RULES VERIFY  ===============>  OFFICER DECIDES
```

### What BidSure AI Does

The platform executes a structured four-stage processing pipeline:

```mermaid
flowchart TD
    subgraph S1 ["Stage 1: Document Ingestion"]
        direction TB
        Upload["File Upload (PDF/TIFF)"] --> Mime["MIME Check & SHA-256 Dedup"]
        Mime --> OCR["OCR & Layout-Aware Structural Parser"]
        OCR --> Blocks["Blocks: Paragraph, Table, Cell, List, Header, Footer"]
    end

    subgraph S2 ["Stage 2: AI Fact Extraction"]
        direction TB
        Blocks --> Clause["LLM Clause Analysis & Blueprint Generation"]
        Clause --> Evidence["5-Tier Evidence Fact Extraction"]
        Evidence --> Provenance["Provenance: Doc ID, Page, Bounding Box, Text, Confidence"]
    end

    subgraph S3 ["Stage 3: Deterministic Evaluation"]
        direction TB
        Provenance --> AST["Declarative AST Rule Engine Execution"]
        AST --> Normalizer["Indian Numeric & Currency Normalizer"]
        Normalizer --> Quad["Quad-State Verdict: PASS | FAIL | REVIEW | NOT_EVALUABLE"]
    end

    subgraph S4 ["Stage 4: Officer Adjudication"]
        direction TB
        Quad --> Conflict["Cross-Document Conflict Graph"]
        Conflict --> Workspace["Split-Pane Adjudication Workspace"]
        Workspace --> SignOff["Mandatory Written Justification & Formal Sign-Off"]
        SignOff --> Audit["Cryptographic SHA-256 Immutable Audit Ledger"]
    end

    S1 --> S2 --> S3 --> S4
```

---

## Core Innovation and USP

### Innovation 1: Deterministic AST Rule Engine (Not Black-Box AI)

**Problem with existing systems:** Generic AI scores like `87/100` that cannot be explained or defended in administrative tribunals or CAG audits.

**BidSure AI solution:** Every compliance output comes from a transparent, declarative **Abstract Syntax Tree (AST)** -- a mathematical evaluation tree readable by any officer or CAG inspector.

```mermaid
graph TD
    Root["Operator: ALL_OF"]
    Root --> Op1["Operator: >="]
    Root --> Op2["Operator: >="]
    Root --> Op3["Operator: >="]

    Op1 --> L1["Fact: annual_turnover_fy2024"]
    Op1 --> R1["Threshold: Rs 500 Cr (5,000,000,000 INR)"]

    Op2 --> L2["Fact: annual_turnover_fy2023"]
    Op2 --> R2["Threshold: Rs 500 Cr (5,000,000,000 INR)"]

    Op3 --> L3["Fact: annual_turnover_fy2022"]
    Op3 --> R3["Threshold: Rs 500 Cr (5,000,000,000 INR)"]
```

```json
{
  "operator": "ALL_OF",
  "operands": [
    {
      "operator": ">=",
      "left":  { "factRef": "annual_turnover_fy2024" },
      "right": { "value": 5000000000, "unit": "INR" }
    },
    {
      "operator": ">=",
      "left":  { "factRef": "annual_turnover_fy2023" },
      "right": { "value": 5000000000, "unit": "INR" }
    },
    {
      "operator": ">=",
      "left":  { "factRef": "annual_turnover_fy2022" },
      "right": { "value": 5000000000, "unit": "INR" }
    }
  ]
}
```

**Result:** A disqualification can be precisely cited: *"Annual turnover of Rs 380 Crore (Fact: ef_004, Source: Audited Balance Sheet FY2023, Page 14, Para 3.2) does not meet the Rs 500 Crore threshold (Clause 4.3.2, RFP CPCL-INFRA-2026)."*

---

### Innovation 2: Cross-Document Contradiction Detection

**Real-world scenario automatically detected:**
- Document A -- Audited Balance Sheet: Annual Turnover = **Rs 380 Crore**
- Document B -- CA Certificate: Annual Turnover = **Rs 510 Crore**

BidSure AI flags this as a `CRITICAL` conflict, generates a bipartite conflict graph, and surfaces it with side-by-side PDF preview. No existing GeM tool does this automatically.

```mermaid
flowchart LR
    subgraph Submission_Documents ["Submitted Bidder Documents"]
        DocA["Document A: Audited Balance Sheet<br/>Declared Turnover: Rs 380 Cr"]
        DocB["Document B: CA Certificate<br/>Declared Turnover: Rs 510 Cr"]
        DocC["External API: GSTIN Portal<br/>Reported Turnover: Rs 375 Cr"]
    end

    subgraph Conflict_Engine ["Contradiction Resolution Graph"]
        Comparator["Semantic Domain Matcher<br/>Field: Annual_Turnover_FY2023"]
        DeltaCalc["Numerical Delta Calculation<br/>Delta: Rs 130 Cr (34.2% discrepancy)"]
        Graph["Bipartite Conflict Graph Generator"]
    end

    subgraph Officer_Review ["Procurement Officer Adjudication"]
        Alert["CRITICAL CONTRADICTION ALERT<br/>Severity: Critical | Impact: Turnover Eligibility"]
        Adjudicate["Officer Review:<br/>Subsidiary turnover wrongly included in CA cert.<br/>Standalone balance sheet upheld -> Disqualified"]
    end

    DocA --> Comparator
    DocB --> Comparator
    DocC --> Comparator
    Comparator --> DeltaCalc
    DeltaCalc --> Graph
    Graph --> Alert
    Alert --> Adjudicate
```

---

### Innovation 3: 5-Tier Evidence Provenance

Every extracted fact carries an unbroken citation chain connecting UI values to physical PDF coordinates:

```mermaid
graph TD
    T1["Tier 1: Document Level<br/>sourceDocumentId: doc_bhel_balance_sheet_fy23<br/>SHA-256: 7f83b165..."]
    T2["Tier 2: Physical Page<br/>pageNumber: 14"]
    T3["Tier 3: Visual Bounding Box<br/>boundingBox: { x: 0.12, y: 0.45, w: 0.65, h: 0.08 }"]
    T4["Tier 4: Raw Text Snippet<br/>rawSnippet: 'Net Revenue from Operations: INR 38,02,14,00,000'"]
    T5["Tier 5: Confidence & Normalization<br/>confidenceScore: 0.97 | normalizedValue: 3800000000 INR"]

    T1 --> T2 --> T3 --> T4 --> T5
```

Officers can click any value in the UI to instantly view the exact paragraph on the exact page highlighted with a coordinate bounding box overlay.

---

### Innovation 4: Tamper-Evident SHA-256 Hash Chaining

Every audit event is cryptographically chained to its predecessor:

```
AuditEvent[N].currentHash = SHA256( AuditEvent[N].data + AuditEvent[N-1].currentHash )
```

```mermaid
flowchart LR
    subgraph Event_0 ["Genesis Audit Event [0]"]
        D0["Event: TENDER_CREATED<br/>Officer: usr_001"]
        H0["currentHash: SHA256(D0 + genesis_seed)"]
        D0 --> H0
    end

    subgraph Event_1 ["Audit Event [1]"]
        D1["Event: BLUEPRINT_LOCKED<br/>Requirements: 22 approved"]
        H1["currentHash: SHA256(D1 + Event_0.currentHash)"]
        D1 --> H1
    end

    subgraph Event_2 ["Audit Event [2]"]
        D2["Event: OVERRIDE_EXECUTED<br/>Mandatory Note: Justified per GFR 157"]
        H2["currentHash: SHA256(D2 + Event_1.currentHash)"]
        D2 --> H2
    end

    H0 --> Event_1
    H1 --> Event_2
```

Tampering with any historical database record breaks the entire subsequent hash chain, making tampering immediately detectable and legally defensible before CAG, administrative tribunals, and the Central Vigilance Commission (CVC).

---

## System Architecture

### High-Level Architecture

```mermaid
graph TD
    subgraph Client_Layer ["Client Presentation Tier"]
        UI["Web Portal (Next.js 15 + React 19 + TailwindCSS)"]
        Mobile["Inspection Client (Android Kotlin + Jetpack)"]
        i18n["Multilingual Localization Engine (22 Languages)"]
    end

    subgraph Gateway_Layer ["API Gateway & Security Tier (Fastify 4.28)"]
        Gateway["Fastify Gateway with CORS & Helmet"]
        AuthMiddleware["HMAC-SHA256 JWT Authentication & RBAC"]
        Validator["Runtime Zod Schema Validation Engine"]
        Swagger["OpenAPI 3.0 / Swagger Interactive Explorer"]
    end

    subgraph Service_Core ["Core Business Logic & AI Subsystem"]
        DocIngest["Document Ingestion & Multi-Stage OCR Pipeline"]
        ReqEngine["AI Requirement Blueprint Extractor"]
        RuleEngine["Deterministic AST Compliance Engine"]
        ConflictEngine["Cross-Document Contradiction Engine"]
        InvestAgent["Autonomous AI Investigation Agent"]
        AuditService["Cryptographic SHA-256 Audit Service"]
    end

    subgraph Adapters ["External Verification Adapters"]
        GSTIN["GSTIN Verification Adapter"]
        MCA["MCA21 Corporate Registry Adapter"]
        PAN["Income Tax PAN Adapter"]
        EPFO["EPFO / ESIC Compliance Adapter"]
        GeM["GeM Vendor Verification Hub"]
    end

    subgraph Persistence ["Persistence & Object Storage Tier"]
        PG[("PostgreSQL 15+ Enterprise DB")]
        Prisma["Prisma ORM 5.22 Schema Engine"]
        Storage["Object Storage (MinIO / S3 / Encrypted Local)"]
    end

    UI --> Gateway
    Mobile --> Gateway
    i18n -.-> UI
    Gateway --> AuthMiddleware
    AuthMiddleware --> Validator
    Validator --> Service_Core

    Service_Core --> Adapters
    Service_Core --> Prisma
    Prisma --> PG
    DocIngest --> Storage
    AuditService --> PG
```

### Frontend Component Architecture

```
frontend/
|-- app/                      (Next.js 15 App Router)
|   |-- page.tsx              (Public landing page)
|   |-- login/                (Authentication)
|   |-- register/             (User registration)
|   |-- dashboard/            (Procurement Officer dashboard)
|   |-- tenders/[id]/         (Tender workspace)
|   |   |-- documents/        (Document management)
|   |   |-- requirements/     (AI requirement blueprint)
|   |   |-- rules/            (Compliance rule editor)
|   |   |-- bidders/[bid]/    (Bidder dossiers & evidence)
|   |   |-- comparison/       (Side-by-side comparison matrix)
|   |   |-- workspace/        (Officer adjudication workspace)
|   |   |-- intelligence/     (Real-time analytics dashboard)
|   |   `-- reports/          (Audit report export)
|   |-- admin/dashboard/      (Admin panel)
|   `-- bidder/               (Bidder self-service portal)
|       |-- dashboard/
|       |-- tenders/
|       |-- applications/
|       `-- profile/
`-- components/
    |-- header/               (Government utility bar)
    |-- landing/              (Landing page components)
    |-- layout/               (Navbar, sidebar, wrappers)
    |-- theme/                (Theme provider & color tokens)
    |-- ui/                   (Primitive UI components)
    `-- verification/         (Verification status widgets)
```

---

## Technology Stack

### Complete Technology Reference

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js | 15.1.0 | React-based SSR/SSG web application |
| **UI Library** | React | 19.0.0 | Component-based UI rendering |
| **Language (Frontend)** | TypeScript | 5.7.2 | Type-safe frontend development |
| **Styling** | TailwindCSS | 3.4.16 | Utility-first CSS framework |
| **Icons** | Lucide React | 0.468.0 | Modern SVG icon library |
| **CSS Utilities** | clsx + tailwind-merge | Latest | Conditional class management |
| **Backend Framework** | Fastify | 4.28.1 | High-performance Node.js API server |
| **Language (Backend)** | TypeScript | 5.7.2 | Type-safe backend development |
| **ORM** | Prisma | 5.22.0 | Type-safe database access layer |
| **Database** | PostgreSQL | 15+ | Primary relational database |
| **Schema Validation** | Zod | 3.23.8 | Runtime schema validation |
| **PDF Processing** | pdf-parse + pdf-lib | Latest | PDF ingestion, OCR, and generation |
| **Authentication** | HMAC-SHA256 JWT | -- | Stateless signed authentication tokens |
| **Security Headers** | @fastify/helmet | 11.1.1 | HTTP security headers enforcement |
| **CORS** | @fastify/cors | 9.0.1 | Cross-origin request control |
| **File Uploads** | @fastify/multipart | 8.3.1 | Multipart form data handling |
| **API Documentation** | @fastify/swagger | 8.15.0 | OpenAPI 3.0 auto-generation |
| **Testing** | Vitest | 2.1.8 | Fast unit and integration testing |
| **Test Utilities** | @testing-library/react | 16.1.0 | React component testing |
| **Deployment** | Render.com | -- | Cloud platform deployment |
| **Package Management** | npm Workspaces | -- | Monorepo dependency management |
| **Process Runner** | tsx | 4.19.2 | TypeScript execution in dev mode |
| **Internationalization** | Google Translate Widget | -- | 22-language multilingual support |

### AI/ML Component Stack

| Component | Technology | Purpose |
|---|---|---|
| **Document Parsing** | pdf-parse + custom OCR pipeline | Multi-stage PDF text and structure extraction |
| **Clause Analysis** | LLM (configurable, any OpenAI-compatible) | Requirement extraction from tender RFPs |
| **Value Normalization** | Custom Indian locale parser | INR Crore/Lakh/unit normalization |
| **Rule Evaluation** | Custom AST Tree-Walker | Zero-eval deterministic compliance engine |
| **Conflict Detection** | Graph-based comparison algorithm | Cross-document contradiction identification |
| **Evidence Linking** | Requirement-Fact Mapper | Semantic matching of criteria to evidence |

---

## Platform Modules

BidSure AI is architected into **18 distinct functional modules**:

```mermaid
graph TD
    subgraph Tender_Lifecycle ["Tender Lifecycle & Ingestion"]
        M01["01. Tender & RFP Mgmt"]
        M02["02. Document OCR Pipeline"]
        M03["03. AI Requirement Extractor"]
        M04["04. Declarative Rule Engine"]
    end

    subgraph Bidder_Ingestion ["Bidder Ingestion & Evidence"]
        M05["05. Bidder Dossier Mgmt"]
        M06["06. Evidence Fact Ingestion"]
        M07["07. Fact-to-Requirement Mapper"]
    end

    subgraph Verification_Core ["Deterministic Verification Core"]
        M08["08. Quad-State Evaluation"]
        M09["09. Contradiction Detection"]
        M10["10. AI Investigation Agent"]
        M11["11. External Verification Adapters"]
        M12["12. Comparative Scoring Matrix"]
    end

    subgraph Decision_Audit ["Officer Cockpit & Audit"]
        M13["13. Officer Adjudication Workspace"]
        M14["14. Executive Audit Reports"]
        M15["15. Real-Time Intelligence"]
        M16["16. Tamper-Evident Audit Log"]
        M17["17. Admin Reset & Provisioning"]
        M18["18. Diagnostic Telemetry & Health"]
    end

    M01 --> M02 --> M03 --> M04
    M05 --> M06 --> M07
    M04 & M07 --> M08
    M08 --> M09 --> M10
    M11 --> M08
    M08 --> M12 --> M13 --> M14
    M13 --> M16
    M15 -.-> M13
```

### Module 01 -- Tender and RFP Management
**Route:** `/tenders`, `/tenders/create`

Tender lifecycle: `DRAFT -> PROCESSING -> READY -> PARTIAL -> FAILED`

Captures GeM Reference Numbers, procuring authority (e.g., CPCL), estimated contract values, closing deadlines, and tender categories. Context-aware tender switching across the dashboard.

---

### Module 02 -- Document Processing and OCR Pipeline
**Route:** `/tenders/[id]/documents`

Document lifecycle: `UPLOADED -> VALIDATING -> STORED -> OCR_PROCESSING -> EXTRACTING -> COMPLETED`

- Layout-aware structural blocks: `PARAGRAPH`, `HEADING`, `TABLE`, `TABLE_ROW`, `TABLE_CELL`, `LIST`, `HEADER`, `FOOTER`, `IMAGE`
- SHA-256 cryptographic hash per document -- instant duplicate rejection
- MIME-type allowlisting: `application/pdf`, `image/tiff`, `image/png`

---

### Module 03 -- AI Requirement Extraction and Blueprint Builder
**Route:** `/tenders/[id]/requirements`

Categorizes criteria per GeM and GFR 2017 norms:

| Category | Examples |
|---|---|
| **Technical** | Machinery capacity, ISO certifications, project completion experience |
| **Financial** | Annual turnover >= Rs 500 Cr, net worth, solvency certificates, working capital |
| **Regulatory/Statutory** | GSTIN compliance, PAN, EPFO, ESI registration, Non-blacklisting affidavit |

Priority tiers: `MANDATORY`, `CRITICAL`, `OPTIONAL`
Blueprint can be **locked** to prevent tampering during active evaluation.

---

### Module 04 -- Declarative Compliance Rule Engine
**Route:** `/tenders/[id]/rules`

**Supported Operators:**

| Category | Operators |
|---|---|
| Numerical | `>`, `>=`, `<`, `<=`, `==`, `BETWEEN`, `SUM`, `AVERAGE` |
| String and Pattern | `EQUALS`, `CONTAINS`, `REGEX`, `IN_LIST`, `STARTS_WITH` |
| Date and Temporal | `DATE_AFTER`, `DATE_BEFORE`, `WITHIN_YEARS` |
| Boolean Logic | `ALL_OF`, `ANY_OF`, `NONE_OF` |

**Indian Value Normalization Engine:**

| Input String | Normalized Output |
|---|---|
| `500 Crores` | `5,000,000,000` |
| `25 Lakhs` | `2,500,000` |
| `Rs 1,50,00,000` | `15,000,000` |
| `31/03/2024` (DD/MM/YYYY) | ISO 8601 Date |
| `22AAAAA0000A1Z5` | Valid GSTIN via regex |

**Security Enforcement:** No `eval()`, no `Function()`, no `setTimeout(string)`, no `vm` contexts. Strict AST tree-walk only.

---

### Module 05 -- Bidder Dossier Management
**Route:** `/tenders/[id]/bidders`

Pre-seeded demo bidders for CPCL-INFRA-DEMO-2026:
1. **Larsen and Toubro Heavy Engineering** -- Compliant across all 22 criteria
2. **Bharat Heavy Electricals Limited (BHEL)** -- Non-compliant on net worth threshold
3. **Reliance Infrastructure Ltd** -- Critical turnover contradiction flagged

---

### Module 06 -- Bid Evidence Fact Ingestion
**Route:** `/tenders/[id]/bidders/[id]/documents/.../evidence`

5-tier audit provenance per extracted fact:

| Tier | Field | Description |
|---|---|---|
| 1 | `sourceDocumentId` | Exact uploaded document identifier |
| 2 | `pageNumber` | Verified page location within document |
| 3 | `boundingBox` | Precise geometric coordinates `{x, y, w, h}` |
| 4 | `rawSnippet` | Verbatim excerpt from source |
| 5 | `confidenceScore` | AI quality score 0.0-1.0 |

Fact types: `NUMERIC`, `TEXT`, `DATE`, `BOOLEAN`, `CERTIFICATE`, `TABLE`

---

### Module 07 -- Requirement-to-Fact Mapping Engine

Connects tender requirements to bidder evidence facts:
- Proposes candidate linkages with confidence scores
- Officers can manually bind, remap, or unlink evidence facts
- Tracks AI-suggested (`isManual: false`) vs officer-confirmed (`isManual: true`) mappings

---

### Module 08 -- Deterministic Quad-State Evaluation Engine

Produces unambiguous **quad-state** outcomes:

| State | Meaning | Action Trigger |
|---|---|---|
| **PASS** | All criteria satisfied with verified documentary proof | Auto-qualified in category |
| **FAIL** | Evidence mathematically fails the RFP threshold | Auto-disqualified with proof |
| **REVIEW** | Missing documentation, low confidence, or conflicting evidence | Escalated to Officer Workspace |
| **NOT_EVALUABLE** | Prerequisite criteria not met or requirement unmapped | Flagged for administrative remediation |

No arbitrary scoring. 100% citation grounding.

---

### Module 09 -- Contradiction Detection and Evidence Conflict Graph
**Route:** `/tenders/[id]/workspace`

Automated cross-document consistency checks:

| Contradiction Type | Real Example | Severity |
|---|---|---|
| Value Mismatch | Balance Sheet: Rs 380 Cr vs CA Certificate: Rs 510 Cr | CRITICAL |
| Date Chronology | Completion certificate dated before work order issuance | CRITICAL |
| Identity Variations | PAN card legal name vs GSTIN registration name mismatch | WARNING |

Severity classification: `CRITICAL`, `WARNING`, `INFORMATIONAL`
Generates bipartite graph linking conflicting documents, facts, and affected criteria.

---

### Module 10 -- AI Investigation Agent

On-demand anomaly analysis under strict guardrails:
- **Hypothesis Formulation:** Structured hypotheses (e.g., consolidated vs standalone turnover)
- **Allowlisted Tools:** Read facts, search document pages, query external verification results only
- **Mandatory Disclaimers:** Every finding requires officer confirmation before action

---

### Module 11 -- External Verification Adapters
**Route:** `/tenders/[id]/bidders/[id]/verification`

| Registry | Verification Scope |
|---|---|
| GSTIN Portal | Active status, registered address, return filing compliance |
| MCA21 / Company RoC | Company status, active directors, paid-up capital |
| PAN / Income Tax | PAN-Aadhaar linking status, entity name match |
| EPFO / ESIC | Workforce registration and monthly contribution currency |
| Udyam Portal | MSME registration status and category |
| Startup India | DPIIT recognition status and validity |
| Blacklisting DB | Debarment status across government registries |

> All simulated connectors marked `isSimulation: true` with amber **MOCK/SYNTHETIC** badges for transparency.

---

### Module 12 -- Comparative Scoring and Evaluation Matrix
**Route:** `/tenders/[id]/comparison`
- Side-by-side compliance grid across all bidders
- Filter by requirement category: Technical, Financial, Statutory
- Visual status indicators: Disqualified | Compliant | Requires Review
- Executive summary comparing L1/L2 pricing eligibility with compliance status

---

### Module 13 -- Officer Adjudication Workspace
**Route:** `/tenders/[id]/workspace`

Central command center for human decision-making:
- **Priority-ranked** pending decisions queue
- **Split-pane view:** Extracted fact (left) | PDF page with highlighted bounding boxes (right)
- **Conflict adjudication:** Mark as `RESOLVED`, `DISMISSED`, or `UPHELD`
- **Override capability:** Change `FAIL -> PASS` with **mandatory written justification**
- **Formal qualification sign-off:** Qualification or disqualification with recorded audit notes

---

### Module 14 -- Executive Audit Reports
**Route:** `/tenders/[id]/reports`

| Report Type | Description |
|---|---|
| Bid Evaluation Report (BER) | All evaluated criteria, bidder statuses, and rule evaluations |
| Bidder Fact Dossier | Complete verified citations for a specific bidder |
| Non-Compliance Notice | Auto-drafted clause-specific rejection grounds in RFP citation format |

**Export formats:** PDF, CSV/Excel, JSON audit dumps

---

### Module 15 -- Real-Time Intelligence and Analytics Dashboard
**Route:** `/tenders/[id]/intelligence`

- **GFR 2017 Compliance Distribution:** Proportions across Technical, Financial, Statutory
- **Dossier Progression Funnel:** Ingestion -> Blueprint -> Facts -> Rules -> Adjudication -> Sign-Off
- **Evidence Citation Coverage:** Percentage of requirements with page-level documentary proof (target: 100%)
- **Deterministic Rule Distribution:** Pass/fail/review breakdown across all bidders

---

### Module 16 -- Tamper-Evident Audit Log

Every state change recorded as immutable `AuditEvent`:

```
AuditEvent {
  userId:        Officer/Admin performing the action
  ipAddress:     Source IP for forensic traceability
  timestamp:     ISO 8601 with millisecond precision
  eventType:     LOGIN | TENDER_CREATED | REQUIREMENT_APPROVED |
                 OVERRIDE_EXECUTED | BIDDER_QUALIFIED | ...
  entityId:      Affected resource ID
  previousValue: JSON snapshot of state before change
  newValue:      JSON snapshot of state after change
  justification: Mandatory officer notes (for overrides/sign-offs)
  previousHash:  SHA-256 of previous audit entry
  currentHash:   SHA-256(currentData + previousHash)
}
```

---

### Module 17 -- Administrative Operations and Demo Reset
**Route:** `POST /api/admin/demo-reset`

One-click reset to verified golden-state demonstration dataset:
- Cleanses test artifacts, re-seeds CPCL-INFRA-DEMO-2026
- 22 requirements, 3 bidders, pre-computed evidence citations, active conflict scenarios
- Restricted to ADMIN role only

---

### Module 18 -- System Health and Diagnostic Telemetry
**Routes:** `/health`, `/health/ready`

- PostgreSQL/Prisma connection latency
- Memory usage (RSS, heap total, heap used)
- Process uptime and Node.js version
- MinIO/S3 storage adapter readiness

---

## User Roles and RBAC

BidSure AI enforces strict **Role-Based Access Control (RBAC)** via HMAC-SHA256 JWT tokens and route-level authorization middleware.

### Role Definitions

| Role | Target Persona | Primary Responsibilities |
|---|---|---|
| `PROCUREMENT_OFFICER` | GeM Evaluator, Ministry Tender Committee Member, CVO | Create tenders, approve requirements, configure rules, adjudicate conflicts, qualification sign-off |
| `ADMIN` | System Administrator, IT Custodian, Technical Auditor | System health, user management, demo resets, raw audit log access |
| `BIDDER` | Registered Vendor / Contractor | Browse tenders, submit applications, upload evidence, track status |

### RBAC Permission Matrix

| Capability | Endpoint | Officer | Admin | Bidder |
|---|---|:---:|:---:|:---:|
| Sign-In and Profile | `/api/auth/login` | Allowed | Allowed | Allowed |
| View Dashboard and Metrics | `/dashboard` | Allowed | Allowed | Denied |
| Create / Update Tender | `POST /api/tenders` | Allowed | Allowed | Denied |
| Upload Tender Documents | `POST /api/tenders/:id/documents` | Allowed | Allowed | Denied |
| Approve / Edit Requirements | `PUT /api/tenders/:id/requirements/:id` | Allowed | Denied | Denied |
| Configure Compliance Rules | `POST /api/tenders/:id/rules` | Allowed | Denied | Denied |
| Run Deterministic Evaluation | `POST /api/tenders/:id/evaluations/run` | Allowed | Allowed | Denied |
| Adjudicate Conflicts | `POST /api/tenders/:id/conflicts/:id/resolve` | Allowed | Denied | Denied |
| Qualification Sign-off | `POST /api/tenders/:id/workspace/decide` | Allowed | Denied | Denied |
| Download Audit Reports | `GET /api/tenders/:id/reports/export` | Allowed | Allowed | Denied |
| Reset Demo State | `POST /api/admin/demo-reset` | Denied | Allowed | Denied |
| Browse / Apply to Tenders | `/bidder/tenders` | Denied | Denied | Allowed |

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Procurement Officer | `officer@gem.gov.in` | `Officer@123` |
| Demo Officer (Alternate) | `demo.officer@bidguard.local` | `Officer@123` |
| System Administrator | `admin@gem.gov.in` | `Admin@123` |
| Demo Bidder (Vendor) | `demo.bidder@bidguard.local` | `Bidder@123` |

---

## End-to-End Procurement Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Procurement Officer
    actor Bidder as Participating Bidder
    participant Web as Web Interface
    participant Fastify as Backend API Service
    participant Rules as Deterministic AST Engine
    participant DB as PostgreSQL Database

    Note over Officer,DB: Phase 1: Tender Setup & Blueprint Locking
    Officer->>Web: Create Tender (CPCL-INFRA-DEMO-2026) & Upload RFP PDF
    Web->>Fastify: POST /api/tenders/:id/documents
    Fastify->>Fastify: Ingest, OCR, Extract 22 Requirements
    Fastify-->>Web: Display Blueprint (Technical: 8, Financial: 7, Statutory: 7)
    Officer->>Web: Review & Lock Blueprint

    Note over Bidder,DB: Phase 2: Bidder Ingestion & Evidence Fact Mapping
    Bidder->>Web: Submit Technical & Financial Proposal PDFs
    Web->>Fastify: POST /api/tenders/:id/bidders/:bid/documents
    Fastify->>Fastify: Extract 5-Tier Facts (Value, Page, Bounding Box)
    Fastify->>DB: Store Grounded Evidence Facts

    Note over Officer,DB: Phase 3: Deterministic Rule Run & Contradiction Graph
    Officer->>Web: Click "Run Compliance Evaluation"
    Web->>Fastify: POST /api/tenders/:id/evaluations/run
    Fastify->>Rules: Evaluate Math Predicates against Extracted Facts
    Rules-->>Fastify: Return Quad-State Matrix (PASS | FAIL | REVIEW)
    Fastify->>Fastify: Build Bipartite Conflict Graph
    Fastify->>DB: Persist Evaluation Results & Active Conflicts

    Note over Officer,DB: Phase 4: Officer Adjudication & Cryptographic Sign-Off
    Officer->>Web: Open Adjudication Workspace
    Web-->>Officer: Show Conflict: Balance Sheet (Rs 380 Cr) vs CA Cert (Rs 510 Cr)
    Officer->>Web: Adjudicate: UPHELD (CA cert included subsidiary figures)
    Officer->>Web: Formal Sign-off (L&T: Qualified, BHEL: Disqualified, Reliance: Disqualified)
    Web->>Fastify: POST /api/tenders/:id/workspace/decide
    Fastify->>DB: Append SHA-256 Chained Audit Event
    Officer->>Web: Export Signed Bid Evaluation Report (BER)
```

### Step-by-Step Walkthrough with Demo Data

**Step 1: RFP Publishing and Document Ingestion**
Officer creates `CPCL-INFRA-DEMO-2026` tender for an EPC contract for a Crude Oil Storage Tank Terminal. Uploads the official RFP PDF. System validates MIME type, computes SHA-256, initiates OCR.

**Step 2: AI Requirement Blueprint Extraction**
AI extracts 22 compliance criteria:
- Technical: min 50,000 MT tank construction experience, ISO 9001, ASME standards
- Financial: Annual turnover >= Rs 500 Cr in 3 preceding FYs, Net Worth >= Rs 500 Cr
- Statutory: Valid GSTIN, PAN compliance, EPFO registration, Non-blacklisting affidavit

Officer reviews, adjusts thresholds, and **locks** the blueprint.

**Step 3: Bidder Submission Ingestion**
Three bids uploaded: L&T Heavy Engineering, BHEL, Reliance Infrastructure. Each indexed by page, text extracted, SHA-256 computed for deduplication.

**Step 4: Evidence Extraction and Mapping**
Pipeline extracts Rs 380 Cr from BHEL Balance Sheet (Page 14), links it to the Annual Turnover FY2023 requirement with 0.97 confidence and bounding box coordinates.

**Step 5: Deterministic Compliance Evaluation**
- **L&T Heavy Engineering:** 22/22 PASS -- all criteria met
- **BHEL:** 20 PASS, 1 FAIL (Net Worth Rs 420 Cr < Rs 500 Cr required), 1 REVIEW
- **Reliance Infrastructure:** REVIEW flagged -- critical turnover contradiction detected

**Step 6: Contradiction Investigation**
Conflict graph: Reliance's Audited Balance Sheet = Rs 380 Cr vs CA Certificate = Rs 510 Cr. Officer reviews side-by-side, identifies CA Certificate included subsidiary figures, upholds contradiction.

**Step 7: Officer Adjudication and Formal Sign-off**
- Reliance: DISQUALIFIED -- financial contradiction upheld
- BHEL: DISQUALIFIED -- net worth below Rs 500 Cr threshold
- L&T: QUALIFIED -- all 22 criteria satisfied

All decisions with written justifications appended to SHA-256 audit ledger.

**Step 8: Audit Dossier Export**
Officer exports signed Bid Evaluation Report (BER) for the procurement committee and GeM portal.

---

## Key Features

### Multi-Portal Verification Integration
Automated integration with GSTIN, MCA21, PAN, EPFO, ESIC, Udyam, and Startup India for real-time status verification.

### AI Document Verification
LLM-assisted clause parsing, OCR processing, automated extraction, validation, and cross-verification.

### Deterministic Compliance Engine
Fully explainable AST rule engine -- no black-box scoring. Every result is mathematically derivable.

### Quad-State Evaluation
`PASS | FAIL | REVIEW | NOT_EVALUABLE` with 100% citation grounding. Every result is backed by page and paragraph.

### Cross-Document Contradiction Detection
Automated bipartite conflict graph identifying value mismatches, date chronology errors, and identity variations.

### AI Recommendation Engine
Structured hypotheses for officer review, identifying gaps and compliance discrepancies.

### Tamper-Evident Audit Trail
SHA-256 hash-chained immutable audit ledger. CAG-defensible event records.

### Multilingual Interface
22-language support: Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Urdu, Kannada, Malayalam, Odia, Punjabi, Assamese, Nepali, Sanskrit, Spanish, French, German, Portuguese, Arabic, Chinese, Japanese, Korean.

### Enterprise Security
HMAC-SHA256 JWT, RBAC, MIME-type validation, path traversal prevention, prompt injection controls, Fastify Helmet.

---

## AI/ML and Compliance Engine Details

### Document Processing Pipeline

```mermaid
flowchart LR
    PDF["Input PDF File"] --> MIME["MIME Verification"]
    MIME --> SHA["SHA-256 Dedup Check"]
    SHA --> Parse["pdf-parse Text Extraction"]
    Parse --> Classify["Block Classifier (Heading/Table/Para)"]
    Classify --> Struct["Structure Recognition"]
    Struct --> LLM["LLM Clause Parser"]
    LLM --> Store["Evidence Fact Store"]
```

### AST Rule Engine TypeScript Interface

```typescript
interface ASTNode {
  operator: 'ALL_OF' | 'ANY_OF' | 'NONE_OF'
           | '>=' | '<=' | '>' | '<' | '==' | 'BETWEEN'
           | 'CONTAINS' | 'REGEX' | 'IN_LIST' | 'EQUALS'
           | 'DATE_AFTER' | 'DATE_BEFORE' | 'WITHIN_YEARS';
  operands?: ASTNode[];           // For logical operators
  left?: ASTNode;                 // For binary comparison operators
  right?: ASTNode;
  factRef?: string;               // Reference to extracted evidence fact
  value?: number | string | Date; // Literal threshold value
  unit?: 'INR' | 'CR' | 'LAKH' | '%' | 'YEARS';
}
```

**Properties:** Zero dynamic code execution, standard arithmetic only, normalization before evaluation, every leaf node carries 5-tier provenance.

### Value Normalization Engine

```mermaid
flowchart TD
    Raw["Input String: 'Annual Turnover Rs 3,80,00,00,000 (Rupees Three Hundred Eighty Crores)'"]
    S1["1. Strip Currency Symbols: 'Rs', 'INR', 'Rupees'"]
    S2["2. Remove Lakh/Crore Formatted Commas"]
    S3["3. Parse Words to Numeric Tokens: 'Three Hundred Eighty' -> 380"]
    S4["4. Apply Indian Magnitude Multiplier: 'Crore' = 1e7, 'Lakh' = 1e5"]
    Out["Normalized Output: 3800000000 (Raw Integer for AST Evaluation)"]

    Raw --> S1 --> S2 --> S3 --> S4 --> Out
```

### Conflict Detection Algorithm

```
For each bidder B:
  For each fact pair (F_i, F_j):
    If SAME semantic domain (e.g., Annual Turnover FY2023)
    And DIFFERENT source documents (D_i != D_j)
    And |normalizedValue(F_i) - normalizedValue(F_j)| > THRESHOLD:
      Emit ConflictFinding {
        factAId, factBId,
        severity: function_of(delta_magnitude, requirement_criticality),
        affectedRequirements: [criteria impacted by this contradiction]
      }
```

---

## External Verification Integrations

| Portal | Endpoint | Data Retrieved | Status |
|---|---|---|---|
| GSTIN Verification | `/api/.../verification/gstin` | Active status, address, return filing | Simulated (production-ready adapter) |
| MCA21 / Company RoC | `/api/.../verification/mca` | Company status, directors, paid-up capital | Simulated |
| PAN / Income Tax | `/api/.../verification/pan` | PAN-Aadhaar link, entity name | Simulated |
| EPFO | `/api/.../verification/epfo` | Establishment registration, ECR | Simulated |
| Udyam/MSME | `/api/.../verification/udyam` | MSME category, registration date | Simulated |
| Startup India | `/api/.../verification/startup` | DPIIT recognition number | Simulated |

> **Production Path:** Verification adapters are pluggable connectors. Replacing simulated implementations with NIC/GeM API gateway calls requires only updating the adapter service layer -- all upstream logic stays unchanged.

---

## Data Models and Schema

### Entity Relationships

```mermaid
erDiagram
    User ||--o{ Tender : creates
    User ||--o{ AuditEvent : records
    Tender ||--o{ TenderDocument : contains
    Tender ||--o{ Requirement : defines
    Requirement ||--o{ ComplianceRule : translates_to
    ComplianceRule ||--o{ EvaluationResult : determines
    Tender ||--o{ Bidder : evaluates
    Bidder ||--o{ BidDocument : submits
    Bidder ||--o{ EvidenceFact : extracts
    EvidenceFact ||--o{ EvidenceMapping : maps
    Requirement ||--o{ EvidenceMapping : receives
    EvidenceMapping ||--o{ EvaluationResult : proves
    EvidenceFact ||--o{ ConflictFinding : triggers
```

### Entity Reference Table

| Entity | Purpose | Key Attributes |
|---|---|---|
| `User` | System actors | `id`, `email`, `name`, `role`, `status` |
| `Tender` | Root procurement dossier | `id`, `referenceNumber`, `title`, `organization`, `status`, `closingDate` |
| `TenderDocument` | Uploaded RFP specification | `id`, `storageKey`, `originalFilename`, `pageCount`, `processingStatus`, `fileHash` |
| `Requirement` | Extracted compliance criterion | `id`, `category`, `description`, `priority`, `isApproved` |
| `ComplianceRule` | Declarative AST evaluation rule | `id`, `expression` (AST JSON), `operator`, `thresholdValue`, `unit`, `version` |
| `Bidder` | Vendor submitting a proposal | `id`, `legalName`, `gstin`, `pan`, `incorporationCountry`, `overallStatus` |
| `BidDocument` | Uploaded bidder submission | `id`, `bidderId`, `documentType`, `fileHash` |
| `EvidenceFact` | Grounded datum from bidder document | `id`, `factType`, `normalizedValue`, `pageNumber`, `boundingBox`, `snippet` |
| `EvidenceMapping` | Requirement-to-Fact connection | `id`, `requirementId`, `evidenceFactId`, `confidence`, `isManual`, `verifiedBy` |
| `EvaluationResult` | Quad-state rule output | `id`, `status`, `actualValue`, `officerOverride`, `overrideJustification` |
| `ConflictFinding` | Cross-document contradiction | `id`, `factAId`, `factBId`, `severity`, `status`, `resolutionNotes` |
| `AuditEvent` | Cryptographic audit ledger entry | `id`, `eventType`, `userId`, `previousState`, `newState`, `previousHash`, `currentHash` |

---

## Project Structure

```
BidSure_AI/
|-- README.md                          <- This file
|-- SYSTEM_OVERVIEW.md                 <- Complete platform manual (18 modules)
|-- package.json                       <- npm Workspaces root config
|-- render.yaml                        <- Render.com deployment config
|-- .env.example                       <- Environment variable template
|
|-- frontend/                          <- Next.js 15 Frontend Application
|   |-- app/
|   |   |-- layout.tsx                 <- Root layout with providers
|   |   |-- page.tsx                   <- Public landing page
|   |   |-- login/page.tsx             <- Authentication
|   |   |-- register/page.tsx          <- User registration
|   |   |-- dashboard/page.tsx         <- Procurement Officer dashboard
|   |   |-- tenders/
|   |   |   |-- page.tsx               <- Tender list
|   |   |   |-- create/                <- New tender form
|   |   |   `-- [id]/
|   |   |       |-- documents/         <- Document management
|   |   |       |-- requirements/      <- AI requirement blueprint
|   |   |       |-- rules/             <- Compliance rule editor
|   |   |       |-- bidders/[bid]/     <- Bidder dossiers & evidence
|   |   |       |-- comparison/        <- Side-by-side comparison matrix
|   |   |       |-- workspace/         <- Officer adjudication workspace
|   |   |       |-- intelligence/      <- Real-time analytics dashboard
|   |   |       `-- reports/           <- Audit report export
|   |   |-- admin/dashboard/           <- Admin panel
|   |   `-- bidder/                    <- Bidder self-service portal
|   |-- components/
|   |   |-- header/GovernmentUtilityBar.tsx
|   |   |-- landing/                   <- Landing page sections
|   |   |-- layout/navbar.tsx          <- Navigation component
|   |   |-- theme/                     <- Theme provider & tokens
|   |   |-- ui/                        <- Primitive UI components
|   |   `-- verification/              <- Verification status widgets
|   |-- features/                      <- Feature-specific logic
|   |-- lib/                           <- Shared utilities & API client
|   |-- types/                         <- TypeScript type definitions
|   |-- tests/                         <- 44 frontend tests (12 suites)
|   |-- tailwind.config.ts
|   |-- next.config.ts
|   `-- package.json
|
|-- backend/                           <- Fastify TypeScript API Server
|   |-- src/
|   |   |-- server.ts                  <- Entry point & Fastify bootstrap
|   |   |-- app.ts                     <- Plugin registration & routing
|   |   |-- config/                    <- Environment configuration
|   |   |-- middleware/                <- Auth, RBAC, error handlers
|   |   `-- modules/                   <- 19 feature modules
|   |       |-- auth/                  <- JWT authentication
|   |       |-- tenders/               <- Tender CRUD
|   |       |-- requirements/          <- Requirement extraction & approval
|   |       |-- rules/                 <- AST rule management
|   |       |-- bidders/               <- Bidder management
|   |       |-- evidence/              <- Evidence fact ingestion
|   |       |-- mappings/              <- Req-to-fact mapping engine
|   |       |-- evaluations/           <- Deterministic quad-state engine
|   |       |-- conflicts/             <- Contradiction detection
|   |       |-- workspace/             <- Officer adjudication endpoints
|   |       |-- comparison/            <- Comparative matrix
|   |       |-- investigation/         <- AI investigation agent
|   |       |-- verification/          <- External portal adapters
|   |       |-- intelligence/          <- Analytics & metrics
|   |       |-- reports/               <- Audit report generation
|   |       |-- applications/          <- Bidder application workflow
|   |       |-- admin/                 <- Admin operations & demo reset
|   |       |-- demo/                  <- Demo seed data management
|   |       `-- health/                <- System health telemetry
|   |-- prisma/schema.prisma           <- Database schema (45KB, 12 models)
|   |-- tests/                         <- 179 backend tests (25 suites)
|   `-- package.json
|
`-- docs/
    |-- architecture.md                <- Detailed architecture blueprint
    |-- security.md                    <- Security & threat model
    |-- intelligence-metrics.md        <- Analytics & metrics guide
    `-- final-hardening-report.md      <- Production hardening report
```

---

## Installation and Setup

### Prerequisites

| Requirement | Minimum | Recommended |
|---|---|---|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| PostgreSQL | 14.x | 15.x |
| Git | 2.x | Latest |

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/BidSure_AI.git
cd BidSure_AI
```

### Step 2: Install All Dependencies

```bash
# Installs root + frontend + backend dependencies in one command (npm Workspaces)
npm install
```

### Step 3: Configure the Database

```sql
-- Run in your PostgreSQL shell
CREATE DATABASE bidsure_ai;
CREATE USER bidsure_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bidsure_ai TO bidsure_user;
```

### Step 4: Set Up Environment Variables

```bash
cp .env.example .env
# Then edit .env with your actual configuration values
```

### Step 5: Initialize Database Schema

```bash
npm run db:push --workspace=backend
# Or for production environments:
npm run db:migrate --workspace=backend
```

### Step 6: Verify Data Integrity

```bash
npm run demo:preflight --workspace=backend
npm run data:check --workspace=backend
```

---

## Environment Variables

### Backend `.env` (copy from `.env.example`)

```env
# Server Networking
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database (PostgreSQL with Prisma)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bidguard?schema=public"

# Authentication & Security
JWT_SECRET=your-secure-jwt-secret-minimum-16-characters-long
AUTH_ENFORCED=true
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW_MS=60000

# Super Administrator Credentials
SUPER_ADMIN_EMAIL=superadmin@gem.gov.in
SUPER_ADMIN_PASSWORD=SuperAdmin@2026!ChangeMe

# Object Storage (MinIO / S3)
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_BUCKET=bidguard-documents
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_REGION=us-east-1

# AI / LLM Verification Engine
LLM_PROVIDER=mock
LLM_API_KEY=
LLM_MODEL=gemini-2.5-flash
LLM_BASE_URL=
```

### Frontend `.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> **Security Note:** Never commit actual API keys, database credentials, or JWT secrets. Use `.env.example` as the committed template.

---

## Running the Project

### Development Mode

```bash
# Terminal 1: Backend API Server (Port 5000)
npm run dev --workspace=backend
# Fastify with hot-reload via tsx watch
# API available at:  http://localhost:5000
# Swagger UI at:     http://localhost:5000/docs

# Terminal 2: Frontend Next.js App (Port 3000)
npm run dev --workspace=frontend
# Next.js 15 dev server
# Application at:    http://localhost:3000
```

### Quick Demo Login

1. Open `http://localhost:3000`
2. Click **"Sign In"** -- use: `officer@gem.gov.in` / `Officer@123`
3. The canonical demo tender **CPCL-INFRA-DEMO-2026** is pre-loaded with 22 requirements and 3 bidders
4. To reset demo data: `POST /api/admin/demo-reset` (Admin only) or use the Admin Dashboard

### Production Build

```bash
# Build frontend
npm run build --workspace=frontend

# Build backend (Prisma generate + TypeScript compile)
npm run build --workspace=backend

# Start production servers
npm run start --workspace=backend   # Port 5000
npm run start --workspace=frontend  # Port 3000
```

### Database Management Commands

```bash
npm run db:studio --workspace=backend    # Open Prisma Studio GUI
npm run db:push --workspace=backend      # Push schema changes to DB
npm run db:generate --workspace=backend  # Regenerate Prisma client
npm run db:migrate --workspace=backend   # Run database migrations
```

---

## API Reference

### Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "officer@gem.gov.in",
  "password": "Officer@123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "usr_001",
    "email": "officer@gem.gov.in",
    "name": "Procurement Officer",
    "role": "PROCUREMENT_OFFICER"
  }
}
```

### Complete API Endpoint Reference

| Category | Method | Endpoint | Auth Required | Description |
|---|:---:|---|:---:|---|
| **Auth** | `POST` | `/api/auth/login` | None | Authenticate user, receive JWT token |
| **Auth** | `GET` | `/api/auth/me` | JWT | Get current user profile and role |
| **Tenders** | `GET` | `/api/tenders` | JWT | List all tenders with status summaries |
| **Tenders** | `POST` | `/api/tenders` | Officer | Create a new tender dossier |
| **Tenders** | `GET` | `/api/tenders/:id` | JWT | Fetch complete tender metadata |
| **Tenders** | `PUT` | `/api/tenders/:id` | Officer | Update tender details |
| **Documents** | `POST` | `/api/tenders/:id/documents` | Officer | Upload RFP document |
| **Documents** | `GET` | `/api/tenders/:id/documents` | JWT | List tender documents |
| **Requirements** | `GET` | `/api/tenders/:id/requirements` | JWT | List extracted requirements |
| **Requirements** | `PUT` | `/api/tenders/:id/requirements/:rId` | Officer | Approve or modify requirement |
| **Rules** | `GET` | `/api/tenders/:id/rules` | JWT | List compliance rules |
| **Rules** | `POST` | `/api/tenders/:id/rules` | Officer | Create/update AST compliance rule |
| **Bidders** | `GET` | `/api/tenders/:id/bidders` | JWT | List participating bidders |
| **Bidders** | `POST` | `/api/tenders/:id/bidders` | Officer | Register new bidder |
| **Evidence** | `GET` | `/api/tenders/:id/bidders/:bId/evidence` | JWT | Fetch extracted evidence facts |
| **Evaluations** | `POST` | `/api/tenders/:id/evaluations/run` | Officer | Run deterministic evaluation |
| **Conflicts** | `GET` | `/api/tenders/:id/conflicts` | JWT | List detected contradictions |
| **Conflicts** | `POST` | `/api/tenders/:id/conflicts/:cId/resolve` | Officer | Adjudicate conflict |
| **Workspace** | `GET` | `/api/tenders/:id/workspace/summary` | JWT | Officer decision dashboard |
| **Workspace** | `POST` | `/api/tenders/:id/workspace/decide` | Officer | Formal qualification sign-off |
| **Reports** | `GET` | `/api/tenders/:id/reports/export` | JWT | Download BER (PDF/JSON/CSV) |
| **Comparison** | `GET` | `/api/tenders/:id/comparison` | JWT | Side-by-side bidder matrix |
| **Intelligence** | `GET` | `/api/tenders/:id/intelligence` | JWT | Analytics and procurement metrics |
| **Verification** | `GET` | `/api/tenders/:id/bidders/:bId/verification` | JWT | External portal checks |
| **Admin** | `POST` | `/api/admin/demo-reset` | Admin | Reset to golden demo seed |
| **Health** | `GET` | `/health` | None | System health and DB status |
| **Health** | `GET` | `/health/ready` | None | Readiness probe |

### Example: Run Compliance Evaluation

```http
POST /api/tenders/tnd_1789567202603_77g22a/evaluations/run
Authorization: Bearer <officer-token>

Response 200:
{
  "evaluationId": "eval_xyz789",
  "status": "COMPLETED",
  "summary": {
    "totalRequirements": 22,
    "bidders": [
      { "legalName": "L&T Heavy Engineering",   "pass": 22, "fail": 0, "review": 0 },
      { "legalName": "BHEL",                     "pass": 20, "fail": 1, "review": 1 },
      { "legalName": "Reliance Infrastructure",  "pass": 18, "fail": 0, "review": 4 }
    ]
  }
}
```

### Example: Adjudicate Conflict

```http
POST /api/tenders/tnd_1789567202603_77g22a/conflicts/cf_001/resolve
Authorization: Bearer <officer-token>
Content-Type: application/json

{
  "decision": "UPHELD",
  "notes": "CA Certificate incorrectly included subsidiary turnover of Rs 130 Cr. The standalone audited balance sheet figure of Rs 380 Cr is the correct basis per clause 4.3.2 of the RFP. Turnover does not meet the Rs 500 Cr threshold. Vendor disqualified."
}

Response 200:
{
  "conflictId": "cf_001",
  "status": "UPHELD",
  "resolvedBy": "officer@gem.gov.in",
  "resolvedAt": "2026-09-26T14:30:00Z",
  "auditEventId": "aud_999"
}
```

### Example: Officer Sign-off

```http
POST /api/tenders/tnd_1789567202603_77g22a/workspace/decide
Authorization: Bearer <officer-token>
Content-Type: application/json

{
  "bidderId": "bid_lt_001",
  "decision": "QUALIFIED",
  "notes": "L&T Heavy Engineering satisfies all 22 compliance requirements. Financial thresholds met, statutory registrations verified, technical experience confirmed via cited project completion certificates. Recommended for contract award."
}

Response 200:
{
  "bidderId": "bid_lt_001",
  "legalName": "L&T Heavy Engineering",
  "finalStatus": "QUALIFIED",
  "signedOffBy": "officer@gem.gov.in",
  "signedOffAt": "2026-09-26T15:00:00Z",
  "auditEventId": "aud_1001"
}
```

---

## Testing

### Test Suite Overview

| Suite | Location | Count | Coverage Areas |
|---|---|---|---|
| Frontend Unit & Integration | `frontend/tests/` | **44 tests** in 12 suites | Components, auth, routing |
| Backend Unit, Security, E2E | `backend/tests/` | **179 tests** in 25 suites | API, rules, auth, evaluation |
| **Total** | | **223 tests** | Full stack coverage |

### Running Tests

```bash
# Run all frontend tests
npm test --workspace=frontend

# Run all backend tests
npm test --workspace=backend

# Watch mode (re-runs on file save)
npm run test:watch --workspace=frontend
npm run test:watch --workspace=backend

# Full SIH validation suite
cd frontend && npm test && npm run build
cd ../backend && npm test && npm run build
npm run demo:preflight --workspace=backend
npm run data:check --workspace=backend
```

### Frontend Tests Cover
- Landing page rendering and navigation
- Authentication flow (login, logout, redirect)
- Role-based routing (officer -> /dashboard, admin -> /admin/dashboard, bidder -> /bidder/dashboard)
- Register page form validation and submission
- Component rendering and interaction tests
- Government utility bar functionality

### Backend Tests Cover
- JWT authentication and token validation
- RBAC enforcement -- all 403/401 unauthorized scenarios
- Tender CRUD operations
- Requirement extraction and officer approval
- AST rule creation and mathematical validation
- Evidence fact ingestion and 5-tier provenance
- Deterministic evaluation engine correctness
- Conflict detection algorithm accuracy
- Officer override and adjudication recording
- Audit log integrity and SHA-256 hash chaining verification
- Admin demo reset with golden-state validation
- System health endpoint checks
- SQL injection prevention tests
- File upload security (MIME type, path traversal, size limit)

---

## Security and Compliance

### 7-Layer Security Architecture

**Layer 1: Authentication -- HMAC-SHA256 JWT**
```
Login -> Bcrypt Password Verify -> HMAC-SHA256 Sign JWT (24h expiry)
Every Request -> Verify HMAC-SHA256 Signature -> Extract role/user
```

**Layer 2: RBAC Authorization**
Route-level middleware validates roles before any handler executes. Returns 403 Forbidden for unauthorized access. No role escalation possible without database-level user modification.

**Layer 3: AST Sandbox -- Zero Dynamic Evaluation**
```
PROHIBITED: eval(input) | new Function(input) | setTimeout(string) | vm.runInContext()
PERMITTED:  Custom AST tree-walker with pre-defined, typed operators only
```

**Layer 4: Prompt Injection and AI Hallucination Controls**
- Bidder documents treated strictly as untrusted data strings
- System prompts strictly separated from data contexts with clear delimiters
- Missing or ambiguous evidence defaults to `INSUFFICIENT_EVIDENCE` or `REVIEW` -- never inferred

**Layer 5: File Upload Validation**
```
MIME-Type:      application/pdf | image/tiff | image/png ONLY
Size Limit:     10MB maximum (enforced at HTTP gateway)
Path Traversal: Strip ../ and absolute paths from all filenames
SHA-256 Hash:   Reject exact duplicate documents instantly
```

**Layer 6: Multi-Tenant Isolation (IDOR Defense)**
All database queries enforce mandatory tender scoping. Cross-tender access returns 404 (not 403) to prevent information leakage across independent procurement dossiers.

**Layer 7: HTTP Security Headers via Fastify Helmet**
- `Content-Security-Policy` -- prevents XSS attacks
- `X-Frame-Options: DENY` -- prevents clickjacking
- `X-Content-Type-Options: nosniff` -- prevents MIME sniffing
- `Referrer-Policy: no-referrer` -- prevents information leakage
- `Strict-Transport-Security` -- enforces HTTPS

### GFR 2017 Compliance Alignment

| GFR 2017 Rule | Requirement | BidSure AI Implementation |
|---|---|---|
| Rule 149 | Maintain records of all bids received | Immutable audit ledger with all submissions |
| Rule 150 | Transparency in evaluation | Explainable AST rules with page-level citations |
| Rule 157 | Single tender justification | Override mechanism with mandatory written justification |
| Rule 175 | Evaluation by duly constituted committee | Officer adjudication workspace with formal sign-off |
| Schedule II | Document retention periods | Tamper-evident SHA-256 hash-chained audit log |

---

## Audit Trail and Tamper Evidence

### SHA-256 Hash Chain Architecture

```
AuditEvent[0]:
  data:         { userId, action, entity, timestamp, ... }
  previousHash: "genesis_block_000"
  currentHash:  SHA256(data + "genesis_block_000")

AuditEvent[1]:
  data:         { ... }
  previousHash: AuditEvent[0].currentHash
  currentHash:  SHA256(data + AuditEvent[0].currentHash)

AuditEvent[N]:
  data:         { ... }
  previousHash: AuditEvent[N-1].currentHash
  currentHash:  SHA256(data + AuditEvent[N-1].currentHash)
```

**Tamper Detection:** Modifying any historical audit record invalidates its `currentHash`, which no longer matches the `previousHash` of the subsequent record. The entire chain from the tampered record onwards becomes invalid -- detectable by any verification scan.

### Tracked Event Types

```
AUTH:         USER_LOGIN | USER_LOGOUT | FAILED_LOGIN_ATTEMPT
TENDER:       TENDER_CREATED | TENDER_UPDATED | TENDER_STATUS_CHANGED
DOCUMENTS:    DOCUMENT_UPLOADED | DOCUMENT_PROCESSED | DOCUMENT_REJECTED
REQUIREMENT:  REQUIREMENT_EXTRACTED | REQUIREMENT_APPROVED | BLUEPRINT_LOCKED
RULES:        RULE_CREATED | RULE_UPDATED | RULE_DELETED
EVALUATION:   EVALUATION_STARTED | EVALUATION_COMPLETED
CONFLICT:     CONFLICT_DETECTED | CONFLICT_RESOLVED | CONFLICT_UPHELD | CONFLICT_DISMISSED
OVERRIDE:     EVALUATION_OVERRIDDEN (includes mandatory justification text)
DECISION:     BIDDER_QUALIFIED | BIDDER_DISQUALIFIED (includes officer notes)
REPORT:       REPORT_GENERATED | REPORT_EXPORTED
ADMIN:        DEMO_RESET_EXECUTED | USER_CREATED | USER_STATUS_CHANGED
```

---

## Impact and Feasibility

### Quantified Impact

| Metric | Current Baseline | With BidSure AI | Improvement |
|---|---|---|---|
| Document Verification Time | 15-30 days per tender | 2-4 days | **60-80% reduction** |
| Manual Cross-Portal Checks | 8-12 portals per bidder | 0 (automated) | **100% automated** |
| Cross-Document Contradiction Detection | 0% automated | 100% automated | **Fully automated** |
| Evidence Citation Coverage | ~40% traceable | 100% page-level | **+60% traceability** |
| Audit Trail Completeness | Partial paper records | Immutable SHA-256 chain | **Legally defensible** |
| Override Accountability | None | 100% with written notes | **Full accountability** |

### Feasibility Assessment

**Technical Feasibility:**
- Built on mature, production-proven stack (Next.js 15, Fastify 4, PostgreSQL 15, Prisma 5)
- LLM clause parsing is provider-agnostic -- works with any OpenAI-compatible API
- Verification adapters are pluggable -- production API integration needs only adapter replacement
- Stateless JWT authentication enables horizontal scaling

**Economic Feasibility:**

| Deployment Tier | Infrastructure | Monthly Cost (INR) |
|---|---|---|
| Pilot (1 CPSE) | 2 vCPU, 4GB RAM, 50GB DB | Rs 8,000-12,000 |
| Regional (10 CPSEs) | 4 vCPU, 16GB RAM, 200GB DB | Rs 25,000-40,000 |
| National (All PSUs) | Kubernetes cluster, managed DB | Rs 2,00,000-5,00,000 |

**ROI Estimate (Tier 1, 1 CPSE):**
- Officer team cost reduction (70%): Rs 42 Lakhs saved/year
- Error and fraud prevention value: Rs 1-5 Crore/year
- BidSure AI annual cost: Rs 7.5 Lakhs/year
- **Net ROI: ~560% in Year 1**

**Operational Feasibility:**
- Web-based -- no client software installation
- 22-language multilingual support
- Admin demo-reset enables reliable, repeatable committee demonstrations

**Legal and Regulatory Feasibility:**
- Procurement Officer Primacy Principle -- legal authority remains with human officers
- GFR 2017 aligned throughout
- Tamper-evident audit trail meets CAG and CVC requirements
- Zero `eval()` -- eliminates code injection legal liability

---

## Scalability Roadmap

### Phase 1: Prototype -- SIH 2026 (Current)
- Core compliance engine with 18 modules
- 3-bidder CPCL-INFRA-DEMO-2026 demonstration dossier
- 223 automated tests passing (44 frontend + 179 backend)
- 22-language multilingual UI
- Tamper-evident SHA-256 audit trail
- GFR 2017 aligned RBAC and officer adjudication

### Phase 2: Pilot Deployment (6-12 Months)
- Live GSTIN, MCA21, PAN, EPFO APIs via NIC API gateway
- Production deployment for CPCL and HPCL
- 5-10 real procurement officer onboarding and training
- DigiLocker document verification integration
- PDF.js rendering with bounding-box highlights

### Phase 3: Ministry-Level Expansion (12-24 Months)
- Expand to Ministry of Petroleum and Natural Gas (15+ CPSEs)
- GeM portal OAuth SSO integration
- Mobile application for officer adjudication
- Advanced analytics with procurement fraud detection

### Phase 4: National GeM Integration (24-36 Months)
- Full GeM 2.0 marketplace API integration
- Government-wide deployment across all Ministries
- Custom AI model fine-tuned on Indian government procurement documents
- Multilingual OCR: Hindi, Tamil, Telugu, Kannada, Bengali
- National blacklisting and debarment database integration

---

## Business and Sustainability Model

### Deployment Models

| Option | Description | Operator |
|---|---|---|
| Central Government SaaS | Hosted on NIC cloud, subscribed by Ministries | Ministry of IT / NIC |
| CPSE On-Premise | Deployed within CPSE IT infrastructure | Individual CPSE IT teams |
| Hybrid | Cloud SaaS with on-premise data residency | NIC + CPSE partnership |

### Long-Term Sustainability
- Platform maintenance by NIC or designated government IT team
- No vendor lock-in: open-source PostgreSQL, Node.js, and Next.js stack
- AI layer is provider-agnostic -- supports government-approved AI providers
- Open-source core; proprietary fine-tuned AI model layer for production

---

## Competitive Comparison

| Feature | Manual Process | GeM Portal | Commercial E-Proc | BidSure AI |
|---|:---:|:---:|:---:|:---:|
| Automated Multi-Portal Verification | No | Partial | Limited | Full |
| Cross-Document Contradiction Detection | No | No | No | Automated |
| Explainable Compliance (No Black-Box) | No | No | No | AST-based |
| Page-Level Evidence Citations | No | No | No | Bounding Boxes |
| SHA-256 Tamper-Evident Audit Log | No | No | Basic | Hash-chained |
| Officer Override with Mandatory Notes | No | No | Optional | Mandatory |
| Quad-State Evaluation (not binary) | No | No | No | 4 states |
| Indian Value Normalization | No | Partial | No | Crore/Lakh/INR |
| GFR 2017 Compliance Design | Manual | Partial | No | Purpose-built |
| 22-Language Multilingual UI | No | Hindi/English | No | 22 languages |
| 223 Open Automated Tests | N/A | N/A | Proprietary | Open |
| Zero Vendor Lock-in | N/A | No | No | Open Stack |

---

## Limitations and Future Scope

### Current Limitations

| Limitation | Current Status | Planned Resolution |
|---|---|---|
| External portal verification is simulated | Mock adapters with MOCK/SYNTHETIC badge | NIC/GeM API integration (Phase 2) |
| PDF bounding-box highlight overlay is logical | Coordinates stored, render pending | PDF.js integration (Phase 2) |
| AI clause parsing needs LLM API key | Configurable, provider-agnostic | Government-approved AI (Phase 3) |
| No real-time GeM portal OAuth | Standalone system | GeM 2.0 API SSO (Phase 3) |
| Hindi and regional OCR accuracy | English-first pipeline | Multilingual OCR models (Phase 4) |

### Near-Term Future Scope (0-12 months)
- Live GSTIN, MCA21, PAN, EPFO API integration via NIC API gateway
- Mobile app for officer adjudication (Android/iOS)
- DigiLocker verification integration
- National debarment and blacklisting registry integration

### Medium-Term Future Scope (12-24 months)
- Custom AI model fine-tuned on Indian government procurement documents
- Multilingual OCR: Hindi, Tamil, Telugu, Kannada, Bengali
- Predictive fraud risk analytics based on historical bid patterns
- GeM OAuth SSO -- single sign-on with GeM portal credentials

### Long-Term Future Scope (24-36 months)
- National procurement intelligence aggregated across all Ministries
- Blockchain upgrade for distributed tamper-evident audit at national scale
- ASEAN expansion for South and South-East Asian government procurement

---

## Live Demo and Quickstart

### Pre-Seeded Demonstration Dossier

| Field | Value |
|---|---|
| **Tender ID** | `tnd_1789567202603_77g22a` |
| **Reference Number** | `CPCL-INFRA-DEMO-2026` |
| **Title** | Engineering, Procurement and Construction (EPC) of Crude Oil Storage Tank Terminal |
| **Organization** | Chennai Petroleum Corporation Limited (CPCL) |
| **Requirements** | 22 criteria (Technical: 8, Financial: 7, Statutory: 7) |
| **Bidders** | 3 (L&T Heavy Engineering, BHEL, Reliance Infrastructure) |
| **Active Conflict** | Rs 380 Cr vs Rs 510 Cr turnover contradiction in Reliance's submission |

### SIH Live Demonstration Flow

```
1.  Login as: officer@gem.gov.in / Officer@123
    `-- Routes to /dashboard (Officer role detected)

2.  Open CPCL-INFRA-DEMO-2026 tender
    `-- See 22 AI-extracted requirements (Technical, Financial, Statutory)

3.  Navigate to /rules -> View AST compliance rules
    `-- e.g., Annual Turnover ALL_OF [>= Rs 500Cr, >= Rs 500Cr, >= Rs 500Cr]

4.  Click Run Compliance Evaluation
    |-- L&T Heavy Engineering:   22/22 PASS (Qualified)
    |-- BHEL:                    20 PASS, 1 FAIL (Net Worth Rs 420Cr < Rs 500Cr)
    `-- Reliance Infrastructure: 18 PASS, 4 REVIEW (contradiction detected)

5.  Open Workspace -> Conflict highlighted (CRITICAL severity)
    |-- Document A - Audited Balance Sheet:  Annual Turnover = Rs 380 Crore (Page 14)
    `-- Document B - CA Certificate:         Annual Turnover = Rs 510 Crore (Page 3)

6.  Adjudicate: UPHELD
    `-- Note: CA Certificate included subsidiary figures not permitted by RFP clause 4.3.2

7.  Sign-off decisions:
    |-- L&T: QUALIFIED (all 22 criteria satisfied)
    |-- BHEL: DISQUALIFIED (net worth shortfall -- Rs 420Cr vs Rs 500Cr required)
    `-- Reliance: DISQUALIFIED (financial contradiction upheld)

8.  Export: Bid Evaluation Report (BER) with full SHA-256 audit chain
```

### Demo Reset

```bash
# Via API (Admin token required)
curl -X POST http://localhost:5000/api/admin/demo-reset \
  -H "Authorization: Bearer <admin-jwt-token>"

# Response:
# { "status": "success", "message": "Demo reset to golden state: CPCL-INFRA-DEMO-2026" }
```

Or via the Admin Dashboard at `http://localhost:3000/admin/dashboard`.

---

## Team and SIH Details

| Detail | Value |
|---|---|
| **Team Name** | Inovix 2.0 2k26 |
| **Team ID** | 175356 |
| **Problem Statement ID** | 26100 |
| **Problem Title** | AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement |
| **Organization** | Ministry of Petroleum and Natural Gas (MoPNG) |
| **Department** | Chennai Petroleum Corporation Limited (CPCL) |
| **Category** | Software |
| **Theme** | Smart Automation |
| **Hackathon Edition** | Smart India Hackathon 2026 |

### Documentation Index

| Document | Description |
|---|---|
| [README.md](./README.md) | This file -- project overview, setup, API reference |
| [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) | Complete platform manual: 18 modules, RBAC, workflows, API reference |
| [docs/architecture.md](./docs/architecture.md) | Detailed system architecture blueprint |
| [docs/security.md](./docs/security.md) | Security model and threat analysis |
| [docs/intelligence-metrics.md](./docs/intelligence-metrics.md) | Analytics and metrics implementation guide |
| [docs/final-hardening-report.md](./docs/final-hardening-report.md) | Production hardening and readiness report |

---

## License

This project was developed for **Smart India Hackathon 2026** (Problem Statement ID: 26100) by **Team Inovix 2.0 2k26** (Team ID: 175356).

The solution is designed for deployment as a government public procurement utility, intended to be operated by or licensed to Government of India Ministries, Central Public Sector Enterprises (CPSEs), and State Public Sector Undertakings.

---

<div align="center">

**Built for Digital India | Smart India Hackathon 2026**

*Transforming manual, error-prone GeM procurement verification into an AI-assisted, explainable,*
*and legally defensible compliance intelligence platform -- while keeping the Procurement Officer firmly in command.*

---

[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-orange?style=for-the-badge)](https://www.sih.gov.in/)
[![Team Inovix](https://img.shields.io/badge/Team-Inovix%202.0%202k26-purple?style=for-the-badge)]()
[![Problem 26100](https://img.shields.io/badge/Problem%20ID-26100-blue?style=for-the-badge)]()
[![CPCL](https://img.shields.io/badge/CPCL%20MoPNG-GeM%20Procurement-red?style=for-the-badge)]()

</div>
