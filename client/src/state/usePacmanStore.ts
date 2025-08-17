import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type Entity } from "@custom-types/gameEntities";
import {
  type Position,
  type MovementTimer,
  Direction,
  type Playable,
  type Health
} from "@custom-types/gameComponents";

interface Pacman extends Entity {
  actions:{
    setPosition: (position: Position) => void;
    setMovementTimerInterval: (interval: number) => void;
    setDirection: (direction: Direction) => void;
    incrementMovementTimer: (delta: number) => void;
    isTimeToMove: (delta: number) => boolean;
    takeDamage: (amount: number) => void;
  }
}

interface IPacmanState {
  pacman: Pacman;
}

const usePacmanStore = create<IPacmanState>()(
  immer((set, get) => ({
    pacman: {
      id: "pacman",
      components: {
        position: { x: 0, y: 0 } as Position,
        movementTimer: { elapsed: 0, interval: 100 } as MovementTimer,
        direction: Direction.RIGHT as Direction,
        playable: { value: true } as Playable,
        health: { value: 3 } as Health, // Default health value
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
          set((state) => {
            state.pacman.components.movementTimer.elapsed += delta;
            if (
              state.pacman.components.movementTimer.elapsed >=
              state.pacman.components.movementTimer.interval
            ) {
              state.pacman.components.movementTimer.elapsed -=
                state.pacman.components.movementTimer.interval;
            }
          });
        },
        isTimeToMove: (delta: number) => {
          const { elapsed, interval } = get().pacman.components.movementTimer;
          return (elapsed + delta) >= interval;
        },
        takeDamage: (amount: number) => {
          set((state) => {
            const currentHealth = state.pacman.components.health.value;
            state.pacman.components.health.value = Math.max(currentHealth - amount, 0);
          });
        }
      }
    },
  }))
);

export default usePacmanStore;
