import { useTilemapState, useGameStatusStore } from "@state/store";
import gameStatusValue from "@/types/gameStatusValue";
import TileMesh from "@scenes/meshes/maze/TileMesh";
import { useEffect, useMemo, useState } from "react";
import { loadMaze } from "@/services/api";
import useMazeState from "@/state/useMazeState";
import type { JSX } from "react";

import Wall from "@scenes/meshes/maze/Wall";

export default function Maze() {
  const mazeState = useMazeState((state) => state.maze);

  const tilemap = useTilemapState((state) => state);
  const game = useGameStatusStore((state) => state);
  const [isTilemapReadyToRender, setTilemapRenderState] = useState(false);

  

  const useLoadMaze = () => {
    useEffect(() => {
      if (game.status === gameStatusValue.GENERATING_MAZE) {
        loadMaze().then((maze) => {
          if (maze) {
            tilemap.setTileMap(maze);
            setTilemapRenderState(true);
            game.setStatus(gameStatusValue.SETTING_PACMAN);
          }
        });
      }
    }, [game.status, game.setStatus]);
  };

  const tileMeshes = useMemo(() => {
    if (!mazeState.isLoaded) return [];
    const meshes: JSX.Element[] = [];

    for (const wallId in mazeState.walls) {
      meshes.push(
        <Wall key={wallId} id={wallId} />
      );
    }

    mazeState.walls
    return meshes;
  }, [mazeState.isLoaded]);

  useLoadMaze();
  return tileMeshes;
}
