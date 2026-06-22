import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the role to dashboard mapping
const roleDashboardMap: Record<string, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  IT: '/admin/dashboard',
  CEO: '/executive/dashboard',
  COO: '/executive/dashboard',
  CTO: '/cto/dashboard',
  CFO: '/finance/dashboard',
  FINANCE: '/finance/dashboard',
  CHRO: '/hr/dashboard',
  HR: '/hr/dashboard',
};

// Define protected route prefixes
const protectedRoutes = [
  '/employee',
  '/admin',
  '/executive',
  '/cto',
  '/finance',
  '/hr',
  '/employees',
  '/attendance',
  '/leaves',
  '/assets',
  '/compliance',
  '/audit',
  '/onboarding',
  '/offboarding',
  '/knowledge',
  '/workflows',
  '/recruitment',
  '/payroll',
  '/performance',
  '/org-chart',
  '/settings'
];

// List of all role base paths to prevent cross-role access
const roleNamespaces = [
  '/employee',
  '/admin',
  '/executive',
  '/cto',
  '/finance',
  '/hr'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value?.toUpperCase();

  // If an authenticated user tries to visit any login-related route, redirect them to their dashboard
  if (token && pathname.startsWith('/login')) {
    const targetDashboard = (role && roleDashboardMap[role]) || '/employee/dashboard';
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }
  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC for Role-Specific Dashboards
  if (token && role) {
    const targetDashboard = roleDashboardMap[role] || '/employee/dashboard';

    // Strict Cross-Role Isolation
    // If the user tries to access ANY role namespace that doesn't match their designated target, bounce them.
    for (const ns of roleNamespaces) {
      // If the current path is inside a restricted namespace...
      if (pathname === ns || pathname.startsWith(`${ns}/`)) {
        // And their target dashboard does NOT start with this namespace...
        if (!targetDashboard.startsWith(ns)) {
          // Kick them back to their authorized dashboard!
          return NextResponse.redirect(new URL(targetDashboard, request.url));
        }
      }
    }
    
    // Auto-redirect from root / to their respective dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // Auto-redirect from their namespace root (e.g., /executive) to the dashboard (e.g., /executive/dashboard)
    if (pathname === targetDashboard.split('/dashboard')[0]) {
       return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

