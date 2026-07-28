# OE (Operations Executive) Role — Deep Backend Security & Business-Logic Audit

**Scope:** Every backend surface an OE (`UserRole.OE`) user touches — Dashboard, Work Reports, Field Operations, Scheduler, and "My Workspace" — audited against the stated requirements:

| Area | Required behavior |
|---|---|
| Dashboard | My work reports, pending approvals, field ops shared, active field operations, recent work report details |
| Work Reports | Add a new report, send to **OM**, view own report details |
| Field Operations | Add a new request, view its status |
| Scheduler | Same as OM/CRM/CEM |
| My Workspace (Connect, Attendance, Leaves, Assets, Knowledge Base, Org Chart, Notifications) | Same as a regular employee |

Backend: `d:\emsv2\naprocs-ems` (NestJS + Prisma). Unlike CRM/CEM, **there is no dedicated `oe` module** — OE has no bespoke controller/service anywhere in `apps/api/src/modules`. A repo-wide search confirms `UserRole.OE` is never referenced by name in any service's logic (`grep -rl "UserRole.OE\b" modules` returns zero files) — OE is never explicitly special-cased anywhere; it only ever falls through generic/default branches. OE's entire backend footprint is: the shared `work-reports` module, the shared `field-work-requests` module, one mismatched "OE metrics" endpoint in `reports.controller.ts`, and the same "same as employee" shared infrastructure already audited three times over in the OM/CRM/CEM reports.

OE's legacy permission grant (`ROLE_PERMISSIONS[UserRole.OE]`) is **`READ_EMPLOYEES, ACCESS_CEM`** — identical to CRM/CEM, and it does **not** include `APPROVE_FIELD_REQUESTS`, so (correctly, per spec) OE cannot approve/reject anyone's field work requests or leaves — only submit and view their own. This report reuses the RBAC architecture documented in `om_module_bugs_backend.md` Section 0 and cross-applies findings already established in the OM/CRM/CEM reports rather than re-deriving them.

Every finding below was verified by reading the actual controller/service/DTO source.

---

## 1. Dashboard — No Backend Endpoint Exists for What the Spec Actually Asks For

**Location:** repo-wide search across `apps/api/src/modules/dashboard/`, `apps/api/src/modules/reports/`, and `apps/api/src/modules/work-reports|field-work-requests/` for anything resembling an OE-scoped aggregate

