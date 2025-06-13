import { type StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { gameStatusValue, type IGameStatus, type IGameState } from "@custom-types/gameStateTypes";


export const createGameStatusSlice: StateCreator<
  IGameState,
  [["zustand/immer", never]],
  [],
  IGameStatus
> = (set) => ({
  gameStatus: gameStatusValue.NOT_STARTED,
  playGame: () =>
    set((state) => {
      state.gameStatus = gameStatusValue.PLAYING;
    }),
  pauseGame: () =>
    set((state) => {
      state.gameStatus = gameStatusValue.PAUSED;
    }),
  loseGame: () =>
    set((state) => {
      state.gameStatus = gameStatusValue.LOST;
    }),
  winGame: () =>
    set((state) => {
      state.gameStatus = gameStatusValue.WINNED;
    }),
  resetGame: () =>
    set((state) => {
      state.gameStatus = gameStatusValue.NOT_STARTED;
    }),
});
