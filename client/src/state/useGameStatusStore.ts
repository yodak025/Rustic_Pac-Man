import { create } from "zustand";

import gameStatusValue from "@custom-types/gameStatusValue";

interface IGameStatus {
  status: gameStatusValue;
  setStatus: (status: gameStatusValue) => void;
}


const useGameStatusStore = create<IGameStatus>((set) => ({
  status: gameStatusValue.NOT_STARTED,
  setStatus: (status: gameStatusValue) => set(() => ({
    status: status
  }))
}));

export default useGameStatusStore;
