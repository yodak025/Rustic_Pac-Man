/**
 * Entity Collision System
 * 
 * PHASE: DETECTION (4)
 * RESPONSIBILITY: Detect collisions between Pacman and ghosts/echos
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import type { DiscretePosition, BehaviorMode, CurrentDirection, CollisionEvent } from '@custom-types/components';
import { BehaviorMode as BehaviorModeEnum, Direction } from '@custom-types/gameComponents';

/**
 * Detect collisions between Pacman and ghosts/echos (including crossover cases)
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

  // Check Ghost collisions
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
    if (ghostBehavior.mode === BehaviorModeEnum.EATEN) {
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

  // Check Echo collisions
  const echoEntities = gameWorld.query(
    ComponentType.ECHO_TAG,
    ComponentType.DISCRETE_POSITION,
    ComponentType.BEHAVIOR_MODE
  );

  for (const echoId of echoEntities) {
    const echoPos = gameWorld.getComponent(
      echoId,
      ComponentType.DISCRETE_POSITION
    ) as DiscretePosition | undefined;
    const echoBehavior = gameWorld.getComponent(
      echoId,
      ComponentType.BEHAVIOR_MODE
    ) as BehaviorMode | undefined;
    const echoDir = gameWorld.getComponent(
      echoId,
      ComponentType.CURRENT_DIRECTION
    ) as CurrentDirection | undefined;

    if (!echoPos) {
      console.error(`[entityCollisionSystem] Echo ${echoId} missing DiscretePosition component`);
      continue;
    }
    if (!echoBehavior) {
      console.error(`[entityCollisionSystem] Echo ${echoId} missing BehaviorMode component`);
      continue;
    }
    if (!echoDir) {
      console.error(`[entityCollisionSystem] Echo ${echoId} missing CurrentDirection component`);
      continue;
    }

    // Skip eaten echos
    if (echoBehavior.mode === BehaviorModeEnum.EATEN) {
      continue;
    }

    // Check for collision (direct or crossover)
    const hasCollision = 
      (echoPos.x === playerPos.x && echoPos.y === playerPos.y) ||
      (playerLastDir && echoDir.direction && checkCrossover(playerPos, playerLastDir, echoPos, echoDir.direction));

    if (hasCollision) {
      const collisionEvent: CollisionEvent = {
        withEntity: echoId,
        type: 'echo'
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
 * Check if Pacman and entity crossed over each other
 * Returns true if they are adjacent and moving in opposite directions
 */
function checkCrossover(
  playerPos: DiscretePosition,
  playerDir: Direction,
  entityPos: DiscretePosition,
  entityDir: Direction
): boolean {
  const dx = Math.abs(playerPos.x - entityPos.x);
  const dy = Math.abs(playerPos.y - entityPos.y);

  // Must be adjacent (manhattan distance = 1)
  if (dx + dy !== 1) {
    return false;
  }

  // Check if directions are opposite
  const isOppositeHorizontal =
    (playerDir === Direction.LEFT && entityDir === Direction.RIGHT && playerPos.x < entityPos.x) ||
    (playerDir === Direction.RIGHT && entityDir === Direction.LEFT && playerPos.x > entityPos.x);

  const isOppositeVertical =
    (playerDir === Direction.UP && entityDir === Direction.DOWN && playerPos.y < entityPos.y) ||
    (playerDir === Direction.DOWN && entityDir === Direction.UP && playerPos.y > entityPos.y);

  return isOppositeHorizontal || isOppositeVertical;
}
