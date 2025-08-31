import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Position, Collidable, Collectable } from "@/types/gameComponents";
import type { Entity } from "@custom-types/gameEntities";

// Wall entity with Collidable component
interface WallEntity extends Entity {};

// Collectable entity with Collectable component
interface CollectableEntity extends Entity {};

// Main maze structure
interface Maze {
  walls: Record<string, WallEntity>;
  collectables: {
    pacDots: Record<string, CollectableEntity>;
    pellets: Record<string, CollectableEntity>;
  };
  info: {
    pacdots: {
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
  createPacDot: (position: Position) => void;
  createPellet: (position: Position) => void;
  isWallAt: (position: Position) => boolean;
  findCollectableAt: (position: Position) => string | null;
  removePacDot: (position: Position) => void;
  initializeMazeEntities: () => void;
  initializeMazeInfo: (pacdots: number) => void;
  setMazeLoaded: (isLoaded: boolean) => void; // Action to set maze loaded state
}

// Helper function to create position key
const positionToKey = (position: Position): string => `${position.x},${position.y}`;

const useMazeState = create<MazeState>()(
  immer((set, get) => ({
    maze: {
      walls: {},
      collectables: {
        pacDots: {},
        pellets: {},
      },
      info: {
        pacdots: {
          total: 0,
          current: 0,
        },
      },
      isLoaded: false, // Initialize as not loaded
    },

    // Create a wall entity at the specified position
    createWall: (position: Position) =>
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

    // Create a pac dot entity at the specified position
    createPacDot: (position: Position) =>
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
    createPellet: (position: Position) =>
      set((state) => {
        const key = positionToKey(position);
        state.maze.collectables.pellets[key] = {
          id: key,
          components: {
            position: position as Position,
            collectable: { value: true } as Collectable,
          },
          actions: {}
        }
      }),

    // Check if there is a wall at the specified position
    isWallAt: (position: Position): boolean => {
      const key = positionToKey(position);
      const state = get();
      return key in state.maze.walls;
    },

    // Find collectable at the specified position
    findCollectableAt: (position: Position): string | null => {
      const key = positionToKey(position);
      const state = get();    
      if (key in state.maze.collectables.pacDots) {
        return "pacDot";
      }
      if (key in state.maze.collectables.pellets) {
        return "pellet";
      }
      return null;
    },

    // Remove a pac dot at the specified position
    removePacDot: (position: Position) =>
      set((state) => {
        const key = positionToKey(position);
        
        // Check if pacdot exists at position, return early if not
        if (!(key in state.maze.collectables.pacDots)) {
          return;
        }
        // Remove the pacdot
        delete state.maze.collectables.pacDots[key];
        // Decrement current pacdots count
        state.maze.info.pacdots.current++;
      }),

    // Initialize maze with pacdot count
    initializeMazeEntities: () =>
      set((state) => {
        state.maze.walls = {};
        state.maze.collectables.pacDots = {};
        state.maze.collectables.pellets = {};
        state.maze.isLoaded = false;
      }),
      initializeMazeInfo: (pacdots: number) =>
      set((state) => {
        state.maze.info.pacdots.total = pacdots;
        state.maze.info.pacdots.current = 0;
      }),

    setMazeLoaded: (isLoaded: boolean) =>
      set((state) => {
        state.maze.isLoaded = isLoaded;
      }),

  }))
);

export default useMazeState;
