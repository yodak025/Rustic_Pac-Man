/**
 * Input Capture System
 *
 * PHASE: INPUT_CAPTURE
 * RESPONSIBILITY: Capture movement key state and write to InputState component
 *
 * This system creates/updates a singleton InputState component that holds
 * the current movement input. It translates from engine.keyState to ECS.
 * Physical key bindings live in keyboardListeners.ts.
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import type { InputState } from '@custom-types/components';

const INPUT_ENTITY_ID = 'input_singleton';

interface MovementKeyState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/**
 * Captures movement input and writes to GameWorld InputState component
 *
 * @param gameWorld - The ECS world
 * @param keyboardState - Current movement state from engine
 */
export function inputCaptureSystem(
  gameWorld: GameWorld,
  keyboardState: MovementKeyState
): void {
  // Ensure input singleton entity exists
  if (!gameWorld.entityExists(INPUT_ENTITY_ID)) {
    gameWorld.createEntity(INPUT_ENTITY_ID);
  }

  // Write current movement state to InputState component
  const inputState: InputState = {
    up: keyboardState.up,
    down: keyboardState.down,
    left: keyboardState.left,
    right: keyboardState.right
  };

  gameWorld.addComponent(INPUT_ENTITY_ID, ComponentType.INPUT_STATE, inputState);
}
