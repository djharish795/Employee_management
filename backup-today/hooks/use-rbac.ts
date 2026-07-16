import { useAuthStore } from "@/store/auth";
import { UserRole, Permission } from "@naprocs/types";

// Keep this synced with backend RbacService
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.EMPLOYEE]: [
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
  ],
  [UserRole.MANAGER]: [
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.READ_TEAM_PROFILES,
  ],
  [UserRole.TEAM_LEAD]: [
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.READ_TEAM_PROFILES,
  ],
  [UserRole.HR]: [
    Permission.READ_EMPLOYEES,
    Permission.WRITE_EMPLOYEES,
    Permission.READ_AUDIT,
  ],
  [UserRole.CHRO]: [
    Permission.READ_EMPLOYEES,
    Permission.WRITE_EMPLOYEES,
  ],
  [UserRole.SUPER_ADMIN]: [
    Permission.READ_EMPLOYEES,
    Permission.WRITE_EMPLOYEES,
    Permission.READ_AUDIT,
    Permission.APPROVE_FIELD_REQUESTS,
  ],
  [UserRole.FINANCE]: [
    Permission.READ_EMPLOYEES,
  ],
  [UserRole.CEO]: [
    Permission.READ_EMPLOYEES,
    Permission.READ_AUDIT,
  ],
  [UserRole.CTO]: [
    Permission.READ_EMPLOYEES,
    Permission.READ_AUDIT,
  ],
  [UserRole.COO]: [
    Permission.READ_EMPLOYEES,
  ],
  [UserRole.OPERATIONS_HEAD]: [
    Permission.READ_EMPLOYEES,
    Permission.APPROVE_FIELD_REQUESTS,
  ],
  [UserRole.CFO]: [
    Permission.READ_EMPLOYEES,
  ],
  [UserRole.IT]: [
    Permission.READ_EMPLOYEES,
  ],
  [UserRole.CAM]: [
    Permission.READ_EMPLOYEES,
  ],
  [UserRole.OM]: [
    Permission.READ_EMPLOYEES,
    Permission.APPROVE_FIELD_REQUESTS,
  ],
  [UserRole.OE]: [
    Permission.READ_EMPLOYEES,
  ],
};

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
    // Universally grant own profile read/write access (matching backend RbacService)
    if (requiredPermission === Permission.READ_OWN_PROFILE || requiredPermission === Permission.WRITE_OWN_PROFILE) {
      return true;
    }
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(requiredPermission);
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
