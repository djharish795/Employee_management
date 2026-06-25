import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Role → home dashboard mapping
const roleDashboardMap: Record<string, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  IT:          '/admin/dashboard',
  CEO:         '/executive/dashboard',
  COO:         '/executive/dashboard',
  CTO:         '/cto/dashboard',
  CFO:         '/finance/dashboard',
  FINANCE:     '/finance/dashboard',
  CHRO:        '/hr/dashboard',
  HR:          '/hr/dashboard',
  MANAGER:     '/employee/dashboard',
  TEAM_LEAD:   '/employee/dashboard',
  EMPLOYEE:    '/employee/dashboard',
};

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
];

// Role-specific dashboard namespaces (cross-role isolation)
const roleNamespaces = ['/employee', '/admin', '/executive', '/cto', '/finance', '/hr'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through Next.js internals and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const rawRole = request.cookies.get('role')?.value?.toUpperCase() ?? '';
  const role = rawRole || 'EMPLOYEE';

  // ─── Redirect authenticated users away from /login ───────────────────────
  if (token && pathname.startsWith('/login')) {
    const target = roleDashboardMap[role] ?? '/employee/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // ─── Enforce authentication on protected routes ───────────────────────────
  const isProtected = protectedRoutes.some(r => pathname === r || pathname.startsWith(`${r}/`));
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ─── Module-level RBAC (authenticated users only) ────────────────────────
  if (token) {
    const targetDashboard = roleDashboardMap[role] ?? '/employee/dashboard';

    // 1. Leave Approvals — only approver roles (HR, CHRO, MANAGER, CTO, SUPER_ADMIN)
    //    CEO is excluded — CEO sees read-only summary only on their Executive Dashboard
    if (pathname.startsWith('/leaves/approvals')) {
      if (!leaveApproverRoles.has(role)) {
        return NextResponse.redirect(new URL('/access-restricted', request.url));
      }
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
    const isEmployeeWrite =
      pathname.startsWith('/employees/add') ||
      !!pathname.match(/^\/employees\/[^/]+\/edit/);
    if (isEmployeeWrite && !['HR', 'CHRO', 'SUPER_ADMIN', 'IT'].includes(role)) {
      return NextResponse.redirect(new URL('/access-restricted', request.url));
    }

    // 5. Admin panel — SUPER_ADMIN and IT only
    if (pathname.startsWith('/admin') && !['SUPER_ADMIN', 'IT'].includes(role)) {
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
    const nsRoot = targetDashboard.split('/dashboard')[0];
    if (nsRoot && pathname === nsRoot) {
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
