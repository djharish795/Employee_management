import { create } from "zustand";
import { OrgRole } from "@/types/org-chart";

import { useAuthStore } from "./auth";

interface OrgTestState {
  activeRole: OrgRole;
  setActiveRole: (role: OrgRole) => void;
}

export const useOrgTestStore = create<OrgTestState>((set) => {
  const getInitialRole = (): OrgRole => {
    // Only attempt to read from auth store if we are in a client environment
    if (typeof window !== "undefined") {
      const authState = useAuthStore.getState();
      const role = authState?.role;
      if (role && ["ADMIN", "HR", "CEO", "CTO", "MANAGER", "EMPLOYEE"].includes(role)) {
        return role as OrgRole;
      }
    }
    return "EMPLOYEE";
  };

  return {
    activeRole: getInitialRole(),
    setActiveRole: (role) => set({ activeRole: role }),
  };
});
