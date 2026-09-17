# BidGuard AI

**AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement**

BidGuard AI helps public procurement officers transform complex Government e-Marketplace (GeM) tender documents into structured compliance requirements, verify bidder evidence, detect inconsistencies, and produce explainable, auditable compliance intelligence.

> **CRITICAL GOVERNANCE PRINCIPLE**  
> **AI assists. Rules verify. Officer decides.**  
> The system must NEVER autonomously make the final qualification/disqualification decision.  
> The Procurement Officer remains the final decision-maker.

---

## 1. Architecture

```text
Frontend (Next.js 15 App Router + Tailwind CSS)
   ↓ (REST via Centralized API Client)
Backend API (Fastify + TypeScript + Zod Validation)
   ↓ (OpenAPI Documentation at /api/docs)
Services Layer
   ├── StorageService Abstraction (S3 / Local)
   └── JobQueueService Abstraction (BullMQ / Redis readiness)
   ↓
Database (PostgreSQL + Prisma ORM)
```

---

## 2. Prerequisites

* **Node.js**: `v20.x` or higher (tested on Node `v24.16.x`)
* **npm**: `v10.x` or higher
* **PostgreSQL**: (optional for Phase 0 client generation; required for live DB operations)

---

## 3. Environment Setup

Create your `.env` file from the provided template:

```bash
cp .env.example .env
```

Review `.env` variables:

```env
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bidguard?schema=public"
REDIS_URL="redis://localhost:6379"

STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_BUCKET="bidguard-documents"
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"

NEXT_PUBLIC_API_URL="http://localhost:5000"
```

---

## 4. Installation

Install all workspace dependencies from the root directory:

```bash
npm install
```

Generate Prisma client:

```bash
npm run db:generate
```

---

## 5. Development Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Runs both Frontend (port 3000) and Backend (port 5000) concurrently |
| `npm run dev:backend` | Starts Fastify backend with live reload (`tsx watch`) |
| `npm run dev:frontend` | Starts Next.js frontend development server |
| `npm run build` | Compiles both backend and frontend for production |
| `npm run typecheck` | Strict TypeScript type checking across all workspaces |
| `npm run lint` | Runs linters across both packages |
| `npm run test` | Executes backend and frontend Vitest suites |
| `npm run test:backend` | Runs backend unit and integration tests |
| `npm run test:frontend` | Runs frontend component and API client tests |

---

## 6. Database Commands

| Command | Purpose |
| :--- | :--- |
| `npm run db:generate` | Generates the typed Prisma Client from `backend/prisma/schema.prisma` |
| `npm run db:migrate` | Runs database migrations against configured `DATABASE_URL` |
| `npm run db:studio` | Opens Prisma Studio visual database browser |

---

## 7. API Specification & Health Verification

* **Health Endpoint**: `GET http://localhost:5000/api/health`
* **Metadata Endpoint**: `GET http://localhost:5000/api`
* **Swagger / OpenAPI Documentation**: `http://localhost:5000/api/docs`

Sample Health Response:
```json
{
  "success": true,
  "data": {
    "service": "bidguard-api",
    "status": "healthy",
    "version": "0.1.0",
    "timestamp": "2026-09-14T15:20:00.000Z",
    "uptime": 32,
    "environment": "development"
  }
}
```

---

## 8. Project Structure

