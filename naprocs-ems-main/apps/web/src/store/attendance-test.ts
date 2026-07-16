import { create } from "zustand";

type AttendanceRole = "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

interface AttendanceTestState {
  activeRole: AttendanceRole;
  setActiveRole: (role: AttendanceRole) => void;
}

export const useAttendanceTestStore = create<AttendanceTestState>((set) => ({
  activeRole: "ADMIN",
  setActiveRole: (role) => set({ activeRole: role }),
}));
