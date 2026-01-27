import useGhostsStore from "@/state/useGhostsStore";
import { manageBehaviorMode } from "./ghostModeManager";
import { manageChaseBehavior } from "./ghostChaseKindManager";
import { decideGhostDirection } from "./ghostDirectionDecider";
import type { GameWorld } from "@core/GameWorld";

export function ghostBehaviorSystem(deltaTime: number, gameWorld?: GameWorld): void {
  const ghosts = useGhostsStore.getState().actions.getGhosts();
  // Process each ghost
  ghosts.forEach((ghost) => {
    const isTimeToMove = ghost.actions.isTimeToMove(deltaTime);
    // Skip if it's not time for this ghost to move
    if (!isTimeToMove) {
      return
    }
    // [ERROR HANDLING] Remenber to check the ghost props and its values

    // Handle behavior mode with callback for chase behavior
    const isDirectionDecision = manageBehaviorMode(ghost, () => {
      manageChaseBehavior(ghost);
    });
    
    // Decide movement direction
    if (isDirectionDecision) decideGhostDirection(ghost, gameWorld);
  });
}