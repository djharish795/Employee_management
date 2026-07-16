import { useAuthStore } from "@/store/auth";
import { UserRole, Permission, hasPermission as checkPermission } from "@naprocs/types";

export function useRbac() {
  const storeRole = useAuthStore((state) => state.role);
  
  // Read from cookie as fallback for SSR/hydration matching
  const getCookieRole = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )role=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const role = (storeRole || getCookieRole())?.toUpperCase() as UserRole | null;

  const hasPermission = (requiredPermission: Permission): boolean => {
    if (!role) return false;
    return checkPermission(role, requiredPermission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(perm => hasPermission(perm));
  };

  return {
    role,
    hasPermission,
    hasAnyPermission,
  };
}
