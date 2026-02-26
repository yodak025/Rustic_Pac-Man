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
}

/**
 * Result from maze generation including tilemap and metadata
 */
export interface MazeGenerationResult {
  tilemap: string[][];
  metadata: MazeMetadata;
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

    return {
      tilemap: data.tilemap,
      metadata: data.metadata
    };
  } catch (error) {
    console.error("Error generating giant maze:", error);
    throw new Error(`Error generating giant maze: ${error}`);
  }
}

