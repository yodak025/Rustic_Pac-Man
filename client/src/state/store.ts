import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createGameStatusSlice} from '@state/slices/gameStatusSlice';
import { createTilemapSlice} from './slices/tilemapSlice';
import type {  IGameState } from '@custom-types/gameStateTypes';


const useGameState = create<IGameState>()(
  immer((...a) => ({ // <- Envolver con immer
    ...createGameStatusSlice(...a),
    ...createTilemapSlice(...a),
  }))
)

export default useGameState;