import { useEntityId } from '@core/ecs/EntityContext';
import { useEffect } from 'react';
import { useEntitiesState } from '@state/store';
import type {Position as TPosition} from '@custom-types/ecsTypes';

export const Position = ({ x, y }: TPosition) => {
  const entityId = useEntityId();
  const addPosition = useEntitiesState((state) => state.addPosition);
  const entity = useEntitiesState((state) => state.entities[entityId]);

  useEffect(() => {
    if (!entity) return;
    if (entityId !== undefined) {
      addPosition(entityId, { x, y });
    }
  }, [entity]);

  return null; 
};