import { useGameStatusStore } from "@state/store";
import gameStatusValue from "@/types/gameStatusValue";
import { useEffect, useMemo } from "react";
import useMazeState from "@/state/useMazeState";
import type { JSX } from "react";

import Wall from "@scenes/meshes/maze/Wall";
import PacDot from "@scenes/meshes/maze/PacDot";

export default function Maze() {
  const mazeState = useMazeState((state) => state.maze);

  const game = useGameStatusStore((state) => state);

  const useLoadMaze = () => {
    useEffect(() => {
      if (game.status === gameStatusValue.GENERATING_MAZE) {
        game.setStatus(gameStatusValue.SETTING_PACMAN);
      }
    }, [game.status, game.setStatus]);
  };

  const tileMeshes = useMemo(() => {
    if (!mazeState.isLoaded) return [];
    const meshes: JSX.Element[] = [];

    for (const wallId in mazeState.walls) {
      meshes.push(<Wall key={wallId} id={wallId} />);
    }
    for (const pacDotsId in mazeState.collectables.pacDots) {
      meshes.push(<PacDot key={pacDotsId} id={pacDotsId} />);
    }

    mazeState.walls;
    return meshes;
  }, [mazeState.isLoaded]);

  useLoadMaze();
  return tileMeshes;
}
