import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandMMKVStorage } from "./storage";

type FcmState = {
  token: string | null;
  platform: string | null;
  lastSyncedAt: number | null;
};

type FcmActions = {
  setToken: (token: string, platform: string) => void;
  clearToken: () => void;
};

export const useFcmStore = create<FcmState & FcmActions>()(
  persist(
    (set) => ({
      token: null,
      platform: null,
      lastSyncedAt: null,

      setToken: (token, platform) =>
        set({
          token,
          platform,
          lastSyncedAt: Date.now(),
        }),

      clearToken: () =>
        set({
          token: null,
          platform: null,
          lastSyncedAt: null,
        }),
    }),
    {
      name: "fcm-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

export const selectFcmToken = (s: ReturnType<typeof useFcmStore.getState>) =>
  s.token;
