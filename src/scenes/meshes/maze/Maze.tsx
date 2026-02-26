import { useMazeHotState, useEchosHotState } from "@state/useHotState";
import type { Position } from "@custom-types/gameComponents";

import InstancedWalls from "@scenes/meshes/maze/InstancedWalls";
import InstancedFloors from "@scenes/meshes/maze/InstancedFloors";
import InstancedPacDots from "@scenes/meshes/maze/InstancedPacDots";
import InstancedPowerPellets from "@scenes/meshes/maze/InstancedPowerPellets";
import InstancedEchos from "@scenes/meshes/maze/InstancedEchos";

/**
 * Convert Set<PositionKey> to Position[] array
 */
function convertPositions(positionSet: Set<string>): Position[] {
  const positions: Position[] = [];
  
  for (const key of positionSet) {
    const [x, y] = key.split(',').map(Number);
    positions.push({ x, y });
  }
  
  return positions;
}

export default function Maze() {
  const mazeState = useMazeHotState();
  const echosMap = useEchosHotState();

  if (!mazeState.isLoaded) {
    return null;
  }

  const wallPositions = convertPositions(mazeState.walls);
  const floorPositions = convertPositions(mazeState.floorTiles);
  const pacDotPositions = convertPositions(mazeState.pacDots);
  const powerPelletPositions = convertPositions(mazeState.powerPellets);

  return (
    <>
      <InstancedWalls positions={wallPositions} />
      <InstancedFloors positions={floorPositions} />
      <InstancedPacDots positions={pacDotPositions} />
      <InstancedPowerPellets positions={powerPelletPositions} />
      <InstancedEchos echosMap={echosMap} />
    </>
  );
}
