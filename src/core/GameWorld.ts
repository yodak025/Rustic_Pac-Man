/**
 * GameWorld - Cold State Container for the ECS Architecture
 * 
 * This is the central data store for all game entities and their components.
 * The game loop reads and writes to this structure. React components should
 * NOT access this directly - they use the HotState (Zustand) which is synced
 * once per frame.
 * 
 * Exception: Debug tools can access GameWorld via GameWorldContext for
 * real-time inspection and modification.
 * 
 * COORDINATE SYSTEM:
 * - Tile centers are at integer coordinates (x.0, y.0)
 * - A tile spans from (x - 0.5, y - 0.5) to (x + 0.5, y + 0.5)
 * - Use Math.round() to convert continuous to discrete positions
 * 
 * @see /docs/ECS_ARCHITECTURE_DESIGN.md for architecture details
 */

import { 
  ComponentType, 
  type EntityId, 
  type PositionKey, 
  positionToKey 
} from '@custom-types/componentTypes';
import type { 
  Component,
  ComponentTypeMap 
} from '@custom-types/components';
import { CollectableKind } from '@custom-types/gameComponents';
import GameStatus from '@custom-types/gameStatus';

// ============================================================================
// GAME STATE INTERFACE
// ============================================================================

export interface GameState {
  status: GameStatus;
  score: number;
  level: number;
}

// ============================================================================
// MAZE INFO INTERFACE
// ============================================================================

export interface MazeInfo {
  pacDots: {
    total: number;
    current: number; // collected count
  };
  powerPellets: {
    total: number;
    current: number; // collected count
  };
  isLoaded: boolean;
}

// ============================================================================
// SERIALIZED WORLD (for debugging)
// ============================================================================

export interface SerializedWorld {
  entities: Record<EntityId, ComponentType[]>;
  components: Record<ComponentType, Record<EntityId, unknown>>;
  gameState: GameState;
  mazeInfo: MazeInfo;
  spatialData: {
    wallCount: number;
    houseCount: number;
    collectableCount: number;
  };
}

// ============================================================================
// HELPER: Convert continuous position to discrete tile
// ============================================================================

function toTile(value: number): number {
  return Math.round(value);
}

// ============================================================================
// GAME WORLD CLASS
// ============================================================================

export class GameWorld {
  // ══════════════════════════════════════════════════════════════════════════
  // STORAGE
  // ══════════════════════════════════════════════════════════════════════════
  
  /** Map of entity ID to set of component types it has */
  private entities: Map<EntityId, Set<ComponentType>> = new Map();
  
  /** Map of component type to map of entity ID to component data */
  private components: Map<ComponentType, Map<EntityId, Component>> = new Map();

  // ══════════════════════════════════════════════════════════════════════════
  // SPATIAL STRUCTURES (for efficient maze queries)
  // ══════════════════════════════════════════════════════════════════════════
  
  /** Set of position keys where walls exist */
  private wallGrid: Set<PositionKey> = new Set();
  
  /** Set of position keys that are ghost house tiles */
  private houseGrid: Set<PositionKey> = new Set();
  
  /** Map of position key to collectable kind */
  private collectableGrid: Map<PositionKey, CollectableKind> = new Map();

  // ══════════════════════════════════════════════════════════════════════════
  // GAME STATE
  // ══════════════════════════════════════════════════════════════════════════
  
  private gameState: GameState = {
    status: GameStatus.LOADING,
    score: 0,
    level: 1,
  };

  // ══════════════════════════════════════════════════════════════════════════
  // MAZE INFO
  // ══════════════════════════════════════════════════════════════════════════
  
  private mazeInfo: MazeInfo = {
    pacDots: { total: 0, current: 0 },
    powerPellets: { total: 0, current: 0 },
    isLoaded: false,
  };

  // ══════════════════════════════════════════════════════════════════════════
  // CONSTRUCTOR
  // ══════════════════════════════════════════════════════════════════════════
  
