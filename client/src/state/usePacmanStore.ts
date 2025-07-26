import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type Entity } from "@custom-types/gameEntities";
import {
  type Position,
  type MovementTimer,
  Direction,
  type Playable,
} from "@custom-types/gameComponents";

interface Pacman extends Entity {
  actions:{
    setPosition: (position: Position) => void;
    setMovementTimerInterval: (interval: number) => void;
    setDirection: (direction: Direction) => void;
    incrementMovementTimer: (delta: number) => boolean;
  }
}

interface IPacmanState {
  pacman: Pacman;
}

const usePacmanStore = create<IPacmanState>()(
  immer((set) => ({
    pacman: {
      id: "pacman",
      components: {
        position: { x: 0, y: 0 } as Position,
        movementTimer: { elapsed: 0, interval: 100 } as MovementTimer,
        direction: Direction.RIGHT as Direction,
        playable: { value: true } as Playable,
      },
      actions: {
        setPosition: (position: Position) => {
          set((state) => {
            state.pacman.components.position = position;
          });
        },
        setMovementTimerInterval: (interval: number) => {
          set((state) => {
            state.pacman.components.movementTimer.interval = interval;
          });
        },
        setDirection: (direction: Direction) => {
          set((state) => {
            state.pacman.components.direction = direction;
          });
        },
        incrementMovementTimer: (delta: number) => {
          let shouldMove = false;
          set((state) => {
            state.pacman.components.movementTimer.elapsed += delta;
            if (
              state.pacman.components.movementTimer.elapsed >=
              state.pacman.components.movementTimer.interval
            ) {
              state.pacman.components.movementTimer.elapsed -=
                state.pacman.components.movementTimer.interval;
              shouldMove = true;
            }
          });
          return shouldMove;
        },
      }
    },
  }))
);

export default usePacmanStore;
