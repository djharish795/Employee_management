import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-12345';
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Server-side role guard for Next.js 14 App Router Server Components.
 * Reads the `token` cookie, verifies the JWT, and checks the role.
 * Redirects to /login or /access-restricted if the check fails.
 *
 * Usage (in a Server Component page.tsx):
 *   await requireRole(['CEO', 'COO']);
 */
export async function requireRole(allowedRoles: string[]): Promise<{ role: string; employeeId: string | null }> {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const role = (payload.role as string)?.toUpperCase();

    if (!role) {
      redirect('/login');
    }

    if (!allowedRoles.map(r => r.toUpperCase()).includes(role)) {
      redirect('/access-restricted');
    }

    return {
      role,
      employeeId: (payload.employeeId as string) ?? null,
    };
  } catch {
    // Token is expired, tampered, or uses the wrong secret
    redirect('/login');
  }
}
