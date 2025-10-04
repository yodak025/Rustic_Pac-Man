import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type Entity } from "@custom-types/gameEntities";
import {
  type Position,
  type MovementTimer,
  Direction,
  type Playable,
  type Health,
  CollectableKind,
  type Collector
} from "@custom-types/gameComponents";

interface Pacman extends Entity {
  actions:{
    setPosition: (position: Position) => void;
    setLastPosition: (position: Position) => void;
    setMovementTimerInterval: (interval: number) => void;
    clearDirections: () => void;
    addDirection: (direction: Direction) => void;
    incrementMovementTimer: (delta: number) => void;
    isTimeToMove: (delta: number) => boolean;
    takeDamage: (amount: number, iTicks:number) => void;
    decrementITicks: () => void;
    setHealth: (health: number) => void;
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
        lastPosition: { x: 0, y: 0 } as Position,
        movementTimer: { elapsed: 0, interval: 100 } as MovementTimer,
        directions: Array<Direction>(), 
        playable: { value: true } as Playable,
        health: { value: 3, iTicks: 0} as Health, // Default health value
        collector: { collects: [CollectableKind.PAC_DOT, CollectableKind.POWER_PELLET] } as Collector,
      },
      actions: {
        setPosition: (position) => {
          set((state) => {
            state.pacman.components.position = position;
            state.pacman.components.health.isDamageTakenOnCurrentFrame = false;
          });
        },
        setLastPosition: (position) => {
          set((state) => {
            state.pacman.components.lastPosition = position;
          });
        },
        setMovementTimerInterval: (interval) => {
          set((state) => {
            state.pacman.components.movementTimer.interval = interval;
          });
        },
        clearDirections: () => {
          set((state) => {
            state.pacman.components.directions = [];
          });
        },
        addDirection: (direction) => {
          set((state) => {
            state.pacman.components.directions = [direction, ...state.pacman.components.directions];

          });
        },
        incrementMovementTimer: (delta) => {
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
        isTimeToMove: (delta) => {
          const { elapsed, interval } = get().pacman.components.movementTimer;
          return (elapsed + delta) >= interval;
        },
        takeDamage: (amount, iTicks) => {
          set((state) => {
            const currentHealth = state.pacman.components.health.value;
            state.pacman.components.health.value = Math.max(currentHealth - amount, 0);
            state.pacman.components.health.iTicks = iTicks;
          });
        },
        decrementITicks: () => {
          set((state) => {
            if(state.pacman.components.health.iTicks > 0){
              state.pacman.components.health.iTicks -= 1;
            }
          });
        },
        setHealth: (health) => {
          set((state) => {
            state.pacman.components.health.value = health;
          });
        },
      }
    },
  }))
);

export default usePacmanStore;
