import { create } from 'zustand';

interface UiState {
  isWelcomeTourActive: boolean;
  setWelcomeTourActive: (active: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isWelcomeTourActive: true,
  setWelcomeTourActive: (active) => set({ isWelcomeTourActive: active }),
}));
