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
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  employeeId: string | null;
  photoUrl: string | null;
  isTeamLead: boolean;
  setTempSession: (session: TempSession | null) => void;
  setDeviceDetails: (details: DeviceDetails | null) => void;
  setAuthSession: (params: { accessToken: string; refreshToken: string; role: string; employeeId: string | null; isTeamLead?: boolean }) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  setPhotoUrl: (url: string | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
      updateTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setPhotoUrl: (url) => set({ photoUrl: url }),
      clearSession: () => {
        if (typeof document !== "undefined") {
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
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
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
