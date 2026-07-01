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
  setTempSession: (session: TempSession | null) => void;
  setDeviceDetails: (details: DeviceDetails | null) => void;
  setAuthSession: (params: { accessToken: string; refreshToken: string; role: string; employeeId: string | null }) => void;
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
      setTempSession: (session) => set({ tempSession: session }),
      setDeviceDetails: (details) => set({ deviceDetails: details }),
      setAuthSession: ({ accessToken, refreshToken, role, employeeId }) =>
        set({ accessToken, refreshToken, role, employeeId, tempSession: null }),
      clearSession: () => {
        // Also clear cookies on logout
        if (typeof document !== "undefined") {
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        set({
          tempSession: null,
          deviceDetails: null,
          accessToken: null,
          refreshToken: null,
          role: null,
          employeeId: null,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken,
        role: state.role,
        employeeId: state.employeeId,
        deviceDetails: state.deviceDetails
      }),
    }
  )
);
