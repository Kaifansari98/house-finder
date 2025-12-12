import * as SecureStore from "expo-secure-store";
import type { StateStorage } from "zustand/middleware";

// In-memory fallback for platforms where SecureStore is unavailable (e.g., web).
const memoryStore = (() => {
  const map = new Map<string, string>();
  return {
    getItem: (name: string) => map.get(name) ?? null,
    setItem: (name: string, value: string) => map.set(name, value),
    removeItem: (name: string) => map.delete(name),
  };
})();

let secureAvailable: boolean | null = null;
const ensureAvailability = async () => {
  if (secureAvailable === null) {
    secureAvailable = await SecureStore.isAvailableAsync();
  }
  return secureAvailable;
};

export const zustandMMKVStorage: StateStorage = {
  getItem: async (name) => {
    const available = await ensureAvailability();
    if (available) {
      const value = await SecureStore.getItemAsync(name);
      return value ?? null;
    }
    return memoryStore.getItem(name);
  },
  setItem: async (name, value) => {
    const available = await ensureAvailability();
    if (available) {
      await SecureStore.setItemAsync(name, value);
      return;
    }
    memoryStore.setItem(name, value);
  },
  removeItem: async (name) => {
    const available = await ensureAvailability();
    if (available) {
      await SecureStore.deleteItemAsync(name);
      return;
    }
    memoryStore.removeItem(name);
  },
};
