# Endpoints & Web Cache Security Audit Plan

I have deeply analyzed the codebase specifically hunting for "IDOR" (Insecure Direct Object Reference) vulnerabilities, role escalation logic, and caching leaks. 

While `middleware.ts` effectively blocks cross-role screen jumping on the frontend, several severe vulnerabilities exist in the backend APIs. If an attacker bypasses the frontend and sends forged HTTP requests (using Postman, or Inspect Mode Network tab), they can manipulate parameters to act as other users.

## Cache Stealing Vulnerability
Currently, the backend API does not instruct browsers to destroy sensitive JSON responses from their memory/disk cache. An attacker with physical access to an employee's machine (or a malicious proxy) could extract Aadhaar/PAN data from the browser cache even after the user logs out. 

## IDOR Vulnerability in Leave Management
`leaves.controller.ts` is vulnerable to IDOR. `applyLeave` accepts `employeeId` in the request body, and `approveLeave` accepts `approverId` in the body. An employee could forge a POST request, inject the CEO's ID as `approverId`, and instantly approve their own leaves!

## IDOR Vulnerability in Documents
`documents.controller.ts` does not verify if the requested `objectKey` belongs to the authenticated user. Anyone with standard read access can intercept another employee's Document S3 Key and request a presigned URL to view it.

## Proposed Changes (For Future Implementation)

---

### Security Middleware (Helmet & Cache-Control)
We will install `helmet` to harden HTTP headers and enforce strict `no-store` cache policies globally so sensitive JSON payloads are never written to disk.

#### [MODIFY] `apps/api/src/main.ts`
- Integrate `helmet()` globally.
- Inject `Cache-Control: no-store, max-age=0` on all `/api/v1` routes to defeat browser cache scraping.

### Leave Management Security (IDOR Remediation)
We will strip user-supplied IDs from the body and strictly enforce identification via the verified JWT token.

#### [MODIFY] `apps/api/src/modules/leaves/leaves.controller.ts`
- Refactor `applyLeave` to extract the actor's ID securely from `@CurrentUser() user`.
- Refactor `approveLeave` and `rejectLeave` to extract `approverId` from `@CurrentUser() user.employeeId` instead of `@Body('approverId')`.
- Ensure `getLeavesKPI` forces the query parameter to match `user.employeeId` unless the user has HR/Admin roles.

#### [MODIFY] `apps/api/src/modules/leaves/dto/apply-leave.dto.ts`
- Strip `employeeId` from the DTO. It must be inferred from the authenticated session, never trusted from client input.

### Documents Module (S3 URL Remediation)
We will enforce ownership checks before dispensing presigned URLs.

#### [MODIFY] `apps/api/src/modules/documents/documents.controller.ts`
- Refactor `getDownloadUrl` to cross-reference the `objectKey` against the `Employee` table (or verify the requester has global `READ_EMPLOYEES` permission). If an employee tries to access an `objectKey` that isn't attached to their profile, throw a `403 Forbidden`.
