import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import ghostName from "@custom-types/ghostName";

interface Position {
  x: number;
  y: number;
}

interface SingleGhostState {
  position: Position;
  type: ghostName;
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
