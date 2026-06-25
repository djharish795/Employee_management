# CEO Leave Dashboard Integration Plan

The goal is to replace the static mockup data in the CEO's Leave Dashboard with real-time, dynamic data connected perfectly to the backend API we just solidified. The CEO view acts as a "God View", allowing them to see all pending approvals across the company and execute executive overrides.

## Pending Decisions (For Later)
- How frontend authentication tokens are handled (whether an `axios` instance is already configured in `@/lib/api` or if we should use standard `fetch` with hardcoded headers initially).
- How the CEO's ID is retrieved globally on the frontend (e.g., from a Zustand store/Context) so we can fetch their specific KPIs and Approvals.

## Proposed Architecture Changes

### 1. Types & Data Structures
**File:** `apps/web/src/types/leaves.ts`
- Ensure the frontend `LeaveRequest` and `LeaveBalance` types exactly match the Prisma schema shapes we implemented in the backend (e.g., adding `approvalQueue`, `currentStep`, `totalDays`, `carriedOver`).

### 2. Dashboard Panel (KPIs & Trends)
**File:** `apps/web/src/components/modules/leaves/dashboard-panel.tsx`
- Remove `INITIAL_REQUESTS` and `INITIAL_BALANCES`.
- Update `useQuery` to call `GET /api/v1/leaves/kpi/{ceoId}`.
- Update `useQuery` to call `GET /api/v1/leaves/approvals/{ceoId}` for recent company-wide leave applications.
- Map the backend `totalLeaves`, `usedLeaves`, and `pendingLeaves` dynamically into the top 5 KPI cards.

### 3. Approvals Queue (Actioning Leaves)
**File:** `apps/web/src/components/modules/leaves/approvals-panel.tsx`
- Remove `INITIAL_REQUESTS` and local storage mutators.
- **Fetch Queue**: Change `useQuery` to hit `GET /api/v1/leaves/approvals/{ceoId}`. Because the CEO's role grants them universal visibility, this will return the entire company's pending leaves.
- **Approve Action**: Change `actionMutation` to send a `POST /api/v1/leaves/{id}/approve` request with `{ approverId: ceoId }`.
- **Reject Action**: Change `actionMutation` to send a `POST /api/v1/leaves/{id}/reject` request with `{ approverId: ceoId, reason }`.
- **Invalidate Queries**: On mutation success, `queryClient.invalidateQueries(["leaveRequests"])` to instantly refresh the queue and visually snap the UI state into alignment with the database.
