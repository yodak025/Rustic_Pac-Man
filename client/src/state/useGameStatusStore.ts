import { create } from "zustand";

import gameStatusValue from "@custom-types/gameStatusValue";

interface IGameStatus {
  gameStatus: gameStatusValue;
  playGame: () => void;
  pauseGame: () => void;
  loseGame: () => void;
  winGame: () => void;
  resetGame: () => void;
}


const useGameStatusStore = create<IGameStatus>((set) => ({
  gameStatus: gameStatusValue.NOT_STARTED,
  playGame: () =>
    set(() => ({
      gameStatus: gameStatusValue.PLAYING
    })),
  pauseGame: () =>
    set(() => ({
      gameStatus: gameStatusValue.PAUSED
    })),
  loseGame: () =>
    set(() => ({
      gameStatus: gameStatusValue.LOST
    })),
  winGame: () =>
    set(() => ({
      gameStatus: gameStatusValue.WON
    })),
  resetGame: () =>
    set(() => ({
      gameStatus: gameStatusValue.NOT_STARTED
    })),
}));

export default useGameStatusStore;
