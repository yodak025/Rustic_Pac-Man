import { GameWorld } from "../GameWorld";
import { ComponentType } from "@custom-types/componentTypes";

export function timerUpdateSystem(gameWorld: GameWorld, deltaTime: number): void {
  const timerEntities = gameWorld.query(
    ComponentType.TIMER
  );
  for (const entityId of timerEntities) {
    const timer = gameWorld.getComponent(entityId, ComponentType.TIMER);
    if (!timer) {
      console.error(`[timerUpdateSystem] Missing TIMER component for entity ${entityId}`);
      continue;
    }
    // Increment timer
    const newElapsed = timer.elapsed + deltaTime;

    // Check if it's time to move
    if (newElapsed < timer.interval) {
      // Not time yet, just update elapsed
      gameWorld.setComponent(entityId, ComponentType.TIMER, {
        elapsed: newElapsed,
        interval: timer.interval,
        baseInterval: timer.baseInterval,
        isTimeToMove: false
      });
      continue;
    }

    // Reset timer (keep remainder)
    const remainder = newElapsed - timer.interval;
    gameWorld.setComponent(entityId, ComponentType.TIMER, {
      elapsed: remainder,
      interval: timer.interval,
      baseInterval: timer.baseInterval,
      isTimeToMove: true
    });
  }
}
