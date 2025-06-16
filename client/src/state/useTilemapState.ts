import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ITilemap {
  tiles: Record<string, number>;
  width: number;
  height: number;
  score: number;

  // acciones
  setTileMap: (array2d: number[][]) => void;
  updateTile: (x: number, y: number, newValue: number) => void;
  getTile: (x: number, y: number) => number;
  forEachTile: (
    callback: (value: number, x: number, y: number) => void
  ) => void;
  getRandomTileCoords: (value: number) => { x: number; y: number };
}

const useTilemapState = create(
  immer<ITilemap>((set, get) => ({
    tiles: {},
    width: 0,
    height: 0,
    score: 0,

    setTileMap: (array2d) => {
      set((state) => {
        state.width = array2d[0].length;
        state.height = array2d.length;

        const tiles: Record<string, number> = {};
        array2d.forEach((row, y) => {
          row.forEach((value, x) => {
            tiles[`${x},${y}`] = value;
          });
        });
        state.tiles = tiles;
      });
    },

    updateTile: (x, y, newValue) => {
      set((state) => {
        state.tiles[`${x},${y}`] = newValue;
      });
    },

    getTile: (x, y) => {
      const state = get();
      return state.tiles[`${x},${y}`] ?? NaN;
    },

    forEachTile: (callback) => {
      const state = get();
      Object.entries(state.tiles).forEach(([key, value]) => {
        const [x, y] = key.split(",").map(Number);
        callback(value, x, y);
      });
    },

    getRandomTileCoords: (value) => {
      const state = get();
      const matchingTiles = Object.entries(state.tiles)
        .filter(([_, tileValue]) => tileValue === value)
        .map(([key, _]) => {
          const [x, y] = key.split(",").map(Number);
          return { x, y };
        });

      if (matchingTiles.length === 0)
        throw new Error(`No tiles with value ${value} found`);
      return matchingTiles[Math.floor(Math.random() * matchingTiles.length)];
    },
  }))
);

export default useTilemapState;