```text
bidguard-ai/
│
├── frontend/
│   ├── app/                      # Next.js App Router (Landing /, Dashboard /dashboard)
│   ├── components/               # UI components, layout shell (Sidebar, Topbar, Navbar, Footer)
│   ├── features/                 # Modular feature architecture placeholders
│   ├── lib/                      # Centralized API client (lib/api/client.ts)
│   ├── types/                    # Shared frontend contract types
│   ├── tests/                    # Vitest UI test suites
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── config/               # Zod-validated environment config (env.ts)
│   │   ├── modules/health/       # Health & metadata controller, service, routes
│   │   ├── middleware/           # Centralized error handler (errorHandler.ts)
│   │   ├── services/storage/     # StorageService interface & mock provider
│   │   ├── services/jobs/        # JobQueueService interface & stub provider
│   │   ├── plugins/              # Fastify plugins (CORS, Helmet, Swagger OpenAPI)
│   │   ├── types/                # Standard API response & error contracts
│   │   ├── utils/                # Standard response creators
│   │   ├── app.ts                # Fastify app factory (buildApp)
│   │   └── server.ts             # Server entry point & graceful shutdown
│   ├── prisma/
│   │   └── schema.prisma         # PostgreSQL schema (User, UserRole enum)
│   ├── tests/                    # Vitest backend tests
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   └── architecture.md           # Detailed architecture specification
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 9. Development Roadmap

The platform is engineered feature-by-feature in strict sequence:

1. **Phase 0: Project Foundation** `[COMPLETED]`
2. **Feature 1A: Tender Upload & Document Processing** `[COMPLETED]`
3. **Feature 1B: AI Tender Requirement Extraction** `[COMPLETED]`
4. **Feature 1C: Tender Compliance Rule Engine** `[COMPLETED]`
5. **Feature 1D: Bidder & Bid Document Ingestion** `[COMPLETED]`
6. **Feature 1E: Evidence Extraction & Source-Grounded Facts** `[COMPLETED]`
7. **Feature 1F: Evidence ↔ Requirement Mapping** `[COMPLETED]`
8. **Feature 1G: Deterministic Compliance Evaluation Engine** `[COMPLETED]`
9. **Feature 1H: AI Compliance Investigation Agent** `[COMPLETED]`
10. **Feature 1I: Contradiction Detection & Evidence Conflict Graph** `[COMPLETED]`
11. **Feature 1J: Procurement Officer Command Center** `[COMPLETED]`
12. **Feature 1K: Bidder Comparison & Tender-Level Intelligence** `[COMPLETED]`
13. **Feature 1L: Audit Trail & Explainable Compliance Report** `[COMPLETED]`
14. **Feature 1M: Verification Adapter Layer / Government Simulation** `[COMPLETED]`
15. **Feature 1N: Demo Intelligence, Risk Indicators & Impact Analytics** `[COMPLETED]`
16. **Feature 1O: Final Security, Testing & SIH Demo Hardening** `[COMPLETED]`

---

## 10. Feature 1N — Demo Intelligence, Risk Indicators & Impact Analytics

Feature 1N transforms raw compliance and audit data into actionable, executive-level intelligence for procurement officers while adhering to strict governance principles:

> **CORE PRINCIPLE: No Opaque AI Risk Scores or Automated Winner Rankings**  
> BidGuard AI never assigns an arbitrary score (e.g. `87/100`) or ranks bidders. Priority queues reflect **where human attention is needed first** to adjudicate discrepancies, missing documentation, or compliance failures.

### Key Capabilities
- **8 Factual Indicator Categories**: `EVIDENCE_GAP`, `COMPLIANCE_REVIEW`, `COMPLIANCE_FAILURE`, `CONFLICT`, `EXTERNAL_VERIFICATION`, `DOCUMENT_PROCESSING`, `INVESTIGATION`, `AUDIT`.
- **Deterministic Attention Ordering**: Highest severity (`CRITICAL` -> `HIGH` -> `MEDIUM` -> `LOW`) with mandatory requirement and conflict prioritization.
- **Auditability & Traceability Metrics**: Measures real 5-tier evidence lineage (Requirement -> Rule -> Evidence Fact -> Document -> Page), Automation Coverage, and Human Review Rate.
- **Segregated Impact Analytics**: Real prototype execution time tracked and compared against manual baselines alongside official Smart India Hackathon (SIH) 60%–80% effort reduction targets.
- **Interactive Demo Calculator**: Parameterized sandbox for demonstrating projected savings across tender volumes, clearly badged `DEMO ESTIMATE`.
- **Simulation Transparency**: All external verification calls explicitly surface provider mode (`MOCK / SYNTHETIC` vs. live sandbox).

---

## 11. Feature 1O — Final Security, Testing & SIH Demo Hardening

Feature 1O establishes the final reliability, security, and verification guarantees across BidGuard AI.

### Canonical Demo Dataset
- **Tender**: `CPCL Infrastructure Procurement — Demo Tender` (`CPCL-INFRA-DEMO-2026`)
- **Scope**: 22 requirements across Financial, Technical, Legal, Experience, and Administrative domains.
- **Bidders**: 3 realistic vendors:
  - *L&T Heavy Engineering*: Clean PASS on mandatory criteria, valid GSTIN, verified ISO 9001.
  - *BHEL Consortium*: Critical turnover contradiction (₹62.5 Cr declared vs ₹44.1 Cr audited), triggering FAIL and autonomous AI Investigation.
  - *Reliance Infrastructure*: Borderline working capital (`REVIEW`), missing Make in India local content certificate (`NOT_EVALUABLE`), expired ISO certificate (`MISMATCH` under `MOCK / SYNTHETIC` provider mode).

### SIH 5-Minute Live Presentation Runbook

```text
Landing Page
      ↓
Dashboard (Select "CPCL-INFRA-DEMO-2026")
      ↓
Executive Intelligence & Health Snapshot (/tenders/[id]/intelligence)
      ↓
Priority Action Queue (Notice mandatory non-preference disclaimer)
      ↓
Compliance Blueprint & Deterministic Rules
      ↓
Bidder Submissions & Evidence Provenance (Page/Line citations)
      ↓
Compliance Matrix & Quad-State Distribution (PASS, FAIL, REVIEW, NOT_EVALUABLE)
      ↓
Click "Why?" on BHEL Turnover Failure (Trace: Requirement → Rule → Balance Sheet P.12)
      ↓
External Verification (Show explicit MOCK / SYNTHETIC badge on GSTIN & ISO checks)
      ↓
Evidence Conflict Graph (Show contradiction between self-declaration and audited P&L)
      ↓
AI Investigation Agent (Show hypothesis synthesis & human officer review)
      ↓
Audit Trail & Immutability (Inspect append-only log)
      ↓
Impact Calculator & Explainable Dossier (Highlight 60%–80% verified effort savings)
```

### Startup Sequence
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Run Pre-flight System Check
npm run demo:preflight

# 4. Start Development Servers (Frontend: 3000, Backend: 5000)
npm run dev
```

### Demo Accounts & Security Credentials
- **Procurement Officer**: `officer@gem.gov.in` (Role: `PROCUREMENT_OFFICER`)
- **System Administrator**: `admin@gem.gov.in` (Role: `ADMIN`)
- **Reset Demo Dataset**: `POST /api/admin/demo-reset` (Guarded by `ADMIN` role)

For the complete security specification, see [docs/security.md](file:///docs/security.md).  
For the final hardening report, see [docs/final-hardening-report.md](file:///docs/final-hardening-report.md).

#   B i d S u r e _ A I  
 