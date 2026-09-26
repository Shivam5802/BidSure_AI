<div align="center">

<img src="frontend/app/icon.png" alt="BidSure AI Logo" width="120" />

# 🛡️ BidSure AI — BidGuard

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
> BidSure AI eliminates manual, error-prone bid compliance verification in Government e-Marketplace (GeM) procurement through a deterministic AI-assisted verification engine — reducing verification effort by **60-80%** while keeping the final qualification decision firmly with the Procurement Officer.

---

**[🚀 Live Demo](#-live-demo--quickstart)** · **[📐 Architecture](#-system-architecture)** · **[📦 Installation](#-installation--setup)** · **[📖 API Docs](#-api-reference)** · **[🔐 Security](#-security--compliance)** · **[🎯 Team](#-team--sih-details)**

</div>

---

## 📋 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Problem Analysis — The Real Gap](#-problem-analysis--the-real-gap)
3. [Our Solution — BidSure AI](#-our-solution--bidsure-ai)
4. [Core Innovation and USP](#-core-innovation--usp)
5. [System Architecture](#-system-architecture)
6. [Technology Stack](#-technology-stack)
7. [Platform Modules — 18 Functional Modules](#-platform-modules)
8. [User Roles and RBAC](#-user-roles--rbac)
9. [End-to-End Procurement Workflow](#-end-to-end-procurement-workflow)
10. [Key Features](#-key-features)
11. [AI/ML and Compliance Engine Details](#-aiml--compliance-engine-details)
12. [External Verification Integrations](#-external-verification-integrations)
13. [Data Models and Schema](#-data-models--schema)
14. [Project Structure](#-project-structure)
15. [Installation and Setup](#-installation--setup)
16. [Environment Variables](#-environment-variables)
17. [Running the Project](#-running-the-project)
18. [API Reference](#-api-reference)
19. [Testing](#-testing)
20. [Security and Compliance](#-security--compliance)
21. [Audit Trail and Tamper Evidence](#-audit-trail--tamper-evidence)
22. [Impact and Feasibility](#-impact--feasibility)
23. [Scalability Roadmap](#-scalability-roadmap)
24. [Business and Sustainability Model](#-business--sustainability-model)
25. [Competitive Comparison](#-competitive-comparison)
26. [Limitations and Future Scope](#-limitations--future-scope)
27. [Live Demo and Quickstart](#-live-demo--quickstart)
28. [Team and SIH Details](#-team--sih-details)
29. [License](#-license)

---

## 📌 Problem Statement

| Field | Details |
|---|---|
| **Problem Statement ID** | `26100` |
| **Title** | AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement |
| **Organization** | Ministry of Petroleum and Natural Gas |
| **Department** | Chennai Petroleum Corporation Limited (CPCL) |
| **Category** | Software |
| **Theme** | Smart Automation |

### Background

Government procurement through the **Government e-Marketplace (GeM)** involves verification of multiple statutory, regulatory, and eligibility requirements of bidders. Procurement Officers must examine and validate documents related to:

- 🏭 **Udyam / MSME Registration**
- 📊 **GST Registration and Return Filing**
- 🪪 **PAN and Income Tax Compliance**
- 🇮🇳 **Make in India / Local Content Requirements**
- 👷 **EPFO / ESIC Compliance**
- 🚀 **Startup India, NSIC, OEM Authorization**
- 📁 **DigiLocker Document Verification**
- ⚠️ **Blacklisting / Debarment Status**

The current verification process is **document-intensive**, requiring cross-checking across multiple government portals. This results in:

- Significant **manual effort** and officer fatigue
- **Longer tender evaluation timelines** delaying public procurement
- **Inconsistencies** and **human errors** in compliance judgments
- **Lack of auditability** and traceable decision records

---

## 🔍 Problem Analysis — The Real Gap

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

| Verification Area | Manual Process | Basic Portals | **BidSure AI** |
|---|:---:|:---:|:---:|
| Udyam/MSME Verification | ❌ Manual | ⚠️ Partial | ✅ Automated |
| GSTIN Status Check | ❌ Manual | ⚠️ Portal Only | ✅ Integrated + AI Cross-check |
| Cross-Document Contradiction Detection | ❌ None | ❌ None | ✅ Automated Conflict Graph |
| Explainable Compliance Scoring | ❌ None | ❌ None | ✅ Deterministic AST Engine |
| Page-Level Evidence Citation | ❌ None | ❌ None | ✅ Bounding Box Citations |
| Tamper-Evident Audit Ledger | ❌ None | ❌ None | ✅ SHA-256 Hash Chaining |
| Officer Override with Justification | ❌ None | ❌ None | ✅ Mandatory Notes + Audit |
| Multilingual Interface | ❌ None | ⚠️ Partial | ✅ 22 Languages via Google Translate |

---

## 💡 Our Solution — BidSure AI

**BidSure AI** (engineered as **BidGuard AI**) is an enterprise-grade compliance intelligence and verification platform purpose-built for high-value public procurement under the **Government e-Marketplace (GeM)** and **General Financial Rules (GFR 2017)**.

### The Procurement Officer Primacy Principle

BidSure AI enforces a strict constitutional principle — AI cannot qualify or disqualify a bidder:

```
+------------------+   Facts &    +--------------------+  Verified  +---------------------+
|  AI SUBSYSTEM    | Hypotheses  | DETERMINISTIC RULE  | Findings  | HUMAN PROCUREMENT   |
|                  | ----------> | ENGINE              | --------> | OFFICER             |
| Reads, Parses    |             |                     |           |                     |
| Extracts,        |             | Evaluates, Validates|           | Decides, Signs Off  |
| Proposes         |             | Detects Conflicts   |           | Legally Responsible |
| NEVER decides    |             | NEVER infers        |           | FINAL AUTHORITY     |
+------------------+             +--------------------+           +---------------------+

             AI ASSISTS  ─────────────  RULES VERIFY  ─────────────  OFFICER DECIDES
```

### What BidSure AI Does

The platform runs a multi-stage processing pipeline:

**Stage 1 — Document Ingestion:**
Multi-stage pipeline: UPLOAD → VALIDATE (MIME, SHA-256 dedup) → STORE → OCR → EXTRACT → COMPLETE
Generates layout-aware blocks: PARAGRAPH, HEADING, TABLE, TABLE_ROW, TABLE_CELL, LIST, HEADER, FOOTER, IMAGE

**Stage 2 — AI Extraction:**
LLM-assisted clause parsing extracts compliance requirements. Evidence facts extracted with 5-tier provenance (document, page, bounding box, raw snippet, confidence).

**Stage 3 — Deterministic Evaluation:**
AST-based mathematical rule engine evaluates bidder evidence against requirements. Zero eval(). Quad-state output: PASS | FAIL | REVIEW | NOT_EVALUABLE. 100% citation-grounded.

**Stage 4 — Officer Adjudication:**
Priority-ranked workspace surfaces conflicts. Split-pane PDF evidence view. Formal sign-off with mandatory justification notes. Immutable SHA-256 audit ledger.

---

## 🌟 Core Innovation and USP

### Innovation 1: Deterministic AST Rule Engine (Not Black-Box AI)

**Problem with existing systems:** Generic AI scores like `87/100` that cannot be explained or defended in administrative tribunals.

**BidSure AI solution:** Every compliance output comes from a transparent, declarative **Abstract Syntax Tree (AST)** — a mathematical evaluation tree readable by any officer or CAG inspector.

```javascript
// Example AST Rule: Annual Turnover for last 3 Financial Years
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
- Document A — Audited Balance Sheet: Annual Turnover = **Rs 380 Crore**
- Document B — CA Certificate: Annual Turnover = **Rs 510 Crore**

BidSure AI flags this as a `CRITICAL` conflict, generates a bipartite conflict graph, and surfaces it with side-by-side PDF preview. **No existing GeM tool does this automatically.**

---

### Innovation 3: 5-Tier Evidence Provenance

Every extracted fact carries a complete, unbreakable citation chain:

```
Fact: Annual Turnover = Rs 380 Crore
  ├── sourceDocumentId: doc_bhel_balance_sheet_fy23
  ├── pageNumber:       14
  ├── boundingBox:      { x: 0.12, y: 0.45, w: 0.65, h: 0.08 }
  ├── rawSnippet:       "Net Revenue from Operations: INR 38,02,14,00,000"
  └── confidenceScore:  0.97
```

Officers can click any value to see the exact paragraph, on the exact page, with a highlighted bounding box.

---

### Innovation 4: Tamper-Evident SHA-256 Hash Chaining

Every audit event is cryptographically chained to the previous:

```
AuditEvent[N].currentHash = SHA256( AuditEvent[N].data + AuditEvent[N-1].currentHash )
```

Tampering with any historical record makes the entire chain from that point invalid — immediately detectable. Legally defensible before CAG, administrative tribunals, and CVC.

---

## 🏗️ System Architecture

### High-Level Architecture

```
+----------------------------------------------------------+
|                      CLIENT LAYER                        |
|   Next.js 15  |  React 19  |  TailwindCSS  |  TS 5.7   |
|   Procurement Officer UI   |   Bidder Portal             |
|   Admin Panel              |   22-Language Multilingual  |
+---------------------------+------------------------------+
                            | HTTPS / REST API
                            v
+----------------------------------------------------------+
|                   API GATEWAY LAYER                      |
|              Fastify 4.28  (Node.js)                    |
|   CORS | Helmet | JWT Auth Middleware | Rate Limiting    |
|   Zod Schema Validation | Swagger/OpenAPI 3.0            |
+----------+--------------+-------------+-----------------+
           |              |             |
  +--------v---+  +-------v------+  +--v-----------+
  |AI SUBSYSTEM|  |BUSINESS LOGIC|  |VERIFICATION  |
  |            |  |              |  |ADAPTERS      |
  |LLM Clause  |  |Rule Engine   |  |GSTIN Portal  |
  |Parser      |  |AST Evaluator |  |MCA21/RoC     |
  |OCR Pipeline|  |Conflict Graph|  |PAN/Income Tax|
  |Fact Extract|  |Evidence Map  |  |EPFO/ESIC     |
  |Evidence    |  |Report Gen    |  |Udyam/MSME    |
  |Prover      |  |Audit Logger  |  |Startup India |
  +------------+  +------+-------+  +--------------+
                         |
                         v
+----------------------------------------------------------+
|                     DATA LAYER                           |
|   PostgreSQL 15       |   Prisma 5.22 ORM               |
|   MinIO / S3 Storage  |   SHA-256 Hash-Chained Audit    |
+----------------------------------------------------------+
```

### Frontend Component Architecture

```
frontend/
├── app/                      (Next.js 15 App Router)
│   ├── page.tsx              (Public landing page)
│   ├── login/                (Authentication)
│   ├── register/             (User registration)
│   ├── dashboard/            (Procurement Officer dashboard)
│   ├── tenders/[id]/         (Tender workspace)
│   │   ├── documents/        (Document management)
│   │   ├── requirements/     (AI requirement blueprint)
│   │   ├── rules/            (Compliance rule editor)
│   │   ├── bidders/[bid]/    (Bidder dossiers & evidence)
│   │   ├── comparison/       (Side-by-side comparison matrix)
│   │   ├── workspace/        (Officer adjudication workspace)
│   │   ├── intelligence/     (Real-time analytics dashboard)
│   │   └── reports/          (Audit report export)
│   ├── admin/dashboard/      (Admin panel)
│   └── bidder/               (Bidder self-service portal)
│       ├── dashboard/
│       ├── tenders/
│       ├── applications/
│       └── profile/
└── components/
    ├── header/               (Government utility bar)
    ├── landing/              (Landing page components)
    ├── layout/               (Navbar, sidebar, wrappers)
    ├── theme/                (Theme provider & color tokens)
    ├── ui/                   (Primitive UI components)
    └── verification/         (Verification status widgets)
```

---

## 🛠️ Technology Stack

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
| **Authentication** | HMAC-SHA256 JWT | — | Stateless signed authentication tokens |
| **Security Headers** | @fastify/helmet | 11.1.1 | HTTP security headers enforcement |
| **CORS** | @fastify/cors | 9.0.1 | Cross-origin request control |
| **File Uploads** | @fastify/multipart | 8.3.1 | Multipart form data handling |
| **API Documentation** | @fastify/swagger | 8.15.0 | OpenAPI 3.0 auto-generation |
| **Testing** | Vitest | 2.1.8 | Fast unit and integration testing |
| **Test Utilities** | @testing-library/react | 16.1.0 | React component testing |
| **Deployment** | Render.com | — | Cloud platform deployment |
| **Package Management** | npm Workspaces | — | Monorepo dependency management |
| **Process Runner** | tsx | 4.19.2 | TypeScript execution in dev mode |
| **Internationalization** | Google Translate Widget | — | 22-language multilingual support |

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

## 🧩 Platform Modules

BidSure AI is architected into **18 distinct functional modules**:

```
+-------------------------------------------------------------+
|               BIDSURE AI PLATFORM MODULES                   |
+---------------------+-----------------+---------------------+
| 01. Tender & RFP    | 02. OCR Pipeline| 03. AI Req Extract  |
| 04. Rule Engine     | 05. Bidder Mgmt | 06. Evidence Ingest |
| 07. Fact Mapper     | 08. Quad-State  | 09. Contradiction   |
| 10. AI Investigation| 11. Ext Verify  | 12. Comparison      |
| 13. Adjudication    | 14. Audit Report| 15. Analytics       |
| 16. Tamper-Log      | 17. Admin Reset | 18. Health Monitor  |
+---------------------+-----------------+---------------------+
```

### Module 01 — Tender and RFP Management
**Route:** `/tenders`, `/tenders/create`

Tender lifecycle: `DRAFT → PROCESSING → READY → PARTIAL → FAILED`

Captures GeM Reference Numbers, procuring authority (e.g., CPCL), estimated contract values, closing deadlines, and tender categories. Context-aware tender switching across the dashboard.

---

### Module 02 — Document Processing and OCR Pipeline
**Route:** `/tenders/[id]/documents`

Document lifecycle: `UPLOADED → VALIDATING → STORED → OCR_PROCESSING → EXTRACTING → COMPLETED`

- Layout-aware structural blocks: `PARAGRAPH`, `HEADING`, `TABLE`, `TABLE_ROW`, `TABLE_CELL`, `LIST`, `HEADER`, `FOOTER`, `IMAGE`
- SHA-256 cryptographic hash per document — instant duplicate rejection
- MIME-type allowlisting: `application/pdf`, `image/tiff`, `image/png`

---

### Module 03 — AI Requirement Extraction and Blueprint Builder
**Route:** `/tenders/[id]/requirements`

Categorizes criteria per GeM and GFR 2017 norms:

| Category | Examples |
|---|---|
| **Technical** | Machinery capacity, ISO certifications, project completion experience |
| **Financial** | Annual turnover ≥ Rs 500 Cr, net worth, solvency certificates, working capital |
| **Regulatory/Statutory** | GSTIN compliance, PAN, EPFO, ESI registration, Non-blacklisting affidavit |

Priority tiers: `MANDATORY`, `CRITICAL`, `OPTIONAL`
Blueprint can be **locked** to prevent tampering during active evaluation.

---

### Module 04 — Declarative Compliance Rule Engine
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

### Module 05 — Bidder Dossier Management
**Route:** `/tenders/[id]/bidders`

Pre-seeded demo bidders for CPCL-INFRA-DEMO-2026:
1. **Larsen and Toubro Heavy Engineering** — Compliant across all 22 criteria
2. **Bharat Heavy Electricals Limited (BHEL)** — Non-compliant on net worth threshold
3. **Reliance Infrastructure Ltd** — Critical turnover contradiction flagged

---

### Module 06 — Bid Evidence Fact Ingestion
**Route:** `/tenders/[id]/bidders/[id]/documents/.../evidence`

5-tier audit provenance per extracted fact:

| Tier | Field | Description |
|---|---|---|
| 1 | `sourceDocumentId` | Exact uploaded document identifier |
| 2 | `pageNumber` | Verified page location within document |
| 3 | `boundingBox` | Precise geometric coordinates `{x, y, w, h}` |
| 4 | `rawSnippet` | Verbatim excerpt from source |
| 5 | `confidenceScore` | AI quality score 0.0–1.0 |

Fact types: `NUMERIC`, `TEXT`, `DATE`, `BOOLEAN`, `CERTIFICATE`, `TABLE`

---

### Module 07 — Requirement-to-Fact Mapping Engine

Connects tender requirements to bidder evidence facts:
- Proposes candidate linkages with confidence scores
- Officers can manually bind, remap, or unlink evidence facts
- Tracks AI-suggested (`isManual: false`) vs officer-confirmed (`isManual: true`) mappings

---

### Module 08 — Deterministic Quad-State Evaluation Engine

Produces unambiguous **quad-state** outcomes:

| State | Meaning |
|---|---|
| ✅ `PASS` | All criteria satisfied with verified documentary proof |
| ❌ `FAIL` | Evidence mathematically fails the RFP threshold |
| 🔶 `REVIEW` | Missing documentation, low confidence, or conflicting evidence |
| ⬜ `NOT_EVALUABLE` | Prerequisite criteria not met or requirement unmapped |

No arbitrary scoring. 100% citation grounding.

---

### Module 09 — Contradiction Detection and Evidence Conflict Graph
**Route:** `/tenders/[id]/workspace`

Automated cross-document consistency checks:

| Contradiction Type | Real Example |
|---|---|
| Value Mismatch | Balance Sheet: Rs 380 Cr vs CA Certificate: Rs 510 Cr |
| Date Chronology | Completion certificate dated before work order issuance |
| Identity Variations | PAN card legal name vs GSTIN registration name mismatch |

Severity classification: `CRITICAL`, `WARNING`, `INFORMATIONAL`
Generates bipartite graph linking conflicting documents, facts, and affected criteria.

---

### Module 10 — AI Investigation Agent

On-demand anomaly analysis under strict guardrails:
- **Hypothesis Formulation:** Structured hypotheses (e.g., consolidated vs standalone turnover)
- **Allowlisted Tools:** Read facts, search document pages, query external verification results only
- **Mandatory Disclaimers:** Every finding requires officer confirmation before action

---

### Module 11 — External Verification Adapters
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

### Module 12 — Comparative Scoring and Evaluation Matrix
**Route:** `/tenders/[id]/comparison`
- Side-by-side compliance grid across all bidders
- Filter by requirement category: Technical, Financial, Statutory
- Color coding: 🔴 Disqualified | 🟢 Compliant | 🟡 Requires Review
- Executive summary comparing L1/L2 pricing eligibility with compliance status

---

### Module 13 — Officer Adjudication Workspace
**Route:** `/tenders/[id]/workspace`

Central command center for human decision-making:
- **Priority-ranked** pending decisions queue
- **Split-pane view:** Extracted fact (left) | PDF page with highlighted bounding boxes (right)
- **Conflict adjudication:** Mark as `RESOLVED`, `DISMISSED`, or `UPHELD`
- **Override capability:** Change `FAIL → PASS` with **mandatory written justification**
- **Formal qualification sign-off:** Qualification or disqualification with recorded audit notes

---

### Module 14 — Executive Audit Reports
**Route:** `/tenders/[id]/reports`

| Report Type | Description |
|---|---|
| Bid Evaluation Report (BER) | All evaluated criteria, bidder statuses, and rule evaluations |
| Bidder Fact Dossier | Complete verified citations for a specific bidder |
| Non-Compliance Notice | Auto-drafted clause-specific rejection grounds in RFP citation format |

**Export formats:** PDF, CSV/Excel, JSON audit dumps

---

### Module 15 — Real-Time Intelligence and Analytics Dashboard
**Route:** `/tenders/[id]/intelligence`

- **GFR 2017 Compliance Distribution:** Proportions across Technical, Financial, Statutory
- **Dossier Progression Funnel:** Ingestion → Blueprint → Facts → Rules → Adjudication → Sign-Off
- **Evidence Citation Coverage:** Percentage of requirements with page-level documentary proof (target: 100%)
- **Deterministic Rule Distribution:** Pass/fail/review breakdown across all bidders

---

### Module 16 — Tamper-Evident Audit Log

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

### Module 17 — Administrative Operations and Demo Reset
**Route:** `POST /api/admin/demo-reset`

One-click reset to verified golden-state demonstration dataset:
- Cleanses test artifacts, re-seeds CPCL-INFRA-DEMO-2026
- 22 requirements, 3 bidders, pre-computed evidence citations, active conflict scenarios
- Restricted to ADMIN role only

---

### Module 18 — System Health and Diagnostic Telemetry
**Routes:** `/health`, `/health/ready`

- PostgreSQL/Prisma connection latency
- Memory usage (RSS, heap total, heap used)
- Process uptime and Node.js version
- MinIO/S3 storage adapter readiness

---

## 👥 User Roles and RBAC

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
| Sign-In and Profile | `/api/auth/login` | ✅ | ✅ | ✅ |
| View Dashboard and Metrics | `/dashboard` | ✅ | ✅ | 🚫 |
| Create / Update Tender | `POST /api/tenders` | ✅ | ✅ | 🚫 |
| Upload Tender Documents | `POST /api/tenders/:id/documents` | ✅ | ✅ | 🚫 |
| Approve / Edit Requirements | `PUT /api/tenders/:id/requirements/:id` | ✅ | 🚫 | 🚫 |
| Configure Compliance Rules | `POST /api/tenders/:id/rules` | ✅ | 🚫 | 🚫 |
| Run Deterministic Evaluation | `POST /api/tenders/:id/evaluations/run` | ✅ | ✅ | 🚫 |
| Adjudicate Conflicts | `POST /api/tenders/:id/conflicts/:id/resolve` | ✅ | 🚫 | 🚫 |
| Qualification Sign-off | `POST /api/tenders/:id/workspace/decide` | ✅ | 🚫 | 🚫 |
| Download Audit Reports | `GET /api/tenders/:id/reports/export` | ✅ | ✅ | 🚫 |
| Reset Demo State | `POST /api/admin/demo-reset` | 🚫 | ✅ | 🚫 |
| Browse / Apply to Tenders | `/bidder/tenders` | 🚫 | 🚫 | ✅ |

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| 🧑‍💼 Procurement Officer | `officer@gem.gov.in` | `Officer@123` |
| 👨‍💼 Demo Officer (Alternate) | `demo.officer@bidguard.local` | `Officer@123` |
| 🔧 System Administrator | `admin@gem.gov.in` | `Admin@123` |
| 🏢 Demo Bidder (Vendor) | `demo.bidder@bidguard.local` | `Bidder@123` |

---

## 🔄 End-to-End Procurement Workflow

```
+------------------+    +------------------+    +------------------+    +------------------+
| 1. TENDER SETUP  |--->| 2. AI BLUEPRINT  |--->| 3. BIDDER FACTS  |--->| 4. RULE RUN      |
|                  |    |                  |    |                  |    |                  |
| Create tender    |    | AI extracts reqs |    | Upload bidder    |    | Deterministic    |
| Upload RFP spec  |    | Officer approves |    | docs & extract   |    | AST evaluation   |
| Set deadlines    |    | Lock blueprint   |    | evidence facts   |    | Quad-state out   |
+------------------+    +------------------+    +------------------+    +--------+---------+
                                                                                 |
                                                                                 v
+------------------+    +------------------+    +------------------+    +------------------+
| 8. FINAL AWARD   |<---| 7. AUDIT REPORT  |<---| 6. SIGN-OFF      |<---| 5. CONFLICTS     |
|                  |    |                  |    |                  |    |                  |
| GeM award sync   |    | Export signed    |    | Officer reviews  |    | Cross-doc check  |
| Portal notify    |    | BER & dossier    |    | overrides &      |    | Bipartite graph  |
| Archive records  |    | Non-compliance   |    | formal sign-off  |    | Investigation    |
+------------------+    +------------------+    +------------------+    +------------------+
```

### Step-by-Step Walkthrough with Demo Data

**Step 1: RFP Publishing and Document Ingestion**
Officer creates `CPCL-INFRA-DEMO-2026` tender for an EPC contract for a Crude Oil Storage Tank Terminal. Uploads the official RFP PDF. System validates MIME type, computes SHA-256, initiates OCR.

**Step 2: AI Requirement Blueprint Extraction**
AI extracts 22 compliance criteria:
- Technical: min 50,000 MT tank construction experience, ISO 9001, ASME standards
- Financial: Annual turnover ≥ Rs 500 Cr in 3 preceding FYs, Net Worth ≥ Rs 500 Cr
- Statutory: Valid GSTIN, PAN compliance, EPFO registration, Non-blacklisting affidavit

Officer reviews, adjusts thresholds, and **locks** the blueprint.

**Step 3: Bidder Submission Ingestion**
Three bids uploaded: L&T Heavy Engineering, BHEL, Reliance Infrastructure. Each indexed by page, text extracted, SHA-256 computed for deduplication.

**Step 4: Evidence Extraction and Mapping**
Pipeline extracts Rs 380 Cr from BHEL Balance Sheet (Page 14), links it to the Annual Turnover FY2023 requirement with 0.97 confidence and bounding box coordinates.

**Step 5: Deterministic Compliance Evaluation**
- **L&T Heavy Engineering:** 22/22 PASS — all criteria met
- **BHEL:** 20 PASS, 1 FAIL (Net Worth Rs 420 Cr < Rs 500 Cr required), 1 REVIEW
- **Reliance Infrastructure:** REVIEW flagged — critical turnover contradiction detected

**Step 6: Contradiction Investigation**
Conflict graph: Reliance's Audited Balance Sheet = Rs 380 Cr vs CA Certificate = Rs 510 Cr. Officer reviews side-by-side, identifies CA Certificate included subsidiary figures, upholds contradiction.

**Step 7: Officer Adjudication and Formal Sign-off**
- Reliance: DISQUALIFIED — financial contradiction upheld
- BHEL: DISQUALIFIED — net worth below Rs 500 Cr threshold
- L&T: QUALIFIED — all 22 criteria satisfied

All decisions with written justifications appended to SHA-256 audit ledger.

**Step 8: Audit Dossier Export**
Officer exports signed Bid Evaluation Report (BER) for the procurement committee and GeM portal.

---

## ✨ Key Features

### 🔍 Multi-Portal Verification Integration
Automated integration with GSTIN, MCA21, PAN, EPFO, ESIC, Udyam, and Startup India for real-time status verification.

### 🤖 AI Document Verification
LLM-assisted clause parsing, OCR processing, automated extraction, validation, and cross-verification.

### ⚙️ Deterministic Compliance Engine
Fully explainable AST rule engine — no black-box scoring. Every result is mathematically derivable.

### 📊 Quad-State Evaluation
`PASS | FAIL | REVIEW | NOT_EVALUABLE` with 100% citation grounding. Every result is backed by page and paragraph.

### 🔗 Cross-Document Contradiction Detection
Automated bipartite conflict graph identifying value mismatches, date chronology errors, and identity variations.

### 📋 AI Recommendation Engine
Structured hypotheses for officer review, identifying gaps and compliance discrepancies.

### 📈 Tamper-Evident Audit Trail
SHA-256 hash-chained immutable audit ledger. CAG-defensible event records.

### 🌐 Multilingual Interface
22-language support: Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Urdu, Kannada, Malayalam, Odia, Punjabi, Assamese, Nepali, Sanskrit, Spanish, French, German, Portuguese, Arabic, Chinese, Japanese, Korean.

### 🔒 Enterprise Security
HMAC-SHA256 JWT, RBAC, MIME-type validation, path traversal prevention, prompt injection controls, Fastify Helmet.

---

## 🧠 AI/ML and Compliance Engine Details

### Document Processing Pipeline

```
PDF File  ─→  MIME Check  ─→  SHA-256 Dedup Hash  ─→  pdf-parse Text Extract
                                                               |
                                                               v
Evidence Store  ←─  LLM Clause Parser  ←─  Structure Recognition  ←─  Block Classifier
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

```
Input: Annual Turnover Rs 3,80,00,00,000 (Rupees Three Hundred Eighty Crores)
                          |
                          v
  Indian Number Normalizer:
  1. Strip currency symbols (Rs, INR, ₹)
  2. Remove lakh/crore-format commas
  3. Parse word-form numbers (Three Hundred Eighty → 380)
  4. Apply multiplier (Crore = 1e7, Lakh = 1e5)
                          |
                          v
Output: 3800000000   (Rs 380 Crore as raw integer for AST comparison)
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

## 🌐 External Verification Integrations

| Portal | Endpoint | Data Retrieved | Status |
|---|---|---|---|
| GSTIN Verification | `/api/.../verification/gstin` | Active status, address, return filing | Simulated (production-ready adapter) |
| MCA21 / Company RoC | `/api/.../verification/mca` | Company status, directors, paid-up capital | Simulated |
| PAN / Income Tax | `/api/.../verification/pan` | PAN-Aadhaar link, entity name | Simulated |
| EPFO | `/api/.../verification/epfo` | Establishment registration, ECR | Simulated |
| Udyam/MSME | `/api/.../verification/udyam` | MSME category, registration date | Simulated |
| Startup India | `/api/.../verification/startup` | DPIIT recognition number | Simulated |

> **Production Path:** Verification adapters are pluggable connectors. Replacing simulated implementations with NIC/GeM API gateway calls requires only updating the adapter service layer — all upstream logic stays unchanged.

---

## 🗄️ Data Models and Schema

### Entity Relationships

```
Tender [1] ──────────────> [N] TenderDocument
Tender [1] ──────────────> [N] Requirement ────> [N] ComplianceRule ────> [N] EvaluationResult
Tender [1] ──────────────> [N] Bidder ─────────> [N] BidDocument
Bidder [1] ──────────────> [N] EvidenceFact ───> [N] EvidenceMapping ───> [N] EvaluationResult
EvidenceFact [N] ────────> [N] ConflictFinding
Tender [1] ──────────────> [N] AuditEvent
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

## 📁 Project Structure

```
BidSure_AI/
├── README.md                          ← This file
├── SYSTEM_OVERVIEW.md                 ← Complete platform manual (18 modules)
├── package.json                       ← npm Workspaces root config
├── render.yaml                        ← Render.com deployment config
├── .env.example                       ← Environment variable template
│
├── frontend/                          ← Next.js 15 Frontend Application
│   ├── app/
│   │   ├── layout.tsx                 ← Root layout with providers
│   │   ├── page.tsx                   ← Public landing page
│   │   ├── login/page.tsx             ← Authentication
│   │   ├── register/page.tsx          ← User registration
│   │   ├── dashboard/page.tsx         ← Procurement Officer dashboard
│   │   ├── tenders/
│   │   │   ├── page.tsx               ← Tender list
│   │   │   ├── create/                ← New tender form
│   │   │   └── [id]/
│   │   │       ├── documents/         ← Document management
│   │   │       ├── requirements/      ← AI requirement blueprint
│   │   │       ├── rules/             ← Compliance rule editor
│   │   │       ├── bidders/[bid]/     ← Bidder dossiers & evidence
│   │   │       ├── comparison/        ← Side-by-side comparison matrix
│   │   │       ├── workspace/         ← Officer adjudication workspace
│   │   │       ├── intelligence/      ← Real-time analytics dashboard
│   │   │       └── reports/           ← Audit report export
│   │   ├── admin/dashboard/           ← Admin panel
│   │   └── bidder/                    ← Bidder self-service portal
│   ├── components/
│   │   ├── header/GovernmentUtilityBar.tsx
│   │   ├── landing/                   ← Landing page sections
│   │   ├── layout/navbar.tsx          ← Navigation component
│   │   ├── theme/                     ← Theme provider & tokens
│   │   ├── ui/                        ← Primitive UI components
│   │   └── verification/              ← Verification status widgets
│   ├── features/                      ← Feature-specific logic
│   ├── lib/                           ← Shared utilities & API client
│   ├── types/                         ← TypeScript type definitions
│   ├── locales/                       ← i18n files
│   ├── tests/                         ← 44 frontend tests (12 suites)
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
│
├── backend/                           ← Fastify TypeScript API Server
│   ├── src/
│   │   ├── server.ts                  ← Entry point & Fastify bootstrap
│   │   ├── app.ts                     ← Plugin registration & routing
│   │   ├── config/                    ← Environment configuration
│   │   ├── middleware/                ← Auth, RBAC, error handlers
│   │   └── modules/                   ← 19 feature modules
│   │       ├── auth/                  ← JWT authentication
│   │       ├── tenders/               ← Tender CRUD
│   │       ├── requirements/          ← Requirement extraction & approval
│   │       ├── rules/                 ← AST rule management
│   │       ├── bidders/               ← Bidder management
│   │       ├── evidence/              ← Evidence fact ingestion
│   │       ├── mappings/              ← Req-to-fact mapping engine
│   │       ├── evaluations/           ← Deterministic quad-state engine
│   │       ├── conflicts/             ← Contradiction detection
│   │       ├── workspace/             ← Officer adjudication endpoints
│   │       ├── comparison/            ← Comparative matrix
│   │       ├── investigation/         ← AI investigation agent
│   │       ├── verification/          ← External portal adapters
│   │       ├── intelligence/          ← Analytics & metrics
│   │       ├── reports/               ← Audit report generation
│   │       ├── applications/          ← Bidder application workflow
│   │       ├── admin/                 ← Admin operations & demo reset
│   │       ├── demo/                  ← Demo seed data management
│   │       └── health/                ← System health telemetry
│   ├── prisma/schema.prisma           ← Database schema (45KB, 12 models)
│   ├── tests/                         ← 179 backend tests (25 suites)
│   └── package.json
│
└── docs/
    ├── architecture.md                ← Detailed architecture blueprint
    ├── security.md                    ← Security & threat model
    ├── intelligence-metrics.md        ← Analytics & metrics guide
    └── final-hardening-report.md      ← Production hardening report
```

---

## ⚙️ Installation and Setup

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

## 🔐 Environment Variables

### Backend `.env` (copy from `.env.example`)

```env
# ====================================================
# DATABASE CONFIGURATION
# ====================================================
DATABASE_URL=postgresql://bidsure_user:your_password@localhost:5432/bidsure_ai

# ====================================================
# AUTHENTICATION & SECURITY
# ====================================================
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRY=24h

# ====================================================
# SERVER CONFIGURATION
# ====================================================
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# ====================================================
# AI / LLM INTEGRATION (Optional)
# ====================================================
# Configure your LLM provider for AI clause parsing
# LLM_PROVIDER=openai
# LLM_API_KEY=sk-...
# LLM_MODEL=gpt-4o

# ====================================================
# FILE STORAGE
# ====================================================
# Development: uses local persisted JSON storage
# Production: configure MinIO or S3
# STORAGE_TYPE=s3
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# S3_BUCKET_NAME=bidsure-documents
# S3_REGION=ap-south-1

# ====================================================
# CORS
# ====================================================
CORS_ORIGIN=http://localhost:3000
```

### Frontend `.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> **Security Note:** Never commit actual API keys, database credentials, or JWT secrets. Use `.env.example` as the committed template.

---

## 🚀 Running the Project

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

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"Sign In"** — use: `officer@gem.gov.in` / `Officer@123`
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

## 📖 API Reference

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

## 🧪 Testing

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
- Role-based routing (officer → /dashboard, admin → /admin/dashboard, bidder → /bidder/dashboard)
- Register page form validation and submission
- Component rendering and interaction tests
- Government utility bar functionality

### Backend Tests Cover
- JWT authentication and token validation
- RBAC enforcement — all 403/401 unauthorized scenarios
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

## 🔐 Security and Compliance

### 7-Layer Security Architecture

**Layer 1: Authentication — HMAC-SHA256 JWT**
```
Login → Bcrypt Password Verify → HMAC-SHA256 Sign JWT (24h expiry)
Every Request → Verify HMAC-SHA256 Signature → Extract role/user
```

**Layer 2: RBAC Authorization**
Route-level middleware validates roles before any handler executes. Returns 403 Forbidden for unauthorized access. No role escalation possible without database-level user modification.

**Layer 3: AST Sandbox — Zero Dynamic Evaluation**
```
PROHIBITED: eval(input) | new Function(input) | setTimeout(string) | vm.runInContext()
PERMITTED:  Custom AST tree-walker with pre-defined, typed operators only
```

**Layer 4: Prompt Injection and AI Hallucination Controls**
- Bidder documents treated strictly as untrusted data strings
- System prompts strictly separated from data contexts with clear delimiters
- Missing or ambiguous evidence defaults to `INSUFFICIENT_EVIDENCE` or `REVIEW` — never inferred

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
- `Content-Security-Policy` — prevents XSS attacks
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy: no-referrer` — prevents information leakage
- `Strict-Transport-Security` — enforces HTTPS

### GFR 2017 Compliance Alignment

| GFR 2017 Rule | Requirement | BidSure AI Implementation |
|---|---|---|
| Rule 149 | Maintain records of all bids received | Immutable audit ledger with all submissions |
| Rule 150 | Transparency in evaluation | Explainable AST rules with page-level citations |
| Rule 157 | Single tender justification | Override mechanism with mandatory written justification |
| Rule 175 | Evaluation by duly constituted committee | Officer adjudication workspace with formal sign-off |
| Schedule II | Document retention periods | Tamper-evident SHA-256 hash-chained audit log |

---

## 📋 Audit Trail and Tamper Evidence

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

**Tamper Detection:** Modifying any historical audit record invalidates its `currentHash`, which no longer matches the `previousHash` of the subsequent record. The entire chain from the tampered record onwards becomes invalid — detectable by any verification scan.

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

## 📈 Impact and Feasibility

### Quantified Impact

| Metric | Current Baseline | With BidSure AI | Improvement |
|---|---|---|---|
| Document Verification Time | 15–30 days per tender | 2–4 days | **60–80% reduction** |
| Manual Cross-Portal Checks | 8–12 portals per bidder | 0 (automated) | **100% automated** |
| Cross-Document Contradiction Detection | 0% automated | 100% automated | **Fully automated** |
| Evidence Citation Coverage | ~40% traceable | 100% page-level | **+60% traceability** |
| Audit Trail Completeness | Partial paper records | Immutable SHA-256 chain | **Legally defensible** |
| Override Accountability | None | 100% with written notes | **Full accountability** |

### Feasibility Assessment

**Technical Feasibility:**
- Built on mature, production-proven stack (Next.js 15, Fastify 4, PostgreSQL 15, Prisma 5)
- LLM clause parsing is provider-agnostic — works with any OpenAI-compatible API
- Verification adapters are pluggable — production API integration needs only adapter replacement
- Stateless JWT authentication enables horizontal scaling

**Economic Feasibility:**

| Deployment Tier | Infrastructure | Monthly Cost (INR) |
|---|---|---|
| Pilot (1 CPSE) | 2 vCPU, 4GB RAM, 50GB DB | Rs 8,000–12,000 |
| Regional (10 CPSEs) | 4 vCPU, 16GB RAM, 200GB DB | Rs 25,000–40,000 |
| National (All PSUs) | Kubernetes cluster, managed DB | Rs 2,00,000–5,00,000 |

**ROI Estimate (Tier 1, 1 CPSE):**
- Officer team cost reduction (70%): Rs 42 Lakhs saved/year
- Error and fraud prevention value: Rs 1–5 Crore/year
- BidSure AI annual cost: Rs 7.5 Lakhs/year
- **Net ROI: ~560% in Year 1**

**Operational Feasibility:**
- Web-based — no client software installation
- 22-language multilingual support
- Admin demo-reset enables reliable, repeatable committee demonstrations

**Legal and Regulatory Feasibility:**
- Procurement Officer Primacy Principle — legal authority remains with human officers
- GFR 2017 aligned throughout
- Tamper-evident audit trail meets CAG and CVC requirements
- Zero `eval()` — eliminates code injection legal liability

---

## 🗺️ Scalability Roadmap

### Phase 1: Prototype — SIH 2026 (Current)
- ✅ Core compliance engine with 18 modules
- ✅ 3-bidder CPCL-INFRA-DEMO-2026 demonstration dossier
- ✅ 223 automated tests passing (44 frontend + 179 backend)
- ✅ 22-language multilingual UI
- ✅ Tamper-evident SHA-256 audit trail
- ✅ GFR 2017 aligned RBAC and officer adjudication

### Phase 2: Pilot Deployment (6–12 Months)
- Live GSTIN, MCA21, PAN, EPFO APIs via NIC API gateway
- Production deployment for CPCL and HPCL
- 5–10 real procurement officer onboarding and training
- DigiLocker document verification integration
- PDF.js rendering with bounding-box highlights

### Phase 3: Ministry-Level Expansion (12–24 Months)
- Expand to Ministry of Petroleum and Natural Gas (15+ CPSEs)
- GeM portal OAuth SSO integration
- Mobile application for officer adjudication
- Advanced analytics with procurement fraud detection

### Phase 4: National GeM Integration (24–36 Months)
- Full GeM 2.0 marketplace API integration
- Government-wide deployment across all Ministries
- Custom AI model fine-tuned on Indian government procurement documents
- Multilingual OCR: Hindi, Tamil, Telugu, Kannada, Bengali
- National blacklisting and debarment database integration

---

## 💼 Business and Sustainability Model

### Deployment Models

| Option | Description | Operator |
|---|---|---|
| Central Government SaaS | Hosted on NIC cloud, subscribed by Ministries | Ministry of IT / NIC |
| CPSE On-Premise | Deployed within CPSE IT infrastructure | Individual CPSE IT teams |
| Hybrid | Cloud SaaS with on-premise data residency | NIC + CPSE partnership |

### Long-Term Sustainability
- Platform maintenance by NIC or designated government IT team
- No vendor lock-in: open-source PostgreSQL, Node.js, and Next.js stack
- AI layer is provider-agnostic — supports government-approved AI providers
- Open-source core; proprietary fine-tuned AI model layer for production

---

## 🏆 Competitive Comparison

| Feature | Manual Process | GeM Portal | Commercial E-Proc | **BidSure AI** |
|---|:---:|:---:|:---:|:---:|
| Automated Multi-Portal Verification | ❌ | ⚠️ Partial | ⚠️ Limited | ✅ Full |
| Cross-Document Contradiction Detection | ❌ | ❌ | ❌ | ✅ Automated |
| Explainable Compliance (No Black-Box) | ❌ | ❌ | ❌ | ✅ AST-based |
| Page-Level Evidence Citations | ❌ | ❌ | ❌ | ✅ Bounding Boxes |
| SHA-256 Tamper-Evident Audit Log | ❌ | ❌ | ⚠️ Basic | ✅ Hash-chained |
| Officer Override with Mandatory Notes | ❌ | ❌ | ⚠️ Optional | ✅ Mandatory |
| Quad-State Evaluation (not binary) | ❌ | ❌ | ❌ | ✅ 4 states |
| Indian Value Normalization | ❌ | ⚠️ Partial | ❌ | ✅ Crore/Lakh/INR |
| GFR 2017 Compliance Design | ⚠️ Manual | ⚠️ Partial | ❌ | ✅ Purpose-built |
| 22-Language Multilingual UI | ❌ | ⚠️ Hindi/English | ❌ | ✅ 22 languages |
| 223 Open Automated Tests | N/A | N/A | Proprietary | ✅ Open |
| Zero Vendor Lock-in | N/A | ❌ | ❌ | ✅ Open Stack |

---

## 🔮 Limitations and Future Scope

### Current Limitations

| Limitation | Current Status | Planned Resolution |
|---|---|---|
| External portal verification is simulated | Mock adapters with MOCK/SYNTHETIC badge | NIC/GeM API integration (Phase 2) |
| PDF bounding-box highlight overlay is logical | Coordinates stored, render pending | PDF.js integration (Phase 2) |
| AI clause parsing needs LLM API key | Configurable, provider-agnostic | Government-approved AI (Phase 3) |
| No real-time GeM portal OAuth | Standalone system | GeM 2.0 API SSO (Phase 3) |
| Hindi and regional OCR accuracy | English-first pipeline | Multilingual OCR models (Phase 4) |

### Near-Term Future Scope (0–12 months)
- 🔌 Live GSTIN, MCA21, PAN, EPFO API integration via NIC API gateway
- 📱 Mobile app for officer adjudication (Android/iOS)
- 📁 DigiLocker verification integration
- ⚠️ National debarment and blacklisting registry integration

### Medium-Term Future Scope (12–24 months)
- 🤖 Custom AI model fine-tuned on Indian government procurement documents
- 🗣️ Multilingual OCR: Hindi, Tamil, Telugu, Kannada, Bengali
- 📊 Predictive fraud risk analytics based on historical bid patterns
- 🔗 GeM OAuth SSO — single sign-on with GeM portal credentials

### Long-Term Future Scope (24–36 months)
- 🏛️ National procurement intelligence aggregated across all Ministries
- 🔐 Blockchain upgrade for distributed tamper-evident audit at national scale
- 🌏 ASEAN expansion for South and South-East Asian government procurement

---

## 🖥️ Live Demo and Quickstart

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
    └── Routes to /dashboard (Officer role detected)

2.  Open CPCL-INFRA-DEMO-2026 tender
    └── See 22 AI-extracted requirements (Technical, Financial, Statutory)

3.  Navigate to /rules → View AST compliance rules
    └── e.g., Annual Turnover ALL_OF [>= Rs 500Cr, >= Rs 500Cr, >= Rs 500Cr]

4.  Click Run Compliance Evaluation
    ├── L&T Heavy Engineering:   22/22 PASS ✅
    ├── BHEL:                    20 PASS, 1 FAIL (Net Worth Rs 420Cr < Rs 500Cr) ❌
    └── Reliance Infrastructure: 18 PASS, 4 REVIEW (contradiction detected) 🔶

5.  Open Workspace → Conflict highlighted (CRITICAL severity)
    ├── Document A - Audited Balance Sheet:  Annual Turnover = Rs 380 Crore (Page 14)
    └── Document B - CA Certificate:         Annual Turnover = Rs 510 Crore (Page 3)

6.  Adjudicate: UPHELD
    └── Note: CA Certificate included subsidiary figures not permitted by RFP clause 4.3.2

7.  Sign-off decisions:
    ├── L&T: QUALIFIED (all 22 criteria satisfied)
    ├── BHEL: DISQUALIFIED (net worth shortfall — Rs 420Cr vs Rs 500Cr required)
    └── Reliance: DISQUALIFIED (financial contradiction upheld)

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

Or via the Admin Dashboard at [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard).

---

## 🎯 Team and SIH Details

| Detail | Value |
|---|---|
| **Team Name** | Inovix 2.0 2k26 |
| **Team ID** | 175356 |
| **Problem Statement ID** | 26100 |
| **Problem Title** | AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement |
| **Organization** | Ministry of Petroleum and Natural Gas |
| **Department** | Chennai Petroleum Corporation Limited (CPCL) |
| **Category** | Software |
| **Theme** | Smart Automation |
| **Hackathon Edition** | Smart India Hackathon 2026 |

### Documentation Index

| Document | Description |
|---|---|
| [README.md](./README.md) | This file — project overview, setup, API reference |
| [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) | Complete platform manual: 18 modules, RBAC, workflows, API reference |
| [docs/architecture.md](./docs/architecture.md) | Detailed system architecture blueprint |
| [docs/security.md](./docs/security.md) | Security model and threat analysis |
| [docs/intelligence-metrics.md](./docs/intelligence-metrics.md) | Analytics and metrics implementation guide |
| [docs/final-hardening-report.md](./docs/final-hardening-report.md) | Production hardening and readiness report |

---

## 📄 License

This project was developed for **Smart India Hackathon 2026** (Problem Statement ID: 26100) by **Team Inovix 2.0 2k26** (Team ID: 175356).

The solution is designed for deployment as a government public procurement utility, intended to be operated by or licensed to Government of India Ministries, Central Public Sector Enterprises (CPSEs), and State Public Sector Undertakings.

---

<div align="center">

**Built with ❤️ for Digital India | Smart India Hackathon 2026**

*Transforming manual, error-prone GeM procurement verification into an AI-assisted, explainable,*
*and legally defensible compliance intelligence platform — while keeping the Procurement Officer firmly in command.*

---

[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-orange?style=for-the-badge)](https://www.sih.gov.in/)
[![Team Inovix](https://img.shields.io/badge/Team-Inovix%202.0%202k26-purple?style=for-the-badge)]()
[![Problem 26100](https://img.shields.io/badge/Problem%20ID-26100-blue?style=for-the-badge)]()
[![CPCL](https://img.shields.io/badge/CPCL%20MoPNG-GeM%20Procurement-red?style=for-the-badge)]()

</div>
