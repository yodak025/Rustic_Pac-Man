import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createGameStatusSlice, type IGameStatus } from '@state/slices/gameStatusSlice';

type IGameState = IGameStatus

const useGameState = create<IGameState>()(
  immer((...a) => ({ // <- Envolver con immer
    ...createGameStatusSlice(...a),
  }))
)

export default useGameState;