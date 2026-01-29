/**
 * Input Capture System
 * 
 * PHASE: INPUT_CAPTURE
 * RESPONSIBILITY: Capture keyboard state and write to InputState component
 * 
 * This system creates/updates a singleton InputState component that holds
 * the current keyboard state. It translates from engine.keyState to ECS.
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import type { InputState } from '@custom-types/components';

const INPUT_ENTITY_ID = 'input_singleton';

interface KeyboardState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
}

/**
 * Captures keyboard input and writes to GameWorld InputState component
 * 
 * @param gameWorld - The ECS world
 * @param keyboardState - Current keyboard state from engine
 */
export function inputCaptureSystem(
  gameWorld: GameWorld,
  keyboardState: KeyboardState
): void {
  // Ensure input singleton entity exists
  if (!gameWorld.entityExists(INPUT_ENTITY_ID)) {
    gameWorld.createEntity(INPUT_ENTITY_ID);
  }

  // Write current keyboard state to InputState component
  const inputState: InputState = {
    up: keyboardState.w,
    down: keyboardState.s,
    left: keyboardState.a,
    right: keyboardState.d
  };

  gameWorld.addComponent(INPUT_ENTITY_ID, ComponentType.INPUT_STATE, inputState);
}
