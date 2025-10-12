import { create } from "zustand";
import gameStatusValue from "@custom-types/gameStatusValue";

interface IGameStatus {
  status: gameStatusValue;
  score: number;
  level: number; 
  setReadyToLoadStatus: () => void;
  setLoadingCoreStatus: () => void;
  setCoreLoadedStatus: () => void;
  setLoadingGraphicsStatus: () => void;
  setGraphicsLoadedStatus: () => void;
  setPlayingStatus: () => void;
  setPauseStatus: () => void;
  setGameOverStatus: (won: boolean) => void;
  setDebugMazeAnalyzerStatus: () => void;
  incrementScore: (amount: number) => void;
  reStart: () => void;
  reboot: () => void;
  setNextLevel: () => void;
}

const useGameStatusStore = create<IGameStatus>((set) => ({
  status: gameStatusValue.NOT_STARTED,
  score: 0,
  level: 1,
  setReadyToLoadStatus: () => set(() => ({ status: gameStatusValue.READY_TO_LOAD })),
  setLoadingCoreStatus: () => set(() => ({ status: gameStatusValue.LOADING_CORE })),
  setCoreLoadedStatus: () => set(() => ({ status: gameStatusValue.CORE_LOADED })),
  setLoadingGraphicsStatus: () => set(() => ({ status: gameStatusValue.LOADING_GRAPHICS })),
  setGraphicsLoadedStatus: () => set(() => ({ status: gameStatusValue.GRAPHICS_LOADED })),
  setPlayingStatus: () => set(() => ({ status: gameStatusValue.PLAYING })),
  setPauseStatus: () => set(() => ({ status: gameStatusValue.PAUSED })),
  setGameOverStatus: (won) => set(() => ({ 
    status: won ? gameStatusValue.WON : gameStatusValue.LOST 
  })),
  setDebugMazeAnalyzerStatus: () => set(() => ({ status: gameStatusValue.DEBUG_MAZE_ANALYZER })),
  incrementScore: (amount) => set((state) => ({
    score: state.score + amount
  })),

  reStart: () => set(() => ({
    status: gameStatusValue.RESTARTING,
    level: 1,
    score: 0
  })),

  reboot: () => set(() => ({
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
