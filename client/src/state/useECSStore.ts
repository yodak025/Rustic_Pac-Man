import { create } from 'zustand';

export interface Entity {
  id: string;
  components: Record<string, any>;
}

interface ECSState {
  entities: Entity[];
  getEntity: (id: string) => Entity | undefined;
  setEntity: (entity: Entity) => void;
  removeEntity: (id: string) => void;
  getAllEntities: () => Entity[];
  setEntities: (entities: Entity[]) => void;
}

const useECSStore = create<ECSState>((set, get) => ({
  entities: [],
  
  getEntity: (id: string) => {
    return get().entities.find(entity => entity.id === id);
  },
  
  setEntity: (entity: Entity) => {
    set((state) => {
      const existingIndex = state.entities.findIndex(e => e.id === entity.id);
      if (existingIndex >= 0) {
        const newEntities = [...state.entities];
        newEntities[existingIndex] = entity;
        return { entities: newEntities };
      } else {
        return { entities: [...state.entities, entity] };
      }
    });
  },
  
  removeEntity: (id: string) => {
    set((state) => ({
      entities: state.entities.filter(entity => entity.id !== id)
    }));
  },
  
  getAllEntities: () => {
    return get().entities;
  },
  
  setEntities: (entities: Entity[]) => {
    set({ entities });
  }
}));

export default useECSStore;
