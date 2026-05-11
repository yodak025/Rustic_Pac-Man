/**
 * White Noise Ball Activate System
 *
 * PHASE: EFFECTS (runs after collectionEffectSystem)
 * RESPONSIBILITY: Consume one WNB from stock and frighten Echos within vision range
 *
 * Triggered when PlayerAbilityInput.useWnb is true AND WNB stock > 0.
 * Only Echos within PLAYER_STATS.visionRadius tiles of Chomp are affected —
 * creating a synergy between the VISION and SHOUT medallions.
 * Fright duration is read from PLAYER_STATS.frightDuration (scales with SHOUT level).
 */

import type { GameWorld } from "@core/GameWorld";
import { ComponentType, PACMAN_ENTITY_ID } from "@custom-types/componentTypes";
import { BehaviorMode } from "@custom-types/gameComponents";
import { SINUSOID_CONFIG } from "@config/echoConfig";

// TODO: migrate to proper ECS cooldown component (see dashSystem pattern)
const COOLDOWN_MS = 400;
let lastActivation = 0;

export function wnoiseActivateSystem(gameWorld: GameWorld): void {
  const abilityInput = gameWorld.getComponent(
    PACMAN_ENTITY_ID,
    ComponentType.PLAYER_ABILITY_INPUT,
  );
  if (!abilityInput?.useWnb) return;
  if (performance.now() - lastActivation < COOLDOWN_MS) return;

  const wnbStock = gameWorld.getComponent(
    PACMAN_ENTITY_ID,
    ComponentType.WNB_STOCK,
  );
  if (!wnbStock || wnbStock.count <= 0) return;

  // Read player position and derived stats
  const chompPos = gameWorld.getComponent(
    PACMAN_ENTITY_ID,
    ComponentType.CONTINUOUS_POSITION,
  );
  if (!chompPos) return;

  const playerStats = gameWorld.getComponent(
    PACMAN_ENTITY_ID,
    ComponentType.PLAYER_STATS,
  );
  const visionRadius = playerStats?.visionRadius ?? 8;
  const frightDuration = playerStats?.frightDuration ?? 30;

  // Consume one WNB
  lastActivation = performance.now();
  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.WNB_STOCK, {
    count: wnbStock.count - 1,
  });

  // Frighten only active (non-EATEN) Echos within vision radius
  const echoEntities = gameWorld.query(
    ComponentType.ECHO_TAG,
    ComponentType.BEHAVIOR_MODE,
    ComponentType.BEHAVIOR_COUNTER,
    ComponentType.TIMER,
  );

  for (const echoId of echoEntities) {
    const behaviorMode = gameWorld.getComponent(
      echoId,
      ComponentType.BEHAVIOR_MODE,
    );
    if (!behaviorMode || behaviorMode.mode === BehaviorMode.EATEN) continue;

    // Distance check — only affect echos within vision range
    const echoPos = gameWorld.getComponent(
      echoId,
      ComponentType.DISCRETE_POSITION,
    );
    if (echoPos) {
      const dx = echoPos.x - chompPos.x;
      const dy = echoPos.y - chompPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > visionRadius) continue;
    }

    // Set FRIGHTENED mode
    gameWorld.setComponent(echoId, ComponentType.BEHAVIOR_MODE, {
      mode: BehaviorMode.FRIGHTENED,
    });

    // Reset fright countdown with SHOUT-scaled duration
    gameWorld.setComponent(echoId, ComponentType.BEHAVIOR_COUNTER, {
      ticksRemaining: frightDuration,
    });

    // Increase movement speed
    const timer = gameWorld.getComponent(echoId, ComponentType.TIMER);
    if (timer) {
      gameWorld.setComponent(echoId, ComponentType.TIMER, {
        ...timer,
        interval: timer.baseInterval / SINUSOID_CONFIG.SPEED_FRIGHTEN,
      });
    }
  }
}
