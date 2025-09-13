import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";
import useMazeState from "@/state/useMazeStore";
import { Direction } from "@custom-types/gameComponents";

import { GhostBehaviorMode } from "@custom-types/gameComponents";
import { use } from "react";
export function ghostBehaviorSystem(deltaTime: number): void {
  const ghosts = Object.values(useGhostsStore.getState());
  
  
  // Process each ghost
  ghosts.forEach(ghost => {

    // Skip if it's not time for this ghost to move
    if (!ghost.actions.isTimeToMove(deltaTime)) {
      return;
    }

    const { x: ghx, y: ghy } = ghost.components.position;
    const { x: tx, y: ty } = ghost.components.behavior.target.position || { x: 14, y: 14 };

    switch (ghost.components.behavior.mode) {
      case GhostBehaviorMode.HOUSE:
        
        if (ghost.components.behavior.ticks <= 0){
          ghost.actions.setBehaviorMode(GhostBehaviorMode.EXITING_HOUSE);
          ghost.actions.setBehaviorTarget({ kind: 'HOUSE', position: {x:14, y: 10} });
        } else {
          ghost.actions.setBehaviorTicks((ghost.components.behavior.ticks) - 1); //[TODO] create a decrement action
          return; // Stay in house until ticks run out
        }
      break;
      case GhostBehaviorMode.EXITING_HOUSE:
        if (ghx === tx && ghy === ty) {
          ghost.actions.setBehaviorMode(GhostBehaviorMode.CHASE);
          ghost.actions.setBehaviorTarget({ kind: 'CHASE', position: usePacmanStore.getState().pacman.components.position });
        }
      break;
      case GhostBehaviorMode.SCATTER:
        // Logic for scatter behavior (not implemented here)
      break;
      case GhostBehaviorMode.CHASE:
        ghost.actions.setBehaviorTarget({
          kind: 'PLAYER',
          position: usePacmanStore.getState().pacman.components.position
        })
      break;
      case GhostBehaviorMode.FRIGHTENED:
        // Logic for frightened (not implemented here)
      break;
      case GhostBehaviorMode.EATEN:
        // Logic for eaten state (not implemented here)
      break;
      default:
        throw (`The GhostBehaviorMode '${ghost.components.behavior.mode}' is not recognized in ghostBehaviorSystem`);

    }
    

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
            Math.pow(move.x - tx, 2) + Math.pow(move.y - ty, 2)
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
