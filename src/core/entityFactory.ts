/**
 * Entity Factory Helpers
 *
 * Helper functions to create entities with all their required components.
 * These functions encapsulate the boilerplate of component initialization.
 *
 * RESPONSIBILITY: Entity creation logic
 */

import type { GameWorld } from "@core/GameWorld";
import { ComponentType, type EntityId, PACMAN_ENTITY_ID } from "@custom-types/componentTypes";
import {
  BehaviorMode,
  TargetKind,
  type EchoBehaviorKind,
  CollectableKind,
  type Position,
} from "@custom-types/gameComponents";
import { SINUSOID_CONFIG } from "@config/echoConfig";
import gameDefaults from "@config/gameDefaults.json";
import { MEDALLION_ATTRIBUTES } from "@config/medallionAttributes";
import { DEBUG_LOG_GAME_WORLD } from "@config/featureFlags";

/**
 * Create an Echo entity with all required components
 *
 * @param gameWorld - The GameWorld instance
 * @param entityId - Unique ID for the echo (e.g., 'echo_0')
 * @param echoKind - Echo behavior kind (SINUSOID, etc.)
 * @param position - Starting discrete position {x, y}
 * @param movementInterval - Milliseconds between movements
 */
export function createEchoEntity(
  gameWorld: GameWorld,
  entityId: EntityId,
  echoKind: EchoBehaviorKind,
  position: { x: number; y: number },
  movementInterval: number,
): void {
  // Create entity
  gameWorld.createEntity(entityId);

  // Add echo tag
  gameWorld.addComponent(entityId, ComponentType.ECHO_TAG, { kind: echoKind });

  // Add discrete position (Echos use discrete movement like ghosts)
  gameWorld.addComponent(entityId, ComponentType.DISCRETE_POSITION, {
    x: position.x,
    y: position.y,
  });

  // Add movement timer (with baseInterval for speed changes)
  gameWorld.addComponent(entityId, ComponentType.TIMER, {
    elapsed: 0,
    interval: movementInterval / SINUSOID_CONFIG.SPEED_SCATTER, // Start slower in SCATTER
    baseInterval: movementInterval,
    isTimeToMove: false,
  });

  gameWorld.addComponent(entityId, ComponentType.MOVEMENT_INTENT, {
    direction: null,
  });

  gameWorld.addComponent(entityId, ComponentType.CURRENT_DIRECTION, {
    direction: null,
  });

  // Add behavior components
  gameWorld.addComponent(entityId, ComponentType.BEHAVIOR_MODE, {
    mode: BehaviorMode.SCATTER, // Echos start in SCATTER mode
  });

  gameWorld.addComponent(entityId, ComponentType.BEHAVIOR_COUNTER, {
    ticksRemaining: 0, // Used for IDLE duration
  });

  gameWorld.addComponent(entityId, ComponentType.TARGET_POSITION, {
    x: position.x,
    y: position.y,
    kind: TargetKind.RANDOM,
  });

  // Add collector component (Echos collect Essence dots)
  gameWorld.addComponent(entityId, ComponentType.COLLECTOR, {
    canCollect: [CollectableKind.ESSENCE],
  });

  // Add collected score component (tracks points this Echo has collected)
  gameWorld.addComponent(entityId, ComponentType.COLLECTED_SCORE, {
    points: 0,
  });

  // Mark as renderable
  gameWorld.addComponent(entityId, ComponentType.RENDERABLE, {
    _tag: "renderable" as const,
  });
}

/**
 * Create the Pacman (player) entity with all required components.
 * Ability state is restored from progressState to persist between levels.
 *
 * @param gameWorld - The GameWorld instance
 * @param initialPosition - Starting discrete position {x, y}
 */
export function createPacmanEntity(
  gameWorld: GameWorld,
  initialPosition: Position,
): void {
  const defaults = gameDefaults.pacman;
  const baseSpeed = gameDefaults.movement.baseSpeed;

  gameWorld.createEntity(PACMAN_ENTITY_ID);
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_TAG, {
    _tag: "player" as const,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.TIMER, {
    elapsed: 0,
    interval: defaults.movementInterval,
    baseInterval: defaults.movementInterval,
    isTimeToMove: false,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.CONTINUOUS_POSITION, {
    x: initialPosition.x,
    y: initialPosition.y,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.DISCRETE_POSITION, {
    x: initialPosition.x,
    y: initialPosition.y,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.MOVEMENT_SPEED, {
    current: baseSpeed,
    base: baseSpeed,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.MOVEMENT_INTENT, {
    direction: null,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_INTENT, {
    desiredDirection: null,
    lastValidDirection: null,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.ALIGNMENT_STATE, {
    isAligned: true,
    aligningDirection: null,
  });

  // Ability components — restore from progressState (persists between levels)
  const progress = gameWorld.getProgressState();
  const abilityCfg = gameDefaults.abilities;

  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.HEALTH, {
    current: progress.health,
    max: defaults.initialHealth,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.INVULNERABILITY, {
    ticksRemaining: 0,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.COLLECTOR, {
    canCollect: [
      CollectableKind.ESSENCE,
      CollectableKind.WHITE_NOISE_BALL,
      CollectableKind.MEDALLION_HEALTH,
      CollectableKind.MEDALLION_STEALTH,
      CollectableKind.MEDALLION_VISION,
      CollectableKind.MEDALLION_SHOUT,
      CollectableKind.MEDALLION_SPEED,
      CollectableKind.MEDALLION_ESSENCE,
      CollectableKind.POWER_UP_SUPER_DASH,
    ],
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYABLE, {
    _tag: "playable" as const,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE, {
    energy: progress.dashEnergy,
    maxEnergy: abilityCfg.dash.maxEnergy,
    isDashing: false,
    dashTimeRemaining: 0,
    cooldownTimeRemaining: 0,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.WNB_STOCK, {
    count: progress.wnbStock,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.MEDALLION_RACK, {
    slots: [...progress.medallionRack.slots.map((s) => ({ ...s }))],
    selectedIndex: progress.medallionRack.selectedIndex,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.ESSENCE_BAR, {
    current: progress.essenceBar.current,
    max: progress.essenceBar.max,
    activePowerUp: progress.essenceBar.activePowerUp,
  });
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_ABILITY_INPUT, {
    dash: false,
    useWnb: false,
    prevMedallion: false,
    nextMedallion: false,
    activateAbility: false,
  });

  // Derived stats — level-0 values from MEDALLION_ATTRIBUTES (recalculated each frame)
  gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_STATS, {
    agroRadius: MEDALLION_ATTRIBUTES.agroRadiusPerLevel[0],
    visionRadius: MEDALLION_ATTRIBUTES.visionRadiusPerLevel[0],
    frightDuration: MEDALLION_ATTRIBUTES.frightDurationPerLevel[0],
    speedMultiplier: MEDALLION_ATTRIBUTES.speedMultiplierPerLevel[0],
    essenceMultiplier: MEDALLION_ATTRIBUTES.essenceMultiplierPerLevel[0],
    dashMaxEnergy: MEDALLION_ATTRIBUTES.dashMaxEnergyPerLevel[0],
  });

  if (DEBUG_LOG_GAME_WORLD) {
    console.log(
      "[GameWorld] Pacman entity created at position:",
      initialPosition,
    );
  }
}
