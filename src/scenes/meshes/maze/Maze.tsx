import { useMemo } from "react";
import { useMazeHotState } from "@state/useHotState";
import type { JSX } from "react";

import Wall from "@scenes/meshes/maze/Wall";
import PacDot from "@scenes/meshes/maze/PacDot";
import Floor from "@scenes/meshes/maze/Floor";
import PowerPellet from "@scenes/meshes/maze/PowerPellet";




export default function Maze() {
  const mazeState = useMazeHotState();

  // Memo for walls and floors - only updates when maze loads
  const staticMazeElements = useMemo(() => {
    if (!mazeState.isLoaded) return [];
    const meshes: JSX.Element[] = [];

    // Add walls
    for (const wallKey of mazeState.walls) {
      const [x, y] = wallKey.split(',').map(Number);
      meshes.push(<Wall key={`wall-${wallKey}`} x={x} z={y} />);
    }

    // Add floors using static floorTiles (never changes after init)
    for (const floorKey of mazeState.floorTiles) {
      const [x, y] = floorKey.split(',').map(Number);
      meshes.push(<Floor key={`floor-${floorKey}`} x={x} z={y} />);
    }

    return meshes;
  }, [mazeState.isLoaded, mazeState.walls, mazeState.floorTiles]);

  // Memo for collectables - updates when collectables change
  const collectables = useMemo(() => {
    if (!mazeState.isLoaded) return [];
    const meshes: JSX.Element[] = [];

    // Render pac dots
    for (const pacDotKey of mazeState.pacDots) {
      const [x, y] = pacDotKey.split(',').map(Number);
      meshes.push(<PacDot key={`pacdot-${pacDotKey}`} x={x} z={y} />);
    }

    // Render power pellets
    for (const powerPelletKey of mazeState.powerPellets) {
      const [x, y] = powerPelletKey.split(',').map(Number);
      meshes.push(<PowerPellet key={`pellet-${powerPelletKey}`} x={x} z={y} />);
    }

    return meshes;
  }, [mazeState.isLoaded, mazeState.pacDots, mazeState.powerPellets]);

  return [...staticMazeElements, ...collectables];
}
