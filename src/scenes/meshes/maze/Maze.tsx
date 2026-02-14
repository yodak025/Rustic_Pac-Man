import { useMemo } from "react";
import { useMazeHotState } from "@state/useHotState";
import type { Position } from "@custom-types/gameComponents";

import InstancedWalls from "@scenes/meshes/maze/InstancedWalls";
import InstancedFloors from "@scenes/meshes/maze/InstancedFloors";
import InstancedPacDots from "@scenes/meshes/maze/InstancedPacDots";
import InstancedPowerPellets from "@scenes/meshes/maze/InstancedPowerPellets";




export default function Maze() {
  const mazeState = useMazeHotState();

  // Memo for wall positions - only updates when maze loads
  const wallPositions = useMemo(() => {
    if (!mazeState.isLoaded) return [];
    const positions: Position[] = [];

    for (const wallKey of mazeState.walls) {
      const [x, y] = wallKey.split(',').map(Number);
      positions.push({ x, y });
    }

    return positions;
  }, [mazeState.isLoaded, mazeState.walls]);

  // Memo for floor positions - only updates when maze loads
  const floorPositions = useMemo(() => {
    if (!mazeState.isLoaded) return [];
    const positions: Position[] = [];

    for (const floorKey of mazeState.floorTiles) {
      const [x, y] = floorKey.split(',').map(Number);
      positions.push({ x, y });
    }

    return positions;
  }, [mazeState.isLoaded, mazeState.floorTiles]);

  // Memo for pac dot positions - updates when pac dots change
  const pacDotPositions = useMemo(() => {
    if (!mazeState.isLoaded) return [];
    const positions: Position[] = [];

    for (const pacDotKey of mazeState.pacDots) {
      const [x, y] = pacDotKey.split(',').map(Number);
      positions.push({ x, y });
    }

    return positions;
  }, [mazeState.isLoaded, mazeState.pacDots]);

  // Memo for power pellet positions - updates when power pellets change
  const powerPelletPositions = useMemo(() => {
    if (!mazeState.isLoaded) return [];
    const positions: Position[] = [];

    for (const powerPelletKey of mazeState.powerPellets) {
      const [x, y] = powerPelletKey.split(',').map(Number);
      positions.push({ x, y });
    }

    return positions;
  }, [mazeState.isLoaded, mazeState.powerPellets]);

  return (
    <>
      <InstancedWalls positions={wallPositions} />
      <InstancedFloors positions={floorPositions} />
      <InstancedPacDots positions={pacDotPositions} />
      <InstancedPowerPellets positions={powerPelletPositions} />
    </>
  );
}
