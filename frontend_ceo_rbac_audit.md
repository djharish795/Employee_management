# Frontend RBAC Audit: CEO Role

## 1. Role Detection (Client-Side)
- **Source**: The role is extracted from the `/auth/login` API response (`res.role`) in `src/services/auth.service.ts` (line 28).
- **Storage Locations**:
  1. **localStorage**: Saved via Zustand persist middleware under the key `auth-storage` (`src/store/auth.ts`, line 60).
  2. **Unsecured Cookie**: Saved as a raw, unencrypted, non-HttpOnly cookie via `document.cookie = "role=${role}; path=/; max-age=86400;"` in `src/components/auth/login-form.tsx` (line 100).
- **Trust Level**: The frontend implicitly trusts these client-editable storage mechanisms without re-verifying against the server on navigation.

## 2. Route-Level Guards
- **File**: `middleware.ts`
- **Logic**: Reads the client-editable cookie: `request.cookies.get('role')?.value?.toUpperCase()`. It then restricts access to specific role namespaces (e.g., `/executive` is allowed if role maps to `/executive/dashboard`).
- **Bypass 1 (Direct Edit)**: Any user can open DevTools (Application > Cookies), change the `role` cookie to `CEO`, and the middleware will instantly grant them access to `/executive`.
- **Bypass 2 (Unprotected Modules)**: The middleware *only* enforces cross-role isolation for specific namespaces (`/admin`, `/executive`, `/cto`, `/finance`, `/hr`). It **fails to protect module paths** like `/audit`, `/employees`, `/attendance`, `/leaves`, `/compliance`, and `/settings`. Any logged-in user, regardless of role, can type `/audit` in the URL and bypass the guard entirely.

## 3. Component-Level Rendering & Client-Side Restrictions
> **WARNING**: The frontend completely ignores the `useAuthStore` session role for UI rendering across major modules. Instead, it relies on fake local states and "Test Role View" dropdowns shipped in the production bundle.

| Area | Component/File | Restriction Type | Evidence (file:line) | Bypassable? (Y/N + how) |
|---|---|---|---|---|
| **Employees** | `employees/employee-directory.tsx` | React Conditional | L273: `useState<DirectoryRole>("ADMIN")` | **Y** - Dev dropdown embedded in UI (L609) allows any user to select "CEO" or "ADMIN". |
| **Employees** | `profile/profile-header.tsx` | React Conditional | L17: `canGenerateReport = ... \|\| activeRole === "CEO"` | **Y** - Relies on parent's fake `activeRole` state. |
| **Audit** | `audit/audit-layout.tsx` | React Conditional | L29: Hides 'Security Events' if `activeRole === "CEO"` | **Y** - Uses `useAuditTestStore` which defaults to "ADMIN". Dropdown on L71 allows manual override. |
| **Settings** | `settings/workflows-panel.tsx` | React Conditional | L77: Hardcoded text "Require CEO approval" | **Y** - Purely visual copy, no backend enforcement. |
| **Leaves** | `leaves/apply-panel.tsx` | React Conditional | L320: Hardcoded "CEO approval" text | **Y** - Purely visual copy, no backend workflow engine. |
| **Org Chart** | `org-chart/reporting-panel.tsx` | React Conditional | L76: `isPrivileged = ... \|\| activeRole === "CEO"` | **Y** - Handled by `useOrgTestStore`. |
| **Compliance** | `compliance/dashboard-panel.tsx`| React Conditional | L21: `isPrivileged = [..., "CEO"].includes(activeRole)`| **Y** - Handled by `useComplianceTestStore`. |

## 4. State Management / Store Audit
- The actual session role is in `useAuthStore` (LocalStorage: `auth-storage`).
- **The Critical Flaw**: Every major module has its own local mock store (`src/store/audit-test.ts`, `attendance-test.ts`, `settings-test.ts`, `leaves-test.ts`, `compliance-test.ts`, `assets-test.ts`, `org-test.ts`) where the `activeRole` is stored in memory and **defaults to `"ADMIN"`**.
- **Impact**: Any user who navigates to an unprotected route like `/audit` or `/employees` is instantly treated as an `"ADMIN"` by the UI components. They can then manually select `"CEO"` from the "View Config" dropdowns to morph the UI. 

## 5. Data Exposure in the Frontend
- **API Fetching**: In `src/app/(dashboard)/employees/[id]/page.tsx` (L32), the frontend calls `/api/v1/employees/${id}`.
- **Exposure**: Per the backend audit, this API returns the full database object (including `aadhaar`, `pan`, `passport`, `bankAccountEnc`).
- **Frontend Masking**: The frontend maps `empData` to a `FullEmployeeProfile` object (L57-L131), entirely dropping or visually hiding the sensitive fields. 
- **Risk**: The PII is already delivered in the browser's Network Tab. The frontend's decision to not render it is irrelevant; the data is fully compromised for every employee in the system to anyone with a valid token.

## 6. Hardcoded Role Strings & Inconsistencies
- `activeRole === "CEO"` is scattered across 20+ components.
- Sometimes checked via equality (`activeRole === "CEO"`), sometimes via array inclusion (`["ADMIN", "HR", "CEO"].includes(activeRole)`).
- CEO is simultaneously treated as an all-seeing admin in some views (e.g., `org-chart/reporting-panel.tsx`) and intentionally blinded in others (e.g., `audit/security-panel.tsx` L61, where CEO is prevented from seeing raw security events).

---

## Critical Findings 🚨

> [!CAUTION]
> **High Risk: Total Decoupling of Auth from UI ("Test Mode" left in Prod)**
> **Evidence**: `src/store/*-test.ts` files and "Test Role View" dropdowns across all layouts.
> **Impact**: The UI does not use the user's actual token/role to gate features. Every module defaults to "ADMIN" state and provides a dropdown for the user to switch themselves to "CEO", "HR", etc. Because the backend has empty guards, the user can click these buttons and execute real administrative API calls successfully.

> [!CAUTION]
> **High Risk: Unprotected Module Routing**
> **Evidence**: `middleware.ts` protected route logic.
> **Impact**: The middleware protects namespace roots (`/executive`) but forgets to protect cross-cutting feature routes (`/audit`, `/compliance`, `/employees`). An entry-level employee can navigate directly to `/audit`, the local UI state will default them to `ADMIN`, and they will have full run of the module.

> [!WARNING]
> **High Risk: Client-Editable Auth Cookies**
> **Evidence**: `src/components/auth/login-form.tsx` (L100).
> **Impact**: The middleware relies on `request.cookies.get('role')`. This cookie is set by the client, is not HttpOnly, and is not cryptographically signed. Any user can change their cookie to `CEO` and bypass the namespace isolation.

> [!WARNING]
> **Medium Risk: Cosmetic Hiding of Severe PII Exposure**
> **Evidence**: `src/app/(dashboard)/employees/[id]/page.tsx` (L40-131).
> **Impact**: The frontend receives highly sensitive, encrypted database scalars (PAN, Aadhaar, Bank Details) in the JSON payload but simply chooses not to map them into the React component props. This means the frontend is actively hiding a massive backend data leak, falsely giving the impression that the UI is secure when the Network tab is bleeding data.
