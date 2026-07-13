import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Roles that may act as approvers in the Leave Approvals queue
const leaveApproverRoles = new Set(['HR', 'CHRO', 'MANAGER', 'TEAM_LEAD', 'CTO', 'SUPER_ADMIN', 'IT']);

// Roles that may view the /employees list
const employeeViewRoles = new Set(['HR', 'CHRO', 'MANAGER', 'TEAM_LEAD', 'CTO', 'CEO', 'COO', 'CFO', 'FINANCE', 'SUPER_ADMIN', 'IT']);

// All protected route prefixes (require authentication)
const protectedRoutes = [
  '/employee', '/admin', '/executive', '/cto', '/finance', '/hr',
  '/employees', '/attendance', '/leaves', '/assets', '/compliance',
  '/audit', '/onboarding', '/offboarding', '/knowledge', '/workflows',
  '/recruitment', '/payroll', '/performance', '/org-chart', '/settings',
  '/connect'
];

// Role-specific dashboard namespaces (cross-role isolation)
const roleNamespaces = ['/employee', '/admin', '/executive', '/cto', '/finance', '/hr'];

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
      // Fall through to unverified state
    }
  }

  // ─── Resolve Target Dashboard ────────────────────────────────────────────────
  let targetDashboard = '/employee/dashboard';
  if (['SUPER_ADMIN', 'IT'].includes(role)) targetDashboard = '/admin/dashboard';
  else if (['CEO', 'COO'].includes(role)) targetDashboard = '/executive/dashboard';
  else if (role === 'CTO') targetDashboard = '/cto/dashboard';
  else if (['CFO', 'FINANCE'].includes(role)) targetDashboard = '/finance/dashboard';
  else if (['CHRO', 'HR'].includes(role)) targetDashboard = '/hr/dashboard';

  const employeeStatus = request.cookies.get('employeeStatus')?.value;
  if (employeeStatus === 'ONBOARDING') {
    targetDashboard = '/employee/onboarding';
  }

  // ─── Redirect authenticated users away from /login ───────────────────────
  if (isVerified && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // ─── Enforce authentication on protected routes ───────────────────────────

  const isProtected = protectedRoutes.some(r => pathname === r || pathname.startsWith(`${r}/`));
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ─── Module-level RBAC (authenticated users only) ────────────────────────
  if (token) {
    if (employeeStatus === 'ONBOARDING' && pathname !== '/employee/onboarding' && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/employee/onboarding', request.url));
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

    // 5. Admin panel — SUPER_ADMIN and IT only
    if (pathname.startsWith('/admin') && !['SUPER_ADMIN', 'IT'].includes(role)) {
      return NextResponse.redirect(new URL('/access-restricted', request.url));
    }

    // 6. Settings - Admin & HR mostly, except own profile (but settings module is global config here)
    if (pathname.startsWith('/settings') && !['SUPER_ADMIN', 'IT', 'HR', 'CHRO'].includes(role)) {
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

    // ─── Strict cross-role namespace isolation ───────────────────────────────
    for (const ns of roleNamespaces) {
      if (pathname === ns || pathname.startsWith(`${ns}/`)) {
        if (!targetDashboard.startsWith(ns)) {
          return NextResponse.redirect(new URL(targetDashboard, request.url));
        }
      }
    }

    // ─── Root / → their respective dashboard ─────────────────────────────────
    if (pathname === '/') {
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // ─── Namespace root (e.g. /executive) → their dashboard ──────────────────
    if (pathname === '/executive' && role === 'CEO') {
       return NextResponse.redirect(new URL('/executive/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
