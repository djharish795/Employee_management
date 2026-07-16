import { create } from "zustand";
import { OrgRole } from "@/types/org-chart";

interface OrgTestState {
  activeRole: OrgRole;
  setActiveRole: (role: OrgRole) => void;
}

export const useOrgTestStore = create<OrgTestState>((set) => ({
  activeRole: "ADMIN",
  setActiveRole: (role) => set({ activeRole: role }),
}));
