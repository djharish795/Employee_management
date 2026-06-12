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
  [UserRole.SUPER_ADMIN]: "/admin",
  [UserRole.CEO]: "/executive",
  [UserRole.CTO]: "/cto",
  [UserRole.COO]: "/executive",
  [UserRole.CFO]: "/finance",
  [UserRole.CHRO]: "/hr",
  [UserRole.HR]: "/hr",
  [UserRole.FINANCE]: "/finance",
  [UserRole.MANAGER]: "/employee",
  [UserRole.TEAM_LEAD]: "/employee",
  [UserRole.EMPLOYEE]: "/employee",
  [UserRole.IT]: "/admin",
};

export function getDashboardPathForRole(role: string): string {
  return ROLE_DASHBOARD_PATH[role as UserRole] ?? "/employee";
}