**Issue:** There is no endpoint that returns "my work reports + pending approvals + field ops shared + active field operations + recent work report details" as a single dashboard payload for OE, the way `cem-lead.service.ts`'s `getDashboardSummary()` does for CEM. The one endpoint that *sounds* purpose-built for this — `GET /reports/oe-metrics` (`reports.controller.ts:38-42` → `reports.service.ts:274-287`, `getOeMetrics()`) — actually returns unrelated, partly **hardcoded mock data**:
```ts
async getOeMetrics(): Promise<any> {
  const totalLeads = await this.prisma.clientLead.count();
  const totalMeetings = await this.prisma.meetRequest.count();
  const totalFieldWork = await this.prisma.fieldWorkRequest.count();
  const pendingFieldWork = await this.prisma.fieldWorkRequest.count({ where: { status: 'PENDING' } });

  return {
    leadReports: { totalLeads, conversionRate: totalLeads > 0 ? "24%" : "0%" },   // hardcoded percentage
    salesReports: { totalMeetings, cycleTime: "14 days" },                        // hardcoded
    revenueReports: { mrr: "$45,000", arr: "$540,000" },                          // hardcoded, not queried at all
    forecastReports: { totalFieldWork, pendingFieldWork },
  };
}
```
This computes company-wide CRM lead/meeting counts and **literal hardcoded revenue figures** (`"$45,000"`/`"$540,000"` never change no matter what's in the database), not anything about the calling OE's own work reports or field operations. It's also gated only by `Permission.READ_EMPLOYEES` (shared by 14 of 17 roles), not restricted to OE, and takes no `employeeId` parameter, so it can't be OE-scoped even in principle.

**Why it's a problem:** The frontend has nothing coherent to call for the described dashboard. It must instead assemble the view client-side from `GET /work-reports/me` and `GET /field-work-requests/my` (both of which do work correctly for OE — see Sections 2–3), computing "pending approvals" and "recent"/"active" groupings itself by filtering on `status`/dates. That's workable, but fragile: there's no server-side guarantee the two lists stay consistent, no single round-trip, and the one endpoint that looks like it exists for this purpose (`oe-metrics`) is actively misleading — anyone reading the API surface would reasonably assume it's the OE dashboard feed and be wrong. Additionally, since `mrr`/`arr`/`conversionRate`/`cycleTime` are hardcoded, any dashboard variant that does happen to render these fields displays permanently false numbers.

**Safe solution:** Either repurpose `getOeMetrics()` into what its name implies (drop the CRM-lead/meeting/revenue fields entirely, add `employeeId`-scoped work-report/field-work-request aggregates: `myReportsCount`, `pendingApprovalsCount` (reports/field-ops with `status: 'PENDING'` for this employee), `activeFieldOpsCount`, `recentReports`), or add a new dedicated `GET /dashboard/oe-overview` endpoint following the pattern already used correctly for CEM (`getDashboardSummary()`). Rename/remove `oe-metrics` if it's serving a different (CRM-forecast) purpose so its name stops implying OE ownership.

---

## 2. Work Reports — Correctly Scoped for OE's Own Use; Two Small Hygiene Issues

**Location:** `apps/api/src/modules/work-reports/work-reports.controller.ts`, `.service.ts`

**Verified correct:** `POST /work-reports` (create), `GET /work-reports/me` (`getMyReports`), and `GET /work-reports/:id` (`getReportById`) are all gated by the universal `Permission.READ_OWN_PROFILE`, correctly reachable by OE, and properly scoped:
- `getMyReports()` filters `where: { employeeId }` — an OE only ever sees their own submitted reports.
- `getReportById()` requires the caller to be the report's `employeeId`, its `reviewerId`, or one of a small admin-role list — an OE cannot view another employee's report by guessing its ID.
- `create()` derives `employeeId` from the JWT (`req.user.employeeId`), never from the request body — not spoofable.

OE is correctly **excluded** from `getTeamReports()`/`exportTeamCsv()`/`reviewReport()` in practice: the controller gate (`@Permissions(Permission.APPROVE_FIELD_REQUESTS, Permission.ACCESS_CEM)`) does technically admit OE (OE holds `ACCESS_CEM` — this is the same over-broad-gate problem already documented as `om_module_bugs_backend.md` Finding 5.5, which explicitly names OE), but the *service*-level `isGlobalAdmin` check in `getTeamReports()`/`reviewReport()` does **not** include `OE` in its role list, and OE is essentially never recorded as anyone's `reviewerId` — so in practice OE hits these endpoints and gets an empty result / a `ForbiddenException` on `reviewReport`, not real access to other employees' reports. This is the same "controller gate too broad, service layer saves it" pattern noted for CRM/CEM; no new OE-specific exploit was found here, but the underlying controller-gate bug (Finding 5.5) should still be fixed — its blast radius includes OE by name.

### Finding 2.1 (minor) — Debug `console.log` in `getTeamReports` logs identity data to stdout on every call

**Location:** `work-reports.controller.ts:33`
```ts
console.log("Fetching team reports for reviewerId:", reviewerId, "role:", role);
```

**Why it's a problem:** Low severity, but this is a leftover debug statement that writes the caller's `employeeId`/`role` to server logs on every hit of this endpoint (including from OE, per the over-broad gate above) — unnecessary log noise and a minor identity-data hygiene issue in a production path.

**Safe solution:** Remove the `console.log`, or replace it with a structured `Logger.debug()` call gated behind the app's normal log-level configuration.

### Finding 2.2 (minor) — `getTeamReports()` and `getReportById()` use two different, inconsistent "global admin" role lists in the same service

**Location:** `work-reports.service.ts` — `getTeamReports()`'s `isGlobalAdmin` includes `CEO, SUPER_ADMIN, OPERATIONS_HEAD, CEM, OM, CHRO, HR`; `getReportById()`'s `isGlobalAdmin` includes only `OM, SUPER_ADMIN, CEO, OPERATIONS_HEAD` (no `CEM`/`CHRO`/`HR`)

**Why it's a problem:** Not exploitable by OE specifically (OE is in neither list), but it's an inconsistency worth flagging while in this file: a CHRO/HR/CEM user can list every employee's work reports via `getTeamReports()` but would be denied viewing one specific report directly by ID via `getReportById()` unless they're also the `reviewerId` — the two access-control lists for what should be the same conceptual privilege level don't agree with each other.

**Safe solution:** Define a single `WORK_REPORT_ADMINS` role group (in `rbac.config.ts`, alongside `RbacGroups`) and use it consistently in both methods, rather than two independently-maintained inline arrays.

**Also applies to OE from the OM/CRM/CEM reports (not re-derived here):**
- The unenforced `reportingManagerId`-routing-to-OM problem (`om_module_bugs_backend.md` Finding 5.3, `crm_module_bugs_backend.md` Section 5) applies to OE identically — `work-reports.service.ts`'s `create()` has zero role-based branching, so an OE's report reviewer is whatever `reportingManagerId` happens to be, with no verification that it's actually an OM.
- CSV formula-injection risk (`om_module_bugs_backend.md` Finding 5.4) — an OE-submitted report `title` is exactly the kind of attacker-controlled input that could carry an injection payload into whichever OM later exports the team CSV.

---

## 3. Field Operations — Correctly Scoped and Well-Implemented for OE's Own Use

**Location:** `apps/api/src/modules/field-work-requests/field-work-requests.controller.ts`, `.service.ts`

**Verified correct (this is the best-implemented piece of OE's entire backend surface):**
- `create()`, `getMyRequests()`, `getRequestDetails()`, `update()`, `delete()`, `downloadPdf()` are all gated by the universal `READ_OWN_PROFILE` and correctly reachable by OE.
- `getMyRequests()` scopes to the caller's own `employeeId`.
- `getRequestDetails()` requires the caller to be the request's owner, its `approverId`, or one of `OPERATIONS_HEAD/OM/CEM` — an OE cannot view another employee's field-work request by ID.
- `update()`/`delete()` both re-verify `request.employeeId === employeeId` before allowing any change, and correctly restrict which state transitions are legal (only `DRAFT` requests can be edited; only `DRAFT`/`CANCELLED` requests can be deleted; `PENDING`/`APPROVED`/`REJECTED` requests are preserved for audit history and can't be deleted).
- `approve()`/`reject()` are gated by `Permission.APPROVE_FIELD_REQUESTS`, which OE does not hold — OE is correctly blocked from approving/rejecting anyone's request, including their own (self-approval is also explicitly blocked in the service regardless of role).

**One residual issue, already documented and cross-referenced rather than re-derived:** when an OE's request transitions `DRAFT → PENDING` (in `update()`, line ~231: `updateData.approverId = await this.resolveApproverId(employeeId)`), the resolved approver depends on `resolveApproverId()`'s generic "Default Employee / OE" branch, which just trusts `employee.reportingManagerId` — with no role check confirming that manager is actually an OM. This is the same fragility documented in `cem_module_bugs_backend.md` Section 9 (where the analogous bug is worse for CEM, which is actively misrouted to the CEO tier) and `crm_module_bugs_backend.md` Section 5. For OE specifically, the code doesn't misroute it the way it does for CEM — it just doesn't verify the routing is correct, relying entirely on org-chart data being accurate.

**Safe solution:** No new fix needed beyond what's already scoped in the CEM/CRM reports — fixing `resolveApproverId()` to explicitly verify (not just assume) that a rank-and-file requester's resolved approver has role `OM` will close this gap for OE at the same time.

---

## 4. Scheduler ("same as OM, CRM, CEM") — Not Implemented, Same Gap as Every Other Role

**Location:** same repo-wide search as `crm_module_bugs_backend.md` Section 6 / `cem_module_bugs_backend.md` Section 10 — no calendar/daily-work-log model, controller, or service exists anywhere in the codebase.

**Issue/Why it's a problem:** Identical situation already documented twice — this is a stated requirement shared across four roles now (OM, CRM, CEM, OE) with zero corresponding backend implementation.

**Safe solution:** Same recommendation as the prior two reports — build one shared `DailyWorkLog` model and endpoint set (`PUT /scheduler/:date` to upsert the day's entry, a range-fetch endpoint to view history), reusable by all four roles rather than building it per-role. Given four separate roles now expect this exact feature, this should be prioritized as a single shared implementation rather than deferred further.

---

## 5. "Same as Employee" Modules (Connect, Attendance, Leaves, Assets, Knowledge Base, Org Chart, Notifications)

OE's permission profile (`READ_EMPLOYEES` + `ACCESS_CEM`) is identical to CRM's and CEM's, so every cross-application note already made in `crm_module_bugs_backend.md` Section 8 and `cem_module_bugs_backend.md` Section 11 applies to OE verbatim:

- **Attendance:** `om_module_bugs_backend.md` Finding 2.1 (org-wide `org-reports`/`all-logs`/`export-all` reachable via bare `READ_EMPLOYEES`) and Finding 2.3 (no geofencing) apply to OE exactly as to OM/CRM/CEM. Finding 2.2 (self-approval) does not apply — OE isn't in `ATTENDANCE_ADMINS`.
- **Leaves:** OE is explicitly handled in the same `OE/CRM/CEM/CAM` branch of `determineQueue()` — routes to `OM` then `HRE`, correctly matching "same as employee" (ops-team) behavior. `om_module_bugs_backend.md` Finding 1.1 (any OM approving if `reportingManagerId` is unset) is the one relevant residual risk.
- **Assets:** OE is excluded from both `ASSET_WRITERS` and `ASSET_PRIVILEGED` — correctly restricted to employee-level, own-holdings-only visibility.
- **Knowledge Base / Connect:** every finding in the OM report's Sections 3–4 applies identically — none of it treats OE differently from any other employee.
- **Org Chart / Employees:** the PII-leak findings (`om_module_bugs_backend.md` 6.1/6.2) apply directly — OE is one of the 14 `READ_EMPLOYEES`-holding roles named there.
- **Tasks:** `tasks.service.ts`'s `isCamOeOm = ['CEM', 'OE', 'OM', 'CRM'].includes(user.role)` bypass (documented in `crm_module_bugs_backend.md` Section 7) explicitly includes `OE` too — same open question about what task-creation access this role should really have, and the same project-task third-party-assignment gap.
- **Notifications:** no OE-specific issue found in the code paths read for this report.

---

## Priority Remediation Checklist

**Build (missing/misleading, not hardening gaps):**
1. Replace or repurpose `GET /reports/oe-metrics` — it currently returns hardcoded revenue figures and unrelated CRM-pipeline counts instead of anything about the calling OE's work reports or field operations (Section 1).
2. Build the shared Scheduler/`DailyWorkLog` feature — now needed by four roles (OM, CRM, CEM, OE) and implemented for none of them (Section 4).

**Fix soon (hygiene / consistency, low individual severity):**
3. Remove the debug `console.log` in `work-reports.controller.ts:33` (2.1).
4. Unify the two divergent `isGlobalAdmin` role lists inside `work-reports.service.ts` into a single shared `RbacGroups` constant (2.2).

**Cross-apply from prior audits (no new work beyond what's already scoped there):**
5. `om_module_bugs_backend.md` Finding 5.5 (`ACCESS_CEM` over-reach into Work Report team/export/review endpoints) explicitly names OE — fixing it at the source resolves OE's technically-too-broad controller gate here too.
6. The `resolveApproverId()` routing-to-OM fix scoped in `cem_module_bugs_backend.md` Section 9 / `crm_module_bugs_backend.md` Section 5 should verify the resolved approver's role for OE's field-work-requests and work reports at the same time.
7. Attendance org-wide visibility (`om_module_bugs_backend.md` 2.1) and employees PII exposure (6.1/6.2) resolve for OE automatically once fixed at their source.
8. Section 0's dual-permission-system cleanup remains the single highest-leverage fix underlying the shared exposure across all four operations-tier roles audited so far (OM, CRM, CEM, OE).

---

## Summary Across All Four Operations-Tier Audits

With OM, CRM, CEM, and OE now all audited, a few patterns recur consistently enough to call out once at the top level for whoever triages these four reports together:

- **The `@RequirePermissions`/v2 RBAC system is dead code everywhere** — every module reviewed has at least one endpoint decorated with it, and none of it does anything.
- **`ACCESS_CEM` is used as a catch-all "operations-tier" permission** across Assets, Work Reports, and Dashboard, but it's held by four roles with meaningfully different intended authority (CEM/OM manage; OE/CRM don't) — every place it gates something manager-level is a latent over-grant to OE/CRM.
- **Ownership/ hierarchy scoping is inconsistently applied**: Field Work Requests and (mostly) Work Reports do it correctly; the CRM and CEM modules largely don't (see those two reports' Section 1/1-2 findings); OE's own surfaces are clean because they're thin wrappers around the well-implemented Field Work Requests module.
- **Four separate roles now expect an identical, unimplemented Scheduler feature** — worth building once, centrally, rather than as a per-role afterthought.
