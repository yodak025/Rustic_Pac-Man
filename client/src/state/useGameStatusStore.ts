import { create } from "zustand";

import gameStatusValue from "@custom-types/gameStatusValue";

interface IGameStatus {
  status: gameStatusValue;
  score: number; 
  setStatus: (status: gameStatusValue) => void;
  incrementScore: (amount: number) => void;
}


const useGameStatusStore = create<IGameStatus>((set) => ({
  status: gameStatusValue.NOT_STARTED,
  score: 0, // Initialize score to 0
  setStatus: (status) => set(() => ({
    status: status
  }))
  ,
  incrementScore: (amount) => set((state) => ({
    score : state.score + amount}))
}));

export default useGameStatusStore;
