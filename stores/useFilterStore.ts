import { create } from "zustand";
import type { VisitFilters } from "@/db/queries/visits";

type FilterStore = VisitFilters & {
  setFilter: <K extends keyof VisitFilters>(key: K, value: VisitFilters[K]) => void;
  resetFilters: () => void;
};

const defaultFilters: VisitFilters = {
  sortField: "date",
  sortOrder: "desc",
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaultFilters,
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () => set(defaultFilters),
}));
