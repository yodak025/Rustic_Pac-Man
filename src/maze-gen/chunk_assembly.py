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
    max_attempts: int = 1000000
) -> np.ndarray:
    """
    Generate tilemap for a single chunk with specified tunnel positions.
    
    Args:
        chunk: Chunk object with dimensions and tunnel specifications
        max_figure_size: Maximum size for figure generation
        max_attempts: Maximum regeneration attempts
        
    Returns:
        Integer numpy array representing the chunk tilemap (tiles, not cells)
        
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
            
            # Convert to tilemap
            tiles = get_tiles(cells, lambda set_tiles: None)  # No-op callback
            logger.debug("String tilemap generated from cells")
            
            # Convert to integer tilemap
            tile_map = {
                '.': 0,   # Path
                '|': 1,   # Vertical wall
                'o': 2,   # Pacdot
                '_': -2,  # Horizontal wall
                'h': -3,  # Ghost house
                'd': -4,  # Door
                '-': 3    # Tunnel
            }
            tiles_array = np.vectorize(lambda x: tile_map.get(x, -1))(tiles).astype(int)
            logger.debug("String tilemap converted to integer tilemap")
            
            logger.info(
                f"Chunk Layer {chunk.layer_id} Chunk {chunk.chunk_id} "
                f"generated successfully (attempt {attempt + 1})"
            )
            
            return tiles_array
            
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
    by cropping all layers to the minimum height.
    
    Args:
        layer_tilemaps: List of layer tilemaps (left to right order)
        
    Returns:
        Horizontally assembled giant maze tilemap
    """
    if not layer_tilemaps:
        raise ValueError("Cannot assemble empty layer list")
    
    if len(layer_tilemaps) == 1:
        return layer_tilemaps[0]
    
    # Find minimum height to ensure all layers can be concatenated
    min_height = min(layer.shape[0] for layer in layer_tilemaps)
    max_height = max(layer.shape[0] for layer in layer_tilemaps)
    
    if min_height != max_height:
        logger.warning(
            f"Layer heights vary ({min_height} to {max_height} tiles). "
            f"Cropping all layers to {min_height} tiles for horizontal assembly. "
            f"This is expected due to get_tiles() border handling."
        )
        # Crop all layers to minimum height (remove bottom rows)
        layer_tilemaps = [layer[:min_height, :] for layer in layer_tilemaps]
    
    # Concatenate horizontally
    assembled = np.hstack(layer_tilemaps)
    logger.info(f"Assembled {len(layer_tilemaps)} layers horizontally into final maze shape {assembled.shape}")
    
    return assembled


def generate_giant_maze_with_chunks(
    chunk_map: List[List[Chunk]],
    config: MazeConfig
) -> np.ndarray:
    """
    Generate complete giant maze from chunk map.
    
    Workflow:
    1. Generate tilemap for each chunk
    2. Assemble chunks vertically within each layer
    3. Assemble layers horizontally into final maze
    
    Args:
        chunk_map: Chunk map with tunnel assignments from MST
        config: MazeConfig with generation parameters
        
    Returns:
        Complete giant maze tilemap as integer numpy array
        
    Raises:
        ValueError: If chunk generation or assembly fails
    """
    logger.info(f"Generating giant maze with {len(chunk_map)} layers...")
    
    layer_tilemaps = []
    
    for layer_id, chunks in enumerate(chunk_map):
        logger.info(f"Processing layer {layer_id} with {len(chunks)} chunk(s)...")
        
        chunk_tilemaps = []
        
        for chunk in chunks:
            # Generate individual chunk
            chunk_tilemap = generate_chunk_tilemap(
                chunk=chunk,
                max_figure_size=config.max_figure_size,
                max_attempts=1000000
            )
            chunk_tilemaps.append(chunk_tilemap)
        
        # Assemble chunks vertically into layer
        layer_tilemap = assemble_chunks_vertical(chunk_tilemaps)
        layer_tilemaps.append(layer_tilemap)
        
        logger.info(f"Layer {layer_id} assembled: shape {layer_tilemap.shape}")
    
    # Assemble layers horizontally into final maze
    final_maze = assemble_layers_horizontal(layer_tilemaps)
    
    logger.info(f"Giant maze generation complete: final shape {final_maze.shape}")
    
    return final_maze


if __name__ == '__main__':
    # Configure logging for testing
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    
    from chunking import generate_chunk_map
    from graph_mst import generate_mst_and_assign_tunnels
    
    # Test configuration
    test_config = MazeConfig({
        'dimensions': {
            'num_layers': 4,
            'layer_rows': 36,
            'layer_cols': 5
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
    
    # Generate chunk map
    chunk_map = generate_chunk_map(test_config)
    
    # Generate MST and assign tunnels
    is_navigable = generate_mst_and_assign_tunnels(chunk_map)
    
    if not is_navigable:
        print("ERROR: Chunk map is not navigable!")
        exit(1)
    
    print("\n✓ Chunk map is navigable")
    print("\nGenerating giant maze...")
    
    # Generate complete maze
    try:
        giant_maze = generate_giant_maze_with_chunks(chunk_map, test_config)
        print(f"\n✓ SUCCESS: Giant maze generated with shape {giant_maze.shape}")
        print(f"  Expected tile size: ~{test_config.layer_rows * 3}×{test_config.num_layers * test_config.layer_cols * 3}")
        print(f"  Actual size: {giant_maze.shape}")
    except Exception as e:
        print(f"\n✗ FAILED: {e}")
