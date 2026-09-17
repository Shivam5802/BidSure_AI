# BidGuard AI — System Architecture

**AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement**

---

## 1. Architectural Overview

BidGuard AI is an enterprise-grade compliance intelligence and verification platform designed specifically for public procurement through the Government e-Marketplace (GeM).

The system operates strictly on the **Procurement Officer Primacy Principle**:
> **AI assists. Rules verify. Officer decides.**
> The system must NEVER autonomously make the final qualification/disqualification decision. The Procurement Officer remains the final decision-maker.

### Operational Hierarchy of Responsibilities

```text
┌─────────────────────────────────────────────────────────────┐
│                       AI SUBSYSTEM                          │
│  - Understands unstructured clauses & bidder narratives    │
│  - Proposes candidate criteria & draft compliance rules    │
│  - Extracts candidate evidence facts with source confidence │
│  - Synthesizes investigation hypotheses on anomalies       │
│  - NEVER decides compliance, passes/fails, or ranks winners │
└──────────────────────────────┬──────────────────────────────┘
                               │ Structured Proposals
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 DETERMINISTIC ENGINE                        │
│  - Evaluates declarative rules against normalized facts    │
│  - Mathematical & date arithmetic (Zero eval(), No shell)   │
│  - Emits quad-state outputs: PASS, FAIL, REVIEW, NOT_EVAL   │
│  - Detects cross-document contradictions & conflict graph   │
│  - Enforces 5-tier unbroken audit traceability (100%)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Verified Findings & Lineage
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 HUMAN PROCUREMENT OFFICER                   │
│  - Approves or edits candidate criteria & rules            │
│  - Adjudicates borderline items & reviews evidence gaps    │
│  - Resolves cross-document contradictions                  │
│  - Makes the final, authoritative qualification decision   │
└─────────────────────────────────────────────────────────────┘
```

### System Component Architecture

```text
Frontend (Next.js 15 App Router + Tailwind CSS)
   ↓ (REST via Centralized API Client with Bearer Token)
Fastify Backend API (TypeScript + Zod Schema Validation)
   ├── Security: Helmet, CORS Whitelist, Auth/RBAC Guards
   ├── Domain Controllers & Repositories (Tenders, Bidders, Rules, Intelligence)
   └── API Documentation (OpenAPI / Swagger at /api/docs)
Services & Engine Layer
   ├── Deterministic Rule Engine (Declarative AST Evaluation)
   ├── Value Normalizer (Indian Currencies, Crores/Lakhs, Dates, GSTIN/PAN)
   ├── Contradiction Detection & Evidence Conflict Graph
   ├── AI Investigation Agent (Structured Hypotheses & Allowlisted Tools)
   ├── External Verification Adapter Layer (Simulated MOCK Providers)
   └── Storage (S3 / MinIO / Protected Local Storage)
Database & State Layer
   └── PostgreSQL + Prisma ORM (Relational foreign keys & immutable audit log)
```

---

## 2. Monorepo Structure

```text
bidguard-ai/
│
├── frontend/                     # Next.js 15 App Router Frontend
│   ├── app/                      # Routes (Landing /, Dashboard /dashboard)
│   ├── components/               # UI components, layout shell, badges
│   ├── features/                 # Modular feature domains (Phase 1A -> Phase 7)
│   ├── lib/                      # Centralized API client, formatters, utilities
│   ├── types/                    # Shared client domain and contract types
│   ├── tests/                    # Vitest UI & client test suites
│   └── package.json
│
├── backend/                      # Fastify Enterprise Node.js Backend
│   ├── src/
│   │   ├── config/               # Zod-validated typed environment module
│   │   ├── modules/              # Domain modules (health, and future feature modules)
│   │   ├── middleware/           # Centralized error handler, 404, security
│   │   ├── services/             # Service interfaces (Storage, Jobs, Database)
│   │   ├── plugins/              # CORS, Helmet, Swagger/OpenAPI
│   │   ├── types/                # API contracts, standardized response formats
│   │   ├── utils/                # Response builders, logging sanitizers
│   │   ├── app.ts                # Fastify application factory
│   │   └── server.ts             # Server entrypoint & graceful shutdown
│   ├── prisma/
│   │   └── schema.prisma         # PostgreSQL schema (User, Role enum)
│   ├── tests/                    # Vitest backend test suites
│   └── package.json
│
├── docs/                         # Technical specifications & blueprints
│   └── architecture.md
│
├── .env.example                  # Environment blueprint
├── .gitignore                    # Version control ignore definitions
├── README.md                     # Project manual
└── package.json                  # Root npm workspaces orchestrator
```

---

## 3. Data Flow & Layering

```text
Request (Browser)
   │
   ▼
Frontend API Client (frontend/lib/api/client.ts)
   │  - Configured via NEXT_PUBLIC_API_URL
   ▼
Backend Security Middleware (Fastify)
   │  - Helmet (secure HTTP headers)
   │  - Configurable CORS (no wildcards in production)
   │  - Request size limits (10MB)
   ▼
Centralized Router & OpenAPI Specs
   │  - Swagger UI at /api/docs
   ▼
Zod Input Validation Layer
   │  - Rejects malformed bodies with 400 VALIDATION_ERROR
   ▼
Controller / Handler
   │  - Strictly handles HTTP request/response mapping
   ▼
Domain Service Layer
   │  - Encapsulates business logic
   ▼
Infrastructure Abstractions
   ├── StorageService (S3-compatible bucket abstraction)
   ├── JobQueueService (BullMQ / Redis asynchronous queue)
   └── Prisma ORM (PostgreSQL client)
```

---

## 4. Standardized Response Protocol

### Success Response Contract
```json
{
  "success": true,
  "data": {
    "key": "value"
  }
}
```

### Error Response Contract
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address",
        "rule": "invalid_string"
      }
    ]
  }
}
```

> **Security Guarantee**: Production errors never leak stack traces, database credentials, internal filesystem paths, or environment variables.

---

## 5. Feature Progression Roadmap

The project follows a strict phase-gated development model:

* **PHASE 0: Project Foundation (Current)**
* **FEATURE 1A**: Tender Upload & Document Processing
* **FEATURE 1B**: AI Tender Requirement Extraction
* **FEATURE 1C**: Compliance Rule Engine
* **FEATURE 2**: Bidder Document Processing
* **FEATURE 3**: Compliance Evaluation
* **FEATURE 4**: Explainable Evidence System
* **FEATURE 5**: Contradiction Detection
* **FEATURE 6**: AI Investigation Agent
* **FEATURE 7**: Officer Decision & Audit
