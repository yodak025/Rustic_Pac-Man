#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Chunk generation and assembly for giant maze construction.
Generates individual chunks and assembles them into complete giant maze.
"""
import logging
import numpy as np
from typing import List, Optional, Callable

from cell import create_cell_array
from reset import reset
from gen import CellConnectionsGenerator
from is_desirable import is_desirable
from tunnels import TunnelsGenerator
from get_tiles import get_tiles
from chunking import Chunk
from config_schema import MazeConfig

# Configure logging
logger = logging.getLogger(__name__)


def generate_chunk_tilemap(
    chunk: Chunk,
    max_figure_size: int,
    max_attempts: int = 500
) -> np.ndarray:
    """
    Generate tilemap for a single chunk with specified tunnel positions.
    
    Args:
        chunk: Chunk object with dimensions and tunnel specifications
        max_figure_size: Maximum size for figure generation
        max_attempts: Maximum regeneration attempts (default: 500)
        
    Returns:
        ASCII numpy array representing the chunk tilemap (dtype='<U1')
        
    Raises:
        ValueError: If unable to generate valid chunk after max_attempts
    """
    logger.info(
        f"Generating chunk Layer {chunk.layer_id} Chunk {chunk.chunk_id} "
        f"({chunk.rows}×{chunk.cols} cells, {len(chunk.left_tunnels)} left tunnels, "
        f"{len(chunk.right_tunnels)} right tunnels)"
    )
    
    for attempt in range(max_attempts):
        try:
            # Create cell array for chunk
            cells = create_cell_array(chunk.rows, chunk.cols)
            logger.debug(f"Cell array created: {chunk.rows}×{chunk.cols}")
            
            # Reset cells (no ghost house)
            reset(cells, None)
            
            # Generate cell connections
            cell_connections = CellConnectionsGenerator(cells, max_figure_size)
            cell_connections.generate()
            
            # Check desirability
            if not is_desirable(cells):
                logger.debug(f"Attempt {attempt + 1}: Not desirable, retrying...")
                continue
            
            # Prepare tunnel positions (convert from chunk-relative to cell-relative)
            # Tunnels in chunk are in layer coordinates, need to convert to chunk coordinates
            left_positions = [y - chunk.start_row for y in chunk.left_tunnels] if chunk.left_tunnels else None
            right_positions = [y - chunk.start_row for y in chunk.right_tunnels] if chunk.right_tunnels else None
            
            # Generate tunnels
            tunnels = TunnelsGenerator(cells)
            tunnels.generate_multi(left_positions, right_positions)
            
            if not tunnels.is_valid_cell_map:
                logger.debug(f"Attempt {attempt + 1}: Invalid tunnel configuration, retrying...")
                continue
            
            logger.debug("Tunnels generated successfully")
            
            # Convert to tilemap (ASCII)
            tiles = get_tiles(cells, lambda set_tiles: None)  # No-op callback
            logger.debug(f"ASCII tilemap generated from cells: shape {tiles.shape}")
            
            logger.info(
                f"Chunk Layer {chunk.layer_id} Chunk {chunk.chunk_id} "
                f"generated successfully (attempt {attempt + 1})"
            )
            
            return tiles
            
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed with error: {e}")
            continue
    
    # Failed after max attempts
    raise ValueError(
        f"Failed to generate valid chunk Layer {chunk.layer_id} Chunk {chunk.chunk_id} "
        f"after {max_attempts} attempts"
    )


def assemble_chunks_vertical(chunk_tilemaps: List[np.ndarray]) -> np.ndarray:
    """
    Assemble multiple chunk tilemaps vertically into a single layer.
    
    Args:
        chunk_tilemaps: List of chunk tilemaps (top to bottom order)
        
    Returns:
        Vertically assembled tilemap
    """
    if not chunk_tilemaps:
        raise ValueError("Cannot assemble empty chunk list")
    
    if len(chunk_tilemaps) == 1:
        return chunk_tilemaps[0]
    
    # Concatenate vertically
    assembled = np.vstack(chunk_tilemaps)
    logger.debug(f"Assembled {len(chunk_tilemaps)} chunks vertically into shape {assembled.shape}")
    
    return assembled


def assemble_layers_horizontal(layer_tilemaps: List[np.ndarray]) -> np.ndarray:
    """
    Assemble multiple layer tilemaps horizontally into final giant maze.
    
    Handles minor height differences due to get_tiles() border inconsistencies
    by padding shorter layers with empty rows (horizontal walls '_').
    
    Args:
        layer_tilemaps: List of ASCII layer tilemaps (left to right order)
        
    Returns:
        Horizontally assembled giant maze tilemap (ASCII)
    """
    if not layer_tilemaps:
        raise ValueError("Cannot assemble empty layer list")
    
    if len(layer_tilemaps) == 1:
        return layer_tilemaps[0]
    
    # Find maximum height to ensure all layers match
    min_height = min(layer.shape[0] for layer in layer_tilemaps)
    max_height = max(layer.shape[0] for layer in layer_tilemaps)
    
    if min_height != max_height:
        logger.warning(
            f"Layer heights vary ({min_height} to {max_height} tiles). "
            f"Padding shorter layers with empty rows to {max_height} tiles. "
            f"This is expected due to get_tiles() border handling."
        )
        # Pad all layers to maximum height (add bottom rows filled with '_')
        padded_layers = []
        for layer in layer_tilemaps:
            if layer.shape[0] < max_height:
                rows_to_add = max_height - layer.shape[0]
                # Create padding rows filled with '_' (empty)
                padding = np.full((rows_to_add, layer.shape[1]), '_', dtype=layer.dtype)
                # Add padding to the bottom
                padded_layer = np.vstack([layer, padding])
                padded_layers.append(padded_layer)
            else:
                padded_layers.append(layer)
        layer_tilemaps = padded_layers
    
    # Concatenate horizontally
    assembled = np.hstack(layer_tilemaps)
    logger.info(f"Assembled {len(layer_tilemaps)} layers horizontally into final maze shape {assembled.shape}")
    
    return assembled


def generate_giant_maze_with_chunks(
    config: MazeConfig,
    max_macro_attempts: int = 1000000
) -> np.ndarray:
    """
    Generate complete giant maze with chunking and intelligent retry logic.
    
    Workflow:
    1. Generate chunk map and MST
    2. Attempt to generate each chunk (max 500 attempts per chunk)
    3. If any chunk fails after 500 attempts, regenerate entire macro (new chunk map + MST)
    4. Assemble chunks vertically within each layer
    5. Assemble layers horizontally into final maze
    
    Args:
        config: MazeConfig with generation parameters
        max_macro_attempts: Maximum attempts to regenerate entire macro structure
        
    Returns:
        Complete giant maze tilemap as ASCII numpy array (dtype='<U1')
        
    Raises:
        RuntimeError: If unable to generate maze after max_macro_attempts
    """
    from chunking import generate_chunk_map
    from graph_mst import generate_mst_and_assign_tunnels
    
    CHUNK_MAX_ATTEMPTS = 500
    
    for macro_attempt in range(max_macro_attempts):
        try:
            logger.info(
                f"Macro attempt {macro_attempt + 1}: Generating chunk map and MST for "
                f"{config.num_layers} layers..."
            )
            
            # Generate new chunk map
            chunk_map = generate_chunk_map(config)
            
            # Generate MST and assign tunnels (including entry/exit)
            is_navigable = generate_mst_and_assign_tunnels(
                chunk_map,
                entry_position=config.entry_position,
                exit_position=config.exit_position
            )
            
            if not is_navigable:
                logger.warning(f"Macro attempt {macro_attempt + 1}: Chunk map not navigable, retrying...")
                continue
            
            logger.info(f"Macro attempt {macro_attempt + 1}: Chunk map is navigable, generating chunks...")
            
            # Try to generate all chunks with this macro configuration
            layer_tilemaps = []
            
            for layer_id, chunks in enumerate(chunk_map):
                logger.info(f"Processing layer {layer_id} with {len(chunks)} chunk(s)...")
                
                chunk_tilemaps = []
                
                for chunk in chunks:
                    # Generate individual chunk with limited attempts
                    try:
                        chunk_tilemap = generate_chunk_tilemap(
                            chunk=chunk,
                            max_figure_size=config.max_figure_size,
                            max_attempts=CHUNK_MAX_ATTEMPTS
                        )
                        chunk_tilemaps.append(chunk_tilemap)
                    except ValueError as e:
                        # Chunk failed after 500 attempts - need to regenerate entire macro
                        logger.warning(
                            f"Macro attempt {macro_attempt + 1}: {e}. "
                            f"Regenerating entire macro structure..."
                        )
                        raise  # Re-raise to trigger macro retry
                
                # Assemble chunks vertically into layer
                layer_tilemap = assemble_chunks_vertical(chunk_tilemaps)
                layer_tilemaps.append(layer_tilemap)
                
                logger.info(f"Layer {layer_id} assembled: shape {layer_tilemap.shape}")
            
            # Assemble layers horizontally into final maze
            final_maze = assemble_layers_horizontal(layer_tilemaps)
            
            logger.info(
                f"Giant maze generation complete on macro attempt {macro_attempt + 1}: "
                f"final shape {final_maze.shape}"
            )
            
            return final_maze
            
        except ValueError:
            # Chunk generation failed - continue to next macro attempt
            continue
        except Exception as e:
            logger.error(f"Unexpected error on macro attempt {macro_attempt + 1}: {e}")
            continue
    
    # Failed after max macro attempts
    raise RuntimeError(
        f"Failed to generate giant maze after {max_macro_attempts} macro attempts. "
        f"Consider adjusting configuration parameters (chunk sizes, tunnel ratios, etc.)"
    )


if __name__ == '__main__':
    # Configure logging for testing
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    
    # Test configuration
    test_config = MazeConfig({
        'dimensions': {
            'num_layers': 4,
            'layer_rows': 36,
            'layer_cols': 5
        },
        'tunnels': {
            'entry_position': 10,  # Entry at row 10 of first layer
            'exit_position': 25   # Exit at row 25 of last layer
        },
        'chunking': {
            'min_chunk_size': 10,  # Increased from 8 to have more room for tunnels
            'max_chunks_per_layer': 3
        },
        'max_figure_size': 5
    })
    
    print("=== Testing Chunk Generation and Assembly ===")
    print(f"Config: {test_config.num_layers} layers, {test_config.layer_rows}×{test_config.layer_cols} cells")
    print()
    
    print("Generating giant maze with intelligent retry logic...")
    print("- Max 500 attempts per chunk")
    print("- Regenerates entire macro structure if any chunk fails")
    print()
    
    # Generate complete maze with new intelligent retry logic
    try:
        giant_maze = generate_giant_maze_with_chunks(test_config)
        print(f"\n✓ SUCCESS: Giant maze generated with shape {giant_maze.shape}")
        print(f"  Expected tile size: ~{test_config.layer_rows * 3}×{test_config.num_layers * test_config.layer_cols * 3}")
        print(f"  Actual size: {giant_maze.shape}")
        
        # Print visual representation of the maze
        print("\n=== Visual Tilemap ===")
        # ASCII tilemap - print directly
        for row in giant_maze[:50]:  # First 50 rows
            print(''.join(row))
    except Exception as e:
        print(f"\n✗ FAILED: {e}")

