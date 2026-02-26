/**
 * Ghost Behavior Mode System
 * 
 * Manages the finite state machine for ghost behavior modes.
 * Handles transitions between: HOUSE → EXITING_HOUSE → CHASE/SCATTER → FRIGHTENED → EATEN
 * 
 * PHASE: GHOST_BEHAVIOR_MODE
 * RESPONSIBILITY: State machine transitions for ghost AI
 * 
 * NOTE: Timer decrements are handled by behaviorTimerTickSystem
 * 
 * @see /docs/ECS_ARCHITECTURE_DESIGN.md Section 4.2 - GhostBehaviorModeSystem
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, type EntityId } from '@custom-types/componentTypes';
// Component types imported for reference, used by getComponent
import { BehaviorMode, TargetKind } from '@custom-types/gameComponents';
import * as config from '@config/defaultPositions.json';
import { getWorldConfigSync } from '@core/worldConfigLoader';

const {
  HOME: HOUSE_POSITION,
  EXIT_HOME: EXIT_POSITION,
  SCATTER: SCATTER_TARGET,
} = config.DEFAULT_POSITIONS;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function setMode(
  gameWorld: GameWorld,
  entityId: EntityId,
  mode: BehaviorMode
): void {
  gameWorld.setComponent(entityId, ComponentType.BEHAVIOR_MODE, { mode });
}

function setTarget(
  gameWorld: GameWorld,
  entityId: EntityId,
  x: number,
  y: number,
  kind: TargetKind
): void {
  gameWorld.setComponent(entityId, ComponentType.TARGET_POSITION, { x, y, kind });
}

function setCounter(
  gameWorld: GameWorld,
  entityId: EntityId,
  ticks: number
): void {
  gameWorld.setComponent(entityId, ComponentType.BEHAVIOR_COUNTER, {
    ticksRemaining: ticks
  });
}

// ============================================================================
// MAIN SYSTEM
// ============================================================================

export function ghostBehaviorModeSystem(gameWorld: GameWorld, currentLevel: number): void {
  const ghostEntities = gameWorld.query(
    ComponentType.GHOST_TAG,
    ComponentType.BEHAVIOR_MODE,
    ComponentType.BEHAVIOR_COUNTER,
    ComponentType.DISCRETE_POSITION,
    ComponentType.TARGET_POSITION,
    ComponentType.TIMER
  );

  for (const entityId of ghostEntities) {
    const ghostTag = gameWorld.getComponent(entityId, ComponentType.GHOST_TAG);
    const behaviorMode = gameWorld.getComponent(entityId, ComponentType.BEHAVIOR_MODE);
    const behaviorTimer = gameWorld.getComponent(entityId, ComponentType.BEHAVIOR_COUNTER);
    const position = gameWorld.getComponent(entityId, ComponentType.DISCRETE_POSITION);
    const targetPosition = gameWorld.getComponent(entityId, ComponentType.TARGET_POSITION);
    const movementTimer = gameWorld.getComponent(entityId, ComponentType.TIMER);

    // Validate required components
    if (!ghostTag || !behaviorMode || !behaviorTimer || !position || !targetPosition || !movementTimer) {
      console.error(`[ghostBehaviorModeSystem] Missing required components for entity ${entityId}`, {
        hasGhostTag: !!ghostTag,
        hasBehaviorMode: !!behaviorMode,
        hasBehaviorTimer: !!behaviorTimer,
        hasPosition: !!position,
        hasTargetPosition: !!targetPosition,
        hasMovementTimer: !!movementTimer
      });
      continue;
    }

    const mode = behaviorMode.mode;
    const ghostKind = ghostTag.kind;
    const { x, y } = position;
    const { x: tx, y: ty } = targetPosition;
    
    // Get world config for current level
    const worldConfig = getWorldConfigSync(currentLevel);
    if (!worldConfig) {
      console.error(`[ghostBehaviorModeSystem] World config not loaded for level ${currentLevel}`);
      continue;
    }
    
    const MODE_CHANGE = worldConfig.mode_change_schema;
    const levelIndex = Math.min(currentLevel - 1, MODE_CHANGE.length - 1);

    // ════════════════════════════════════════════════════════════════════════
    // STATE MACHINE
    // ════════════════════════════════════════════════════════════════════════

    switch (mode) {
      case BehaviorMode.HOUSE: {
        if (behaviorTimer.ticksRemaining <= 0) {
          setMode(gameWorld, entityId, BehaviorMode.EXITING_HOUSE);
          const exitPos = EXIT_POSITION[ghostKind];
          setTarget(gameWorld, entityId, exitPos.x, exitPos.y, TargetKind.TILE);
        }
        break;
      }

      case BehaviorMode.EXITING_HOUSE: {
        if (x === tx && y === ty) {
          setMode(gameWorld, entityId, BehaviorMode.CHASE);
          setTarget(gameWorld, entityId, x, y, TargetKind.PLAYER);
          setCounter(gameWorld, entityId, MODE_CHANGE[levelIndex].CHASE.SECONDS);
        }
        break;
      }

      case BehaviorMode.SCATTER: {
        if (behaviorTimer.ticksRemaining <= 0) {
          const shouldChase = Math.random() < MODE_CHANGE[levelIndex].CHASE.PROBABILITY;

          if (shouldChase) {
            // Transition to CHASE
            setMode(gameWorld, entityId, BehaviorMode.CHASE);
            setTarget(gameWorld, entityId, x, y, TargetKind.PLAYER);
            setCounter(gameWorld, entityId, MODE_CHANGE[levelIndex].CHASE.SECONDS);
          } else {
            // Stay in SCATTER, reset timer
            setCounter(gameWorld, entityId, MODE_CHANGE[levelIndex].SCATTER.SECONDS);
          }
        }
        break;
      }

      case BehaviorMode.CHASE: {
        if (behaviorTimer.ticksRemaining <= 0) {
          const shouldScatter = Math.random() < MODE_CHANGE[levelIndex].SCATTER.PROBABILITY;

          if (shouldScatter) {
            // Transition to SCATTER
            setMode(gameWorld, entityId, BehaviorMode.SCATTER);

            const scatterPos = SCATTER_TARGET[ghostKind];
            setTarget(gameWorld, entityId, scatterPos.x, scatterPos.y, TargetKind.TILE);
            setCounter(gameWorld, entityId, MODE_CHANGE[levelIndex].SCATTER.SECONDS);
          } else {
            // Stay in CHASE, reset timer
            setCounter(gameWorld, entityId, MODE_CHANGE[levelIndex].CHASE.SECONDS);
          }
        }
        break;
      }

      case BehaviorMode.FRIGHTENED: {
        const exitPos = EXIT_POSITION[ghostKind];
        const housePos = HOUSE_POSITION[ghostKind];

        // Reached exit, now go to house
        if (x === exitPos.x && y === exitPos.y) {
          setTarget(gameWorld, entityId, housePos.x, housePos.y, TargetKind.HOUSE);
        }
        // Reached house, transition to HOUSE mode
        else if (x === housePos.x && y === housePos.y) {
          setMode(gameWorld, entityId, BehaviorMode.HOUSE);
          setTarget(gameWorld, entityId, housePos.x, housePos.y, TargetKind.HOUSE);
          setCounter(gameWorld, entityId, 15);
        }
        break;
      }

      case BehaviorMode.EATEN: {
        // EATEN ghosts don't update behavior - handled by damage system
        break;
      }

      default: {
        console.error(`[ghostBehaviorModeSystem] Unknown behavior mode: ${mode} for entity ${entityId}`);
      }
    }
  }
}
