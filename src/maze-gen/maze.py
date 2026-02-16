#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from directions import UP, RIGHT, DOWN, LEFT
from cell import create_cell_array
from reset import reset
from gen import CellConnectionsGenerator
from get_tiles import get_tiles
from is_desirable import is_desirable
from tunnels import TunnelsGenerator
from config_schema import MazeConfig
import numpy as np
import logging


logging.basicConfig(level=logging.INFO)
LOGGER = logging.getLogger("maze-gen")


def _echoes_chamber_cells(cells, cols):
    """Connects manually the cells that represents the Echoes Chamber in the maze."""
    i = 3 * cols 
    x = i % cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[LEFT] = c.is_connected_at[RIGHT] = c.is_connected_at[DOWN] = True
    i += 1
    x = i % cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[LEFT] = c.is_connected_at[DOWN] = True
    i += cols - 1
    x = i % cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[RIGHT] = c.is_connected_at[UP] = c.is_connected_at[LEFT] = True
    i += 1
    x = i % cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[LEFT] = c.is_connected_at[UP] = True
    LOGGER.debug("Echoes chamber cell connections created")


def _set_echoes_chamber_door_tiles(set_tiles):
    """Sets the tiles that represent the Echoes Chamber door in the tilemap."""
    set_tiles(11, 2, "h")
    set_tiles(12, 2, "h")
    set_tiles(13, 2, "h")
    set_tiles(14, 2, "h")
    set_tiles(12, 3, "h")
    set_tiles(13, 3, "h")
    set_tiles(14, 3, "h")
    set_tiles(12, 4, "h")
    set_tiles(13, 4, "h")
    set_tiles(14, 4, "h")
    LOGGER.debug("Echoes Chamber tiles setted in tilemap")


def create_maze(rows=9, cols=5, max_figure_size=5):
    """
    Generates a Pacman-like maze, represented as a tilemap made of numbers.
    """
    while True:
        LOGGER.info("Generating maze...")
        cells = create_cell_array(rows, cols)
        LOGGER.debug(f"New cell array with {rows} rows and {cols} columns created")
        reset(cells, lambda c: _echoes_chamber_cells(c, cols))
        LOGGER.debug("Cells prepared for generation")

        cell_connections = CellConnectionsGenerator(cells, max_figure_size)
        cell_connections.generate()
        if not is_desirable(cells):
            LOGGER.warning("Generated maze is not desirable, regenerating...")
            continue
        tunnels = TunnelsGenerator(cells)
        tunnels.generate()
        if not tunnels.is_valid_cell_map:
            LOGGER.info("Generated maze with tunnels is not valid, regenerating...")
            continue
        LOGGER.debug("Tunnels generated successfully")

        tiles = get_tiles(cells, _set_echoes_chamber_door_tiles)
        LOGGER.debug("String tilemap generated from cells")
        tile_map = {
            '.': 0, 
            '|': 1,
            'o': 2, 
            '_': -2, 
            'h': -3, 
            'd': -4, 
            '-': 3
            }
        tiles_array = np.vectorize(lambda x: tile_map.get(x, -1))(tiles).astype(int)
        LOGGER.debug("String tilemap converted to integer tilemap")
        LOGGER.info("Maze generated successfully")
        return tiles_array
    
def create_rustic_giant_layer(rows, cols, max_figure_size, left=None, right=None):
    """
    Generates a single layer for a giant maze with asymmetric tunnels.
    
    Args:
        rows: Number of rows (cells) in the layer
        cols: Number of columns (cells) in the layer
        max_figure_size: Maximum size for figure generation
        left: Y-coordinate for left tunnel. If None, selects randomly.
        right: Y-coordinate for right tunnel. If None, selects randomly.
    
    Returns:
        Integer numpy array representing the tilemap
    """
    while True:
        LOGGER.info("Generating giant maze layer...")
        cells = create_cell_array(rows, cols)
        LOGGER.debug(f"New cell array with {rows} rows and {cols} columns created")
        
        # [DISABLED] Ghost house generation - commented for new giant maze system
        # Will be reimplemented later with entity placement system
        # reset(cells, lambda c: _echoes_chamber_cells(c, cols))
        reset(cells, None)
        LOGGER.debug("Cells prepared for generation")

        cell_connections = CellConnectionsGenerator(cells, max_figure_size)
        cell_connections.generate()
        if not is_desirable(cells):
            LOGGER.warning("Generated maze is not desirable, regenerating...")
            continue
        tunnels = TunnelsGenerator(cells)
        tunnels.generate_asym(left, right)
        if not tunnels.is_valid_cell_map:
            LOGGER.info("Generated maze with tunnels is not valid, regenerating...")
            continue
        LOGGER.debug("Tunnels generated successfully")

        # [DISABLED] Ghost house door tiles - commented for new giant maze system
        # tiles = get_tiles(cells, _set_echoes_chamber_door_tiles)
        tiles = get_tiles(cells, lambda set_tiles: None)  # No-op callback
        LOGGER.debug("String tilemap generated from cells")
        tile_map = {
            '.': 0, 
            '|': 1,
            'o': 2, 
            '_': -2, 
            'h': -3, 
            'd': -4, 
            '-': 3
            }
        tiles_array = np.vectorize(lambda x: tile_map.get(x, -1))(tiles).astype(int)
        LOGGER.debug("String tilemap converted to integer tilemap")
        LOGGER.info("Giant maze layer generated successfully")
        return tiles_array
    
