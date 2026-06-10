# AGENTS.md — Naprocs EMS Cursor Context

## Project
- Name: naprocs-ems
- Client: Dental Implant Distribution Organizations
- Tech Team: Naprocs Technologies Pvt. Ltd.
- Prepared by: Tejesh Kumar (HR Management Director & Lead Architect)
- CTO: Lokesh | CEO: Pradeep Chandra

## Architecture
- Monorepo: Turborepo + pnpm workspaces
- Frontend: apps/web — Next.js 14 App Router, TypeScript 5 strict
- Backend: apps/api — NestJS 10, Node.js 20 LTS, TypeScript 5 strict
- Database: PostgreSQL 15 via Prisma 5 ORM (packages/database)
- Cache: Redis 7 (AWS ElastiCache) — sessions, BullMQ, rate limiting, WebSocket adapter
- Cloud: AWS ap-south-1 (Mumbai) — DPDPA compliant
- Access: VPN-only (AWS Client VPN) — NOT publicly accessible

## Three Phases
- Phase 1 (P1): Weeks 1–2, 50–100 employees — auth, employees, attendance, leaves, assets, org-chart, compliance, workflows, knowledge, audit, notifications, dashboards, realtime
- Phase 2 (P2): Weeks 3–8, 100–500 employees — payroll, recruitment, performance, skills, learning, engagement, talent, succession, analytics — unlocked via PHASE_2_ENABLED=true
- Phase 3 (P3): Month 5+, 500+ employees — AI modules (Claude API), pgvector, OpenSearch — unlocked via PHASE_3_ENABLED=true

## Key Rules
- One NestJS module per BRD section (modules/ folder = BRD sections)
- All routes prefixed /api/v1/ (Phase 2 breaking changes go to /api/v2/)
- Phase-gated endpoints use @RequiresPhase(2) or @RequiresPhase(3) decorator
- Phase-gated frontend routes are blocked in middleware.ts using feature flags
- Audit log (AuditLog model) is APPEND-ONLY — never update or delete records
- Aadhaar, PAN, bank account, phone: AES-256-GCM encrypted at application layer
- All secrets in AWS Secrets Manager — never hardcode, never commit to repo
- S3 documents accessed via pre-signed URLs (15-min expiry) only
- Prisma migration naming: 0001_p1_*, 0020_p2_*, 0040_p3_*
- pg_trgm + GIN index for employee full-text search in P1/P2 (NOT OpenSearch)
- pgvector extension for AI embeddings in P3 (same RDS instance)
- WebSocket gateway uses Redis pub/sub adapter for multi-ECS-task scaling
- Payroll runs are idempotent: PayrollRun model gates per (month, year)
- DPDPA compliance: ConsentLog required, DataErasureRequest masks PII fields
- No payment gateway for P2 payroll — use NEFT bank file generation instead

## Shared Packages (used by both apps)
- packages/types — TypeScript type definitions (all phases)
- packages/schemas — Zod validation schemas (shared FE + BE)
- packages/database — Prisma schema + migrations + seeds
- packages/email-templates — React Email templates
- packages/feature-flags — PHASE_2_ENABLED / PHASE_3_ENABLED flags
- packages/logger — Winston structured logger
- packages/ui — Design tokens + base components
- packages/config — ESLint, TS, Prettier configs

## Stack Versions
- Next.js: 14 (App Router)
- NestJS: 10
- Prisma: 5
- TypeScript: 5 (strict)
- Node.js: 20 LTS
- Redis: 7
- PostgreSQL: 15
- Tailwind CSS: 3
- React: 18
- socket.io: 4
- BullMQ: latest

## Do NOT
- Install packages without checking package.json first
- Write to AuditLog — only audit.service.ts writes audit entries
- Use OpenSearch in Phase 1 or Phase 2
- Use Razorpay standard gateway for payroll — use NEFT file generation
- Skip @RequiresPhase() decorator on Phase 2/3 controllers
- Store secrets in .env files committed to repo — use AWS Secrets Manager
- Create any direct S3 presigned URL outside document.service.ts

## RBAC Permission Matrix (Section 9.4 from Master Document)

Every controller and endpoint must enforce these permissions using
the @Permissions() decorator combined with @RequiresPhase().
R = Read | W = Write | A = Approve | Req = Request | F = Feedback
— = No access | All = All departments | Team = Own team only | Own = Own record only

