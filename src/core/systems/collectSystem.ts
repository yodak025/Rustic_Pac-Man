import { CollectableKind } from "@/types/gameComponents";
import useMazeState from "@/state/useMazeStore";
import useGameStatusStore from "@/state/useGameStatusStore";
import useGhostsStore from "@/state/useGhostsStore";
import { type Position } from "@custom-types/gameComponents";
import type { Entity } from "@custom-types/gameEntities";
import { USE_ECS_MAZE, USE_ECS_GAME_STATUS } from "@config/featureFlags";
import type { GameWorld } from "@core/GameWorld";
import * as gameDefaults from "@config/gameDefaults.json";

const POINTS = gameDefaults.game.pointValues;

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
      
      // Update score in appropriate store
      if (USE_ECS_GAME_STATUS && gameWorld) {
        gameWorld.addScore(POINTS.pacDot);
      } else {
        useGameStatusStore.getState().incrementScore(POINTS.pacDot);
      }
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
      
      // Update score in appropriate store
      if (USE_ECS_GAME_STATUS && gameWorld) {
        gameWorld.addScore(POINTS.powerPellet);
      } else {
        useGameStatusStore.getState().incrementScore(POINTS.powerPellet);
      }
      
      useGhostsStore.getState().actions.frightenAll();
    }
  }
}
