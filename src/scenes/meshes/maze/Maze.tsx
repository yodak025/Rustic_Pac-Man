import { useMazeHotState, usePacmanHotState } from "@state/useHotState";
import type { Position } from "@custom-types/gameComponents";

import InstancedWalls from "@scenes/meshes/maze/InstancedWalls";
import InstancedFloors from "@scenes/meshes/maze/InstancedFloors";
import InstancedPacDots from "@scenes/meshes/maze/InstancedPacDots";
import InstancedPowerPellets from "@scenes/meshes/maze/InstancedPowerPellets";

// Asymmetric visibility margins based on isometric camera perspective
// Camera looks down from above-right, so we need more visibility upward/ahead
const VISIBILITY_MARGIN = {
  left: 35,   // tiles to the left
  right: 30,  // tiles to the right
  up: 35,     // tiles upward (away from camera)
  down: 15   // tiles downward (toward camera)
};

/**
 * Filter Set<PositionKey> to only render tiles within asymmetric visibility range of the player
 * Converts Set to Position[] array and filters in one pass
 */
function filterVisiblePositions(positionSet: Set<string>, playerPos: Position): Position[] {
  const visible: Position[] = [];

  for (const key of positionSet) {
    const [x, y] = key.split(',').map(Number);
    const dx = x - playerPos.x;
    const dy = y - playerPos.y;

    // Check if within asymmetric bounds
    if (
      dx >= -VISIBILITY_MARGIN.left &&
      dx <= VISIBILITY_MARGIN.right &&
      dy >= -VISIBILITY_MARGIN.up &&
      dy <= VISIBILITY_MARGIN.down
    ) {
      visible.push({ x, y });
    }
  }

  return visible;
}

export default function Maze() {
  const mazeState = useMazeHotState();
  const pacmanPosition = usePacmanHotState().position;

  if (!mazeState.isLoaded) {
    return null;
  }

  // Extract totals as primitive values (copies, not references)
  // This prevents unintended reactivity if these values change in the store
  const wallsTotal = mazeState.walls.size;
  const floorsTotal = mazeState.floorTiles.size;
  const pacDotsTotal = mazeState.pacDotsTotal;
  const powerPelletsTotal = mazeState.powerPelletsTotal;

  // Calculate visible positions directly (no memoization)
  const wallPositions = filterVisiblePositions(mazeState.walls, pacmanPosition);
  const floorPositions = filterVisiblePositions(mazeState.floorTiles, pacmanPosition);
  const pacDotPositions = filterVisiblePositions(mazeState.pacDots, pacmanPosition);
  const powerPelletPositions = filterVisiblePositions(mazeState.powerPellets, pacmanPosition);

  // Log optimization stats (only for walls to avoid spam)
  if (wallPositions.length > 0) {
    const reductionPercent = ((1 - wallPositions.length / wallsTotal) * 100).toFixed(1);
    console.log(`[Maze Optimization] Walls: ${wallPositions.length}/${wallsTotal} rendered (${reductionPercent}% culled)`);
  }

  return (
    <>
      <InstancedWalls positions={wallPositions} totalCount={wallsTotal} />
      <InstancedFloors positions={floorPositions} totalCount={floorsTotal} />
      <InstancedPacDots positions={pacDotPositions} totalCount={pacDotsTotal} />
      <InstancedPowerPellets positions={powerPelletPositions} totalCount={powerPelletsTotal} />
    </>
  );
}
