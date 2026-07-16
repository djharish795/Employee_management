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
  OM = "OM",
  OE = "OE",
}

export enum SidebarType {
  CEO = "CEO",
  CAM = "CAM",
  TEAM_LEAD = "TEAM_LEAD",
  EMPLOYEE = "EMPLOYEE",
}

export const ROLE_SIDEBAR_TYPE: Record<UserRole, SidebarType> = {
  [UserRole.SUPER_ADMIN]: SidebarType.CEO,
  [UserRole.CEO]: SidebarType.CEO,
  [UserRole.CTO]: SidebarType.CEO,
  [UserRole.COO]: SidebarType.CEO,
  [UserRole.OPERATIONS_HEAD]: SidebarType.CEO,
  [UserRole.CFO]: SidebarType.CEO,
  [UserRole.CHRO]: SidebarType.CEO,
  [UserRole.HR]: SidebarType.CEO,
  [UserRole.FINANCE]: SidebarType.CEO,
  [UserRole.MANAGER]: SidebarType.CEO,
  [UserRole.TEAM_LEAD]: SidebarType.TEAM_LEAD,
  [UserRole.EMPLOYEE]: SidebarType.EMPLOYEE,
  [UserRole.IT]: SidebarType.CEO,
  [UserRole.CAM]: SidebarType.CAM,
  [UserRole.OM]: SidebarType.CAM,
  [UserRole.OE]: SidebarType.CAM,
};

export function getSidebarTypeForRole(role: string): SidebarType {
  return ROLE_SIDEBAR_TYPE[role as UserRole] ?? SidebarType.EMPLOYEE;
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
  [UserRole.OE]: "/oe/dashboard",
  [UserRole.OM]: "/om/dashboard",
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
  APPROVE_FIELD_REQUESTS = "APPROVE_FIELD_REQUESTS",
  MANAGE_PROJECTS = "MANAGE_PROJECTS",
}
