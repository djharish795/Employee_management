import { create } from 'zustand';

interface SearchState {
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  globalSearchQuery: '',
  setGlobalSearchQuery: (query: string) => set({ globalSearchQuery: query }),
}));
