import { create } from "zustand";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type SearchPin = {
  name: string;
  latitude: number;
  longitude: number;
};

type MapStore = {
  region: Region;
  selectedPlaceId: number | null;
  pendingRegion: Region | null;
  searchPin: SearchPin | null;
  setRegion: (region: Region) => void;
  setSelectedPlaceId: (id: number | null) => void;
  setSearchPin: (pin: SearchPin, region: Region) => void;
  clearSearchPin: () => void;
  clearPendingRegion: () => void;
};

export const useMapStore = create<MapStore>((set) => ({
  region: {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  selectedPlaceId: null,
  pendingRegion: null,
  searchPin: null,
  setRegion: (region) => set({ region }),
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
  setSearchPin: (pin, region) => set({ searchPin: pin, pendingRegion: region }),
  clearSearchPin: () => set({ searchPin: null }),
  clearPendingRegion: () => set({ pendingRegion: null }),
}));
