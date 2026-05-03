import { useMazeHotState, useEchosHotState } from "@state/useHotState";
import type { Position } from "@custom-types/gameComponents";

import InstancedWalls from "@scenes/meshes/maze/InstancedWalls";
import InstancedFloors from "@scenes/meshes/maze/InstancedFloors";
import InstancedPacDots from "@scenes/meshes/maze/InstancedPacDots";
import InstancedPowerPellets from "@scenes/meshes/maze/InstancedPowerPellets";
import InstancedMedallions from "@scenes/meshes/maze/InstancedMedallions";
import Sinusoid from "@scenes/meshes/entities/Sinusoid";

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
  const essenceDotPositions = convertPositions(mazeState.essenceDots);
  const whiteNoiseBallPositions = convertPositions(mazeState.whiteNoiseBalls);

  return (
    <>
      <InstancedWalls positions={wallPositions} />
      <InstancedFloors positions={floorPositions} />
      <InstancedPacDots positions={essenceDotPositions} />
      <InstancedPowerPellets positions={whiteNoiseBallPositions} />
      <InstancedMedallions medallions={mazeState.medallions} />
      <Sinusoid echosMap={echosMap} />
    </>
  );
}
