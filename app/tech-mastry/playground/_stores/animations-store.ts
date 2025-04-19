import { create } from "zustand";

interface AnimationsStore {
  isAnimating: boolean;
  panelTransition: "entering" | "exiting" | "idle";
  setPanelTransition: (state: "entering" | "exiting" | "idle") => void;
  toggleAnimation: () => void;
}

export const useAnimationsStore = create<AnimationsStore>((set) => ({
  isAnimating: false,
  panelTransition: "idle",
  setPanelTransition: (state) => set({ panelTransition: state }),
  toggleAnimation: () => set((state) => ({ isAnimating: !state.isAnimating })),
}));
