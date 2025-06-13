import { TileMap } from "@core/tilemap/Tilemap";

export enum gameStatusValue {
  NOT_STARTED = "NOT_STARTED",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  LOST = "LOST",
  WINNED = "WINNED",
}

interface IGameStatus {
  gameStatus: gameStatusValue;
  playGame: () => void;
  pauseGame: () => void;
  loseGame: () => void;
  winGame: () => void;
  resetGame: () => void;
}

interface ITilemap {
  tileMap: TileMap | null
  score: number

  // acciones
  setTileMap: (map: number[][]) => void
  updateTile: (x: number, y: number, newValue: number) => void
}

type IGameState = IGameStatus & ITilemap;

export type { IGameState, IGameStatus, ITilemap};