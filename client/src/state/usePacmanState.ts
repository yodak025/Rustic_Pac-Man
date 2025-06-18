import { create } from "zustand";
import pacmanStatusValue from "@/types/pacmanStatusValue";

interface Position {
  x: number;
  y: number;
}

const I_MILISECONDS = 3000; // Constant for converting seconds to milliseconds

interface PacmanState {
  position: Position;
  lives: number;
  status: pacmanStatusValue;
  // Actions
  setPosition: (position: Position) => void;
  updatePosition: (x: number, y: number) => void;
  takeDamage: () => void;
  reStart: () => void;
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
        set({ status:pacmanStatusValue.INVINCIBLE }); // Set invincibility state
        setTimeout(() => {
          set({ status:pacmanStatusValue.COMMON }); // Reset invincibility after I_MILISECONDS
        }, I_MILISECONDS);
        return { lives: state.lives - 1 };
      }
      return state; // No change if lives are already 0
    }),
  reStart: () =>
    set(() => ({
      lives: 3, // Reset lives to default
    }))
}));

export default usePacmanState;
