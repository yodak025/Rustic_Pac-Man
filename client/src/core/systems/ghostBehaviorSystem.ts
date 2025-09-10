import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";
import useMazeState from "@/state/useMazeStore";
import { Direction } from "@custom-types/gameComponents";
import { is } from "@react-three/fiber/dist/declarations/src/core/utils";

export function ghostBehaviorSystem(deltaTime: number): void {
  if (!useGhostsStore.getState().blinky.actions.isTimeToMove(deltaTime)) {
    return;
  }
  //[FEATURE] Only one ghost, one behavior and one pacman for now.

  const { x: ghx, y: ghy } =
    useGhostsStore.getState().blinky.components.position;
  const { x: px, y: py } = usePacmanStore.getState().pacman.components.position;
  const isWallAt = useMazeState.getState().isWallAt;
  const directions = useGhostsStore.getState().blinky.components
    .directions as Array<Direction>;

  const clearDirections =
    useGhostsStore.getState().blinky.actions.clearDirections;
  const addDirection = useGhostsStore.getState().blinky.actions.addDirection;

  const decide = () => {
    // Ghost decides direction based on Pacman's position
    // Chooses the direction with the shortest Euclidean distance to Pacman
    // while avoiding reversing direction
    
    const currentDirection = directions[0];
    const oppositeDirections = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT
    };

    // Possible moves and their coordinates
    const moves = [
      { dir: Direction.RIGHT, x: ghx + 1, y: ghy },
      { dir: Direction.LEFT, x: ghx - 1, y: ghy },
      { dir: Direction.DOWN, x: ghx, y: ghy + 1 },
      { dir: Direction.UP, x: ghx, y: ghy - 1 }
    ];

    // Filter valid moves and calculate distances
    const candidates = moves
      .filter(move => 
        move.dir !== oppositeDirections[currentDirection] && 
        !isWallAt({ x: move.x, y: move.y })
      )
      .map(move => ({
        direction: move.dir,
        distance: Math.sqrt(Math.pow(move.x - px, 2) + Math.pow(move.y - py, 2))
      }));

    clearDirections();

    if (candidates.length > 0) {
      // Find direction with minimum distance
      const bestMove = candidates.reduce(
        (min, current) => current.distance < min.distance ? current : min,
        candidates[0]
      );
      
      addDirection(bestMove.direction);
    }
  };
  decide();
}
