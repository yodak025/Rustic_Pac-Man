import type { PyodideInterface } from "pyodide";

/**
 * Configuration for maze generation
 */
export interface MazeConfig {
  dimensions?: {
    layer_rows?: number;
    layer_cols?: number;
    num_layers?: number;
  };
  tunnels?: {
    entry_position?: number | null;
    exit_position?: number | null;
  };
  entities?: {
    ghost_ratio?: number;
    powerpellet_ratio?: number;
  };
  chunking?: {
    min_chunk_size?: number;
    max_chunks_per_layer?: number;
  };
  max_figure_size?: number;
  seed?: number | null;
}

/**
 * Metadata returned by maze generation with entity placement
 */
export interface MazeMetadata {
  pacdot_count: number;
  powerpellet_count: number;
  echo_count: number;
  chomp_spawn: [number, number] | null;
  echo_spawns: Array<[number, number]>;
  /**
   * Maps "row,col" to medallion kind string for each dedicated medallion tile.
   * Each medallion kind uses its own ASCII character (see MEDALLION_TILE_CHARS below).
   */
  medallion_kinds?: Record<string, string>;
  /** Maps "row,col" to power-up kind string (e.g. "SUPER_DASH") for tile 'p' */
  power_up_kinds?: Record<string, string>;
}

/**
 * One-character ASCII tile symbol per collectable medallion kind.
 * These characters replace pacdots in the post-processed tilemap.
 * HEALTH is not collectable as a tile, so it has no entry here.
 */
export const MEDALLION_TILE_CHARS: Record<string, string> = {
  STEALTH: 's',
  VISION:  'v',
  SHOUT:   'u',
  SPEED:   'z',
  ESSENCE: 'e',
} as const;

/**
 * Result from maze generation including tilemap and metadata
 */
export interface MazeGenerationResult {
  tilemap: string[][];
  metadata: MazeMetadata;
}

/**
 * Post-processes a generated tilemap to inject one medallion tile per collectable kind.
 *
 * Randomly selects one pacdot ('.') position per medallion kind, replaces the tile
 * with the kind-specific character and records the mapping in metadata.medallion_kinds.
 *
 * Mutates `tilemap` and `metadata` in place.
 */
function injectMedallionTiles(tilemap: string[][], metadata: MazeMetadata): void {
  const kinds = Object.keys(MEDALLION_TILE_CHARS);

  // Collect all pacdot positions as [row, col] pairs
  const pacdotPositions: Array<[number, number]> = [];
  for (let row = 0; row < tilemap.length; row++) {
    for (let col = 0; col < tilemap[row].length; col++) {
      if (tilemap[row][col] === '.') {
        pacdotPositions.push([row, col]);
      }
    }
  }

  if (pacdotPositions.length < kinds.length) {
    console.warn(`[mazeGen] Not enough pacdots (${pacdotPositions.length}) to place ${kinds.length} medallions`);
    return;
  }

  // Fisher-Yates shuffle to pick random unique positions
  for (let i = pacdotPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pacdotPositions[i], pacdotPositions[j]] = [pacdotPositions[j], pacdotPositions[i]];
  }

  if (!metadata.medallion_kinds) {
    metadata.medallion_kinds = {};
  }

  kinds.forEach((kind, i) => {
    const [row, col] = pacdotPositions[i];
    tilemap[row][col] = MEDALLION_TILE_CHARS[kind];
    metadata.medallion_kinds![`${row},${col}`] = kind;
  });

  console.log(`[mazeGen] Injected ${kinds.length} medallion tiles:`, metadata.medallion_kinds);
}

/**
 * Generates a new giant maze with entity placement (power pellets, chomp, echoes).
 * Uses simplified ASCII tilemap:
 * - '_' = empty/void
 * - '.' = pacdot
 * - '|' = wall
 * - 'c' = chomp (player) spawn
 * - 'x' = echo (ghost) spawn
 * - 'o' = power pellet
 * - 's' = STEALTH medallion
 * - 'v' = VISION medallion
 * - 'u' = SHOUT medallion
 * - 'z' = SPEED medallion
 * - 'e' = ESSENCE medallion
 * 
 * @param pyodide Already initialized PyodideInterface instance
 * @param config Optional maze configuration (uses defaults if not provided)
 * @returns Object with tilemap (2D string array) and metadata
 */
export async function generateMaze(
  pyodide: PyodideInterface,
  config?: MazeConfig
): Promise<MazeGenerationResult> {
  try {
    console.log('Generating giant maze with entity placement...');

    // Default configuration
    const defaultConfig: MazeConfig = {
      dimensions: {
        layer_rows: 36,
        layer_cols: 5,
        num_layers: 4
      },
      tunnels: {
        entry_position: 10,
        exit_position: 25
      },
      entities: {
        ghost_ratio: 250,
        powerpellet_ratio: 500
      },
      max_figure_size: 5
    };

    // Merge with user config
    const finalConfig = {
      ...defaultConfig,
      ...config,
      dimensions: { ...defaultConfig.dimensions, ...config?.dimensions },
      tunnels: { ...defaultConfig.tunnels, ...config?.tunnels },
      entities: { ...defaultConfig.entities, ...config?.entities },
      chunking: { ...defaultConfig.chunking, ...config?.chunking }
    };

    console.log('Maze config:', finalConfig);

    const result = await pyodide.runPythonAsync(`
      from maze import create_giant_maze_with_entities
      from config_schema import MazeConfig
      import json

      # Create configuration
      config_dict = ${JSON.stringify(finalConfig)}
      config = MazeConfig(config_dict)

      # Generate giant maze with entity placement
      maze_array, metadata = create_giant_maze_with_entities(config)

      # Convert tilemap to Python list for serialization
      maze_list = maze_array.tolist()

      # Prepare metadata (convert numpy int64 to regular int)
      metadata_serializable = {
          'pacdot_count': int(metadata['pacdot_count']),
          'powerpellet_count': int(metadata['powerpellet_count']),
          'echo_count': int(metadata['echo_count']),
          'chomp_spawn': metadata['chomp_spawn'],
          'echo_spawns': metadata['echo_spawns']
      }

      # Return as JSON
      json.dumps({
          'tilemap': maze_list,
          'metadata': metadata_serializable
      })
    `);

    const data = JSON.parse(result as string);

    console.log("Giant maze generated successfully with entity placement");
    console.log(`Maze size: ${data.tilemap.length} rows × ${data.tilemap[0]?.length || 0} cols`);
    console.log(`Pacdots: ${data.metadata.pacdot_count}, Power pellets: ${data.metadata.powerpellet_count}, Echoes: ${data.metadata.echo_count}`);

    // Post-process: inject one medallion tile per collectable kind into random pacdot positions
    injectMedallionTiles(data.tilemap, data.metadata);

    return {
      tilemap: data.tilemap,
      metadata: data.metadata
    };
  } catch (error) {
    console.error("Error generating giant maze:", error);
    throw new Error(`Error generating giant maze: ${error}`);
  }
}

