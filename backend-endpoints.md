# Naprocs EMS — Complete Backend API Endpoint Reference

> **Verified against:** All 55 controller files + `rbac.types.ts` + `rbac.config.ts` + `rbac.guard.ts`
> **Base URL:** `http://localhost:3001/api/v1` (dev)
> **All routes are relative to `/api/v1/`**
> **Last audited:** 2026-07-22

---

## Role Definitions (UserRole enum — from `rbac.types.ts`)

| Role | Description | Default Dashboard |
|------|-------------|-------------------|
| `SUPER_ADMIN` | Full system access | /admin/dashboard |
| `CEO` | Executive access | /executive/dashboard |
| `CTO` | Engineering lead | /cto/dashboard |
| `COO` | Operations executive | /executive/dashboard |
| `OPERATIONS_HEAD` | Operations manager | /executive/dashboard |
| `CFO` | Finance executive | /finance/dashboard |
| `CHRO` | Chief HR Officer | /hr/dashboard |
| `HR` | HR staff | /hr/dashboard |
| `FINANCE` | Finance staff | /finance/dashboard |
| `MANAGER` | People manager | /employee/dashboard |
| `TEAM_LEAD` | Team lead | /employee/dashboard |
| `EMPLOYEE` | Regular employee | /employee/dashboard |
| `IT` | IT staff | /admin/dashboard |
| `CEM` | Client Engagement Manager | /cem/dashboard |
| `OM` | Operations Manager | /om/dashboard |
| `OE` | Operations Executive | /oe/dashboard |
| `CRM` | CRM staff | /crm/dashboard |

---

## Permission System (from `packages/types/src/rbac.types.ts`)

### `Permission` enum — what each role has:

| Permission | EMPLOYEE | MANAGER | TEAM_LEAD | HR | CHRO | FINANCE | CFO | CEO | CTO | COO | OPERATIONS_HEAD | IT | CEM | OM | OE | CRM | SUPER_ADMIN |
|-----------|----------|---------|-----------|-----|------|---------|-----|-----|-----|-----|-----------------|----|-----|----|----|-----|-------------|
| READ_OWN_PROFILE | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | — | — | — | — | — | — | — | ✅ |
| WRITE_OWN_PROFILE | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | — | — | — | — | — | — | — | ✅ |
| READ_EMPLOYEES | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| WRITE_EMPLOYEES | — | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — | — | ✅ |
| READ_TEAM_PROFILES | — | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| READ_AUDIT | — | — | — | ✅ | — | — | — | ✅ | ✅ | — | — | — | — | — | — | — | ✅ |
| APPROVE_FIELD_REQUESTS | — | — | — | — | — | — | — | ✅ | — | — | ✅ | — | — | ✅ | — | — | — |
| MANAGE_PROJECTS | — | — | — | — | — | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| ACCESS_SETTINGS | — | — | — | — | — | — | — | ✅ | — | — | — | — | — | — | — | — | — |
| READ_PAYROLL | — | — | — | — | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — | ✅ |
| ACCESS_CEM | — | — | — | — | — | — | — | ✅ | — | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ |

> **Note:** `READ_OWN_PROFILE` and `WRITE_OWN_PROFILE` are universally granted to ALL roles by the RBAC service (`rbac.service.ts` line 10–12 and `hasPermission` line 22). This means any authenticated user can access own-profile guarded routes.

---

## 1. Auth

**Prefix:** `/auth` | **Guards:** `ThrottlerGuard` on all | No RBAC guard — public login flow

| Method | Path | Roles | Rate Limit | Body / Query | Description |
|--------|------|-------|------------|--------------|-------------|
| POST | /auth/login | None (public) | 50 req / 5 min | `{ email, password }` | Step 1. Validates credentials. Returns MFA challenge or sets JWT+refreshToken cookies. Captures IP + User-Agent. |
| POST | /auth/mfa | None (public) | 5 req / 5 min | `{ challengeId, otp }` (MfaVerifyDto) | Step 2. Verifies HOTP (email) or TOTP. On success: sets `token` cookie (1 day) + `refreshToken` cookie (7 days). |
| POST | /auth/device/trust | None (public) | Default | `{ challengeId }` (TrustDeviceDto) | Trust unknown device from security alert email link. |
| POST | /auth/refresh | refreshToken cookie | Default | — (reads `refreshToken` cookie) | Silently rotate both cookies. No body needed. |
| POST | /auth/logout | JWT cookie required | Default | — | Clears cookies, revokes session from Redis, blacklists JTI. |
| GET | /auth/sessions | JWT cookie required | Default | — | Returns all active sessions for current user. |
| POST | /auth/sessions/:jti/revoke | JWT cookie required | Default | `{ jti }` | Force-logout a specific device session. |

**Cookie names set on login:**
| Cookie | TTL | Flags |
|--------|-----|-------|
| `token` | 1 day (86400000ms) | `HttpOnly, Secure (prod), SameSite=Strict` |
| `refreshToken` | 7 days | `HttpOnly, Secure (prod), SameSite=Strict` |

---

## 2. Profile

**Prefix:** `/profile` | **Guards:** `JwtAuthGuard`, `RbacGuard`, `AuditInterceptor`

| Method | Path | Permission Check | Who Can Access | Body | Description |
|--------|------|-----------------|----------------|------|-------------|
| GET | /profile/me | `READ_OWN_PROFILE` + `PROFILE_READ` | **ALL roles** (universal grant) | — | Own full profile: name, designation, dept, leave balance, attendance summary, bank details (decrypted). |
| PUT | /profile/me | `WRITE_OWN_PROFILE` | **ALL roles** (universal grant) | `UpdateProfileDto` | Update own profile. PII (bank, phone, Aadhaar, PAN) encrypted AES-256-GCM before save. |
| POST | /profile/change-password | `WRITE_OWN_PROFILE` | **ALL roles** (universal grant) | `{ currentPassword, newPassword }` | Change own password. Validates current password first. |

---

## 3. Employees

**Prefix:** `/employees` | **Guards:** `JwtAuthGuard`, `RbacGuard`, `AuditInterceptor`

| Method | Path | Permission Check | Who Can Access | Body / Query | Description |
|--------|------|-----------------|----------------|--------------|-------------|
| GET | /employees | `READ_EMPLOYEES` OR `READ_TEAM_PROFILES` | HR, CHRO, FINANCE, CFO, CEO, CTO, COO, OPERATIONS_HEAD, IT, CEM, OM, OE, CRM, SUPER_ADMIN, MANAGER, TEAM_LEAD | ?page&limit&status&departmentId&search | Paginated employee list. MANAGER/TEAM_LEAD get filtered to team via service. |
| POST | /employees | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `CreateEmployeeDto` | Quick-create employee (bypasses multi-step draft). |
| GET | /employees/org-chart | `READ_OWN_PROFILE` OR `READ_EMPLOYEES` | **ALL roles** | ?asOf=ISO_DATE | Full org-chart tree. Historical snapshot if asOf provided. |
| GET | /employees/search-directory | `READ_OWN_PROFILE` OR `READ_EMPLOYEES` | **ALL roles** | ?q=name_or_email | pg_trgm search. Min 2 chars. |
| GET | /employees/org-stats | `READ_EMPLOYEES` OR `READ_TEAM_PROFILES` | HR, CHRO, FINANCE, CFO, CEO, CTO, COO, OPERATIONS_HEAD, IT, CEM, OM, OE, CRM, SUPER_ADMIN, MANAGER, TEAM_LEAD | — | Headcount by dept/status. |
| GET | /employees/cto-team | `READ_EMPLOYEES` OR `READ_TEAM_PROFILES` | Same as org-stats | — | Engineering/CTO team members only. |
| GET | /employees/:id | `READ_EMPLOYEES` OR `READ_TEAM_PROFILES` OR `READ_OWN_PROFILE` | **ALL roles** (service enforces visibility) | — | Full employee detail. Service restricts cross-team access for MANAGER/TEAM_LEAD. |
| PATCH | /employees/:id | `WRITE_EMPLOYEES` OR `WRITE_OWN_PROFILE` | HR, CHRO, SUPER_ADMIN (for any); ALL roles (for own) | `UpdateEmployeeDto` | Update employee record. |
| DELETE | /employees/:id | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | — | Soft-delete / DPDPA PII mask. |
| POST | /employees/org-chart/reassign | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `{ employeeId, newManagerId }` | Reassign manager in org hierarchy. |
| POST | /employees/onboarding/draft/step | `WRITE_EMPLOYEES` + `EMPLOYEES_UPDATE` | HR, CHRO, SUPER_ADMIN | `{ draftId, stepNumber, payload }` | Save a step in multi-step onboarding draft. |
| GET | /employees/onboarding/draft/:id | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | — | Get in-progress draft by ID. |
| POST | /employees/onboarding/draft/complete | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `{ draftId }` | Finalize draft → create employee. |

