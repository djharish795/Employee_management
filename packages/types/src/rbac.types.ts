export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  CEO = "CEO",
  CTO = "CTO",
  COO = "COO",
  OPERATIONS_HEAD = "OPERATIONS_HEAD",
  CFO = "CFO",
  CHRO = "CHRO",
  HR = "HR",
  FINANCE = "FINANCE",
  MANAGER = "MANAGER",
  TEAM_LEAD = "TEAM_LEAD",
  EMPLOYEE = "EMPLOYEE",
  IT = "IT",
  CAM = "CAM",
}

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "/admin/dashboard",
  [UserRole.CEO]: "/executive/dashboard",
  [UserRole.CTO]: "/cto/dashboard",
  [UserRole.COO]: "/executive/dashboard",
  [UserRole.OPERATIONS_HEAD]: "/executive/dashboard",
  [UserRole.CFO]: "/finance/dashboard",
  [UserRole.CHRO]: "/hr/dashboard",
  [UserRole.HR]: "/hr/dashboard",
  [UserRole.FINANCE]: "/finance/dashboard",
  [UserRole.MANAGER]: "/employee/dashboard",
  [UserRole.TEAM_LEAD]: "/team-lead/dashboard",
  [UserRole.EMPLOYEE]: "/employee/dashboard",
  [UserRole.IT]: "/admin/dashboard",
  [UserRole.CAM]: "/cam/scheduler",
};

export function getDashboardPathForRole(role: string): string {
  return ROLE_DASHBOARD_PATH[role as UserRole] ?? "/employee/dashboard";
}

export enum Permission {
  READ_EMPLOYEES = "READ_EMPLOYEES",
  WRITE_EMPLOYEES = "WRITE_EMPLOYEES",
  READ_TEAM_PROFILES = "READ_TEAM_PROFILES",
  READ_OWN_PROFILE = "READ_OWN_PROFILE",
  WRITE_OWN_PROFILE = "WRITE_OWN_PROFILE",
  READ_AUDIT = "READ_AUDIT",
}
