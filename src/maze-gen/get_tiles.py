# ----------------------------------------------------------------------
# NOTE: Matrix indexing reference for clarity:                         |
#   Axis 0 = rows = i = y = vertical                                   |
#   Axis 1 = cols = j = x = horizontal                                 |
#   row size = number of elements in a row = number of cols = shape[1] |
#   col size = number of elements in a col = number of rows = shape[0] |
# ----------------------------------------------------------------------

import random
import logging
import numpy as np
from cell import Cell
from directions import UP, RIGHT, DOWN, LEFT
from typing import Callable as Def


LOGGER = logging.getLogger("tile-generation")


#![SHIT CODE]: This function is stupidly masive. Maybe it needs OOP refactoring.
def get_tiles(cells: np.ndarray, set_manual_tiles: Def[[Def[[int, int, str], None]], None]) -> np.ndarray:
    """
    Converts a 2D cell grid into a tile representation with walls, paths, and pellets.
    Processes cell connectivity to generate playable maze tiles and applies manual modifications.
    """
    LOGGER.info("Starting tile generation from cell grid...")
    # [HARD CODED] Magic number coefficients: cells are expanded 3x and offset by 1-2
    tiles_demirow_size = cells.shape[1] * 3 + 1  # Half row size for symmetry
    tiles_row_size = tiles_demirow_size * 2  # Full row with symmetric halves
    tiles_col_size = cells.shape[0] * 3 + 2  # Column size with offset
    aux_row_size = tiles_demirow_size + 2  # Auxiliary row size with padding
    aux_col_size = tiles_col_size + 1  # Auxiliary column size with padding
    LOGGER.debug(f"Tile grid dimensions - rows: {tiles_col_size}, cols: {tiles_row_size}")

    tiles = np.full((aux_col_size, tiles_row_size ), '_', dtype=str)
    # Auxiliary array to hold cells. The position corresponds to expanded tile positions and
    # is used to reference back to cells when filling the main tile array.
    aux_tile_cells = np.full((aux_col_size, aux_col_size), None, dtype=object)


    def set_tile(y, x, value):
        """Sets a tile value symmetrically on both halves of the row."""
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return
        x -= 2
        tiles[y, tiles_demirow_size + x] = value
        tiles[y, tiles_demirow_size-1 - x] = value

    def get_tile(y, x):
        """Retrieves a tile value from the right half of the symmetric grid."""
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return None
        x -= 2
        value = tiles[y, tiles_demirow_size + x]
        return value 
    
    def set_asym_tile(y, x, value, is_left: bool):
        """Sets a tile value for asymmetric mazes."""
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return
        x -= 2
        if is_left:
            tiles[y, tiles_demirow_size -1 - x] = value
        else:
            tiles[y, tiles_demirow_size + x] = value

    def get_asym_tile(y, x, is_left: bool):
        """Retrieves a tile value for asymmetric mazes."""
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return None
        x -= 2
        if is_left:
            value = tiles[y, tiles_demirow_size -1 - x]
        else:
            value = tiles[y, tiles_demirow_size + x]
        return value

    def set_aux_tile_cell(y, x, cell):
        """Sets an auxiliary tile reference to a cell."""
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return
        x -= 2
        aux_tile_cells[y, x] = cell

    def get_aux_tile_cell(y, x):
        """Retrieves an auxiliary tile reference to a cell."""
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return None
        x -= 2
        cell = aux_tile_cells[y, x]
        return cell 

    def erase_until_intersection(x, y, get_tile_func, set_tile_func):
        """Removes an underired path at the horizontal edges until reaching an intersection."""
        #! [QUARENTINE]: The parametized functions seems unnecessary. Erase if possible.
        #? However, they could be useful for future unsymetric tunnel management. 
        #? Original algorithm didn't use them, it is higly proabable that I add it thinking about that.
        while True:
            adj = []
            if get_tile_func(y, x-1) == '.':
                adj.append((x-1, y))
            if get_tile_func(y, x+1) == '.':
                adj.append((x+1, y))
            if get_tile_func(y-1, x) == '.':
                adj.append((x, y-1))
            if get_tile_func(y+1, x) == '.':
                adj.append((x, y+1))
            if len(adj) == 1:
                set_tile_func(y, x, '_')
                x, y = adj[0]
            else:
                break

    # Populate auxiliary tile array with cell references in the position of their expanded tiles
    # It its used to reference back to cells when filling the main tile array.
    # [SHIT CODE] Complex offset logic (offset of 2) and expansion algorithm inhertit from the
    # LeBron implementation. It just works but it's clearly code out of control. 
    LOGGER.debug("Populating auxiliary tile array with cell references...")
    for i in range(cells.shape[0]):
        for j in range(cells.shape[1]):
            current_cell = cells[i, j]
            for x0 in range(3):
                for y0 in range(3):
                    set_aux_tile_cell(3*i + y0 + 1, 3*j + x0, current_cell)
    LOGGER.debug("Auxiliary tile array populated successfully.")

    # Fill tiles based on cell group changes and connectivity
    # Tiles are marked for path ('.') where cell groups change or connections exist
    # Note: symmetric filling applied to both halves of each row
    LOGGER.debug("Starting tile path filling based on cell connectivity...")
    i, j = 0, 0
    for i in range(tiles_col_size):
        for j in range(tiles_demirow_size):
            curr: Cell = get_aux_tile_cell(i, j)
            prev_left: Cell = get_aux_tile_cell(i, j - 1)
            prev_up: Cell = get_aux_tile_cell(i - 1, j)
            # Cell group changes or top edge connectivity
            if curr:
                # If cell group changes from left or above, 
                # or no upper connection (top border case), create path.
                if (prev_left and (curr.group_seq != prev_left.group_seq) or
                    prev_up and (curr.group_seq != prev_up.group_seq) or
                        (not prev_up and not curr.is_connected_at[UP])):
                    set_tile(i, j, '.')
            # If same group (implicitly verify the falseness of condition above)
            # And previous are extreme cells (bott or right paths) or previous 
            # is defining a path (on bott or right directions), create path
            elif ((prev_left and (not prev_left.is_connected_at[RIGHT]
                   or get_tile(i , j - 1) == '.')) or
                  (prev_up and (not prev_up.is_connected_at[DOWN]
                   or get_tile(i - 1, j) == '.'))):
                set_tile(i, j, '.')
            # Fill corners connecting diagonal path segments
            if( get_tile(i - 1, j) == '.' and
               (get_tile(i, j - 1) == '.' and 
                get_tile(i - 1, j - 1) == '_')):
                set_tile(i, j, '.')
    LOGGER.debug("Tile path filling completed.")

    # Before generating tunnels, clean all the open paths on the edges 
    # that are not tunnels to ensure clean borders.
    LOGGER.debug("Processing edge path erasure (before tunnels)...")
    x_erasing_edge = tiles_demirow_size - 1
    for y in range(tiles_col_size):
        if get_tile(y, x_erasing_edge) == '.':
            LOGGER.debug(f"Cleaning edge path at row {y}")
            erase_until_intersection(x_erasing_edge, y, get_tile, set_tile)

    # Detect and handle tunnels at the edges
    LOGGER.debug("Detecting tunnels at maze edges...")
    no_tunnel = True
    for i in range(cells.shape[0]):
        c = cells[i, cells.shape[1] - 1]
        if c.is_top_tunnel:
            set_tile(3*i + 1, tiles_demirow_size , '.')
            set_tile(3*i + 1, tiles_demirow_size - 1, '.')
            no_tunnel = False
            LOGGER.debug(f"Found top tunnel at row {i}")
        if c.is_left_tunnel:
            # Iterate from leftmost edge towards center
            # tiles_demirow_size + 1 maps to the extreme left edge (tiles[y, 0])
            # Iterate backwards from edge to center until we hit an existing path
            tunnel_y = 3*i + 1
            # Start from extreme left edge and work inward (decreasing x in aux coords)
            for current_x in range(tiles_demirow_size + 1, 1, -1):
                # Check if this position already has a path
                if get_asym_tile(tunnel_y, current_x, True) == '.':
                    # Already a path, stop here
                    break
                # Set this position as path and continue inward
                set_asym_tile(tunnel_y, current_x, '.', True)
            no_tunnel = False
            LOGGER.debug(f"Found left tunnel at row {i}, filled path from edge to existing path")
        if c.is_right_tunnel:
            # Iterate from rightmost edge towards center
            # tiles_demirow_size + 1 maps to the extreme right edge (tiles[y, tiles_row_size - 1])
            # Iterate backwards from edge to center until we hit an existing path
            tunnel_y = 3*i + 1
            # Start from extreme right edge and work inward (decreasing x in aux coords)
            for current_x in range(tiles_demirow_size + 1, 1, -1):
                # Check if this position already has a path
                if get_asym_tile(tunnel_y, current_x, False) == '.':
                    # Already a path, stop here
                    break
                # Set this position as path and continue inward
                set_asym_tile(tunnel_y, current_x, '.', False)
            no_tunnel = False
            LOGGER.debug(f"Found right tunnel at row {i}, filled path from edge to existing path")
    if no_tunnel:
        LOGGER.debug("No top tunnels found, filling with walls")

    # Fill wall tiles adjacent to any path tile
    i, j = 0, 0
    
    # Fill tiles adjacent to paths with wall markers ('|')
    LOGGER.debug("Filling wall tiles adjacent to paths...")
    for i in range(aux_col_size):
        for j in range(aux_row_size):
            # Fill walls for left side (asymmetric)
            if get_asym_tile(i, j, True) == '_':
                if (get_asym_tile(i - 1, j, True) == '.' or
                    get_asym_tile(i + 1, j, True) == '.' or
                    get_asym_tile(i, j - 1, True) == '.' or
                    get_asym_tile(i, j + 1, True) == '.' or
                    get_asym_tile(i - 1, j - 1, True) == '.' or
                    get_asym_tile(i - 1, j + 1, True) == '.' or
                    get_asym_tile(i + 1, j - 1, True) == '.' or
                    get_asym_tile(i + 1, j + 1, True) == '.'):
                    set_asym_tile(i, j, '|', True)
            # Fill walls for right side (asymmetric)
            if get_asym_tile(i, j, False) == '_':
                if (get_asym_tile(i - 1, j, False) == '.' or
                    get_asym_tile(i + 1, j, False) == '.' or
                    get_asym_tile(i, j - 1, False) == '.' or
                    get_asym_tile(i, j + 1, False) == '.' or
                    get_asym_tile(i - 1, j - 1, False) == '.' or
                    get_asym_tile(i - 1, j + 1, False) == '.' or
                    get_asym_tile(i + 1, j - 1, False) == '.' or
                    get_asym_tile(i + 1, j + 1, False) == '.'):
                    set_asym_tile(i, j, '|', False)
    LOGGER.debug("Wall filling completed.")

    # Apply manual tile modifications via callback
    LOGGER.debug("Applying manual tile modifications...")
    set_manual_tiles(set_tile)
    
    LOGGER.info(f"Tile generation completed successfully. Final grid size: {tiles.shape}")
    return tiles


