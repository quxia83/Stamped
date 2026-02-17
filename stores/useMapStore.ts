import { create } from "zustand";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MapStore = {
  region: Region;
  selectedPlaceId: number | null;
  setRegion: (region: Region) => void;
  setSelectedPlaceId: (id: number | null) => void;
};

export const useMapStore = create<MapStore>((set) => ({
  region: {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  selectedPlaceId: null,
  setRegion: (region) => set({ region }),
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
}));
