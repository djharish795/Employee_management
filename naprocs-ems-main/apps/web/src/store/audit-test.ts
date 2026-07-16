import { create } from "zustand";
import { AuditRole } from "@/types/audit";

interface AuditTestState {
  activeRole: AuditRole;
  setActiveRole: (role: AuditRole) => void;
}

export const useAuditTestStore = create<AuditTestState>((set) => ({
  activeRole: "ADMIN",
  setActiveRole: (role) => set({ activeRole: role }),
}));
