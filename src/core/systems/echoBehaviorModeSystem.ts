/**
 * Echo Behavior Mode System
 * 
 * Manages the finite state machine for Echo behavior modes.
 * Handles transitions between: IDLE ⇄ SCATTER ⇄ CHASE → FRIGHTENED → EATEN
 * 
 * PHASE: ECHO_BEHAVIOR_MODE
 * RESPONSIBILITY: State machine transitions for Echo AI
 * 
 * Echo FSM differs from Ghosts:
 * - No HOUSE or EXITING_HOUSE modes
 * - IDLE state with duration
 * - SCATTER with random movement
 * - CHASE triggered by distance to player (agro)
 * - FRIGHTENED with distance-based behavior (flee vs wander)
 * 
 * Speed Control:
 * - Echos use discrete movement (like ghosts)
 * - Speed is controlled via timer.interval (lower = faster)
 * - Speed changes: interval = baseInterval / speedMultiplier
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, type EntityId, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import { BehaviorMode } from '@custom-types/gameComponents';
import { SINUSOID_CONFIG } from '@config/echoConfig';

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

/**
 * Set Echo speed by adjusting timer interval
 * @param speedMultiplier - Speed multiplier (higher = faster)
 *   - 0.3 = very slow (SCATTER)
 *   - 1.2 = slightly faster (CHASE)
 *   - 2.0 = very fast (FRIGHTENED)
 */
function setSpeed(
  gameWorld: GameWorld,
  entityId: EntityId,
  speedMultiplier: number
): void {
  const timer = gameWorld.getComponent(entityId, ComponentType.TIMER);
  if (!timer) return;

  // Lower interval = faster movement
  // interval = baseInterval / speedMultiplier
  const newInterval = timer.baseInterval / speedMultiplier;

  gameWorld.setComponent(entityId, ComponentType.TIMER, {
    elapsed: timer.elapsed,
    interval: newInterval,
    baseInterval: timer.baseInterval,
    isTimeToMove: timer.isTimeToMove
  });
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

/**
 * Calculate Euclidean distance between two positions
 */
function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// ============================================================================
// MAIN SYSTEM
// ============================================================================

export function echoBehaviorModeSystem(gameWorld: GameWorld): void {
  // Get player position (needed for distance calculations)
  const playerPosition = gameWorld.getComponent(
    PACMAN_ENTITY_ID,
    ComponentType.DISCRETE_POSITION
  );

  if (!playerPosition) {
    console.error('[echoBehaviorModeSystem] Player position not found');
    return;
  }

  const echoEntities = gameWorld.query(
    ComponentType.ECHO_TAG,
    ComponentType.BEHAVIOR_MODE,
    ComponentType.BEHAVIOR_COUNTER,
    ComponentType.DISCRETE_POSITION,
    ComponentType.TIMER
  );

  for (const entityId of echoEntities) {
    const behaviorMode = gameWorld.getComponent(entityId, ComponentType.BEHAVIOR_MODE);
    const behaviorCounter = gameWorld.getComponent(entityId, ComponentType.BEHAVIOR_COUNTER);
    const position = gameWorld.getComponent(entityId, ComponentType.DISCRETE_POSITION);
    const timer = gameWorld.getComponent(entityId, ComponentType.TIMER);

    // Validate required components
    if (!behaviorMode || !behaviorCounter || !position || !timer) {
      console.error(`[echoBehaviorModeSystem] Missing required components for entity ${entityId}`);
      continue;
    }

    const mode = behaviorMode.mode;
    const distanceToPlayer = calculateDistance(
      position.x,
      position.y,
      playerPosition.x,
      playerPosition.y
    );

    // ════════════════════════════════════════════════════════════════════════
    // STATE MACHINE
    // ════════════════════════════════════════════════════════════════════════

    switch (mode) {
      case BehaviorMode.IDLE: {
        // Decrement idle timer (only when time to move)
        if (timer.isTimeToMove && behaviorCounter.ticksRemaining > 0) {
          setCounter(gameWorld, entityId, behaviorCounter.ticksRemaining - 1);
        }

        // Check if idle duration expired
        if (behaviorCounter.ticksRemaining <= 0) {
          // Transition back to SCATTER
          setMode(gameWorld, entityId, BehaviorMode.SCATTER);
          setSpeed(gameWorld, entityId, SINUSOID_CONFIG.SPEED_SCATTER);
        }
        break;
      }

      case BehaviorMode.SCATTER: {
        // Check for random IDLE transition (very low probability)
        if (timer.isTimeToMove && Math.random() < SINUSOID_CONFIG.IDLE_PROBABILITY) {
          setMode(gameWorld, entityId, BehaviorMode.IDLE);
          setCounter(gameWorld, entityId, SINUSOID_CONFIG.IDLE_DURATION_TICKS);
          // Speed doesn't matter in IDLE (movement intent will be null)
          break;
        }

        // Check for CHASE transition (player enters agro range)
        if (distanceToPlayer < SINUSOID_CONFIG.AGRO_TRIGGER_DISTANCE) {
          setMode(gameWorld, entityId, BehaviorMode.CHASE);
          setSpeed(gameWorld, entityId, SINUSOID_CONFIG.SPEED_CHASE);
        }
        break;
      }

      case BehaviorMode.CHASE: {
        // Check for SCATTER transition (player exits agro range)
        if (distanceToPlayer > SINUSOID_CONFIG.AGRO_COOL_DISTANCE) {
          setMode(gameWorld, entityId, BehaviorMode.SCATTER);
          setSpeed(gameWorld, entityId, SINUSOID_CONFIG.SPEED_SCATTER);
        }
        break;
      }

      case BehaviorMode.FRIGHTENED: {
        // Decrement frightened timer (only when time to move)
        if (timer.isTimeToMove && behaviorCounter.ticksRemaining > 0) {
          setCounter(gameWorld, entityId, behaviorCounter.ticksRemaining - 1);
        }

        // Check if frightened duration expired
        if (behaviorCounter.ticksRemaining <= 0) {
          // Determine transition based on distance to player
          if (distanceToPlayer < SINUSOID_CONFIG.AGRO_TRIGGER_DISTANCE) {
            // If player is close, go to CHASE mode
            setMode(gameWorld, entityId, BehaviorMode.CHASE);
            setSpeed(gameWorld, entityId, SINUSOID_CONFIG.SPEED_CHASE);
          } else {
            // Otherwise, return to SCATTER mode
            setMode(gameWorld, entityId, BehaviorMode.SCATTER);
            setSpeed(gameWorld, entityId, SINUSOID_CONFIG.SPEED_SCATTER);
          }
        }
        // Speed is set when entering FRIGHTENED mode (in powerPelletEffectSystem)
        // and remains high throughout the duration
        break;
      }

      case BehaviorMode.EATEN: {
        // EATEN Echos don't update behavior - they stay stationary
        break;
      }

      default: {
        console.error(`[echoBehaviorModeSystem] Unknown behavior mode: ${mode} for entity ${entityId}`);
      }
    }
  }
}
