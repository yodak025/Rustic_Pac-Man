import { useEntityId } from '@core/ecs/EntityContext';
import { useEffect } from 'react';
import { useEntitiesState } from '@state/store';
import type { Direction as TDirection } from '@custom-types/ecsTypes';

export const Direction = ({direction}: {direction: TDirection}) => {
  const entityId = useEntityId();
  const addDirection = useEntitiesState((state) => state.addDirection);

  useEffect(() => {
    if (entityId !== undefined) {
      addDirection(entityId, direction);
    }
  }, []);

  return null; 
};