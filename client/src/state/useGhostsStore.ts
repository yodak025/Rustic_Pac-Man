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
    clearDirections: () => void;
    addDirection: (direction: Direction) => void;
    incrementMovementTimer: (delta: number) => void;
    isTimeToMove: (delta: number) => boolean;
  }
}

interface IGhostsState {
  blinky: Ghost;
  pinky: Ghost;
  inky: Ghost;
  clyde: Ghost;
}

// Factory function para crear fantasmas
const createGhost = (id: string, set: any, get: any): Ghost => ({
  id,
  components: {
    position: { x: 0, y: 0 } as Position,
    movementTimer: { elapsed: 0, interval: 100 } as MovementTimer,
    directions: [Direction.RIGHT as Direction],
  },
  actions: {
    setPosition: (position: Position) => {
      set((state: IGhostsState) => {
        (state as any)[id].components.position = position;
      });
    },
    setMovementTimerInterval: (interval: number) => {
      set((state: IGhostsState) => {
        (state as any)[id].components.movementTimer.interval = interval;
      });
    },
    clearDirections: () => {
      set((state: IGhostsState) => {
        (state as any)[id].components.directions = [];
      });
    },
    addDirection: (direction: Direction) => {
      set((state: IGhostsState) => {
        (state as any)[id].components.directions = [
          ...(state as any)[id].components.directions,
          direction
        ];
      });
    },
    incrementMovementTimer: (delta: number) => {
      set((state: IGhostsState) => {
        (state as any)[id].components.movementTimer.elapsed += delta;
        if (
          (state as any)[id].components.movementTimer.elapsed >=
          (state as any)[id].components.movementTimer.interval
        ) {
          (state as any)[id].components.movementTimer.elapsed -=
            (state as any)[id].components.movementTimer.interval;
        }
      });
    },
    isTimeToMove: (delta: number) => {
      const { elapsed, interval } = (get() as any)[id].components.movementTimer;
      return (elapsed + delta) >= interval;
    },
  }
});

const useGhostsStore = create<IGhostsState>()(
  immer((set, get) => ({
    blinky: createGhost("blinky", set, get),
    pinky: createGhost("pinky", set, get),
    inky: createGhost("inky", set, get),
    clyde: createGhost("clyde", set, get),
  }))
);

export default useGhostsStore;
