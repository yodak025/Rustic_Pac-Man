/**
 * Ghost Targeting System
 * 
 * Calculates target positions for ghosts in CHASE mode.
 * Each ghost has a unique targeting algorithm:
 * - BLINKY: Directly targets Pacman
 * - PINKY: Targets 4 tiles ahead of Pacman
 * - INKY: Targets based on vector from Blinky to 2 tiles ahead of Pacman, doubled (only if Blinky is chasing, otherwise acts like Blinky)
 * - CLYDE: Targets Pacman if >8 tiles away, otherwise scatter corner
 * 
 * PHASE: GHOST_TARGETING
 * RESPONSIBILITY: Calculate navigation targets for ghost AI
 * 
 * @see /docs/ECS_ARCHITECTURE_DESIGN.md Section 4.2 - GhostTargetingSystem
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, PACMAN_ENTITY_ID, BLINKY_ENTITY_ID } from '@custom-types/componentTypes';
import { BehaviorMode, GhostBehaviorKind, TargetKind, Direction } from '@custom-types/gameComponents';
import * as config from '@config/defaultPositions.json';

const SCATTER_TARGET = config.DEFAULT_POSITIONS.SCATTER;

/**
 * Ghost Targeting System
 * 
 * Updates TargetPosition for ghosts in CHASE mode based on their behavior kind.
 * Only runs for ghosts in CHASE mode.
 */
export function ghostTargetingSystem(gameWorld: GameWorld): void {
  // Query all ghosts
  const ghostEntities = gameWorld.query(
    ComponentType.GHOST_TAG,
    ComponentType.BEHAVIOR_MODE,
    ComponentType.DISCRETE_POSITION,
    ComponentType.TARGET_POSITION
  );

  // Get Pacman's position and direction (needed by all targeting algorithms)
  const pacmanPosition = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.DISCRETE_POSITION);
  const pacmanIntent = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_INTENT);

  if (!pacmanPosition) {
    console.error('[ghostTargetingSystem] Pacman position not found');
    return;
  }

  // Get Pacman's current direction from PlayerIntent.lastValidDirection
  const pacmanDirection = pacmanIntent?.lastValidDirection || null;

  for (const entityId of ghostEntities) {
    const ghostTag = gameWorld.getComponent(entityId, ComponentType.GHOST_TAG);
    const behaviorMode = gameWorld.getComponent(entityId, ComponentType.BEHAVIOR_MODE);
    const ghostPosition = gameWorld.getComponent(entityId, ComponentType.DISCRETE_POSITION);

    if (!ghostTag || !behaviorMode || !ghostPosition) {
      console.error(`[ghostTargetingSystem] Missing components for entity ${entityId}`);
      continue;
    }

    // Only update target if in CHASE mode
    if (behaviorMode.mode !== BehaviorMode.CHASE) {
      continue;
    }

    const ghostKind = ghostTag.kind;
    let targetX = pacmanPosition.x;
    let targetY = pacmanPosition.y;

    switch (ghostKind) {
      case GhostBehaviorKind.BLINKY: {
        // Blinky directly targets Pacman
        targetX = pacmanPosition.x;
        targetY = pacmanPosition.y;
        break;
      }

      case GhostBehaviorKind.PINKY: {
        // Pinky targets 4 tiles ahead of Pacman
        targetX = pacmanPosition.x;
        targetY = pacmanPosition.y;

        if (pacmanDirection === Direction.UP) {
          targetY -= 4;
        } else if (pacmanDirection === Direction.DOWN) {
          targetY += 4;
        } else if (pacmanDirection === Direction.LEFT) {
          targetX -= 4;
        } else if (pacmanDirection === Direction.RIGHT) {
          targetX += 4;
        }
        break;
      }

      case GhostBehaviorKind.INKY: {
        // Inky's targeting depends on Blinky's state
        const blinkyPosition = gameWorld.getComponent(BLINKY_ENTITY_ID, ComponentType.DISCRETE_POSITION);
        const blinkyMode = gameWorld.getComponent(BLINKY_ENTITY_ID, ComponentType.BEHAVIOR_MODE);

        // If Blinky is not chasing, Inky acts like Blinky
        if (!blinkyPosition || !blinkyMode || blinkyMode.mode !== BehaviorMode.CHASE) {
          targetX = pacmanPosition.x;
          targetY = pacmanPosition.y;
          break;
        }

        // Blinky is chasing: use Inky's complex algorithm
        // Calculate intermediate position: 2 tiles ahead of Pacman
        let intermediateX = pacmanPosition.x;
        let intermediateY = pacmanPosition.y;

        if (pacmanDirection === Direction.UP) {
          intermediateY -= 2;
        } else if (pacmanDirection === Direction.DOWN) {
          intermediateY += 2;
        } else if (pacmanDirection === Direction.LEFT) {
          intermediateX -= 2;
        } else if (pacmanDirection === Direction.RIGHT) {
          intermediateX += 2;
        }

        // Vector from Blinky to intermediate position, then doubled
        const vectorX = intermediateX - blinkyPosition.x;
        const vectorY = intermediateY - blinkyPosition.y;
        
        targetX = intermediateX + vectorX;
        targetY = intermediateY + vectorY;
        break;
      }

      case GhostBehaviorKind.CLYDE: {
        // Clyde targets Pacman if >8 tiles away, otherwise scatter corner
        const dx = ghostPosition.x - pacmanPosition.x;
        const dy = ghostPosition.y - pacmanPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 8) {
          targetX = pacmanPosition.x;
          targetY = pacmanPosition.y;
        } else {
          targetX = SCATTER_TARGET.CLYDE.x;
          targetY = SCATTER_TARGET.CLYDE.y;
        }
        break;
      }

      default: {
        console.error(`[ghostTargetingSystem] Unknown ghost kind: ${ghostKind}`);
      }
    }

    // Update target position
    gameWorld.setComponent(entityId, ComponentType.TARGET_POSITION, {
      x: targetX,
      y: targetY,
      kind: TargetKind.PLAYER
    });
  }
}
