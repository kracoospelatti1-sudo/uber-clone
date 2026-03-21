import { create } from 'zustand';
import type { User, Ride, Location } from '@/types';

interface AppState {
  user: User | null;
  currentRide: Ride | null;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  driverLocation: Location | null;
  isDriverMode: boolean;
  
  setUser: (user: User | null) => void;
  setCurrentRide: (ride: Ride | null) => void;
  setPickupLocation: (location: Location | null) => void;
  setDropoffLocation: (location: Location | null) => void;
  setDriverLocation: (location: Location | null) => void;
  toggleDriverMode: () => void;
  resetRide: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentRide: null,
  pickupLocation: null,
  dropoffLocation: null,
  driverLocation: null,
  isDriverMode: false,

  setUser: (user) => set({ user }),
  setCurrentRide: (ride) => set({ currentRide: ride }),
  setPickupLocation: (location) => set({ pickupLocation: location }),
  setDropoffLocation: (location) => set({ dropoffLocation: location }),
  setDriverLocation: (location) => set({ driverLocation: location }),
  toggleDriverMode: () => set((state) => ({ isDriverMode: !state.isDriverMode })),
  resetRide: () => set({ 
    currentRide: null, 
    pickupLocation: null, 
    dropoffLocation: null,
    driverLocation: null 
  }),
}));
