import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CollectableKind,  type Position, type Collidable, type Collectable } from "@/types/gameComponents";
import type { Entity } from "@custom-types/gameEntities";

// Wall entity with Collidable component
interface WallEntity extends Entity {};

interface HouseEntity extends Entity {};

// Collectable entity with Collectable component
interface CollectableEntity extends Entity {};

// Main maze structure
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
  isLoaded: boolean; // Optional property to indicate if the maze is loaded
}

// Store state interface
interface MazeState {
  maze: Maze;
  // Actions
  createWall: (position: Position) => void;
  createHouseTile: (position: Position) => void; // Future use
  createPacDot: (position: Position) => void;
  createPowerPellet: (position: Position) => void;
  isWallAt: (position: Position) => boolean;
  isHouseTileAt: (position: Position) => boolean; // Future use
  findCollectableAt: (position: Position) => string | null;
  removePacDot: (position: Position) => void;
  removePowerPellet: (position: Position) => void;
  initializeMazeEntities: () => void;
  initializeMazeInfo: (pacDots: number, powerPellets: number) => void;
  setMazeLoaded: (isLoaded: boolean) => void; // Action to set maze loaded state
}

// Helper function to create position key
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
      isLoaded: false, // Initialize as not loaded
    },

    // Create a wall entity at the specified position
    createWall: (position) =>
      set((state) => {
        const key = positionToKey(position);
        state.maze.walls[key] = {
          id: key,
          components: {
            position: position as Position,
            collidable: { value: true } as Collidable,
          },
          actions: {}
        }
      }),

    // Create a house tile entity at the specified position (for future use)
    createHouseTile: (position) =>
      set((state) => {
        const key = positionToKey(position);
        state.maze.houseTiles[key] = {
          id: key,
          components: {
            position: position as Position,
            collidable: { value: true } as Collidable,
          },
          actions: {}
        }
      }),

    // Create a pac dot entity at the specified position
    createPacDot: (position) =>
      set((state) => {
        const key = positionToKey(position);
        state.maze.collectables.pacDots[key] = {
          id: key,
          components: {
            position: position as Position,
            collectable: { value: true } as Collectable,
          },
          actions: {}
        }
      }),

    // Create a pellet entity at the specified position
    createPowerPellet: (position) =>
      set((state) => {
        const key = positionToKey(position);
        state.maze.collectables.powerPellets[key] = {
          id: key,
          components: {
            position: position as Position,
            collectable: { value: true } as Collectable,
          },
          actions: {}
        }
      }),

    // Check if there is a wall at the specified position
    isWallAt: (position) => {
      const key = positionToKey(position);
      const state = get();
      return key in state.maze.walls;
    },

    // Check if there is a house tile at the specified position (for future use)
    isHouseTileAt: (position) => {
      const key = positionToKey(position);
      const state = get();
      return key in state.maze.houseTiles;
    },

    // Find collectable at the specified position
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

    // Remove a pac dot at the specified position
    removePacDot: (position) =>
      set((state) => {
        const key = positionToKey(position);
        
        // Check if pacdot exists at position, return early if not
        if (!(key in state.maze.collectables.pacDots)) {
          return;
        }
        // Remove the pacdot
        delete state.maze.collectables.pacDots[key];
        // Decrement current pacdots count
        state.maze.info.pacDots.current++;
      }),

      // Remove a pac dot at the specified position
    removePowerPellet: (position) =>
      set((state) => {
        const key = positionToKey(position);
        
        // Check if pacdot exists at position, return early if not
        if (!(key in state.maze.collectables.powerPellets)) {
          return;
        }
        // Remove the pacdot
        delete state.maze.collectables.powerPellets[key];
        // Decrement current pacdots count
        state.maze.info.powerPellets.current++;
      }),

    // Initialize maze with pacdot count
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
