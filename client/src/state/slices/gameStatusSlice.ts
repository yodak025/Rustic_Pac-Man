import { type StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

export enum gameStatusValue {
  NOT_STARTED = "NOT_STARTED",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  LOST = "LOST",
  WINNED = "WINNED",
}

export interface IGameStatus {
  gameStatus: gameStatusValue;
  playGame: () => void;
  pauseGame: () => void;
  loseGame: () => void;
  winGame: () => void;
  resetGame: () => void;
}

export const createGameStatusSlice: StateCreator<
  IGameStatus,
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
