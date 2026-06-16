import { create } from "zustand";

type AssetRole = "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE" | "IT_ADMIN";

interface AssetsTestState {
  activeRole: AssetRole;
  setActiveRole: (role: AssetRole) => void;
}

export const useAssetsTestStore = create<AssetsTestState>((set) => ({
  activeRole: "IT_ADMIN",
  setActiveRole: (role) => set({ activeRole: role }),
}));