  constructor() {
    // Initialize component storage for all types
    for (const type of Object.values(ComponentType)) {
      this.components.set(type, new Map());
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ENTITY MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Create a new entity with the given ID
   */
  createEntity(id: EntityId): void {
    if (this.entities.has(id)) {
      console.warn(`Entity ${id} already exists`);
      return;
    }
    this.entities.set(id, new Set());
  }

  /**
   * Destroy an entity and all its components
   */
  destroyEntity(id: EntityId): void {
    const componentTypes = this.entities.get(id);
    if (!componentTypes) {
      return;
    }

    // Remove all components for this entity
    for (const type of componentTypes) {
      this.components.get(type)?.delete(id);
    }

    this.entities.delete(id);
  }

  /**
   * Check if an entity exists
   */
  entityExists(id: EntityId): boolean {
    return this.entities.has(id);
  }

  /**
   * Get all entity IDs
   */
  getAllEntities(): EntityId[] {
    return Array.from(this.entities.keys());
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COMPONENT MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Add a component to an entity (type-safe version)
   */
  addComponent<T extends ComponentType>(
    entityId: EntityId, 
    type: T, 
    data: ComponentTypeMap[T]
  ): void {
    if (!this.entities.has(entityId)) {
      console.warn(`Cannot add component to non-existent entity ${entityId}`);
      return;
    }

    this.entities.get(entityId)!.add(type);
    this.components.get(type)!.set(entityId, data);
  }

  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: EntityId, type: ComponentType): void {
    this.entities.get(entityId)?.delete(type);
    this.components.get(type)?.delete(entityId);
  }

  /**
   * Get a component from an entity (type-safe version)
   */
  getComponent<T extends ComponentType>(
    entityId: EntityId, 
    type: T
  ): ComponentTypeMap[T] | undefined {
    return this.components.get(type)?.get(entityId) as ComponentTypeMap[T] | undefined;
  }

  /**
   * Check if an entity has a component
   */
  hasComponent(entityId: EntityId, type: ComponentType): boolean {
    return this.entities.get(entityId)?.has(type) ?? false;
  }

  /**
   * Set/update a component on an entity (type-safe version)
   */
  setComponent<T extends ComponentType>(
    entityId: EntityId, 
    type: T, 
    data: ComponentTypeMap[T]
  ): void {
    if (!this.entities.has(entityId)) {
      console.warn(`Cannot set component on non-existent entity ${entityId}`);
      return;
    }

    this.entities.get(entityId)!.add(type);
    this.components.get(type)!.set(entityId, data);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // QUERIES
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Query for entities that have ALL specified component types
   */
  query(...componentTypes: ComponentType[]): EntityId[] {
    if (componentTypes.length === 0) {
      return Array.from(this.entities.keys());
    }

    const result: EntityId[] = [];
    
    for (const [entityId, entityComponents] of this.entities) {
      let hasAll = true;
      for (const type of componentTypes) {
        if (!entityComponents.has(type)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) {
        result.push(entityId);
      }
    }

    return result;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SPATIAL QUERIES (for maze)
  // Uses Math.round() because tile centers are at integer coordinates
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Check if there's a wall at the given position
   * Position is rounded to nearest tile center
   */
  isWallAt(x: number, y: number): boolean {
    return this.wallGrid.has(positionToKey(toTile(x), toTile(y)));
  }

  /**
   * Check if the position is a ghost house tile
   * Position is rounded to nearest tile center
   */
  isHouseAt(x: number, y: number): boolean {
    return this.houseGrid.has(positionToKey(toTile(x), toTile(y)));
  }

  /**
   * Get the collectable at the given position
   * Position is rounded to nearest tile center
   */
  getCollectableAt(x: number, y: number): CollectableKind | null {
    return this.collectableGrid.get(positionToKey(toTile(x), toTile(y))) ?? null;
  }

  /**
   * Remove a collectable from the grid
   * Position is rounded to nearest tile center
   */
  removeCollectable(x: number, y: number): boolean {
    const key = positionToKey(toTile(x), toTile(y));
    const kind = this.collectableGrid.get(key);
    
    if (!kind) {
      return false;
    }

    this.collectableGrid.delete(key);
    
    // Update maze info
    if (kind === CollectableKind.PAC_DOT) {
      this.mazeInfo.pacDots.current++;
    } else if (kind === CollectableKind.POWER_PELLET) {
      this.mazeInfo.powerPellets.current++;
    }

    return true;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SPATIAL GRID MANAGEMENT (for initialization)
  // These methods expect integer tile coordinates
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Add a wall to the spatial grid at tile (x, y)
   */
  addWall(x: number, y: number): void {
    this.wallGrid.add(positionToKey(x, y));
  }

  /**
   * Add a house tile to the spatial grid at tile (x, y)
   */
  addHouseTile(x: number, y: number): void {
    this.houseGrid.add(positionToKey(x, y));
  }

  /**
   * Add a collectable to the spatial grid at tile (x, y)
   */
  addCollectable(x: number, y: number, kind: CollectableKind): void {
    this.collectableGrid.set(positionToKey(x, y), kind);
  }

  /**
   * Clear all spatial grids
   */
  clearSpatialGrids(): void {
    this.wallGrid.clear();
    this.houseGrid.clear();
    this.collectableGrid.clear();
  }

  /**
   * Get all wall positions
   */
  getWalls(): Set<PositionKey> {
    return new Set(this.wallGrid);
  }

  /**
   * Get all pac dot positions
   */
  getPacDots(): Set<PositionKey> {
    const result = new Set<PositionKey>();
    for (const [key, kind] of this.collectableGrid) {
      if (kind === CollectableKind.PAC_DOT) {
        result.add(key);
      }
    }
    return result;
  }

  /**
   * Get all power pellet positions
   */
  getPowerPellets(): Set<PositionKey> {
    const result = new Set<PositionKey>();
    for (const [key, kind] of this.collectableGrid) {
      if (kind === CollectableKind.POWER_PELLET) {
        result.add(key);
      }
    }
    return result;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GAME STATE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Get current game state
   */
  getGameState(): Readonly<GameState> {
    return this.gameState;
  }

  /**
   * Set game status
   */
  setGameStatus(status: GameStatus): void {
    this.gameState.status = status;
  }

  /**
   * Add to score
   */
  addScore(amount: number): void {
    this.gameState.score += amount;
  }

  /**
   * Set score
   */
  setScore(score: number): void {
    this.gameState.score = score;
  }

  /**
   * Set level
   */
  setLevel(level: number): void {
    this.gameState.level = level;
  }

  /**
   * Increment level
   */
  nextLevel(): void {
    this.gameState.level++;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MAZE INFO MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Get maze info
   */
  getMazeInfo(): Readonly<MazeInfo> {
    return this.mazeInfo;
  }

  /**
   * Initialize maze info with totals
   */
  initializeMazeInfo(pacDotsTotal: number, powerPelletsTotal: number): void {
    this.mazeInfo = {
      pacDots: { total: pacDotsTotal, current: 0 },
      powerPellets: { total: powerPelletsTotal, current: 0 },
      isLoaded: false,
    };
  }

  /**
   * Set maze loaded state
   */
  setMazeLoaded(isLoaded: boolean): void {
    this.mazeInfo.isLoaded = isLoaded;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DEBUG API
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Debug: Set a component directly (bypasses validation for testing)
   */
  debugSetComponent<T extends ComponentType>(
    entityId: EntityId, 
    type: T, 
    data: ComponentTypeMap[T]
  ): void {
    if (!this.entities.has(entityId)) {
      this.createEntity(entityId);
    }
    this.addComponent(entityId, type, data);
  }

  /**
   * Debug: Get the full serialized state for inspection
   */
  debugGetFullState(): SerializedWorld {
    const entitiesRecord: Record<EntityId, ComponentType[]> = {};
    for (const [id, types] of this.entities) {
      entitiesRecord[id] = Array.from(types);
    }

    const componentsRecord: Record<ComponentType, Record<EntityId, unknown>> = {} as Record<ComponentType, Record<EntityId, unknown>>;
    for (const [type, entityMap] of this.components) {
      componentsRecord[type] = {};
      for (const [entityId, data] of entityMap) {
        componentsRecord[type][entityId] = data;
      }
    }

    return {
      entities: entitiesRecord,
      components: componentsRecord,
      gameState: { ...this.gameState },
      mazeInfo: { ...this.mazeInfo },
      spatialData: {
        wallCount: this.wallGrid.size,
        houseCount: this.houseGrid.size,
        collectableCount: this.collectableGrid.size,
      },
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RESET
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Reset the entire world state
   */
  reset(): void {
    this.entities.clear();
    this.clearSpatialGrids();
    
    // Re-initialize component storage
    for (const type of Object.values(ComponentType)) {
      this.components.set(type, new Map());
    }

    this.gameState = {
      status: GameStatus.LOADING,
      score: 0,
      level: 1,
    };

    this.mazeInfo = {
      pacDots: { total: 0, current: 0 },
      powerPellets: { total: 0, current: 0 },
      isLoaded: false,
    };
  }
}
