import { useAuthStore } from "@/store/auth";

export function usePermissions() {
  const role = useAuthStore((state) => state.role);

  const canViewAudit = ["SUPER_ADMIN", "CEO", "CTO", "HR"].includes(role || "");
  const canManageEmployees = ["SUPER_ADMIN", "CHRO", "HR", "IT"].includes(role || "");
  const canViewEmployeesList = [
    "SUPER_ADMIN", "CEO", "CTO", "COO", "CFO", "CHRO", "HR", 
    "FINANCE", "MANAGER", "TEAM_LEAD", "IT", "CAM", "OE", "OM"
  ].includes(role || "");
  
  const canManageLeaves = ["SUPER_ADMIN", "CEO", "CTO", "HR", "CHRO", "MANAGER", "TEAM_LEAD", "OM"].includes(role || "");
  const canManageCompliance = ["SUPER_ADMIN", "HR", "CHRO"].includes(role || "");
  const canManageSettings = ["SUPER_ADMIN", "IT"].includes(role || "");
  const canManageOrg = ["SUPER_ADMIN", "HR", "CHRO"].includes(role || "");

  // specific module overrides
  const isExecutive = ["CEO", "COO", "CFO", "CTO"].includes(role || "");
  const isAdmin = ["SUPER_ADMIN", "IT"].includes(role || "");

  return {
    role: (role || "EMPLOYEE") as any,
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
