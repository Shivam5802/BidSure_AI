# BidSure AI (BidGuard)

> **AI-Powered Integrated Bid Compliance Verification Platform for GeM Public Procurement**

---

## 📖 Comprehensive Documentation

For the complete, authoritative manual covering **all 18 platform modules**, **user roles & RBAC matrix**, **architectural philosophy**, **data models**, **end-to-end workflows**, and **API references**, see:

👉 **[SYSTEM_OVERVIEW.md](file:///c:/Users/Harshita%20Srivastava/OneDrive/Desktop/BidSure_AI/SYSTEM_OVERVIEW.md)**

Additional specialized documentation:
- [Architecture Blueprint](file:///c:/Users/Harshita%20Srivastava/OneDrive/Desktop/BidSure_AI/docs/architecture.md)
- [Security & Threat Model](file:///c:/Users/Harshita%20Srivastava/OneDrive/Desktop/BidSure_AI/docs/security.md)
- [Intelligence & Metrics](file:///c:/Users/Harshita%20Srivastava/OneDrive/Desktop/BidSure_AI/docs/intelligence-metrics.md)
- [Final Hardening & Demo Report](file:///c:/Users/Harshita%20Srivastava/OneDrive/Desktop/BidSure_AI/docs/final-hardening-report.md)

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ / 20+
- PostgreSQL database
- npm / npx

### 1. Installation
```bash
# Install workspace dependencies
npm install
```

### 2. Run Tests & Validation
```bash
# Frontend Tests (Vitest)
npm test --workspace=frontend

# Backend Tests (Vitest)
npm test --workspace=backend
```

### 3. Start Development Servers
```bash
# Terminal 1: Backend API (Port 5000)
npm run dev --workspace=backend

# Terminal 2: Frontend App (Port 3000)
npm run dev --workspace=frontend
```

### 4. Demo Login Credentials
- **Procurement Officer**: `officer@gem.gov.in` / `Officer@123`
- **Administrator**: `admin@gem.gov.in` / `Admin@123`
- **Canonical Demo Tender**: `CPCL-INFRA-DEMO-2026` (`tnd_1789567202603_77g22a`)
