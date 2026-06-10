import { create } from "zustand";

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
  setTempSession: (session: TempSession | null) => void;
  setDeviceDetails: (details: DeviceDetails | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  tempSession: null,
  deviceDetails: null,
  setTempSession: (session) => set({ tempSession: session }),
  setDeviceDetails: (details) => set({ deviceDetails: details }),
  clearSession: () => set({ tempSession: null, deviceDetails: null }),
}));
