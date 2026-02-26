/**
 * Behavior Timer Tick System
 * 
 * PHASE: BEHAVIOR_COUNTER_TICK
 * RESPONSIBILITY: Decrement behavior timers for ghosts
 * 
 * This system runs once per frame and decrements the behavior timer
 * for ghosts that are in modes where timing matters (HOUSE, CHASE, SCATTER).
 * 
 * The BehaviorModeSystem will check these timers to trigger state transitions.
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import { BehaviorMode } from '@custom-types/gameComponents';

/**
 * Decrement behavior timers for ghosts in timed modes
 * 
 * Modes that use timers:
 * - HOUSE: Timer until ghost can exit
 * - CHASE: Timer until switching to SCATTER
 * - SCATTER: Timer until switching to CHASE
 * 
 * Modes that don't use timers:
 * - EXITING_HOUSE: Exits when reaching exit position
 * - FRIGHTENED: Exits when reaching house position
 * - EATEN: No timer, navigates back to house
 * 
 * @param gameWorld - The ECS world
 */
export function behaviorTimerTickSystem(gameWorld: GameWorld): void {
  // Query all ghosts with behavior timers
  const ghosts = gameWorld.query(
    ComponentType.GHOST_TAG,
    ComponentType.BEHAVIOR_COUNTER,
    ComponentType.BEHAVIOR_MODE,
    ComponentType.TIMER
  );

  for (const ghostId of ghosts) {
    const timer = gameWorld.getComponent(ghostId, ComponentType.TIMER);
    const counter = gameWorld.getComponent(ghostId, ComponentType.BEHAVIOR_COUNTER);
    const mode = gameWorld.getComponent(ghostId, ComponentType.BEHAVIOR_MODE);

    if (!timer || !mode || !counter) {
      console.error(`[BehaviorTimerTickSystem] Ghost ${ghostId} missing required components`);
      continue;
    }

    // Only decrement timers for specific modes
    const timedModes = [
      BehaviorMode.HOUSE,
      BehaviorMode.CHASE,
      BehaviorMode.SCATTER
    ];

    if (timedModes.includes(mode.mode) && timer.isTimeToMove && counter.ticksRemaining > 0) {
      // Decrement timer
      gameWorld.setComponent(ghostId, ComponentType.BEHAVIOR_COUNTER, {
        ticksRemaining: counter.ticksRemaining - 1
      });
    }
  }
}

