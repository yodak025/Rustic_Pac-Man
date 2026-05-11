/**
 * Player Ability Input System
 *
 * PHASE: INPUT_CAPTURE (runs after inputCaptureSystem)
 * RESPONSIBILITY: Translate ability key state into PlayerAbilityInput component
 *
 * Actions handled (key bindings live in keyboardListeners.ts):
 *   - dash
 *   - useWnb              (use White Noise Ball)
 *   - prevMedallion       (select previous medallion)
 *   - nextMedallion       (select next medallion)
 *   - activateAbility     (activate selected medallion ability)
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';

interface AbilityKeyState {
  dash: boolean;
  useWnb: boolean;
  prevMedallion: boolean;
  nextMedallion: boolean;
  activateAbility: boolean;
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
    dash: keyState.dash,
    useWnb: keyState.useWnb,
    prevMedallion: keyState.prevMedallion,
    nextMedallion: keyState.nextMedallion,
    activateAbility: keyState.activateAbility,
  });
}
