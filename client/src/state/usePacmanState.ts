import { create } from "zustand";
import pacmanStatusValue from "@/types/pacmanStatusValue";

interface Position {
  x: number;
  y: number;
}

const I_PERIOD = 3000; // Constant for converting seconds to milliseconds
const HUNT_PERIOD = 5000; // Constant for converting seconds to milliseconds

interface PacmanState {
  position: Position;
  lives: number;
  status: pacmanStatusValue;
  // Actions
  setPosition: (position: Position) => void;
  updatePosition: (x: number, y: number) => void;
  takeDamage: () => void;
  hunt: () => void;
  reStart: () => void;
  addLive: () => void;
}
const usePacmanState = create<PacmanState>((set) => ({
  position: { x: 0, y: 0 },
  lives: 3, // Default number of lives
  status: pacmanStatusValue.COMMON,
  setPosition: (position) => set({ position }),
  updatePosition: (x, y) => set({ position: { x, y } }),
  takeDamage: () =>
    set((state) => {
      if (state.status === pacmanStatusValue.INVINCIBLE) {
        return state; // No change if already invincible
      }
      if (state.lives > 0) {
        set({ status: pacmanStatusValue.INVINCIBLE }); // Set invincibility state
        setTimeout(() => {
          set({ status: pacmanStatusValue.COMMON }); // Reset invincibility after I_MILISECONDS
        }, I_PERIOD);
        return { lives: state.lives - 1 };
      }
      return state; // No change if lives are already 0
    }),
  hunt: () => {
    set({ status: pacmanStatusValue.HUNTING }); // Set hunting state
    setTimeout(() => {
      set({ status: pacmanStatusValue.COMMON }); // Reset to common after hunt period
    }, HUNT_PERIOD);
  },
  reStart: () =>
    set(() => ({
      lives: 3, // Reset lives to default
    })),
  addLive: () =>
    set((state) => ({
      lives: state.lives + 1, // Increment lives by 1
    })),
}));

export default usePacmanState;