| Module              | Employee | Manager  | HR       | Finance | CTO      | CHRO     | CEO     | IT      | Super Admin |
|---------------------|----------|----------|----------|---------|----------|----------|---------|---------|-------------|
| Own Profile         | R/W      | R        | R/W      | R       | R        | R/W      | R       | R       | R/W         |
| Attendance          | R/W      | R-Team   | R-All    | —       | R-Team   | R-All    | R       | —       | R/W         |
| Leave Apply         | R/W      | R/A      | R/W      | —       | R/A      | R/W      | R       | —       | R/W         |
| Assets              | R        | R/Req    | R-All    | —       | R        | R-All    | R       | R/W     | R/W         |
| Payroll (P2)        | Own      | —        | —        | R/W     | —        | R/W      | R       | —       | R/W         |
| Recruitment (P2)    | —        | R/F      | R/W      | —       | R/W      | R/W      | R       | —       | R/W         |
| Performance (P2)    | R/W      | R/W      | R-All    | —       | R-Team   | R-All    | R       | —       | R/W         |
| Skills (P2)         | R/W      | R-Team   | R-All    | —       | R-All    | R-All    | R       | —       | R/W         |
| Learning (P2)       | R/W      | R-Team   | R/W      | —       | R-All    | R/W      | R       | —       | R/W         |
| Engagement (P2)     | R/W      | R-Team   | R/W      | —       | R-Team   | R/W      | R       | —       | R/W         |
| Analytics (P2)      | —        | Team     | All      | All     | Tech     | All      | All     | —       | All         |
| Audit Log           | —        | —        | —        | —       | —        | —        | —       | —       | Full        |
| Compliance          | Own      | —        | R/W      | —       | —        | R/W      | R       | —       | R/W         |
| Admin Panel         | —        | —        | —        | —       | —        | —        | —       | —       | Full        |
| AI Modules (P3)     | Chat     | Team     | All      | All     | All      | All      | All     | —       | All         |

## Authentication Flow (Section 9.1 — implement in exact order)

Step 1  Employee enters email + password on login page (VPN-only accessible)
Step 2  Server verifies credentials, checks account status (ACTIVE, not SUSPENDED)
Step 3  MFA challenge issued — email OTP (HOTP, 6-digit, 5-min TTL stored in Redis) OR TOTP (Google Authenticator via speakeasy)
Step 4  On MFA success: short-lived JWT (15 min) + refresh token (7 days, stored in Redis with device ID) issued
Step 5  Device fingerprint captured on every login — stored in Device table
Step 6  Unknown device triggers: security alert email to employee + realtime admin notification
Step 7  Session stored in Redis with device ID — forced logout on device revocation by admin
Step 8  Concurrent session limit: max 3 sessions per user (SESSION_MAX_CONCURRENT env var)

## Network Security Rules (Section 9.2)

- App is NOT accessible on public internet — private AWS VPC only
- AWS Client VPN (mutual certificate auth) required for ALL access
- WAF v2 with IP set rules — only office CIDR + VPN CIDR allowed
- ALB terminates TLS 1.3 — no HTTP traffic accepted anywhere
- All ECS tasks in private subnets — no public IPs on any compute

## Data Protection Rules (Section 9.3)

- Aadhaar, PAN, bank account numbers, phone: AES-256-GCM encrypted at application layer (encrypt.util.ts)
- RDS encryption at rest (AWS KMS). TLS 1.3 in transit. S3 SSE-S3 at rest
- All secrets in AWS Secrets Manager — zero .env files with real values committed
- S3 document access ONLY via pre-signed URLs (15-min expiry) from document.service.ts
- DPDPA: ConsentLog entry required before storing any employee personal data
- Erasure: DataErasureRequest masks PII fields via pii-masker.util.ts, retains employment history

## Infra Cost Reference (Section 10)

| Phase | Monthly AWS Cost |
|-------|-----------------|
| P1 (50–100 employees) | ~₹23,900/month |
| P2 (100–500 employees) | ~₹44,600/month |
| P3 (500+ employees) | ~₹1,29,100/month |

Cost jumps significantly at P3 due to OpenSearch Serverless (₹55,000/month alone).
Do not enable OpenSearch until P3 is formally unlocked.
