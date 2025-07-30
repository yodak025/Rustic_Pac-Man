import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type Entity } from "@custom-types/gameEntities";
import {
  type Position,
  type MovementTimer,
  Direction,
} from "@custom-types/gameComponents";

interface Ghost extends Entity {
  actions:{
    setPosition: (position: Position) => void;
    setMovementTimerInterval: (interval: number) => void;
    setDirection: (direction: Direction) => void;
    incrementMovementTimer: (delta: number) => boolean;
  }
}

interface IGhostsState {
  blinky: Ghost;
}

const useGhostsStore = create<IGhostsState>()(
  immer((set) => ({
    blinky: {
      id: "blinky",
      components: {
        position: { x: 0, y: 0 } as Position,
        movementTimer: { elapsed: 0, interval: 100 } as MovementTimer,
        direction: Direction.RIGHT as Direction,
      },
      actions: {
        setPosition: (position: Position) => {
          set((state) => {
            state.blinky.components.position = position;
          });
        },
        setMovementTimerInterval: (interval: number) => {
          set((state) => {
            state.blinky.components.movementTimer.interval = interval;
          });
        },
        setDirection: (direction: Direction) => {
          set((state) => {
            state.blinky.components.direction = direction;
          });
        },
        incrementMovementTimer: (delta: number) => {
          let shouldMove = false;
          set((state) => {
            state.blinky.components.movementTimer.elapsed += delta;
            if (
              state.blinky.components.movementTimer.elapsed >=
              state.blinky.components.movementTimer.interval
            ) {
              state.blinky.components.movementTimer.elapsed -=
                state.blinky.components.movementTimer.interval;
              shouldMove = true;
            }
          });
          return shouldMove;
        },
      }
    },
  }))
);

export default useGhostsStore;
