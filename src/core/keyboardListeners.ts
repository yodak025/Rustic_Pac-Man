/**
 * Keyboard Listeners
 *
 * RESPONSIBILITY: Register and unregister keyboard event listeners for the game.
 *
 * Returns a teardown function that removes the registered listeners,
 * allowing clean destruction of the engine without leaking handlers.
 */

export interface KeyState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  m: boolean;
  comma: boolean;
  j: boolean;
  k: boolean;
  dot: boolean;
}

/**
 * Register keydown/keyup listeners that mutate the provided keyState object.
 *
 * @param keyState - Mutable keyboard state object owned by the engine
 * @param onDebugSkipLevel - Callback invoked when the debug skip key ('n') is pressed
 * @returns Teardown function that removes both event listeners
 */
export function setupKeyboardListeners(
  keyState: KeyState,
  onDebugSkipLevel: () => void,
): () => void {
  const onKeyDown = (event: KeyboardEvent): void => {
    switch (event.key.toLowerCase()) {
      case "w":
        keyState.w = true;
        break;
      case "a":
        keyState.a = true;
        break;
      case "s":
        keyState.s = true;
        break;
      case "d":
        keyState.d = true;
        break;
      case "m":
        keyState.m = true;
        break;
      case ",":
        keyState.comma = true;
        break;
      case "j":
        keyState.j = true;
        break;
      case "k":
        keyState.k = true;
        break;
      case ".":
        keyState.dot = true;
        break;
      case "n":
        onDebugSkipLevel();
        break;
    }
  };

  const onKeyUp = (event: KeyboardEvent): void => {
    switch (event.key.toLowerCase()) {
      case "w":
        keyState.w = false;
        break;
      case "a":
        keyState.a = false;
        break;
      case "s":
        keyState.s = false;
        break;
      case "d":
        keyState.d = false;
        break;
      case "m":
        keyState.m = false;
        break;
      case ",":
        keyState.comma = false;
        break;
      case "j":
        keyState.j = false;
        break;
      case "k":
        keyState.k = false;
        break;
      case ".":
        keyState.dot = false;
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
