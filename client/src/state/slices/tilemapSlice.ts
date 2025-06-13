import { type StateCreator } from "zustand";
import { TileMap } from "@core/tilemap/Tilemap";
import { immer } from "zustand/middleware/immer";
import { type ITilemap, type IGameState  } from "@custom-types/gameStateTypes";


export const createTilemapSlice: StateCreator<
  IGameState,
  [["zustand/immer", never]],
  [],
  ITilemap
> = (set) => ({
    tileMap: null,
    score: 0,

    setTileMap: (array2d) => {
      // reemplazamos por una instancia inmutable de TileMap
      set(state => {
        state.tileMap = TileMap.fromArray(array2d)
      })
    },

    updateTile: (x, y, newValue) => {
      set(state => {
        if (!state.tileMap) return
        // TileMap expone un método inmutable .set()
        state.tileMap = state.tileMap.set(x, y, newValue)
      })
    }
  });
