import { create } from "zustand";
import type { VisitFilters } from "@/db/queries/visits";

type FilterStore = VisitFilters & {
  setFilter: <K extends keyof VisitFilters>(key: K, value: VisitFilters[K]) => void;
  resetFilters: () => void;
  clearFilters: () => void;
};

const defaultFilters: VisitFilters = {
  sortField: "date",
  sortOrder: "desc",
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaultFilters,
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () => set(defaultFilters),
  // Clears content filters but preserves sort preference
  clearFilters: () => set({
    categoryId: undefined,
    tagIds: undefined,
    minRating: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    whoPaidId: undefined,
    searchQuery: undefined,
  }),
}));
