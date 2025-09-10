import { CollectableKind } from "@/types/gameComponents";
import useMazeState from "@/state/useMazeStore";
import useGameStatusStore from "@/state/useGameStatusStore";
import { type Position } from "@custom-types/gameComponents";
import type { Entity } from "@custom-types/gameEntities";

export function collectSystem(position: Position, entity: Entity): void {
  if (!entity.components.collector) {
    return;
  }
  const collectable = useMazeState.getState().findCollectableAt(position);
  if (collectable) {
    if (
      collectable === CollectableKind.PAC_DOT &&
      entity.components.collector.collects.includes(CollectableKind.PAC_DOT)
    ) {
      useMazeState.getState().removePacDot(position);
      useGameStatusStore.getState().incrementScore(100);
    }
  }
}
