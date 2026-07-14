import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface TempSession {
  email: string;
  challengeId: string;
  method: "EMAIL_OTP";
}

export interface DeviceDetails {
  location: string;
  device: string;
  time: string;
}

interface AuthState {
  tempSession: TempSession | null;
  deviceDetails: DeviceDetails | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  employeeId: string | null;
  photoUrl: string | null;
  isTeamLead: boolean;
  setTempSession: (session: TempSession | null) => void;
  setDeviceDetails: (details: DeviceDetails | null) => void;
  setAuthSession: (params: { accessToken: string; refreshToken: string; role: string; employeeId: string | null; isTeamLead?: boolean }) => void;
  setPhotoUrl: (url: string | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  tempSession: null,
  deviceDetails: null,
  accessToken: null,
  refreshToken: null,
  role: null,
  employeeId: null,
  photoUrl: null,
  isTeamLead: false,
  setTempSession: (session) => set({ tempSession: session }),
  setDeviceDetails: (details) => set({ deviceDetails: details }),
  setAuthSession: ({ accessToken, refreshToken, role, employeeId, isTeamLead = false }) =>
    set({ accessToken, refreshToken, role, employeeId, isTeamLead, tempSession: null }),
  setPhotoUrl: (url) => set({ photoUrl: url }),
  clearSession: () => {
    // Note: HttpOnly cookies are cleared by the backend /api/v1/auth/logout endpoint
    // We only clear memory here
    set({
      tempSession: null,
      deviceDetails: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      employeeId: null,
      photoUrl: null,
      isTeamLead: false,
    });
  },
}));
