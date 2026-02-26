/**
 * Component Types for the new ECS architecture
 * 
 * This file defines all the component types that can be attached to entities
 * in the GameWorld. Each component represents a specific aspect of an entity's
 * data and behavior.
 * 
 * @see /docs/ECS_ARCHITECTURE_DESIGN.md for detailed component specifications
 */

// ============================================================================
// COMPONENT TYPE ENUM
// ============================================================================

export enum ComponentType {
  // Identity Tags
  PLAYER_TAG = 'PLAYER_TAG',
  GHOST_TAG = 'GHOST_TAG',
  ECHO_TAG = 'ECHO_TAG',
  WALL_TAG = 'WALL_TAG',
  COLLECTABLE_TAG = 'COLLECTABLE_TAG',
  HOUSE_TILE_TAG = 'HOUSE_TILE_TAG',

  // Position Components
  DISCRETE_POSITION = 'DISCRETE_POSITION',
  CONTINUOUS_POSITION = 'CONTINUOUS_POSITION',

  // Movement Components
  TIMER = 'MOVEMENT_TIMER',
  MOVEMENT_SPEED = 'MOVEMENT_SPEED',
  MOVEMENT_INTENT = 'MOVEMENT_INTENT',
  CURRENT_DIRECTION = 'CURRENT_DIRECTION',

  // Alignment (Chomp only)
  ALIGNMENT_STATE = 'ALIGNMENT_STATE',

  // Input Components
  INPUT_STATE = 'INPUT_STATE',
  PLAYER_INTENT = 'PLAYER_INTENT',
  PLAYABLE = 'PLAYABLE',

  // Ghost Behavior Components
  BEHAVIOR_MODE = 'BEHAVIOR_MODE',
  BEHAVIOR_COUNTER = 'BEHAVIOR_COUNTER',
  TARGET_POSITION = 'TARGET_POSITION',
  PEER_REFERENCE = 'PEER_REFERENCE',

  // Combat/Interaction Components
  HEALTH = 'HEALTH',
  INVULNERABILITY = 'INVULNERABILITY',
  COLLECTOR = 'COLLECTOR',
  COLLECTED_SCORE = 'COLLECTED_SCORE',

  // Event Components (one-frame, cleared each frame)
  COLLISION_EVENT = 'COLLISION_EVENT',
  COLLECTION_EVENT = 'COLLECTION_EVENT',
  ECHO_EATEN_EVENT = 'ECHO_EATEN_EVENT',

  // Render Marker
  RENDERABLE = 'RENDERABLE',
}

// ============================================================================
// ENTITY ID TYPE
// ============================================================================

export type EntityId = string;

// ============================================================================
// COMMON ENTITY IDS
// ============================================================================

export const PACMAN_ENTITY_ID: EntityId = 'pacman';
export const BLINKY_ENTITY_ID: EntityId = 'blinky';
export const PINKY_ENTITY_ID: EntityId = 'pinky';
export const INKY_ENTITY_ID: EntityId = 'inky';
export const CLYDE_ENTITY_ID: EntityId = 'clyde';

// ============================================================================
// POSITION KEY TYPE (for spatial queries)
// ============================================================================

export type PositionKey = `${number},${number}`;

// ============================================================================
// HELPER FUNCTION
// ============================================================================

export function positionToKey(x: number, y: number): PositionKey {
  return `${x},${y}`;
}

export function keyToPosition(key: PositionKey): { x: number; y: number } {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}
