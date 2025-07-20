import { create } from "zustand";
import type { EntityId, EntityState, Position, Speed, Direction } from "@custom-types/ecsTypes";


type EntitiesState = {
  entities: Record<EntityId, EntityState>;
  setEntity: (id: EntityId, update: Partial<EntityState>) => void;
  addEntity: (id: EntityId) => void;

  addPosition: (id: EntityId, position: Position) => void;
  setPosition: (id: EntityId, position: Position) => void;
  getPosition: (id: EntityId) => Position;

  addSpeed: (id: EntityId, speed: Speed) => void;
  setSpeed: (id: EntityId, speed: Speed) => void;

  addDirection: (id: EntityId, direction: Direction) => void;
  setDirection: (id: EntityId, direction: Direction) => void;


};

const useEntitiesState = create<EntitiesState>((set) => ({
  entities: {},

  setEntity: (id, update) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [id]: {
          ...state.entities[id],
          ...update,
        },
      },
    })),

  addEntity: (id) =>
    set((state) => {
      if (state.entities[id]) throw new Error(`Entidad ${id} ya existe`);
      return {
        entities: {
          ...state.entities,
          [id]: {
            id: id,
            type: "pacman", // Default type, can be changed later
            components: {}, // Start with an empty components object
          },
        },
      };
    }),

    //--------------------------------------- COMPONENT ACTIONS ---------------------------------------


  addPosition: (id, position) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [id]: {
          ...state.entities[id],
          components: {
            ...state.entities[id].components,
            position,
          },
        },
      },
    })),

  setPosition: (id, position) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [id]: {
          ...state.entities[id],
          components: {
            ...state.entities[id].components,
            position,
          },
        },
      },
    })),

  getPosition: (id) => {
    return {
      x: get(entity => entity.entities[id]?.components.position?.x ?? NaN),
      y: get(entity => entity.entities[id]?.components.position?.y ?? NaN),
    }
  },




  addSpeed: (id, speed) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [id]: {
          ...state.entities[id],
          components: {
            ...state.entities[id].components,
            speed,
          },
        },
      },
    })),

  setSpeed: (id, speed) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [id]: {
          ...state.entities[id],
          components: {
            ...state.entities[id].components,
            speed,
          },
        },
      },
    })),

  addDirection: (id, direction) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [id]: {
          ...state.entities[id],
          components: {
            ...state.entities[id].components,
            direction,
          },
        },
      },
    })),

  setDirection: (id, direction) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [id]: {
          ...state.entities[id],
          components: {
            ...state.entities[id].components,
            direction,
          },
        },
      },
    })),

}));

export default useEntitiesState;
