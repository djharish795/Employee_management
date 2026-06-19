export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  CEO = "CEO",
  CTO = "CTO",
  COO = "COO",
  CFO = "CFO",
  CHRO = "CHRO",
  HR = "HR",
  FINANCE = "FINANCE",
  MANAGER = "MANAGER",
  TEAM_LEAD = "TEAM_LEAD",
  EMPLOYEE = "EMPLOYEE",
  IT = "IT",
}

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "/admin/dashboard",
  [UserRole.CEO]: "/executive/dashboard",
  [UserRole.CTO]: "/cto/dashboard",
  [UserRole.COO]: "/executive/dashboard",
  [UserRole.CFO]: "/finance/dashboard",
  [UserRole.CHRO]: "/hr/dashboard",
  [UserRole.HR]: "/hr/dashboard",
  [UserRole.FINANCE]: "/finance/dashboard",
  [UserRole.MANAGER]: "/employee/dashboard",
  [UserRole.TEAM_LEAD]: "/employee/dashboard",
  [UserRole.EMPLOYEE]: "/employee/dashboard",
  [UserRole.IT]: "/admin/dashboard",
};

export function getDashboardPathForRole(role: string): string {
  return ROLE_DASHBOARD_PATH[role as UserRole] ?? "/employee/dashboard";
}
