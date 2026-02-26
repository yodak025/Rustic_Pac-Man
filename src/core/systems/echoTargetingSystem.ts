/**
 * Echo Targeting System
 * 
 * Calculates target positions for Echos based on their current mode.
 * 
 * Targeting Behavior by Mode:
 * - IDLE: No target (stationary)
 * - SCATTER: Random valid adjacent tile
 * - CHASE: Chomp's position (like Blinky)
 * - FRIGHTENED (near): Position away from Chomp (flee)
 * - FRIGHTENED (far): Random valid adjacent tile (wander at high speed)
 * - EATEN: No target (stationary)
 * 
 * PHASE: ECHO_TARGETING
 * RESPONSIBILITY: Calculate navigation targets for Echo AI
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import { BehaviorMode, TargetKind } from '@custom-types/gameComponents';
import { SINUSOID_CONFIG } from '@config/echoConfig';

/**
 * Calculate Euclidean distance between two positions
 */
function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Echo Targeting System
 * 
 * Updates TargetPosition for Echos based on their behavior mode and distance to Chomp.
 */
export function echoTargetingSystem(gameWorld: GameWorld): void {
  // Get Chomp's position (needed for CHASE and FRIGHTENED modes)
  const pacmanPosition = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.DISCRETE_POSITION);

  if (!pacmanPosition) {
    console.error('[echoTargetingSystem] Pacman position not found');
    return;
  }

  // Query all Echos
  const echoEntities = gameWorld.query(
    ComponentType.ECHO_TAG,
    ComponentType.BEHAVIOR_MODE,
    ComponentType.DISCRETE_POSITION,
    ComponentType.TARGET_POSITION
  );

  for (const entityId of echoEntities) {
    const behaviorMode = gameWorld.getComponent(entityId, ComponentType.BEHAVIOR_MODE);
    const echoPosition = gameWorld.getComponent(entityId, ComponentType.DISCRETE_POSITION);

    if (!behaviorMode || !echoPosition) {
      console.error(`[echoTargetingSystem] Missing components for entity ${entityId}`);
      continue;
    }

    const mode = behaviorMode.mode;
    let targetX = echoPosition.x;
    let targetY = echoPosition.y;
    let targetKind = TargetKind.RANDOM;

    switch (mode) {
      case BehaviorMode.IDLE:
      case BehaviorMode.EATEN: {
        // No target update needed - Echo is stationary
        // Target remains at current position
        targetKind = TargetKind.TILE;
        break;
      }

      case BehaviorMode.SCATTER: {
        // Random wandering - target will be chosen by direction system
        // Just mark as RANDOM so direction system knows to randomize
        targetX = echoPosition.x;
        targetY = echoPosition.y;
        targetKind = TargetKind.RANDOM;
        break;
      }

      case BehaviorMode.CHASE: {
        // Direct targeting like Blinky - chase Chomp
        targetX = pacmanPosition.x;
        targetY = pacmanPosition.y;
        targetKind = TargetKind.PLAYER;
        break;
      }

      case BehaviorMode.FRIGHTENED: {
        // Distance-based behavior
        const distanceToPlayer = calculateDistance(
          echoPosition.x,
          echoPosition.y,
          pacmanPosition.x,
          pacmanPosition.y
        );

        if (distanceToPlayer < SINUSOID_CONFIG.FRIGHTEN_EXIT_DISTANCE) {
          // FLEE: Move away from Chomp
          // Calculate vector away from player and set target in opposite direction
          const vectorX = echoPosition.x - pacmanPosition.x;
          const vectorY = echoPosition.y - pacmanPosition.y;
          
          // Normalize and scale to create a target point away from player
          const magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
          if (magnitude > 0) {
            const normalizedX = vectorX / magnitude;
            const normalizedY = vectorY / magnitude;
            
            // Target = current position + direction away from player (scaled by distance)
            targetX = Math.round(echoPosition.x + normalizedX * 10);
            targetY = Math.round(echoPosition.y + normalizedY * 10);
          } else {
            // If on same tile, pick random direction away
            targetX = echoPosition.x;
            targetY = echoPosition.y;
          }
          targetKind = TargetKind.TILE;
        } else {
          // WANDER: Random movement at high speed (SCATTER behavior but in FRIGHTENED mode)
          targetX = echoPosition.x;
          targetY = echoPosition.y;
          targetKind = TargetKind.RANDOM;
        }
        break;
      }

      default: {
        console.error(`[echoTargetingSystem] Unknown behavior mode: ${mode} for entity ${entityId}`);
      }
    }

    // Update target position
    gameWorld.setComponent(entityId, ComponentType.TARGET_POSITION, {
      x: targetX,
      y: targetY,
      kind: targetKind
    });
  }
}
