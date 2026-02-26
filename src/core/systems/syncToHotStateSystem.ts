/**
 * Sync To Hot State System
 * 
 * PHASE: SYNC_TO_HOT_STATE
 * RESPONSIBILITY: Synchronize GameWorld data to Zustand Hot State for React rendering
 * 
 * This system runs once per frame at the end of the game loop.
 * It copies necessary data from GameWorld (Cold State) to useHotState (Hot State)
 * for React components to render.
 */

import type { GameWorld } from '@core/GameWorld';
import {
  ComponentType,
  PACMAN_ENTITY_ID,
  BLINKY_ENTITY_ID,
  PINKY_ENTITY_ID,
  INKY_ENTITY_ID,
  CLYDE_ENTITY_ID
} from '@custom-types/componentTypes';
import { useHotState, type EchoRenderState } from '@state/useHotState';

/**
 * Sync Pacman data from GameWorld to Hot State
 * 
 * @param gameWorld - The ECS world
 */
export function syncToHotStateSystem(gameWorld: GameWorld): void {
  // Build sync payload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const syncPayload: any = {};

  // ========================================================================
  // SYNC PACMAN
  // ========================================================================

  const position = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.CONTINUOUS_POSITION);
  const health = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.HEALTH);
  const invulnerability = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.INVULNERABILITY);
  const playerIntent = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_INTENT);

  if (position || health || invulnerability || playerIntent) {
    syncPayload.pacman = {};

    if (position) {
      syncPayload.pacman.position = { x: position.x, y: position.y };
    }

    if (health) {
      syncPayload.pacman.health = health.current;
    }

    if (invulnerability) {
      syncPayload.pacman.isInvulnerable = invulnerability.ticksRemaining > 0;
    }

    if (playerIntent && playerIntent.lastValidDirection) {
      syncPayload.pacman.direction = playerIntent.lastValidDirection;
    }
  }

  // ========================================================================
  // SYNC GHOSTS
  // ========================================================================

  syncPayload.ghosts = {};

  const ghostIds = [
    { id: BLINKY_ENTITY_ID, key: 'blinky' },
    { id: PINKY_ENTITY_ID, key: 'pinky' },
    { id: INKY_ENTITY_ID, key: 'inky' },
    { id: CLYDE_ENTITY_ID, key: 'clyde' }
  ] as const;

  for (const ghost of ghostIds) {
    const ghostPosition = gameWorld.getComponent(ghost.id, ComponentType.DISCRETE_POSITION);
    const ghostMode = gameWorld.getComponent(ghost.id, ComponentType.BEHAVIOR_MODE);
    const ghostDirection = gameWorld.getComponent(ghost.id, ComponentType.CURRENT_DIRECTION);
    const ghostTimer = gameWorld.getComponent(ghost.id, ComponentType.TIMER);

    if (ghostPosition || ghostMode || ghostDirection || ghostTimer) {
      syncPayload.ghosts[ghost.key] = {};

      if (ghostPosition) {
        syncPayload.ghosts[ghost.key].position = {
          x: ghostPosition.x,
          y: ghostPosition.y
        };
      }

      if (ghostMode) {
        syncPayload.ghosts[ghost.key].mode = ghostMode.mode;
      }

      if (ghostDirection) {
        syncPayload.ghosts[ghost.key].direction = ghostDirection.direction;
      }

      if (ghostTimer) {
        syncPayload.ghosts[ghost.key].timer = {
          elapsed: ghostTimer.elapsed,
          interval: ghostTimer.interval
        };
      }
    }
  }

  // ========================================================================
  // SYNC ECHOS
  // ========================================================================

  const echoEntities = gameWorld.query(
    ComponentType.ECHO_TAG,
    ComponentType.DISCRETE_POSITION,
    ComponentType.BEHAVIOR_MODE,
    ComponentType.CURRENT_DIRECTION,
    ComponentType.COLLECTED_SCORE
  );

  const echosMap = new Map<string, EchoRenderState>();

  for (const echoId of echoEntities) {
    const echoPosition = gameWorld.getComponent(echoId, ComponentType.DISCRETE_POSITION);
    const echoMode = gameWorld.getComponent(echoId, ComponentType.BEHAVIOR_MODE);
    const echoDirection = gameWorld.getComponent(echoId, ComponentType.CURRENT_DIRECTION);
    const echoCollectedScore = gameWorld.getComponent(echoId, ComponentType.COLLECTED_SCORE);
    const echoTimer = gameWorld.getComponent(echoId, ComponentType.TIMER);

    if (echoPosition && echoMode && echoDirection !== undefined && echoCollectedScore && echoTimer !== undefined) {
      echosMap.set(echoId, {
        position: { x: echoPosition.x, y: echoPosition.y },
        mode: echoMode.mode,
        direction: echoDirection.direction,
        collectedScore: echoCollectedScore.points,
        timer: { elapsed: echoTimer.elapsed, interval: echoTimer.interval }
      });
    }
  }

  syncPayload.echos = echosMap;

  // ========================================================================
  // SYNC MAZE STATE
  // ========================================================================

  const mazeInfo = gameWorld.getMazeInfo();

  syncPayload.maze = {
    isLoaded: mazeInfo.isLoaded,
    walls: gameWorld.getWalls(),
    pacDots: gameWorld.getPacDots(),
    powerPellets: gameWorld.getPowerPellets(),
    pacDotsTotal: mazeInfo.pacDots.total,
    pacDotsCollected: mazeInfo.pacDots.total - mazeInfo.pacDots.current,
    powerPelletsTotal: mazeInfo.powerPellets.total,
  };

  // ========================================================================
  // SYNC GAME STATE
  // ========================================================================

  const gameState = gameWorld.getGameState();
  syncPayload.game = {
    status: gameState.status,
    score: gameState.score,
    level: gameState.level
  };

  // ========================================================================
  // SYNC TO HOT STATE
  // ========================================================================

  if (Object.keys(syncPayload).length > 0) {
    useHotState.getState().sync(syncPayload);
  }
}
