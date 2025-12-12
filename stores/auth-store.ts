import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LoginResponse } from "@/api/api";

import { zustandMMKVStorage } from "./storage";

type AuthData = LoginResponse["data"];

type AuthState = {
  authData: AuthData | null;
  isLoading: boolean;
  isHydrated: boolean;
};

type AuthActions = {
  setAuthData: (authData: AuthData) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setHydrated: (isHydrated: boolean) => void;
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      authData: null,
      isLoading: false,
      isHydrated: false,
      setAuthData: (authData) => set({ authData }),
      clearAuth: () => set({ authData: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({
        authData: state.authData,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const selectAuthData = (state: AuthStore) => state.authData;
export const selectAuthLoading = (state: AuthStore) => state.isLoading;
export const selectIsHydrated = (state: AuthStore) => state.isHydrated;
