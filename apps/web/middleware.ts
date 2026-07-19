import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ROLE_REGISTRY, getDashboardPathForRole, hasPermission, Permission, UserRole } from '@naprocs/types';
import { isPhase2Enabled } from '@naprocs/feature-flags';

// --- Role-exclusive namespace prefixes ---------------------------------------
// These are dashboard namespaces that belong to specific roles only.
// Any request to one of these prefixes will be validated against
// the user's ROLE_REGISTRY.allowedNamespaces before being allowed through.
const ROLE_EXCLUSIVE_NAMESPACES = [
  '/executive', '/admin', '/cto', '/finance', '/hr',
  '/employee', '/cam', '/oe', '/om', '/team-lead', '/crm',
];

// Roles that may act as approvers in the Leave Approvals queue
const leaveApproverRoles = new Set(['HR', 'CHRO', 'MANAGER', 'TEAM_LEAD', 'CTO', 'SUPER_ADMIN', 'IT', 'OM', 'OPERATIONS_HEAD']);

// Roles that may view the /employees list
const employeeViewRoles = new Set(['HR', 'CHRO', 'MANAGER', 'TEAM_LEAD', 'CTO', 'CEO', 'COO', 'CFO', 'FINANCE', 'SUPER_ADMIN', 'IT', 'OM', 'OPERATIONS_HEAD']);

// All protected route prefixes (require authentication)
const protectedRoutes = [
  '/employee', '/admin', '/executive', '/cto', '/finance', '/hr', '/cam',
  '/employees', '/attendance', '/leaves', '/assets', '/compliance',
  '/audit', '/onboarding', '/offboarding', '/knowledge', '/workflows',
  '/recruitment', '/payroll', '/performance', '/org-chart', '/settings',
  '/connect', '/cam', '/oe', '/om', '/team-lead', '/crm'
];

// Ensure this matches the backend JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-12345';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through Next.js internals and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  let role = 'EMPLOYEE';
  let isVerified = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload && typeof payload.role === 'string') {
        role = payload.role.toUpperCase();
        isVerified = true;
      }
    } catch (err) {
      console.warn("Invalid JWT in middleware", err);
      // Token is expired, tampered, or wrong secret — treat as unauthenticated
    }
  }

  // --- Resolve Target Dashboard ---------------------------------------------
  let targetDashboard = getDashboardPathForRole(role);

  const employeeStatus = request.cookies.get('employeeStatus')?.value;
  if (employeeStatus === 'ONBOARDING') {
    targetDashboard = '/employee/onboarding';
  }

  // --- Redirect authenticated users away from /login ------------------------
  if (isVerified && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // --- Enforce authentication on protected routes ---------------------------
  const isProtected = protectedRoutes.some(r => pathname === r || pathname.startsWith(`${r}/`));
  if (isProtected && !isVerified) {
    // Clear potentially stale/invalid cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (token) {
      // Token existed but failed verification — clear it
      response.cookies.delete('token');
    }
    return response;
  }

  // --- Module-level RBAC (verified users only) -----------------------------
  // SECURITY: Use `isVerified` not `token` — expired/tampered tokens must not
  // bypass the access control layer.
  if (isVerified) {
    if (employeeStatus === 'ONBOARDING' && pathname !== '/employee/onboarding' && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/employee/onboarding', request.url));
    }

    // --- Strict cross-role namespace isolation using ROLE_REGISTRY -----------
    // This is the authoritative check — it reads the user's allowed namespaces
    // directly from the ROLE_REGISTRY instead of a hardcoded/incomplete list.
    const registryEntry = ROLE_REGISTRY[role as UserRole];
    const allowedNamespaces: string[] = registryEntry?.allowedNamespaces ?? ['/employee'];

    const matchedExclusiveNs = ROLE_EXCLUSIVE_NAMESPACES.find(
      ns => pathname === ns || pathname.startsWith(`${ns}/`)
    );

    if (matchedExclusiveNs) {
      // Check if the user's allowed namespaces include the requested namespace
      const hasNsAccess = allowedNamespaces.some(
        ns => pathname === ns || pathname.startsWith(`${ns}/`)
      );

      if (!hasNsAccess) {
        // Hard redirect to the user's own dashboard — they have no business here
        return NextResponse.redirect(new URL(targetDashboard, request.url));
      }
    }

    // 1. Leave Approvals — only approver roles (HR, CHRO, MANAGER, CTO, SUPER_ADMIN)
    if (pathname.startsWith('/leaves/approvals') && !leaveApproverRoles.has(role)) {
      return NextResponse.redirect(new URL('/access-restricted', request.url));
    }

    // 2. Audit Log — SUPER_ADMIN only per RBAC matrix
    if (pathname.startsWith('/audit') && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/access-restricted', request.url));
    }

    // 3. Employee directory — plain EMPLOYEE role cannot access the directory
    if (pathname.startsWith('/employees') && !employeeViewRoles.has(role)) {
      return NextResponse.redirect(new URL('/access-restricted', request.url));
    }

    // 4. Employee add/edit write operations — HR, CHRO, SUPER_ADMIN, IT only
    const isEmployeeWrite = pathname.startsWith('/employees/add') || !!pathname.match(/^\/employees\/[^/]+\/edit/);
    if (isEmployeeWrite && !['HR', 'CHRO', 'SUPER_ADMIN', 'IT'].includes(role)) {
      return NextResponse.redirect(new URL('/access-restricted', request.url));
    }

    // 5. Admin panel — SUPER_ADMIN and IT only (enforced by namespace above too)
    if (pathname.startsWith('/admin') && !['SUPER_ADMIN', 'IT'].includes(role)) {
      return NextResponse.redirect(new URL('/access-restricted', request.url));
    }

    // 6. Settings - Governed by ACCESS_SETTINGS permission
    if (pathname.startsWith('/settings') && !hasPermission(role, Permission.ACCESS_SETTINGS)) {
      return NextResponse.redirect(new URL('/access-restricted', request.url));
    }

    // 7. Compliance - Manager, Finance, CTO, IT have no access to compliance dashboard per matrix
    if (pathname.startsWith('/compliance') && ['MANAGER', 'FINANCE', 'CTO', 'IT'].includes(role)) {
      return NextResponse.redirect(new URL('/access-restricted', request.url));
    }

    // 8. Attendance - Finance and IT have no access
    if (pathname.startsWith('/attendance') && ['FINANCE', 'IT'].includes(role)) {
      return NextResponse.redirect(new URL('/access-restricted', request.url));
    }

    // 9. Leaves - Finance and IT have no access
    if (pathname.startsWith('/leaves') && ['FINANCE', 'IT'].includes(role)) {
      return NextResponse.redirect(new URL('/access-restricted', request.url));
    }

    // 10. Phase 2 Gating
    const phase2Routes = ['/payroll', '/recruitment', '/performance', '/skills', '/learning', '/engagement', '/analytics', '/talent', '/succession'];
    const isPhase2Route = phase2Routes.some(r => pathname === r || pathname.startsWith(`${r}/`) || pathname.endsWith(r) || pathname.includes(`${r}/`));
    if (isPhase2Route && !isPhase2Enabled()) {
      return NextResponse.redirect(new URL('/not-available', request.url));
    }

    // --- Root / ? their respective dashboard ------------------------------
    if (pathname === '/') {
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
