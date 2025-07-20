import React, { useEffect } from 'react';
import { EntityProvider } from './EntityContext';
import { useEntitiesState } from '@state/store';

export const Entity = ({ id, children }: { id: string, children: React.ReactNode }) => {
  const addEntity = useEntitiesState((state) => state.addEntity);

  useEffect(() => {
    if (id !== undefined) {
      addEntity(id);
    }
  },[])

  return (
    <EntityProvider value={id}>
      {children}
    </EntityProvider>
  );
};