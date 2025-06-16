import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
interface Position {
  x: number;
  y: number;
}

enum ghostType {
  BLINKY = "Blinky",
  PINKY = "Pinky",
  INKY = "Inky",
  CLYDE = "Clyde",
}

interface SingleGhostState {
  position: Position;
  type: ghostType;
}

interface GhostsState {
  ghosts: SingleGhostState[];
  addGhost: ({position, type}: SingleGhostState) => void;
  setPosition: (position: Position, ghostIndex: number) => void;
}

const useGhostsState = create(
  immer<GhostsState>((set) => ({
    ghosts: [],
    addGhost: (ghost) =>
      set((state) => {
        state.ghosts.push(ghost);
      }),
    setPosition: (position, ghostIndex) =>
      set((state) => {
        if (state.ghosts[ghostIndex]) {
          state.ghosts[ghostIndex].position = position;
        }
      }),
  }))
);

export default useGhostsState;
