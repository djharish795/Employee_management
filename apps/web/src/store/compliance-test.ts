import { create } from "zustand";
import { ComplianceRole } from "@/types/compliance";

interface ComplianceTestState {
  activeRole: ComplianceRole;
  setActiveRole: (role: ComplianceRole) => void;
}

export const useComplianceTestStore = create<ComplianceTestState>((set) => ({
  activeRole: "COMPLIANCE_OFFICER",
  setActiveRole: (role) => set({ activeRole: role }),
}));
