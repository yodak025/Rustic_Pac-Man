import { create } from 'zustand';

interface Position {
  x: number;
  y: number;
}

interface PacmanState {
  position: Position;
  setPosition: (position: Position) => void;
  updatePosition: (x: number, y: number) => void;
}
const usePacmanState = create<PacmanState>((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set({ position }),
  updatePosition: (x, y) => set({ position: { x, y } }),
}));

export default usePacmanState;