def create_giant_maze_simple(config):
    """
    Generates a giant maze by connecting multiple layers horizontally.
    Simple version without chunking - each layer is a complete maze.
    
    Args:
        config: MazeConfig instance with generation parameters
    
    Returns:
        Integer numpy array representing the complete giant maze tilemap
    """
    if not isinstance(config, MazeConfig):
        raise TypeError("config must be a MazeConfig instance")
    
    LOGGER.info(f"Generating simple giant maze with {config.num_layers} layers...")
    
    max_attempts = 100
    for attempt in range(max_attempts):
        try:
            layer_tilemaps = []
            previous_right_tunnel = None
            
            for layer_idx in range(config.num_layers):
                LOGGER.info(f"Generating layer {layer_idx + 1}/{config.num_layers}...")
                
                # Determine tunnel positions for this layer
                if layer_idx == 0:
                    # First layer: entry position (left) and random exit (right)
                    left_tunnel = config.entry_position
                    right_tunnel = None  # Random
                elif layer_idx == config.num_layers - 1:
                    # Last layer: previous exit becomes entry, and exit position on right
                    left_tunnel = previous_right_tunnel
                    right_tunnel = config.exit_position
                else:
                    # Middle layers: previous exit becomes entry, random exit
                    left_tunnel = previous_right_tunnel
                    right_tunnel = None  # Random
                
                # Generate the layer
                layer_tilemap = create_rustic_giant_layer(
                    rows=config.layer_rows,
                    cols=config.layer_cols,
                    max_figure_size=config.max_figure_size,
                    left=left_tunnel,
                    right=right_tunnel
                )
                
                layer_tilemaps.append(layer_tilemap)
                
                # Store the right tunnel position for the next layer
                if layer_idx < config.num_layers - 1:
                    previous_right_tunnel = _extract_right_tunnel_position(layer_tilemap)
                    LOGGER.debug(f"Layer {layer_idx + 1} right tunnel at position: {previous_right_tunnel}")
            
            # Concatenate all layers horizontally
            giant_maze = np.hstack(layer_tilemaps)
            
            LOGGER.info(f"Simple giant maze generated successfully: {giant_maze.shape}")
            return giant_maze
            
        except ValueError as e:
            LOGGER.warning(f"Attempt {attempt + 1}/{max_attempts} failed: {e}. Retrying...")
            continue
    
    raise RuntimeError(f"Failed to generate giant maze after {max_attempts} attempts")


def _extract_right_tunnel_position(tilemap):
    """
    Extracts the y-coordinate of the right tunnel from a layer tilemap.
    The tunnel is a path tile ('.'/0) on the rightmost column.
    
    Args:
        tilemap: Integer numpy array representing a layer
    
    Returns:
        Y-coordinate of the tunnel in cell coordinates (not tile coordinates)
    
    Raises:
        ValueError: If no tunnel is found in the tilemap
    """
    rows, cols = tilemap.shape
    
    # Search for path tiles on the rightmost column
    # Tiles expand cells 3x, so we need to find the cell coordinate
    for tile_y in range(rows):
        if tilemap[tile_y, cols - 1] == 0:  # Path tile
            # Convert tile coordinate to cell coordinate
            # Tiles are generated with formula: tile_y = 3 * cell_y + offset
            # We need to reverse this, considering the offset in get_tiles.py
            cell_y = (tile_y - 1) // 3  # Approximation based on expansion logic
            return cell_y
    
    raise ValueError("Could not find right tunnel in tilemap")


def create_rustic_giant_maze(max_figure_size=5, init_row=2, final_row=11):
    """
    [LEGACY FUNCTION - For backwards compatibility]
    Generates a giant maze by combining multiple layers connected through asymmetric tunnels.
    Fixed configuration: 2 layers connected horizontally.
    
    Use create_giant_maze_simple() with MazeConfig for new code.
    """
    LOGGER.info("Generating rustic giant maze...")
    ROWS = 18
    COLS = 5
    current_tunnel = 14
    
    layer_tilemaps = []
    # First layer: connects from init_row to current_tunnel
    layer_tilemaps.append(create_rustic_giant_layer(ROWS, COLS, max_figure_size, init_row, current_tunnel))
    last_tunnel = current_tunnel 
    
    # Second layer: connects from last_tunnel to final_row
    layer_tilemaps.append(create_rustic_giant_layer(ROWS, COLS, max_figure_size, last_tunnel, final_row))

    # Concatenate layers horizontally
    giant_maze = np.hstack(layer_tilemaps)
            
    LOGGER.info("Rustic giant maze generated successfully")
    return giant_maze


if __name__ == '__main__':
    # Test simple giant maze generation with 4 layers
    config = MazeConfig({
        'dimensions': {
            'layer_rows': 36,
            'layer_cols': 5,
            'num_layers': 4
        }
    })
    
    maze = create_giant_maze_simple(config)
    
    int_to_tile = {
        0: '.', 
        1: '|',
        2: 'o', 
        -2: '_', 
        -3: 'h', 
        -4: 'd', 
        3: '-'
    }
    # recreate the string tilemap from the integer maze
    redone_maze = np.vectorize(lambda x: int_to_tile.get(int(x), '?'))(maze)
    for row in redone_maze:
        print(' '.join(f"{cell}" for cell in row))
