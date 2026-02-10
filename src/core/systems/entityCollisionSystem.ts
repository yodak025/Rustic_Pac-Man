/**
 * Entity Collision System
 * 
 * PHASE: DETECTION (4)
 * RESPONSIBILITY: Detect collisions between Pacman and ghosts
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import type { DiscretePosition, BehaviorMode, CurrentDirection, CollisionEvent } from '@custom-types/components';
import { GhostBehaviorMode, Direction } from '@custom-types/gameComponents';

/**
 * Detect collisions between Pacman and ghosts (including crossover cases)
 */
export function entityCollisionSystem(gameWorld: GameWorld): void {
  const playerEntities = gameWorld.query(
    ComponentType.PLAYER_TAG,
    ComponentType.DISCRETE_POSITION
  );

  if (playerEntities.length === 0) {
    return;
  }

  const playerId = playerEntities[0];
  const playerPos = gameWorld.getComponent(
    playerId,
    ComponentType.DISCRETE_POSITION
  ) as DiscretePosition | undefined;

  if (!playerPos) {
    console.error('[entityCollisionSystem] Player entity missing DiscretePosition component');
    return;
  }

  const playerIntent = gameWorld.getComponent(
    playerId,
    ComponentType.PLAYER_INTENT
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerLastDir = (playerIntent as any)?.lastValidDirection || null;

  const ghostEntities = gameWorld.query(
    ComponentType.GHOST_TAG,
    ComponentType.DISCRETE_POSITION,
    ComponentType.BEHAVIOR_MODE
  );

  for (const ghostId of ghostEntities) {
    const ghostPos = gameWorld.getComponent(
      ghostId,
      ComponentType.DISCRETE_POSITION
    ) as DiscretePosition | undefined;
    const ghostBehavior = gameWorld.getComponent(
      ghostId,
      ComponentType.BEHAVIOR_MODE
    ) as BehaviorMode | undefined;
    const ghostDir = gameWorld.getComponent(
      ghostId,
      ComponentType.CURRENT_DIRECTION
    ) as CurrentDirection | undefined;

    if (!ghostPos) {
      console.error(`[entityCollisionSystem] Ghost ${ghostId} missing DiscretePosition component`);
      continue;
    }
    if (!ghostBehavior) {
      console.error(`[entityCollisionSystem] Ghost ${ghostId} missing BehaviorMode component`);
      continue;
    }
    if (!ghostDir) {
      console.error(`[entityCollisionSystem] Ghost ${ghostId} missing CurrentDirection component`);
      continue;
    }

    // Skip eaten ghosts
    if (ghostBehavior.mode === GhostBehaviorMode.EATEN) {
      continue;
    }

    // Check for collision (direct or crossover)
    const hasCollision = 
      (ghostPos.x === playerPos.x && ghostPos.y === playerPos.y) ||
      (playerLastDir && ghostDir.direction && checkCrossover(playerPos, playerLastDir, ghostPos, ghostDir.direction));

    if (hasCollision) {
      const collisionEvent: CollisionEvent = {
        withEntity: ghostId,
        type: 'ghost'
      };

      gameWorld.addComponent(
        PACMAN_ENTITY_ID,
        ComponentType.COLLISION_EVENT,
        collisionEvent
      );
    }
  }
}

/**
 * Check if Pacman and ghost crossed over each other
 * Returns true if they are adjacent and moving in opposite directions
 */
function checkCrossover(
  playerPos: DiscretePosition,
  playerDir: Direction,
  ghostPos: DiscretePosition,
  ghostDir: Direction
): boolean {
  const dx = Math.abs(playerPos.x - ghostPos.x);
  const dy = Math.abs(playerPos.y - ghostPos.y);

  // Must be adjacent (manhattan distance = 1)
  if (dx + dy !== 1) {
    return false;
  }

  // Check if directions are opposite
  const isOppositeHorizontal =
    (playerDir === Direction.LEFT && ghostDir === Direction.RIGHT && playerPos.x < ghostPos.x) ||
    (playerDir === Direction.RIGHT && ghostDir === Direction.LEFT && playerPos.x > ghostPos.x);

  const isOppositeVertical =
    (playerDir === Direction.UP && ghostDir === Direction.DOWN && playerPos.y < ghostPos.y) ||
    (playerDir === Direction.DOWN && ghostDir === Direction.UP && playerPos.y > ghostPos.y);

  return isOppositeHorizontal || isOppositeVertical;
}
