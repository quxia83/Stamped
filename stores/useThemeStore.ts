import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as FileSystem from "expo-file-system/legacy";

const settingsPath = FileSystem.documentDirectory + "theme-settings.json";

const fileStorage = {
  getItem: async (_name: string): Promise<string | null> => {
    try {
      return await FileSystem.readAsStringAsync(settingsPath);
    } catch {
      return null;
    }
  },
  setItem: async (_name: string, value: string): Promise<void> => {
    await FileSystem.writeAsStringAsync(settingsPath, value);
  },
  removeItem: async (_name: string): Promise<void> => {
    try {
      await FileSystem.deleteAsync(settingsPath);
    } catch {}
  },
};

export const PIN_COLORS = [
  "#e94560",
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#ec4899",
  "#06b6d4",
  "#ef4444",
  "#6b7280",
] as const;

type ThemeStore = {
  accentColor: string;
  setAccentColor: (color: string) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      accentColor: PIN_COLORS[0],
      setAccentColor: (color) => set({ accentColor: color }),
    }),
    {
      name: "theme",
      storage: createJSONStorage(() => fileStorage),
    }
  )
);
