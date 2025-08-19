import { create } from "zustand";

import gameStatusValue from "@custom-types/gameStatusValue";

interface IGameStatus {
  status: gameStatusValue;
  score: number;
  level: number; 
  // Status setters
  setLoadingState: () => void;
  setPlayingState: () => void;
  setPauseState: () => void;
  setRestartingState: () => void;
  setGameOverState: (won: boolean) => void;
  // Game actions
  incrementScore: (amount: number) => void;
  reStart: () => void;
  setNextLevel: () => void;
}

const useGameStatusStore = create<IGameStatus>((set) => ({
  status: gameStatusValue.NOT_STARTED,
  score: 0,
  level: 1,
  
  // Status setters
  setLoadingState: () => set(() => ({ status: gameStatusValue.LOADING })),
  setPlayingState: () => set(() => ({ status: gameStatusValue.PLAYING })),
  setPauseState: () => set(() => ({ status: gameStatusValue.PAUSED })),
  setRestartingState: () => set(() => ({ status: gameStatusValue.RESTARTING })),
  setGameOverState: (won) => set(() => ({ 
    status: won ? gameStatusValue.WON : gameStatusValue.LOST 
  })),
  
  // Game actions
  incrementScore: (amount) => set((state) => ({
    score: state.score + amount
  })),
  reStart: () => set(() => ({
    status: gameStatusValue.NOT_STARTED,
    level: 1,
    score: 0
  })),
  setNextLevel: () => set((state) => ({
    level: state.level + 1,
    score: state.score + 1000
  })),
}));

export default useGameStatusStore;
