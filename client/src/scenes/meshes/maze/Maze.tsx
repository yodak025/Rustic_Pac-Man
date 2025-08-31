import { useGameStatusStore } from "@state/store";
import gameStatusValue from "@/types/gameStatusValue";
import { useEffect, useMemo } from "react";
import useMazeState from "@/state/useMazeStore";
import type { JSX } from "react";

import Wall from "@scenes/meshes/maze/Wall";
import PacDot from "@scenes/meshes/maze/PacDot";
import Floor from "@scenes/meshes/maze/Floor";

export default function Maze() {
  const mazeState = useMazeState((state) => state.maze);

  const game = useGameStatusStore((state) => state);

  const useLoadMaze = () => {
    useEffect(() => {
      if (game.status === gameStatusValue.LOADING) {
        game.setPlayingStatus();
      }
    }, [game.status, game.setPlayingStatus]);
  };

  // Memo para walls y floors - solo se actualiza cuando cambia el estado del laberinto
  const staticMazeElements = useMemo(() => {
    if (!mazeState.isLoaded) return [];
    const meshes: JSX.Element[] = [];

    // Agregar walls
    for (const wallId in mazeState.walls) {
      meshes.push(<Wall key={`wall-${wallId}`} id={wallId} />);
    }

    // Agregar floors para todas las posiciones de pacDots
    for (const pacDotsId in mazeState.collectables.pacDots) {
      const position = mazeState.collectables.pacDots[pacDotsId].components.position;
      meshes.push(<Floor key={`floor-${pacDotsId}`} x={position.x} z={position.y} />);
    }

    return meshes;
  }, [mazeState.isLoaded, mazeState.walls]);

  // Memo para pacDots - se actualiza cuando cambian los pacDots
  const pacDotMeshes = useMemo(() => {
    if (!mazeState.isLoaded) return [];
    const meshes: JSX.Element[] = [];

    for (const pacDotsId in mazeState.collectables.pacDots) {
      meshes.push(<PacDot key={`pacdot-${pacDotsId}`} id={pacDotsId} />);
    }

    return meshes;
  }, [mazeState.isLoaded, mazeState.collectables.pacDots]);

  useLoadMaze();
  return [...staticMazeElements, ...pacDotMeshes];
}
