import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CollectableKind,  type Position, type Collidable, type Collectable } from "@/types/gameComponents";
import type { Entity } from "@custom-types/gameEntities";


interface WallEntity extends Entity {};
interface HouseEntity extends Entity {};
interface CollectableEntity extends Entity {};

interface Maze {
  walls: Record<string, WallEntity>;
  houseTiles: Record<string, HouseEntity>;
  collectables: {
    pacDots: Record<string, CollectableEntity>;
    powerPellets: Record<string, CollectableEntity>;
  };
  info: {
    pacDots: {
      total: number;
      current: number;
    };
    powerPellets: {
      total: number;
      current: number;
    };
  };
  isLoaded: boolean; 
}

interface MazeState {
  maze: Maze;

  createWall: (position: Position) => void;
  createHouseTile: (position: Position) => void; 
  createPacDot: (position: Position) => void;
  createPowerPellet: (position: Position) => void;
  isWallAt: (position: Position) => boolean;
  isHouseTileAt: (position: Position) => boolean;
  findCollectableAt: (position: Position) => string | null;
  removePacDot: (position: Position) => void;
  removePowerPellet: (position: Position) => void;
  initializeMazeEntities: () => void;
  initializeMazeInfo: (pacDots: number, powerPellets: number) => void;
  setMazeLoaded: (isLoaded: boolean) => void; 
}


const positionToKey = (position: Position): string => `${position.x},${position.y}`;

const useMazeState = create<MazeState>()(
  immer((set, get) => ({
    maze: {
      walls: {},
      houseTiles: {},
      collectables: {
        pacDots: {},
        powerPellets: {},
      },
      info: {
        pacDots: {
          total: 0,
          current: 0,
        },
        powerPellets: {
          total: 0,
          current: 0,
        },
      },
      isLoaded: false,
    },

    createWall: (position) =>
      set((state) => {
        const key = positionToKey(position);
        state.maze.walls[key] = {
          id: key,
          components: {
            position: position as Position,
            collidable: { value: true } as Collidable,
          },
          actions: {},
        };
      }),

    createHouseTile: (position) =>
      set((state) => {
        const key = positionToKey(position);
        state.maze.houseTiles[key] = {
          id: key,
          components: {
            position: position as Position,
            collidable: { value: true } as Collidable,
          },
          actions: {},
        };
      }),

    createPacDot: (position) =>
      set((state) => {
        const key = positionToKey(position);
        state.maze.collectables.pacDots[key] = {
          id: key,
          components: {
            position: position as Position,
            collectable: { value: true } as Collectable,
          },
          actions: {},
        };
      }),

    createPowerPellet: (position) =>
      set((state) => {
        const key = positionToKey(position);
        state.maze.collectables.powerPellets[key] = {
          id: key,
          components: {
            position: position as Position,
            collectable: { value: true } as Collectable,
          },
          actions: {},
        };
      }),

    isWallAt: (position) => {
      const key = positionToKey(position);
      const state = get();
      return key in state.maze.walls;
    },

    isHouseTileAt: (position) => {
      const key = positionToKey(position);
      const state = get();
      return key in state.maze.houseTiles;
    },

    findCollectableAt: (position) => {
      const key = positionToKey(position);
      const state = get();
      if (key in state.maze.collectables.pacDots) {
        return CollectableKind.PAC_DOT;
      }
      if (key in state.maze.collectables.powerPellets) {
        return CollectableKind.POWER_PELLET;
      }
      return null;
    },

    removePacDot: (position) =>
      set((state) => {
        const key = positionToKey(position);
        if (!(key in state.maze.collectables.pacDots)) {
          return;
        }
        delete state.maze.collectables.pacDots[key];
        state.maze.info.pacDots.current++;
      }),

    removePowerPellet: (position) =>
      set((state) => {
        const key = positionToKey(position);
        if (!(key in state.maze.collectables.powerPellets)) {
          return;
        }
        delete state.maze.collectables.powerPellets[key];
        state.maze.info.powerPellets.current++;
      }),

    initializeMazeEntities: () =>
      set((state) => {
        state.maze.walls = {};
        state.maze.collectables.pacDots = {};
        state.maze.collectables.powerPellets = {};
        state.maze.isLoaded = false;
      }),
    initializeMazeInfo: (pacdots, powerPellets) =>
      set((state) => {
        state.maze.info.pacDots.total = pacdots;
        state.maze.info.pacDots.current = 0;
        state.maze.info.powerPellets.total = powerPellets;
        state.maze.info.powerPellets.current = 0;
      }),

    setMazeLoaded: (isLoaded) =>
      set((state) => {
        state.maze.isLoaded = isLoaded;
      }),
  }))
);

export default useMazeState;