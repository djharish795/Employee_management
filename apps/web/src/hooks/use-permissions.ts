import { useAuthStore } from "@/store/auth";
import { useRbac } from "./use-rbac";
import { Permission } from "@naprocs/types";

export function usePermissions() {
  const rawRole = useAuthStore((state) => state.role);
  const role = (rawRole || "EMPLOYEE").toUpperCase();
  const { hasPermission } = useRbac();

  const canViewAudit = ["SUPER_ADMIN", "CEO", "CTO", "HR", "CHRO"].includes(role);
  const canManageEmployees = ["SUPER_ADMIN", "CHRO", "HR", "IT"].includes(role);
  const canViewEmployeesList = [
    "SUPER_ADMIN", "CEO", "CTO", "COO", "CFO", "CHRO", "HR", 
    "FINANCE", "MANAGER", "TEAM_LEAD", "IT", "CEM", "OE", "OM", "CRM"
  ].includes(role);
  
  const canManageLeaves = ["SUPER_ADMIN", "CEO", "CTO", "HR", "CHRO", "MANAGER", "TEAM_LEAD", "OM", "CRM"].includes(role);
  const canManageCompliance = ["SUPER_ADMIN", "CEO", "HR", "CHRO"].includes(role);
  const canManageSettings = hasPermission(Permission.ACCESS_SETTINGS);
  const canManageOrg = ["SUPER_ADMIN", "HR", "CHRO"].includes(role);

  // specific module overrides
  const isExecutive = ["CEO", "COO", "CFO", "CTO"].includes(role);
  const isAdmin = ["SUPER_ADMIN", "IT", "CEO"].includes(role);

  return {
    role,
    canViewAudit,
    canManageEmployees,
    canViewEmployeesList,
    canManageLeaves,
    canManageCompliance,
    canManageSettings,
    canManageOrg,
    isExecutive,
    isAdmin,
  };
}
