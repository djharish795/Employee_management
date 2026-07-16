import { create } from "zustand";

type LeavesRole = "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

interface LeavesTestState {
  activeRole: LeavesRole;
  setActiveRole: (role: LeavesRole) => void;
}

export const useLeavesTestStore = create<LeavesTestState>((set) => ({
  activeRole: "ADMIN",
  setActiveRole: (role) => set({ activeRole: role }),
}));