---

## 4. Attendance

**Prefix:** `/attendance` | **Guards:** `JwtAuthGuard`, `RbacGuard`

| Method | Path | Permission Check | Who Can Access | Body / Query | Description |
|--------|------|-----------------|----------------|--------------|-------------|
| GET | /attendance/today | `READ_OWN_PROFILE` + `ATTENDANCE_READ` | **ALL roles** | — | Own today: check-in time, check-out time, status (PRESENT/ABSENT/LATE/WFH). |
| POST | /attendance/punch | `WRITE_OWN_PROFILE` | **ALL roles** | `{ type: IN\|OUT, method: WEB\|MOBILE, location? }` | Clock in or out. IP logged. |
| GET | /attendance/my-logs | `READ_OWN_PROFILE` | **ALL roles** | ?page&limit&startDate&endDate | Paginated own attendance history. |
| GET | /attendance/my-kpis | `READ_OWN_PROFILE` | **ALL roles** | — | Own KPIs: on-time%, late count, absent count, avg daily hours. |
| GET | /attendance/org-reports | `READ_EMPLOYEES` | HR, CHRO, FINANCE, CFO, CEO, CTO, COO, OPERATIONS_HEAD, IT, CEM, OM, OE, CRM, SUPER_ADMIN | — | Org-wide attendance report summary. |
| GET | /attendance/summary-today | `READ_EMPLOYEES` OR `READ_TEAM_PROFILES` | All privileged + MANAGER, TEAM_LEAD | ?date&departmentId | Present/absent/late counts for today or a given date. |
| GET | /attendance/all-logs | `READ_EMPLOYEES` OR `READ_TEAM_PROFILES` | All privileged + MANAGER, TEAM_LEAD | ?page&limit&startDate&endDate&employeeId&departmentId | All attendance logs with filters. |
| GET | /attendance/export-all | `READ_EMPLOYEES` OR `READ_TEAM_PROFILES` | All privileged + MANAGER, TEAM_LEAD | ?startDate&endDate&departmentId | Download `attendance_logs.csv`. |
| GET | /attendance/team-view | `READ_TEAM_PROFILES` | MANAGER, TEAM_LEAD | ?date=ISO_DATE | Manager's team attendance view for a date. |
| GET | /attendance/regularizations | `READ_OWN_PROFILE` | **ALL roles** | — | Own regularization requests + pending approvals (service merges both). |
| POST | /attendance/regularize | `WRITE_OWN_PROFILE` | **ALL roles** | `{ date, checkIn, checkOut, reason }` | Submit an attendance regularization request. |
| PATCH | /attendance/regularizations/:id/action | `READ_OWN_PROFILE` | **ALL roles** (service validates: must be the employee's manager or HR) | `{ action: APPROVE\|REJECT }` | Approve/reject a regularization. No `WRITE_EMPLOYEES` required — manager can act on their own team. |

---

## 5. Leaves

**Prefix:** `/leaves` | **Guards:** `JwtAuthGuard`, `RbacGuard`

**Privileged roles for KPI cross-view:** HR, CHRO, MANAGER, TEAM_LEAD, CTO, CEO, COO, SUPER_ADMIN, FINANCE, CFO (hardcoded list in controller)

| Method | Path | RBAC Permission | Who Can Access | Body / Query | Description |
|--------|------|-----------------|----------------|--------------|-------------|
| GET | /leaves/kpi | `LEAVE_READ` | **ALL roles** | ?employeeId | Leave balance KPIs. Non-privileged roles can only query own employeeId. |
| GET | /leaves/my | `LEAVE_READ` | **ALL roles** | — | Own leave requests (all statuses). |
| GET | /leaves/approvals | `LEAVE_READ` | **ALL roles** | — | Pending leave approvals in the authenticated user's queue (returns empty for EMPLOYEE). |
| GET | /leaves/calendar | `LEAVE_READ` | **ALL roles** | — | Calendar data of own approved/pending leaves. |
| POST | /leaves/apply | `LEAVE_CREATE` | **ALL roles** | `{ leaveTypeId, startDate, endDate, reason, halfDay? }` | Apply for leave. employeeId from JWT only. |
| POST | /leaves/calculate | `LEAVE_READ` | **ALL roles** | Same as apply | Preview leave days without applying. |
| POST | /leaves/:id/approve | `LEAVE_APPROVE` | **ALL roles** (service checks if user is valid approver for that leave) | — | Approve a leave request. Approver ID from JWT. |
| POST | /leaves/:id/reject | `LEAVE_REJECT` | **ALL roles** (service checks approver) | `{ reason }` | Reject leave. |
| POST | /leaves/:id/cancel | `LEAVE_CREATE` | **ALL roles** | — | Cancel own pending or approved leave. |

---

## 6. WFH

**Prefix:** `/wfh` | **Guards:** `JwtAuthGuard`, `RbacGuard`
> employeeId and approverId always from JWT — never from body/query (anti-spoofing).

| Method | Path | RBAC Permission | Who Can Access | Body | Description |
|--------|------|-----------------|----------------|------|-------------|
| GET | /wfh/my | `WFH_READ` | **ALL roles** | — | Own WFH requests. |
| GET | /wfh/approvals | `WFH_READ` + `READ_TEAM_PROFILES` | MANAGER, TEAM_LEAD | — | WFH requests pending approval from current user's queue. |
| POST | /wfh/apply | `WFH_CREATE` | **ALL roles** | `{ date: ISO_DATE, reason }` | Submit WFH request. |
| POST | /wfh/:id/approve | `WFH_APPROVE` | MANAGER, TEAM_LEAD | — | Approve. approverId from JWT. |
| POST | /wfh/:id/reject | `WFH_REJECT` | MANAGER, TEAM_LEAD | `{ reason }` | Reject. |

---

## 7. Field Work Requests

**Prefix:** `/field-work-requests` | **Guards:** `JwtAuthGuard`, `RbacGuard`

| Method | Path | Permission Check | Who Can Access | Body / Query | Description |
|--------|------|-----------------|----------------|--------------|-------------|
| POST | /field-work-requests | `READ_OWN_PROFILE` | **ALL roles** | `CreateFieldWorkRequestDto` (date, purpose, location, expectedReturn, notes) | Create request. IP logged. |
| GET | /field-work-requests/my | `READ_OWN_PROFILE` | **ALL roles** | — | Own requests. |
| GET | /field-work-requests/team | `APPROVE_FIELD_REQUESTS` | CEO, OPERATIONS_HEAD, OM, SUPER_ADMIN | — | All team field-work requests for approval. |
| GET | /field-work-requests/export | `READ_OWN_PROFILE` | **ALL roles** (manager gets team, employee gets own) | ?startDate&endDate | Download CSV. |
| GET | /field-work-requests/:id | `READ_OWN_PROFILE` | **ALL roles** (service checks ownership or role) | — | Full detail of a specific request. |
| PATCH | /field-work-requests/:id | `READ_OWN_PROFILE` | **ALL roles** (own pending only) | `UpdateFieldWorkRequestDto` | Update own pending request. |
| POST | /field-work-requests/:id/approve | `APPROVE_FIELD_REQUESTS` | CEO, OPERATIONS_HEAD, OM, SUPER_ADMIN | — | Approve request. |
| POST | /field-work-requests/:id/reject | `APPROVE_FIELD_REQUESTS` | CEO, OPERATIONS_HEAD, OM, SUPER_ADMIN | `{ reason }` | Reject. |
| DELETE | /field-work-requests/:id | `READ_OWN_PROFILE` | **ALL roles** (own pending only) | — | Delete own pending. |
| GET | /field-work-requests/:id/pdf | `READ_OWN_PROFILE` | **ALL roles** (ownership + role checked) | — | Download PDF. |

---

## 8. Assets

**Three controllers in one file:** `AssetsKpiController`, `AssetsController`, `AssetRequestsController`

### 8a. Asset KPIs — `/assets/kpis` | Permission: `READ_EMPLOYEES` | Roles: HR, CHRO, FINANCE, CFO, CEO, CTO, COO, OPERATIONS_HEAD, IT, CEM, OM, OE, CRM, SUPER_ADMIN

| Method | Path | Extra RBAC | Description |
|--------|------|------------|-------------|
| GET | /assets/kpis/summary | — | Total/assigned/available counts + depreciation. Role-aware (CTO sees tech only). |
| GET | /assets/kpis/categories | `ASSETS_READ` | Count per category (LAPTOP, MONITOR, PHONE, etc.). |
| GET | /assets/kpis/financials | `ASSETS_READ` | Total value, depreciation, write-offs. Roles: `ASSET_FINANCIAL_VIEWERS` (SUPER_ADMIN, CEO, FINANCE, IT, HR, CHRO, OM). |
| GET | /assets/kpis/departments | `ASSETS_READ` | Assets distributed by department. |
| GET | /assets/kpis/trends | `ASSETS_READ` | Lifecycle trend data. Query: ?startDate&endDate&interval |

### 8b. Asset CRUD — `/assets` | Guards: JwtAuthGuard, RbacGuard

| Method | Path | Permission | Who Can Access | Body / Query | Description |
|--------|------|------------|----------------|--------------|-------------|
| GET | /assets/my | `READ_OWN_PROFILE` + `ASSETS_READ` | **ALL roles** | — | Own assigned assets (status=ASSIGNED). |
| GET | /assets | `READ_EMPLOYEES` | HR, CHRO, FINANCE, CFO, CEO, CTO, COO, OPERATIONS_HEAD, IT, CEM, OM, OE, CRM, SUPER_ADMIN | ?status&category&search&page&limit | Full asset inventory. Role-aware filtering in service. |
| GET | /assets/activity | `READ_OWN_PROFILE` | **ALL roles** | ?scope= | Activity log. Scope=own or all (privileged). |
| GET | /assets/cto/overview | `READ_EMPLOYEES` | Privileged roles | — | CTO tech asset dashboard. |
| GET | /assets/cto | `READ_EMPLOYEES` | Privileged roles | — | Legacy compat route (same as /cto/overview). |
| GET | /assets/:id | `READ_EMPLOYEES` | Privileged roles | — | Single asset detail. Service checks role visibility. |
| POST | /assets | `READ_EMPLOYEES` | IT, SUPER_ADMIN (enforced in service via `ASSET_WRITERS` group) | `CreateAssetDto` | Register new asset. |
| PATCH | /assets/:id | `READ_EMPLOYEES` | IT, SUPER_ADMIN, HR, OM (service enforced) | `UpdateAssetDto` | Update asset. |
| DELETE | /assets/:id | `READ_EMPLOYEES` | IT, SUPER_ADMIN (service enforced) | — | Decommission asset. |
| POST | /assets/:id/assign | `READ_EMPLOYEES` | IT, SUPER_ADMIN, HR, OM (service enforced) | `AssignAssetDto { employeeId, expectedReturnDate? }` | Assign to employee. |
| POST | /assets/:id/return | `READ_EMPLOYEES` | IT, SUPER_ADMIN, HR, OM (service enforced) | `{ returnedCondition? }` | Mark as returned. |

### 8c. Asset Requests — `/assets/requests` | Guards: JwtAuthGuard, RbacGuard

| Method | Path | Permission | Who Can Access | Body | Description |
|--------|------|------------|----------------|------|-------------|
| GET | /assets/requests | `READ_OWN_PROFILE` | **ALL roles** | ?status&scope | Own requests (EMPLOYEE); all pending (privileged, scope=all). |
| POST | /assets/requests | `READ_OWN_PROFILE` | **ALL roles** | `CreateAssetRequestDto` | Submit an asset request. |
| PATCH | /assets/requests/:id/om-select | `READ_EMPLOYEES` + `ASSETS_ALLOCATE` | OM role (from `RbacRolePermissionsMapping`) | `OmSelectAssetRequestDto` | OM selects which specific asset to allocate. |
| PATCH | /assets/requests/:id/ceo-approve | `READ_EMPLOYEES` + `ASSETS_ALLOCATE` | CEO (has `ASSETS_ALLOCATE` via `RbacRoles.CEO`) | `RespondAssetRequestDto { approved: boolean, notes? }` | CEO final approval or rejection. |

---

## 9. Departments

### 9a. From `departments` module (prefix: `/departments`) — Guard: JwtAuthGuard, RbacGuard

| Method | Path | Permission | Who Can Access | Description |
|--------|------|------------|----------------|-------------|
| GET | /departments/dashboard | `READ_EMPLOYEES` + `DEPARTMENTS_READ` | Privileged roles | Department-level org stats. |

### 9b. From `organization` module (prefix: `/departments`) — No controller-level guard

| Method | Path | RBAC Permission | Who Can Access | Body | Description |
|--------|------|-----------------|----------------|------|-------------|
| GET | /departments | `DEPARTMENTS_READ` | HR, SUPER_ADMIN (from RbacRolePermissionsMapping) | ?page&limit | Paginated departments. |
| POST | /departments | `DEPARTMENTS_CREATE` | HR, SUPER_ADMIN | `{ name, code, managerId? }` | Create department. |
| GET | /departments/all-designations | `DESIGNATIONS_READ` | HR, SUPER_ADMIN | — | All designations. |
| GET | /departments/dashboard | `READ_EMPLOYEES` + `DEPARTMENTS_READ` | Privileged roles | — | Org dashboard stats (headcount, dept breakdown). |
| GET | /departments/:id | None (public route — no guard) | Anyone | — | Get single department by ID. |
| PATCH | /departments/:id | `DEPARTMENTS_UPDATE` | HR, SUPER_ADMIN | `UpdateDepartmentDto` | Update department. |

---

## 10. Notifications

**Prefix:** `/notifications` | **Guards:** `JwtAuthGuard`, `RbacGuard`

| Method | Path | Permission | Who Can Access | Body | Description |
|--------|------|------------|----------------|------|-------------|
| GET | /notifications | `READ_OWN_PROFILE` + `NOTIFICATIONS_READ` | **ALL roles** | — | All notifications for current user, newest first. |
| PATCH | /notifications/read-all | `READ_OWN_PROFILE` | **ALL roles** | — | Mark all as read. |
| PATCH | /notifications/:id/read | `READ_OWN_PROFILE` | **ALL roles** | — | Mark single notification as read. |
| POST | /notifications/push | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `{ employeeId, title, body, type: NotificationType }` | Manually push notification. |

> **Real-time (Socket.IO):** Notifications also pushed via `/realtime` namespace. See Section 31.

---

## 11. Documents (S3)

**Prefix:** `/documents` | **Guards:** `JwtAuthGuard`, `RbacGuard`
> Files never proxy through the API server directly (except `/upload` which strips EXIF). All access via 15-min pre-signed URLs.

| Method | Path | Permission | Who Can Access | Body / Query | Description |
|--------|------|------------|----------------|--------------|-------------|
| POST | /documents/upload-url | `READ_EMPLOYEES` | Privileged roles | `{ fileName, contentType }` | Get pre-signed S3 PUT URL. Returns `{ uploadUrl, objectKey }`. |
| GET | /documents/view-url | `READ_EMPLOYEES` | Privileged roles | ?objectKey= | Get pre-signed S3 GET URL. 15-min expiry. |
| POST | /documents/upload | `READ_EMPLOYEES` | Privileged roles | Form-data field: `file` | Direct multipart upload. EXIF stripped. Returns `{ objectKey, url }`. |

---

## 12. Compliance (DPDPA)

**Prefix:** `/compliance` | **Guards:** `JwtAuthGuard`, `RbacGuard`, `AuditInterceptor`

**`COMPLIANCE_READ` roles** (from `COMPLIANCE_ADMINS` group): SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL
**`COMPLIANCE_MANAGE` roles:** SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL

| Method | Path | RBAC Permission | Who Can Access | Body | Description |
|--------|------|-----------------|----------------|------|-------------|
| GET | /compliance/dashboard | `COMPLIANCE_READ` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | — | Stats: consent coverage%, avg erasure time, grievance officer info. |
| GET | /compliance/consents | `COMPLIANCE_READ` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | — | All ConsentLog records. |
| GET | /compliance/consents/me/status | `COMPLIANCE_READ` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | — | Has the authenticated user given onboarding PII consent? |
| POST | /compliance/consents/me | `COMPLIANCE_MANAGE` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | `{ purpose }` | Record own consent. |
| POST | /compliance/consents | `COMPLIANCE_MANAGE` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | `{ employeeId, purpose }` | Record consent on behalf of another employee. |
| PATCH | /compliance/consents/:id/revoke | `COMPLIANCE_MANAGE` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | — | Revoke a specific ConsentLog. |
| GET | /compliance/erasures | `COMPLIANCE_READ` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | — | All DataErasureRequest records. |
| POST | /compliance/erasures | `COMPLIANCE_MANAGE` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | `{ notes? }` | Create erasure request for own employee data. |
| POST | /compliance/erasures/:id/process | `COMPLIANCE_MANAGE` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | `{ action: APPROVE\|REJECT }` | Approve/reject. On APPROVE: `pii-masker.util.ts` masks PII fields. |
| GET | /compliance/grievances | `COMPLIANCE_READ` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | — | All GrievanceCase records. |
| GET | /compliance/grievances/me | `COMPLIANCE_READ` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | — | Own grievance cases. |
| POST | /compliance/grievances | `COMPLIANCE_MANAGE` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | `{ description }` | File a new grievance. |
| PATCH | /compliance/grievances/:id/resolve | `COMPLIANCE_MANAGE` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | `{ resolution }` | Resolve a grievance. |
| GET | /compliance/policies | `COMPLIANCE_READ` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | — | All CompliancePolicy records from DB. |
| GET | /compliance/reports | `COMPLIANCE_READ` | SUPER_ADMIN, HR, COMPLIANCE_OFFICER, LEGAL | — | StatutoryFiling records (PF, ESI, TDS, etc.) sorted by deadline. |

---

## 13. Audit

**Prefix:** `/audit` | **Guards:** `JwtAuthGuard`, `RbacGuard`
> **APPEND-ONLY** — Only `audit.service.ts` writes entries. This controller is read-only.

| Method | Path | Permission | Who Can Access | Query | Description |
|--------|------|------------|----------------|-------|-------------|
| GET | /audit/events | `READ_AUDIT` + `AUDIT_READ` | HR, CEO, CTO, SUPER_ADMIN | ?limit=50&offset=0 | Paginated audit events. Recommended max limit: 200. |
| GET | /audit/metrics | `READ_AUDIT` | HR, CEO, CTO, SUPER_ADMIN | — | 24h metrics: total events, breakdown by type, top actors. |

---

## 14. Dashboard

**Prefix:** `/dashboard` | **Guards:** `JwtAuthGuard`, `RbacGuard` | **Controller-level:** `READ_EMPLOYEES`

| Method | Path | RBAC Permission | Who Can Access | Description |
|--------|------|-----------------|----------------|-------------|
| GET | /dashboard/metrics | `READ_EMPLOYEES` (controller default) | HR, CHRO, FINANCE, CFO, CEO, CTO, COO, OPERATIONS_HEAD, IT, CEM, OM, OE, CRM, SUPER_ADMIN | High-level org metrics: headcount, absent today, open leaves, pending approvals. |
| GET | /dashboard/hr-overview | `DASHBOARD_VIEW` | HR, CHRO, CEO, MANAGER, EMPLOYEE, SUPER_ADMIN | Full HR dashboard: attendance, leaves, onboarding, compliance overview. |
| GET | /dashboard/headcount | `DASHBOARD_VIEW` | Same as hr-overview | Headcount by dept/role/status. |
| GET | /dashboard/attendance-summary | `DASHBOARD_VIEW` | Same | Today's org-wide attendance summary. |
| GET | /dashboard/department-attendance | `DASHBOARD_VIEW` | Same | Per-department attendance breakdown. |
| GET | /dashboard/cto-overview | `DASHBOARD_VIEW` | Same | CTO view: engineering team stats, project health, open tasks. |
| GET | /dashboard/export-report | `DASHBOARD_VIEW` | Same | Download `organisation-report-YYYY-MM-DD.csv`. |
| GET | /dashboard/cto-export | `DASHBOARD_VIEW` | Same | Download `engineering-report-YYYY-MM-DD.csv`. |
| GET | /dashboard/team-lead-overview | `READ_TEAM_PROFILES` | MANAGER, TEAM_LEAD | Team lead view: team attendance/tasks/leave status. Uses `@CurrentUser()`. |

> **`DASHBOARD_VIEW` binding** (from `RbacRolePermissionsMapping`): HR, CEO, MANAGER, EMPLOYEE, SUPER_ADMIN. Others (CTO, CHRO, etc.) have empty arrays — they access dashboards through the `READ_EMPLOYEES` controller-level guard.

---

## 15. Search

**Prefix:** `/search` | **Guards:** `JwtAuthGuard`, `RbacGuard`

| Method | Path | RBAC Permission | Who Can Access | Query | Description |
|--------|------|-----------------|----------------|-------|-------------|
| GET | /search | `DASHBOARD_VIEW` | HR, CEO, MANAGER, EMPLOYEE, SUPER_ADMIN | ?q=term&scope=employees\|tasks\|knowledge | Global full-text search. Min 2 chars required. pg_trgm GIN index. |

---

## 16. Workflows

**Prefix:** `/hr/workflows` | **Guards:** `JwtAuthGuard`, `RbacGuard`

| Method | Path | Permission | Who Can Access | Body | Description |
|--------|------|------------|----------------|------|-------------|
| GET | /hr/workflows/config | `READ_EMPLOYEES` + `WORKFLOWS_READ` | Privileged roles | — | All WorkflowConfig definitions (leave, regularization, offboarding, etc.). |
| PUT | /hr/workflows/config/:type | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `deployWorkflowSchema` | Update config by `WorkflowType`. |
| GET | /hr/workflows/kanban | `READ_EMPLOYEES` | Privileged roles | — | Kanban board of active WorkflowInstance records. |
| GET | /hr/workflows/my-approvals | `READ_OWN_PROFILE` | **ALL roles** | — | Workflow instances in the current user's approval queue. |
| PATCH | /hr/workflows/:id/status | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `{ status: WorkflowInstanceStatus }` | Force-update status (admin override). |
| POST | /hr/workflows/:id/approve | `WRITE_OWN_PROFILE` | **ALL roles** | `{ notes? }` | Approve a workflow step. Service verifies the user is an approver for that step. |
| POST | /hr/workflows/:id/reject | `WRITE_OWN_PROFILE` | **ALL roles** | `{ notes? }` | Reject a workflow step. |

---

## 17. Knowledge Base

**Prefix:** `/knowledge` | **Guards:** `JwtAuthGuard`, `RbacGuard`, `AuditInterceptor`

**Writer roles** (from `KNOWLEDGE_WRITERS` group): SUPER_ADMIN, CEO, CTO, COO, OPERATIONS_HEAD, CHRO, HR, IT

| Method | Path | Permission | Who Can Access | Body | Description |
|--------|------|------------|----------------|------|-------------|
| GET | /knowledge | `READ_OWN_PROFILE` | **ALL roles** | SearchKnowledgeDocDto (category, tag, search, etc.) | List articles. Role-based visibility applied in service. |
| POST | /knowledge | `WRITE_EMPLOYEES` + `KNOWLEDGE_CREATE` | HR, CHRO, SUPER_ADMIN (and writer group via service) | `CreateKnowledgeDocDto` | Create article. |
| GET | /knowledge/id/:id | `READ_OWN_PROFILE` | **ALL roles** | — | Get by database ID. Role-based visibility. |
| GET | /knowledge/slug/:slug | `READ_OWN_PROFILE` | **ALL roles** | — | Get by URL slug. |
| PATCH | /knowledge/:id | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `UpdateKnowledgeDocDto` | Update article. |
| DELETE | /knowledge/:id | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | — | Delete article. |
| PATCH | /knowledge/:id/publish | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `{ isPublished: boolean }` | Publish or unpublish. |
| POST | /knowledge/:id/acknowledge | `READ_OWN_PROFILE` | **ALL roles** | `{ signatureName }` | Employee acknowledges/signs a policy document. |

---

## 18. Onboarding

**Prefix:** `/onboarding` | **Guards:** `JwtAuthGuard`, `RbacGuard`

| Method | Path | Permission | Who Can Access | Body | Description |
|--------|------|------------|----------------|------|-------------|
| GET | /onboarding/dashboard | `WRITE_EMPLOYEES` + `DASHBOARD_VIEW` | HR, CHRO, SUPER_ADMIN | — | KPIs: in-progress sessions, overdue tasks, completion rate. |
| POST | /onboarding/initiate | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `initiateOnboardingSchema` (employeeId, startDate, etc.) | Start onboarding session for a new hire. |
| GET | /onboarding/me | `READ_OWN_PROFILE` | **ALL roles** | — | New hire's own session + task checklist. Returns empty if no active session. |
| POST | /onboarding/me/tasks/:taskId/submit-document | `WRITE_OWN_PROFILE` | **ALL roles** | `{ documentKey }` | Submit S3 document key for an onboarding task. |
| GET | /onboarding/:id | `READ_EMPLOYEES` | HR, CHRO, SUPER_ADMIN and privileged roles | — | Full session detail (tasks, progress, timeline). |
| PATCH | /onboarding/tasks/:taskId | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `{ isCompleted: boolean }` | HR toggles a task's completion status. |
| PATCH | /onboarding/tasks/:taskId/assignee | `WRITE_OWN_PROFILE` | **ALL roles** (IT, Finance, Employee assigned to the task) | `{ isCompleted: boolean }` | Assignee toggles own task. Service verifies identity. |
| POST | /onboarding/:id/remind | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | — | Send reminder emails for all overdue tasks in this session. |
| POST | /onboarding/:id/welcome-call | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `{ startTime, endTime }` | Schedule Zoom welcome call via `zoom.service.ts`. Sends email. |
| POST | /onboarding/:id/cancel | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | — | Cancel and close an onboarding session. |

---

## 19. Lifecycle / Offboarding

**Prefix:** `/lifecycle/offboarding` | **Guards:** `JwtAuthGuard`, `RbacGuard`, `AuditInterceptor`

| Method | Path | Permission | Who Can Access | Body | Description |
|--------|------|------------|----------------|------|-------------|
| POST | /lifecycle/offboarding | `WRITE_EMPLOYEES` + `EMPLOYEES_UPDATE` | HR, CHRO, SUPER_ADMIN | `initiateOffboardingSchema` (employeeId, lastWorkingDate, reason, type) | Initiate offboarding process. |
| GET | /lifecycle/offboarding | `READ_EMPLOYEES` | Privileged roles | `GetOffboardingQueryDto` (status, departmentId, search) | List all offboarding cases. |
| GET | /lifecycle/offboarding/:id | `READ_EMPLOYEES` | Privileged roles | — | Full offboarding case detail + checklist + interview. |
| PATCH | /lifecycle/offboarding/:id | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `updateOffboardingSchema` | Update offboarding details (last day change, notes, etc.). |
| PATCH | /lifecycle/offboarding/:id/checklist-item | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `updateChecklistItemSchema` | Update IT/Finance/HR checklist item status. |
| POST | /lifecycle/offboarding/:id/interview | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `recordInterviewSchema` | Record exit interview responses. |
| POST | /lifecycle/offboarding/:id/cancel | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `{ reason }` | Cancel the offboarding process. |
| POST | /lifecycle/offboarding/:id/finalize | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | — | Finalize: sets employee to INACTIVE, generates clearance document. |

---

## 20. Projects

**Prefix:** `/projects` | **Guards:** `JwtAuthGuard`, `RbacGuard` | **Phase:** `@RequiresPhase(1)`

`MANAGE_PROJECTS` permission holders: CEO, CTO

| Method | Path | Permission | Who Can Access | Body / Query | Description |
|--------|------|------------|----------------|--------------|-------------|
| GET | /projects | `READ_OWN_PROFILE` | **ALL roles** | ?status=ACTIVE\|COMPLETED | Own assigned/created projects. Service filters by membership. |
| POST | /projects | `MANAGE_PROJECTS` + `PROJECTS_CREATE` | CEO, CTO | `{ name, description? }` | Create project. |
| GET | /projects/:id | `READ_OWN_PROFILE` | **ALL roles** (service checks membership) | — | Detail: members, sprints, tasks. |
| PATCH | /projects/:id/complete | `MANAGE_PROJECTS` | CEO, CTO | `{ signatureName }` | Mark project complete with digital signature. |
| POST | /projects/:id/delete | `MANAGE_PROJECTS` | CEO, CTO | — | Soft-delete project. |
| POST | /projects/:id/assign | `READ_OWN_PROFILE` | **ALL roles** (service validates: CTO/MANAGER can assign) | `{ employeeId, projectRole: ProjectRole }` | Assign member to project. |
| POST | /projects/:id/release | `READ_OWN_PROFILE` | **ALL roles** (service validates) | `{ employeeId }` | Remove member from project. |
| POST | /projects/:id/sprints | `WRITE_OWN_PROFILE` | **ALL roles** (project member) | `{ name, startDate, endDate }` | Create sprint. |
| GET | /projects/:id/sprints | `READ_OWN_PROFILE` | **ALL roles** (project member) | — | List sprints. |
| PATCH | /projects/sprints/:sprintId | `WRITE_OWN_PROFILE` | **ALL roles** (project member) | Partial sprint fields | Update sprint. |

---

## 21. Tasks

### 21a. Tasks Webhook — `/tasks/webhook` (No JWT — internal only)

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | /tasks/webhook/event-task | `WebhookSignatureGuard` (HMAC) | `{ eventName, payload }` | Auto-create tasks from internal system events (e.g., onboarding started → create IT setup task). |

### 21b. Tasks CRUD — `/tasks` | Guards: JwtAuthGuard, RbacGuard

| Method | Path | Permission | Who Can Access | Body | Description |
|--------|------|------------|----------------|------|-------------|
| GET | /tasks | `READ_OWN_PROFILE` + `TASKS_READ` | **ALL roles** | — | Own assigned/created tasks. Includes `isMentioned: boolean` flag from @email comments. |
| GET | /tasks/project/:projectId | `READ_OWN_PROFILE` | **ALL roles** (project member) | — | Project tasks with `isMentioned` flag. |
| POST | /tasks | `WRITE_OWN_PROFILE` | **ALL roles** | `{ title, description, projectId, sprintId?, assigneeId?, priority, dueDate? }` | Create task. |
| PATCH | /tasks/:id | `WRITE_OWN_PROFILE` | **ALL roles** (owner/assignee) | Partial task fields | Update task details. |
| PATCH | /tasks/:id/status | `WRITE_OWN_PROFILE` | **ALL roles** (service validates) | `{ status: TaskStatus, previousStatus: TaskStatus }` | Update task status (Kanban move). |
| DELETE | /tasks/:id | `WRITE_OWN_PROFILE` | **ALL roles** (owner only, service enforces) | — | Delete task. |
| POST | /tasks/:id/comments | `READ_OWN_PROFILE` | **ALL roles** | `{ content, category? }` | Add comment. Supports @email mentions. |
| POST | /tasks/:id/mentions/read | `READ_OWN_PROFILE` | **ALL roles** | — | Mark @mention comments as read for current user. |
| POST | /tasks/:id/actions | `MANAGE_PROJECTS` | CEO, CTO | `{ type, notes? }` | Add management action log to task. |

---

## 22. Work Reports

**Prefix:** `/work-reports` | **Guards:** `JwtAuthGuard`, `RbacGuard`

`APPROVE_FIELD_REQUESTS` roles: CEO, OPERATIONS_HEAD, OM, SUPER_ADMIN
`ACCESS_CEM` roles: CEO, CEM, OM, OE, CRM, SUPER_ADMIN

| Method | Path | Permission | Who Can Access | Body | Description |
|--------|------|------------|----------------|------|-------------|
| POST | /work-reports | `READ_OWN_PROFILE` | **ALL roles** | `CreateWorkReportDto` | Submit daily/weekly work report. employeeId from JWT. |
| GET | /work-reports/me | `READ_OWN_PROFILE` | **ALL roles** | — | Own submitted reports. |
| GET | /work-reports/team | `APPROVE_FIELD_REQUESTS` OR `ACCESS_CEM` | CEO, OPERATIONS_HEAD, OM, OE, CEM, CRM, SUPER_ADMIN | — | Team reports for review. |
| GET | /work-reports/export | `APPROVE_FIELD_REQUESTS` OR `ACCESS_CEM` | Same as team | — | Export team reports as CSV. |
| GET | /work-reports/:id | `READ_OWN_PROFILE` | **ALL roles** (ownership + role checked in service) | — | Get specific report. |
| PATCH | /work-reports/:id/review | `APPROVE_FIELD_REQUESTS` OR `ACCESS_CEM` | CEO, OPERATIONS_HEAD, OM, OE, CEM, CRM, SUPER_ADMIN | `{ status: ReportStatus, rejectionReason? }` | Review/approve/reject report. |

---

## 23. Connect (1-on-1 Meetings)

**Prefix:** `/connect` | **Guards:** `JwtAuthGuard`, `RbacGuard`

| Method | Path | Permission | Who Can Access | Body / Query | Description |
|--------|------|------------|----------------|--------------|-------------|
| POST | /connect/request | `WRITE_OWN_PROFILE` | **ALL roles** | `CreateMeetRequestDto` | Request 1-on-1. Rate limit: 5 req/min. |
| GET | /connect/my-meetings | `READ_OWN_PROFILE` | **ALL roles** | — | All meetings where current user is participant. |
| GET | /connect/team-meetings | `READ_OWN_PROFILE` | **ALL roles** (service filters to team for managers) | — | Team meetings. |
| GET | /connect/quick-contacts | `READ_OWN_PROFILE` | **ALL roles** | — | Frequently messaged employees list. |
| GET | /connect/goals | `READ_OWN_PROFILE` | **ALL roles** | — | Own performance goals (for agenda pre-fill). |
| GET | /connect/availability/:employeeId | `READ_OWN_PROFILE` | **ALL roles** | ?date=ISO_DATE | Check employee's availability. |
| GET | /connect/settings | `READ_OWN_PROFILE` | **ALL roles** | — | Own Connect preferences (notification settings, availability blocks). |
| POST | /connect/settings | `WRITE_OWN_PROFILE` | **ALL roles** | `UpdateConnectSettingsDto` | Update preferences. |
| POST | /connect/:id/accept | `WRITE_OWN_PROFILE` | **ALL roles** (service verifies assignee) | — | Accept meeting request. |
| POST | /connect/:id/reschedule | `WRITE_OWN_PROFILE` | **ALL roles** | `RescheduleMeetDto` | Propose new time. |
| POST | /connect/:id/reject | `WRITE_OWN_PROFILE` | **ALL roles** | — | Reject meeting request. |
| PATCH | /connect/:id/workspace | `WRITE_OWN_PROFILE` | **ALL roles** | `{ agenda?, actionItems? }` | Live update agenda and action items. |
| PATCH | /connect/:id/status | `WRITE_OWN_PROFILE` | **ALL roles** | `{ status: MeetStatus }` | Update meeting status. |
| PATCH | /connect/:id | `WRITE_OWN_PROFILE` | **ALL roles** | `UpdateMeetDto` | Update meeting metadata. |
| DELETE | /connect/:id | `WRITE_OWN_PROFILE` | **ALL roles** (owner only) | — | Delete meeting. |
| GET | /connect/:id/notes | `READ_OWN_PROFILE` | **ALL roles** (participant) | — | Get meeting notes. |
| POST | /connect/:id/notes | `WRITE_OWN_PROFILE` | **ALL roles** (participant) | `{ content }` | Create/upsert meeting note. |
| POST | /connect/notes/:noteId/comments | `WRITE_OWN_PROFILE` | **ALL roles** | `{ content }` | Add comment to a note. |

---

## 24. CEM (Client Engagement Module)

All CEM endpoints require `ACCESS_CEM` permission.
`ACCESS_CEM` roles: **CEO, CEM, OM, OE, CRM, SUPER_ADMIN**

### 24a. CEM Leads — `/cem/leads`

| Method | Path | Body / Query | Description |
|--------|------|--------------|-------------|
| GET | /cem/leads | ?priority=High\|Medium\|Low | All leads. |
| GET | /cem/leads/pipeline | — | Pipeline view by stage (1–5). |
| GET | /cem/leads/dashboard-summary | — | KPIs: total leads, by stage, conversion rate, avg follow-up time. |
| GET | /cem/leads/:id | — | Full lead detail: follow-up log, meeting log, BANT status. |
| POST | /cem/leads | `CreateCemLeadDto` | Create new lead. |
| PUT | /cem/leads/:id/stage | `{ stage: number }` | Move lead to pipeline stage. |
| PUT | /cem/leads/:id/bant | `BantUpdateDto` | Update Budget/Authority/Need/Timeline flags. |
| PUT | /cem/leads/:id/status | `{ status }` | Update lead status. |
| POST | /cem/leads/:id/follow-ups | `AddFollowUpLogDto` | Log a follow-up action. |
| POST | /cem/leads/:id/meetings | `AddMeetingLogDto` | Log a meeting event. |
| POST | /cem/leads/:id/handoff | — | Trigger CRM handoff process (changes lead status). |
| POST | /cem/leads/:id/confirm-handoff | `{ crmOwner }` | Confirm handoff → creates `ClientLead` record in CRM. |

### 24b. CEM Follow-Ups — `/cem/follow-ups`

| Method | Path | Body / Query | Description |
|--------|------|--------------|-------------|
| GET | /cem/follow-ups | ?status&stage | All follow-up tasks with filters. |
| GET | /cem/follow-ups/summary | — | Summary: overdue count, completed today, upcoming this week. |
| POST | /cem/follow-ups | `CreateFollowUpDto` | Schedule new follow-up. |
| PUT | /cem/follow-ups/:id/outcome | `UpdateFollowUpOutcomeDto` | Log outcome of completed follow-up. |

### 24c. CEM Meetings — `/cem/meetings`

| Method | Path | Body / Query | Description |
|--------|------|--------------|-------------|
| GET | /cem/meetings | ?status&type&employee&date | All meetings. |
| POST | /cem/meetings | `CreateMeetingDto` | Create meeting record. |
| PUT | /cem/meetings/:id | `UpdateMeetingDto` | Update meeting. |
| DELETE | /cem/meetings/:id | — | Delete meeting. |

---

## 25. CRM

**Prefix:** `/crm` | **Guards:** `JwtAuthGuard`, `RbacGuard` | **Permission:** `READ_EMPLOYEES` on all routes

CRM is accessible to all roles that have `READ_EMPLOYEES`: HR, CHRO, FINANCE, CFO, CEO, CTO, COO, OPERATIONS_HEAD, IT, CEM, OM, OE, CRM, SUPER_ADMIN

### 25a. Clients — `/crm/clients`

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | /crm/clients | — | All ClientLead records in CRM pipeline. |
| GET | /crm/clients/incoming | — | Leads from CEM awaiting CRM team acceptance (status=PENDING_CRM). |
| POST | /crm/clients | `CreateClientDto` | Manually create client lead. actorId from JWT. |
| POST | /crm/clients/:id/accept | — | Accept CEM handoff. Sets status to ACTIVE. |
| POST | /crm/clients/:id/clarify | — | Request clarification from CEM team. |
| POST | /crm/clients/:id/reject | — | Reject incoming lead. |
| POST | /crm/clients/:id/transfer-to-crm | — | Move to active CRM management. |
| PUT | /crm/clients/:id/stage | `{ stage: number }` | Move to CRM pipeline stage. |
| PUT | /crm/clients/:id/health | `{ health: ON TRACK\|AT RISK\|OFF TRACK }` | Update account health. |
| POST | /crm/clients/:id/close-deal | — | Mark deal as closed/won. |
| POST | /crm/clients/:id/notes | `{ note }` | Add note to client record. |
| POST | /crm/clients/:id/calls | `{ call }` | Log a call. |
| POST | /crm/clients/:id/requirements | Requirement object | Add requirement to client. |
| PUT | /crm/clients/:id/requirements/:reqId/status | `{ status }` | Update requirement status. |
| POST | /crm/clients/:id/change-requests | Change request object | Log a change request. |
| PUT | /crm/clients/:id/change-requests/:crId/status | `{ status }` | Update change request status. |
| POST | /crm/clients/:id/attachments | `{ attachment }` | Add attachment reference (S3 key). |

### 25b. Requirements — `/crm/requirements`

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | /crm/requirements | — | All requirements across all clients. |
| POST | /crm/requirements | `CreateRequirementDto` | Create standalone requirement. |
| PUT | /crm/requirements/:id | `UpdateRequirementDto` | Update requirement. |
| PUT | /crm/requirements/:id/status | `{ status }` | Update status only. |
| DELETE | /crm/requirements/:id | — | Delete requirement. |

### 25c. Meetings — `/crm/meetings`

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | /crm/meetings | — | All CRM meetings. |
| GET | /crm/clients/:id/meetings | — | Meetings for a specific client. |
| POST | /crm/meetings | `CreateMeetingDto` | Create meeting. Generates Zoom link via `zoom.service.ts`. Sends email via AWS SES. |

### 25d. Reports — `/crm/reports`

| Method | Path | Description |
|--------|------|-------------|
| GET | /crm/activity | Recent CRM activity feed (audit-style log). |
| GET | /crm/reports/pipeline-summary | Pipeline funnel stats by stage, health, source. |
| GET | /crm/reports/lead-activity | Calls, notes, meetings over time. |

---

## 26. Reports and VDR

**Prefix:** `/reports` | **Guards:** JwtAuthGuard + RbacGuard (varies per endpoint)

| Method | Path | Permission | Who Can Access | Phase | Body | Description |
|--------|------|------------|----------------|-------|------|-------------|
| GET | /reports | `READ_EMPLOYEES` | Privileged roles | P1 | — | Recent generated reports for authenticated user. |
| GET | /reports/oe-metrics | `READ_EMPLOYEES` | Privileged roles | P1 | — | OE (Operations Executive) metrics. |
| POST | /reports/generate | `READ_EMPLOYEES` + `REPORTS_GENERATE` | Privileged roles | **P2** | `{ type, format: PDF\|CSV\|EXCEL }` | Generate report. Blocked until PHASE_2_ENABLED=true. |
| GET | /reports/:id/download | `READ_EMPLOYEES` | Privileged roles | P1 | — | Pre-signed S3 download URL for a generated report. |
| POST | /reports/vdr/generate | `READ_EMPLOYEES` | Privileged roles | P1 | `{ payload, expiresInHours }` | Create Virtual Data Room token for secure sharing. |
| GET | /reports/vdr/:token | **None (public)** | Anyone with token | P1 | — | Access VDR by token. IP + User-Agent logged. |
| GET | /reports/vdr-audit | `READ_AUDIT` | HR, CEO, CTO, SUPER_ADMIN | P1 | — | All VDR access audit records. |
| GET | /reports/vdr-audit/:token | `READ_AUDIT` | HR, CEO, CTO, SUPER_ADMIN | P1 | — | VDR audit for a specific token. |
| POST | /reports/vdr-audit/:token/revoke | `READ_AUDIT` | HR, CEO, CTO, SUPER_ADMIN | P1 | — | Revoke VDR token. |

---

## 27. Settings

**Prefix:** `/settings` | **Guards:** `JwtAuthGuard`, `RbacGuard` | **Permission:** `ACCESS_SETTINGS`

`ACCESS_SETTINGS` permission: **CEO only** (from `ROLE_PERMISSIONS` in `rbac.types.ts`)
> Note: SUPER_ADMIN gets `SETTINGS_VIEW` + `SETTINGS_MANAGE` via `RbacRolePermissionsMapping`, but NOT `ACCESS_SETTINGS` from `ROLE_PERMISSIONS`. The `@Permissions(ACCESS_SETTINGS)` guard uses `ROLE_PERMISSIONS`, so effectively only CEO passes it at the decorator level. SUPER_ADMIN accesses settings via the `SETTINGS_VIEW`/`SETTINGS_MANAGE` RBAC permissions.

| Method | Path | RBAC Permission | Who Can Access | Body | Description |
|--------|------|-----------------|----------------|------|-------------|
| GET | /settings/dashboard | `SETTINGS_VIEW` | CEO, SUPER_ADMIN | — | Admin dashboard: user counts, feature flags, health. |
| GET | /settings/permissions | `SETTINGS_VIEW` | CEO, SUPER_ADMIN | — | Current RBAC permission matrix. |
| GET | /settings/health | `SETTINGS_VIEW` | CEO, SUPER_ADMIN | — | System health: DB, Redis, queue statuses. |
| GET | /settings/policy | `SETTINGS_VIEW` | CEO, SUPER_ADMIN | — | Org policy: working hours, overtime, probation, etc. |
| PUT | /settings/policy | `SETTINGS_MANAGE` | CEO, SUPER_ADMIN | Org policy object | Update org policy. |
| GET | /settings/matrix | `SETTINGS_VIEW` | CEO, SUPER_ADMIN | — | Approval matrix configuration. |
| PUT | /settings/matrix | `SETTINGS_MANAGE` | CEO, SUPER_ADMIN | Array of matrix entries | Update approval matrix. |
| GET | /settings/org-profile | `SETTINGS_VIEW` | CEO, SUPER_ADMIN | — | Org profile: name, logo, address, GSTIN. |
| PUT | /settings/org-profile | `SETTINGS_MANAGE` | CEO, SUPER_ADMIN | Org profile object | Update org profile. |
| GET | /settings/email-templates | `SETTINGS_VIEW` | CEO, SUPER_ADMIN | — | All system email templates. |
| PUT | /settings/email-templates/:id | `SETTINGS_MANAGE` | CEO, SUPER_ADMIN | `{ subject, bodyHtml }` | Update email template. |

---

## 28. Holidays

**Prefix:** `/holidays` | **Guards:** None at controller level

| Method | Path | RBAC Permission | Who Can Access | Description |
|--------|------|-----------------|----------------|-------------|
| GET | /holidays | `EMPLOYEES_READ` (RBAC only, no JWT guard) | Anyone who passes RBAC (but no JWT guard = effectively open) | All public holidays for the current year. |

---

## 29. Succession Planning (Phase 2)

**Prefix:** `/succession` | **Guards:** `JwtAuthGuard`, `RbacGuard` | **Phase:** `@RequiresPhase(2)` — blocked until `PHASE_2_ENABLED=true`

| Method | Path | Permission | Who Can Access | Body | Description |
|--------|------|------------|----------------|------|-------------|
| GET | /succession | `READ_EMPLOYEES` + `TALENT_READ` | Privileged roles | — | All succession plans. |
| POST | /succession | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `CreateSuccessionPlanDto` | Create succession plan. |
| PATCH | /succession/:id | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `UpdateSuccessionPlanDto` | Update plan. |
| DELETE | /succession/:id | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | — | Remove plan. |
| POST | /succession/transfer-ceo | `WRITE_EMPLOYEES` | HR, CHRO, SUPER_ADMIN | `{ newCeoEmployeeId }` | Execute CEO succession transfer. |

---

## 30. Health Check

**Prefix:** `/health` | **Guards:** None (public — used by AWS ALB)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | None | Returns `{ status: ok, service: naprocs-ems-api, timestamp }`. |

---

## 31. WebSocket / Realtime

**Not HTTP — Socket.IO gateway (`/realtime` namespace)**

| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | Client → Server | Authenticates via `token` cookie. Registers employee in Redis session map. |
| `disconnect` | Client → Server | Removes session from Redis map. |
| `notification` | Server → Client | Real-time push for: leave approval/rejection, asset assignment, @mention, workflow update. |
| `attendance_update` | Server → Client | Live punch-in/out event broadcast for dashboard. |
| `workflow_update` | Server → Client | Workflow step approval/rejection broadcast. |

**Adapter:** Redis Pub/Sub via `@socket.io/redis-adapter` for multi-ECS-task horizontal scaling.

---

## 32. Webhook Endpoints

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | /tasks/webhook/event-task | `WebhookSignatureGuard` (HMAC-SHA256 signature header) | `{ eventName: string, payload: any }` | Internal webhook to auto-create tasks from system events (e.g., `ONBOARDING_STARTED` → creates IT asset setup task). |

---

## 33. Phase-Locked Stubs (P2 / P3)

These controller files exist but export nothing (`export {}`) — completely locked.

### Phase 2 — `PHASE_2_ENABLED=true` required:

| Module | Route Prefix | Planned Features |
|--------|-------------|-----------------|
| Payroll | /payroll | NEFT bank file gen, payslips, idempotent PayrollRun per (month,year) |
| Performance Reviews | /performance/reviews | Appraisal cycles, review submissions |
| Performance Goals | /performance/goals | OKRs, goal tracking |
| Performance Feedback | /performance/feedback | 360° feedback |
| Recruitment Jobs | /recruitment/jobs | Job postings (ATS) |
| Recruitment Candidates | /recruitment/candidates | Candidate pipeline |
| Recruitment Interviews | /recruitment/interviews | Interview scheduling |
| Recruitment Offers | /recruitment/offers | Offer letter generation |
| Skills | /skills | Skill inventory, assessments |
| Learning Courses | /learning/courses | LMS course library |
| Learning Enrollments | /learning/enrollments | Course enrollment tracking |
| Engagement Surveys | /engagement/surveys | Pulse surveys |
| Engagement Recognition | /engagement/recognition | Peer recognition |
| Engagement Feedback | /engagement/feedback | Continuous feedback |
| Analytics Attrition | /analytics/attrition | Attrition trends |
| Analytics Headcount | /analytics/headcount | Headcount forecasting |
| Analytics Cost | /analytics/cost | HR cost analytics |
| Analytics Reports | /analytics/reports | Advanced analytics |
| Talent | /talent | 9-box grid, talent mapping |

### Phase 3 — `PHASE_3_ENABLED=true` required:

| Module | Route Prefix | Planned Features |
|--------|-------------|-----------------|
| AI | /ai | Claude API, pgvector embeddings, AI chat assistant (OpenSearch) |

---

## 34. Security Architecture

| Concern | Implementation |
|---------|---------------|
| Authentication | JWT (15-min TTL) + HttpOnly Refresh Token cookie (7-day) |
| MFA | Email HOTP: 6-digit, 5-min TTL, stored in Redis. TOTP: `speakeasy` library (Google Authenticator). |
| Session Store | Redis with device ID. Max 3 concurrent sessions per user (`SESSION_MAX_CONCURRENT` env var). |
| Authorization Layer 1 | `JwtAuthGuard` — verifies JWT signature, extracts user + role |
| Authorization Layer 2 | `RbacGuard` — checks `@Permissions()` decorator against `ROLE_PERMISSIONS` in `rbac.types.ts` |
| Authorization Layer 3 | `RequirePermissions` — checks `@RequirePermissions()` against `RbacRolePermissionsMapping` in `rbac.config.ts` |
| Fail-Closed | Routes without `@Permissions()` decorator throw `ForbiddenException` (no silent pass-through) |
| PII Encryption | AES-256-GCM at app layer: Aadhaar, PAN, bank account, phone (`encrypt.util.ts`) |
| S3 Access | Pre-signed URLs only (15-min expiry). Exclusively generated by `document.service.ts`. |
| Audit Logging | `AuditLog` table is APPEND-ONLY. Only `audit.service.ts` writes. `AuditInterceptor` on sensitive controllers. |
| Rate Limiting | `@nestjs/throttler`: login 50/5min, MFA 5/5min, connect.request 5/1min |
| Secrets | AWS Secrets Manager — zero `.env` files with real values committed to repo |
| Network | AWS Client VPN (mutual cert auth). Private VPC. TLS 1.3 via ALB. WAF v2 (office + VPN CIDR only). No public ECS IPs. |
| Webhook Auth | HMAC-SHA256 signature verification via `WebhookSignatureGuard` |
| DPDPA | `ConsentLog` required before storing employee PII. `DataErasureRequest` → `pii-masker.util.ts` on approval. |
| Device Tracking | `Device` table: fingerprint captured on every login. Unknown device → security alert email + admin notification. |
| Unknown Role | Routes without matching `ROLE_PERMISSIONS` entry → `ForbiddenException`. |
