import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface TempSession {
  email: string;
  challengeId: string;
  method: "EMAIL_OTP" | "TOTP";
}

export interface DeviceDetails {
  location: string;
  device: string;
  time: string;
}

interface AuthState {
  tempSession: TempSession | null;
  deviceDetails: DeviceDetails | null;
  role: string | null;
  employeeId: string | null;
  photoUrl: string | null;
  isTeamLead: boolean;
  setTempSession: (session: TempSession | null) => void;
  setDeviceDetails: (details: DeviceDetails | null) => void;
  setAuthSession: (params: { role: string; employeeId: string | null; isTeamLead?: boolean; accessToken?: string; refreshToken?: string; }) => void;
  setPhotoUrl: (url: string | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tempSession: null,
      deviceDetails: null,
      role: null,
      employeeId: null,
      photoUrl: null,
      isTeamLead: false,
      setTempSession: (session) => set({ tempSession: session }),
      setDeviceDetails: (details) => set({ deviceDetails: details }),
      setAuthSession: ({ role, employeeId, isTeamLead = false }) =>
        set({ role, employeeId, isTeamLead, tempSession: null }),
      setPhotoUrl: (url) => set({ photoUrl: url }),
      clearSession: () => {
        if (typeof document !== "undefined") {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
          fetch(`${apiUrl.split('#')[0].trim()}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
        }
        set({
          tempSession: null,
          deviceDetails: null,
          role: null,
          employeeId: null,
          photoUrl: null,
          isTeamLead: false,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
