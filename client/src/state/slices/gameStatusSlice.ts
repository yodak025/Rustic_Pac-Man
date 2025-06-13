import { type StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

enum gameStatusValue {
  NOT_STARTED = "NOT_STARTED",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  LOST = "LOST",
  WINNED = "WINNED",
}

export interface IGameStatus {
  gameStatus: gameStatusValue;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
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
  startGame: () =>
    set((state) => {
      state.gameStatus = gameStatusValue.PLAYING;
    }),
  pauseGame: () =>
    set((state) => {
      state.gameStatus = gameStatusValue.PAUSED;
    }),
  resumeGame: () =>
    set((state) => {
      state.gameStatus = gameStatusValue.PLAYING;
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
