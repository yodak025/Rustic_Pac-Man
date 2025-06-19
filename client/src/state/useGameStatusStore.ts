import { create } from "zustand";

import gameStatusValue from "@custom-types/gameStatusValue";

interface IGameStatus {
  status: gameStatusValue;
  isDebugMode: boolean; // Optional property for debug mode
  score: number;
  level: number; 
  // Actions 
  setStatus: (status: gameStatusValue) => void;
  incrementScore: (amount: number) => void;
  reStart: () => void;
  setNextLevel: () => void;
  toggleDebugMode: () => void;

}


const useGameStatusStore = create<IGameStatus>((set) => ({
  status: gameStatusValue.NOT_STARTED,
  isDebugMode: false, // Initialize debug mode to false
  score: 0, // Initialize score to 0
  level: 1, // Initialize level to 1
  setStatus: (status) => set(() => ({
    status: status
  }))
  ,
  incrementScore: (amount) => set((state) => ({
    score : state.score + amount})),
  reStart: () => set(() => ({
    status: gameStatusValue.NOT_STARTED,
    level: 1, // Reset level to 1 when restarting the game
    score: 0 // Reset score to 0 when restarting the game
  })),
  setNextLevel: () => set((state) => ({
    level: state.level + 1,
    score: state.score + 1000 // Increment score by 100 for each new level
  })),
  toggleDebugMode: () => set((state) => ({
    isDebugMode: !state.isDebugMode
  })),

}));

export default useGameStatusStore;
