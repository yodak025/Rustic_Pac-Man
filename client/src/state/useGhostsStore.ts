import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type Entity } from "@custom-types/gameEntities";
import {
  type Position,
  type MovementTimer,
  Direction,
  type Behavior,
  GhostBehaviorKind,
  GhostBehaviorMode,
  TargetKind,
} from "@custom-types/gameComponents";

interface Ghost extends Entity {
  actions: {
    setPosition: (position: Position) => void;
    setMovementTimerInterval: (interval: number) => void;
    clearDirections: () => void;
    addDirection: (direction: Direction) => void;
    incrementMovementTimer: (delta: number) => void;
    isTimeToMove: (delta: number) => boolean;
    initBehavior: (ticks: number) => void;
    setBehaviorMode: (mode: GhostBehaviorMode) => void;
    setBehaviorTarget: (target: Behavior["target"]) => void;
    setBehaviorTicks: (ticks: number | null) => void;
  };
}

interface IGhostsState {
  blinky: Ghost;
  pinky: Ghost;
  inky: Ghost;
  clyde: Ghost;
  actions: {
    frightenAll: () => void;
    getGhosts: () => Ghost[];
  };
}

// Factory function para crear fantasmas
const createGhost = (id: string, set: any, get: any): Ghost => ({
  id,
  components: {
    position: { x: 0, y: 0 } as Position,
    movementTimer: { elapsed: 0, interval: 100 } as MovementTimer,
    directions: [Direction.RIGHT as Direction],
    behavior: {
      kind: GhostBehaviorKind.BLINKY,
      mode: GhostBehaviorMode.HOUSE,
      target: { kind: TargetKind.RANDOM, position: { x: 0, y: 0 } },
      ticks: null,
    } as Behavior,
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
        (state as any)[id].components.movementTimer.elapsed = 0;
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
          direction,
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
          (state as any)[id].components.movementTimer.elapsed -= (state as any)[
            id
          ].components.movementTimer.interval;
        }
      });
    },
    isTimeToMove: (delta: number) => {
      const { elapsed, interval } = (get() as any)[id].components.movementTimer;
      return elapsed + delta >= interval;
    },
    initBehavior: (ticks: number) => {
      set((state: IGhostsState) => {
        let kind: GhostBehaviorKind;
        switch (id) {
          case "blinky":
            kind = GhostBehaviorKind.BLINKY;
            break;
          case "pinky":
            kind = GhostBehaviorKind.PINKY;
            break;
          case "inky":
            kind = GhostBehaviorKind.INKY;
            break;
          case "clyde":
            kind = GhostBehaviorKind.CLYDE;
            break;
          default:
            kind = GhostBehaviorKind.BLINKY;
        }
        (state as any)[id].components.behavior.kind = kind;
        (state as any)[id].components.behavior.mode = GhostBehaviorMode.HOUSE;
        (state as any)[id].components.behavior.target = {
          kind: TargetKind.RANDOM,
          position: { x: 0, y: 0 },
        };
        (state as any)[id].components.behavior.ticks = ticks;
      });
    },
    setBehaviorMode: (mode) => {
      set((state: IGhostsState) => {
        (state as any)[id].components.behavior.mode = mode;
      });
    },
    setBehaviorTarget: (target) => {
      set((state: IGhostsState) => {
        (state as any)[id].components.behavior.target = target;
      });
    },
    setBehaviorTicks: (ticks) => {
      set((state: IGhostsState) => {
        (state as any)[id].components.behavior.ticks = ticks;
      });
    },
  },
});

const useGhostsStore = create<IGhostsState>()(
  immer((set, get) => ({
    blinky: createGhost("blinky", set, get),
    pinky: createGhost("pinky", set, get),
    inky: createGhost("inky", set, get),
    clyde: createGhost("clyde", set, get),

    actions: {
      frightenAll: () => {
        let ids = get().actions.getGhosts().map(g => g.id);
        set((state: IGhostsState) => {
          // ✅ Modifica directamente el estado dentro del contexto actual
          ids.forEach((ghostId) => {
            const ghost = (state as any)[ghostId];
            ghost.components.behavior.mode = GhostBehaviorMode.FRIGHTENED;
            ghost.components.behavior.ticks = 50;
            ghost.components.behavior.target = {
              kind: TargetKind.TILE,
              position: { x: 15, y: 11 },
            };
            console.log(`${ghost.id} is now FRIGHTENED, ${ghost.components.behavior.mode}`);
          });
        });
      },
      getGhosts: () => {
        return ["blinky", "pinky", "inky", "clyde"].map((id) => (get() as any)[id]);
      }
    },
  }))
);

export default useGhostsStore;
