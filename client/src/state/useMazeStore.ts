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
  collectableAt: (position: Position) => string | null; // TODO: Implement this action
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
          }
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
          }
        }
      }),

    // Check if there is a wall at the specified position
    isWallAt: (position: Position): boolean => {
      const key = positionToKey(position);
      const state = get();
      return key in state.maze.walls;
    },

    // TODO: Implement collectableAt action
    // This action should:
    // 1. Generate position key from the given Position
    // 2. Check if there's a pacDot at that position, return "pacDot" if found
    // 3. Check if there's a pellet at that position, return "pellet" if found
    // 4. Return null if no collectable is found at that position
    // Future enhancement: Could return an object with type and entity data instead of just a string
    collectableAt: (position: Position): string | null => {
      // Implementation pending
      return null;
    },

    setMazeLoaded: (isLoaded: boolean) =>
      set((state) => {
        state.maze.isLoaded = isLoaded;
      }),

  }))
);

export default useMazeState;
