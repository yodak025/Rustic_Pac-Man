/**
 * Medallion Charge System
 *
 * PHASE: EFFECTS (runs after collectionEffectSystem)
 * RESPONSIBILITY: Handle medallion selection cycling (j/k keys)
 *
 * Note: XP charging itself happens in collectionEffectSystem when
 * an ESSENCE dot is collected with a full dash bar.
 * This system only handles the selectedIndex cycling.
 */

import type { GameWorld } from "@core/GameWorld";
import { ComponentType, PACMAN_ENTITY_ID } from "@custom-types/componentTypes";

// TODO: migrate to proper ECS cooldown component (see dashSystem pattern)
const COOLDOWN_MS = 200;
let lastSwitch = 0;

export function medallionChargeSystem(gameWorld: GameWorld): void {
  const abilityInput = gameWorld.getComponent(
    PACMAN_ENTITY_ID,
    ComponentType.PLAYER_ABILITY_INPUT,
  );
  if (!abilityInput) return;

  const rack = gameWorld.getComponent(
    PACMAN_ENTITY_ID,
    ComponentType.MEDALLION_RACK,
  );
  if (!rack || rack.slots.length === 0) return;

  let newIndex = rack.selectedIndex;

  if (abilityInput.prevMedallion) {
    newIndex = (rack.selectedIndex - 1 + rack.slots.length) % rack.slots.length;
  } else if (abilityInput.nextMedallion) {
    newIndex = (rack.selectedIndex + 1) % rack.slots.length;
  }

  if (newIndex !== rack.selectedIndex) {
    if (performance.now() - lastSwitch < COOLDOWN_MS) return;
    lastSwitch = performance.now();
    gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.MEDALLION_RACK, {
      ...rack,
      selectedIndex: newIndex,
    });
  }
}
