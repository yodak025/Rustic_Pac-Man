import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";
import useMazeState from "@/state/useMazeStore";
import { Direction } from "@custom-types/gameComponents";

export function ghostBehaviorSystem(deltaTime: number): void {
  const ghosts = ['blinky', 'inky', 'pinky', 'clyde'];
  const ghostsState = useGhostsStore.getState();
  
  // Process each ghost
  ghosts.forEach(ghostName => {
    const ghost = ghostsState[ghostName] ; //[LAZY ANY] 
    
    // Skip if it's not time for this ghost to move
    if (!ghost.actions.isTimeToMove(deltaTime)) {
      return;
    }
    
    const { x: ghx, y: ghy } = ghost.components.position;
    const { x: px, y: py } = usePacmanStore.getState().pacman.components.position;
    const isWallAt = useMazeState.getState().isWallAt;
    const directions = ghost.components.directions as Array<Direction>;
    
    const clearDirections = ghost.actions.clearDirections;
    const addDirection = ghost.actions.addDirection;
    
    const decide = () => {
      // Ghost decides direction based on Pacman's position
      // Chooses the direction with the shortest Euclidean distance to Pacman
      // while avoiding reversing direction
      
      const currentDirection = directions[0];
      const oppositeDirections = {
        [Direction.UP]: Direction.DOWN,
        [Direction.DOWN]: Direction.UP,
        [Direction.LEFT]: Direction.RIGHT,
        [Direction.RIGHT]: Direction.LEFT,
      };
      
      // Possible moves and their coordinates
      const moves = [
        { dir: Direction.RIGHT, x: ghx + 1, y: ghy },
        { dir: Direction.LEFT, x: ghx - 1, y: ghy },
        { dir: Direction.DOWN, x: ghx, y: ghy + 1 },
        { dir: Direction.UP, x: ghx, y: ghy - 1 },
      ];
      
      // Filter valid moves and calculate distances
      const candidates = moves
        .filter(
          (move) =>
            move.dir !== oppositeDirections[currentDirection] &&
            !isWallAt({ x: move.x, y: move.y })
        )
        .map((move) => ({
          direction: move.dir,
          distance: Math.sqrt(
            Math.pow(move.x - px, 2) + Math.pow(move.y - py, 2)
          ),
        }));
      
      clearDirections();
      
      if (candidates.length > 0) {
        // Find direction with minimum distance
        const bestMove = candidates.reduce(
          (min, current) => (current.distance < min.distance ? current : min),
          candidates[0]
        );
        
        addDirection(bestMove.direction);
      }
    };
    
    decide();
  });
}
