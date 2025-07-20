import { createContext, useContext } from 'react';

const EntityIdContext = createContext<string | null>(null);

export const useEntityId = () => {
  const context = useContext(EntityIdContext);
  if (!context) throw new Error("useEntityId must be used within <Entity>");
  return context;
};

export const EntityProvider = EntityIdContext.Provider;