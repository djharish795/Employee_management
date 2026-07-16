import { create } from "zustand";
import { SettingsRole } from "@/types/settings";

interface SettingsTestState {
  activeRole: SettingsRole;
  setActiveRole: (role: SettingsRole) => void;
}

export const useSettingsTestStore = create<SettingsTestState>((set) => ({
  activeRole: "SUPER_ADMIN",
  setActiveRole: (role) => set({ activeRole: role }),
}));
