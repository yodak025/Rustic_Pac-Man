import { CollectableKind } from "@/types/gameComponents";
import useMazeState from "@/state/useMazeStore";
import useGameStatusStore from "@/state/useGameStatusStore";
import useGhostsStore from "@/state/useGhostsStore";
import { type Position } from "@custom-types/gameComponents";
import type { Entity } from "@custom-types/gameEntities";
import { USE_ECS_MAZE } from "@config/featureFlags";
import type { GameWorld } from "@core/GameWorld";


export function collectSystem(position: Position, entity: Entity, gameWorld?: GameWorld): void {
  if (!entity.components.collector) {
    return;
  }
  
  // Use GameWorld if ECS flag is enabled, otherwise use legacy store
  const collectable = USE_ECS_MAZE && gameWorld
    ? gameWorld.getCollectableAt(position.x, position.y)
    : useMazeState.getState().findCollectableAt(position);
  
  if (collectable) {
    if (
      collectable === CollectableKind.PAC_DOT &&
      entity.components.collector.collects.includes(CollectableKind.PAC_DOT)
    ) {
      // Remove collectable from appropriate store
      if (USE_ECS_MAZE && gameWorld) {
        gameWorld.removeCollectable(position.x, position.y);
      } else {
        useMazeState.getState().removePacDot(position);
      }
      useGameStatusStore.getState().incrementScore(100);
    } else if (
      collectable === CollectableKind.POWER_PELLET &&
      entity.components.collector.collects.includes(CollectableKind.POWER_PELLET)
    ) {
      // Remove collectable from appropriate store
      if (USE_ECS_MAZE && gameWorld) {
        gameWorld.removeCollectable(position.x, position.y);
      } else {
        useMazeState.getState().removePowerPellet(position);
      }
      useGameStatusStore.getState().incrementScore(500);
      useGhostsStore.getState().actions.frightenAll();
    }
  }
}
