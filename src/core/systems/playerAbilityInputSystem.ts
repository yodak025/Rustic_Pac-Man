/**
 * Player Ability Input System
 * 
 * PHASE: INPUT_CAPTURE (runs after inputCaptureSystem)
 * RESPONSIBILITY: Translate ability key state into PlayerAbilityInput component
 * 
 * Keys:
 *   m       - dash
 *   ,       - use White Noise Ball
 *   j       - select previous medallion
 *   k       - select next medallion
 *   .       - activate selected medallion ability
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';

interface AbilityKeyState {
  m: boolean;
  comma: boolean;
  j: boolean;
  k: boolean;
  dot: boolean;
}

/**
 * Writes ability key presses to the player's PlayerAbilityInput component.
 * This component is consumed by dashSystem, wnoiseActivateSystem, and
 * medallionActivateSystem — and cleared by cleanupEventsSystem each frame.
 */
export function playerAbilityInputSystem(
  gameWorld: GameWorld,
  keyState: AbilityKeyState
): void {
  const abilityInput = gameWorld.getComponent(
    PACMAN_ENTITY_ID,
    ComponentType.PLAYER_ABILITY_INPUT
  );

  if (!abilityInput) return;

  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_ABILITY_INPUT, {
    dash: keyState.m,
    useWnb: keyState.comma,
    prevMedallion: keyState.j,
    nextMedallion: keyState.k,
    activateAbility: keyState.dot,
  });
}
