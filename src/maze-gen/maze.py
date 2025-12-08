#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from directions import UP, RIGHT, DOWN, LEFT
from cell import create_cell_array
from reset import reset
from gen import CellConnectionsGenerator
from get_tiles import get_tiles
from is_desirable import is_desirable
from tunnels import TunnelsGenerator
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


if __name__ == '__main__':
    maze = create_maze()
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
