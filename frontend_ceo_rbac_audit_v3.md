# Frontend RBAC Audit: CEO Role (v3 - Post-Dev Fix Verification)

*Note: This audit was re-run after the development team claimed to have fixed the vulnerabilities. Analysis of the current codebase (`developer` branch) reveals that the frontend security has actually regressed.*

## 1. Role Definition & Storage
| Element | Location | Notes / Risk |
|---|---|---|
| **Auth Store** | `src/store/auth.ts` | The role is still stored in `localStorage` under the `auth-storage` key. |
| **Session Cookie** | `middleware.ts:39` | **NEW REGRESSION:** The middleware no longer even attempts to decode a JWT. It now reads the role directly from a plaintext `role` cookie (`request.cookies.get('role')`). |
| **Cookie Setter** | `login-form.tsx:102` | **REMOVED:** The frontend team removed the code that sets the token cookie, leaving a comment blaming the backend (`The backend AuthController MUST set HttpOnly...`). Currently, if the backend isn't setting it, the auth flow is broken. |

## 2. Access Map (CEO Scope)
| Component / Route | Scope | Evidence |
|---|---|---|
| **Executive Dashboard** | Full Access | `middleware.ts:45`: Routes CEO to `/executive/dashboard`. |
| **Navigation Sidebar**| Full Access | `ceo-sidebar.tsx`: Grants access to Organisation, Succession Planning, Reports. |
| **Tasks** | Global View | `NewTaskModal.tsx`: CEO sees all task types. |

## 3. Middleware / Guard Logic (STILL BROKEN)
| Guard | File | Description & Integrity |
|---|---|---|
| **Route Protection** | `middleware.ts` | The middleware explicitly notes it defers authorization, but now reads a plaintext `role` cookie. **Integrity:** Zero. |
| **Component Gates** | `usePermissions()` | Checks `useAuthStore`. **Integrity:** Zero (relies on editable localStorage). |

## 4. UI vs Backend Inconsistencies (WORSENED)
| UI Restriction | Backend Reality | Evidence |
|---|---|---|
| **Employee Management** | The dev team ran `refactor-roles.js` to explicitly **REMOVE** the CEO from `canManageEmployees` in `usePermissions.ts:7`. The UI now hides employee editing from the CEO. | **Bypassable:** The backend `RbacService` still grants `WRITE_EMPLOYEES` to the CEO. |
| **Compliance Management** | The dev team **REMOVED** the CEO from `canManageCompliance` (`usePermissions.ts:14`). The UI hides compliance admin panels. | **Bypassable:** The backend still groups the CEO into `COMPLIANCE_ADMINS`. |

*Note: The dev team attempted to "fix" CEO access by just hiding the buttons in the UI, creating a classic "Security by Obscurity" gap since the backend API still allows the actions.*

---

# Critical Findings 🚨 (Verification Results)

### [Critical] Middleware Replaced JWT with Plaintext Cookie Tampering
**Location:** `middleware.ts:39`
**Risk:** The frontend middleware previously decoded an unverified JWT to determine the user's role. The dev team "fixed" this by removing the JWT decode logic entirely. Instead, the middleware now reads a plaintext `role` cookie directly. This makes exploiting the system even easier: an attacker simply opens Chrome DevTools and types `document.cookie = "role=CEO"`. The Next.js middleware will instantly route them to the `/executive/dashboard`.

### [High] LocalStorage Role Tampering Remains Unpatched
**Location:** `src/store/auth.ts` and `src/hooks/use-permissions.ts`
**Risk:** The entire UI component gating system still relies on `useAuthStore`, which is persisted in `localStorage`. Any user can manually edit `localStorage.getItem("auth-storage")` to change their role to `"CEO"`, bypassing all frontend UI component hiding.

### [Medium] "Security By Obscurity" Worsened by Refactor
**Location:** `use-permissions.ts` vs Backend `RbacService`
**Risk:** Rather than fixing the backend to restrict the CEO's permissions, the frontend team ran a refactor script that simply deleted `"CEO"` from the allowed roles in the UI for Employee and Compliance management. This hides the buttons, but the backend API still fully permits the CEO to execute those administrative actions. This creates a dangerous disconnect where leadership assumes the CEO cannot alter compliance records because they "can't see the button," even though the underlying API access remains wide open.

**Action Required for Dev Team:**
1. **Frontend:** Do not read a plaintext `role` cookie in `middleware.ts`. Route protection must rely on an encrypted, cryptographically signed session cookie (like `iron-session` or NextAuth) that the user cannot tamper with.
2. **Frontend:** `usePermissions` must hydrate its state securely from a trusted backend `/me` endpoint on load, not blindly trust `localStorage`.
3. **Backend/Frontend Alignment:** If the CEO is not supposed to manage Compliance or edit Employee profiles, you must remove `WRITE_EMPLOYEES` and `COMPLIANCE_ADMINS` from the CEO role in the **backend** (`rbac.config.ts`), not just hide the buttons in the frontend UI.
