import { useEntityId } from '@core/ecs/EntityContext';
import { useEffect } from 'react';
import { useEntitiesState } from '@state/store';
import type { Speed as TSpeed } from '@/types/ecsTypes';

export const Speed = ({ speed }: { speed: TSpeed}) => {
  const entityId = useEntityId();
  const addSpeed = useEntitiesState((state) => state.addSpeed);

  useEffect(() => {
    if (entityId !== undefined) {
      addSpeed(entityId, speed);
    }
  }, []);

  return null; 
};