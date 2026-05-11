/**
 * Keyboard Listeners
 *
 * RESPONSIBILITY: Register and unregister keyboard event listeners for the game.
 *
 * This module is the SINGLE SOURCE OF TRUTH for the keyboard-to-action mapping.
 * Downstream systems consume the semantic action flags (up, dash, useWnb, etc.)
 * and remain agnostic to the physical keys bound to them — to remap a binding,
 * edit only the switch cases below.
 *
 * Returns a teardown function that removes the registered listeners,
 * allowing clean destruction of the engine without leaking handlers.
 */

export interface KeyState {
  // Movement (semantic directions, decoupled from physical keys)
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  // Abilities (semantic actions, decoupled from physical keys)
  dash: boolean;
  useWnb: boolean;
  prevMedallion: boolean;
  nextMedallion: boolean;
  activateAbility: boolean;
}

/**
 * Register keydown/keyup listeners that mutate the provided keyState object.
 *
 * @param keyState - Mutable keyboard state object owned by the engine
 * @param onDebugSkipLevel - Callback invoked when the debug skip key is pressed
 * @returns Teardown function that removes both event listeners
 */
export function setupKeyboardListeners(
  keyState: KeyState,
  onDebugSkipLevel: () => void,
): () => void {
  const onKeyDown = (event: KeyboardEvent): void => {
    switch (event.key.toLowerCase()) {
      case "w":
        keyState.up = true;
        break;
      case "a":
        keyState.left = true;
        break;
      case "s":
        keyState.down = true;
        break;
      case "d":
        keyState.right = true;
        break;
      case " ":
        event.preventDefault();
        keyState.dash = true;
        break;
      case "j":
        keyState.useWnb = true;
        break;
      case "m":
        keyState.prevMedallion = true;
        break;
      case ",":
        keyState.nextMedallion = true;
        break;
      case "k":
        keyState.activateAbility = true;
        break;
      case "n":
        onDebugSkipLevel();
        break;
    }
  };

  const onKeyUp = (event: KeyboardEvent): void => {
    switch (event.key.toLowerCase()) {
      case "w":
        keyState.up = false;
        break;
      case "a":
        keyState.left = false;
        break;
      case "s":
        keyState.down = false;
        break;
      case "d":
        keyState.right = false;
        break;
      case " ":
        keyState.dash = false;
        break;
      case "j":
        keyState.useWnb = false;
        break;
      case "m":
        keyState.prevMedallion = false;
        break;
      case ",":
        keyState.nextMedallion = false;
        break;
      case "k":
        keyState.activateAbility = false;
        break;
    }
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return (): void => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
}
