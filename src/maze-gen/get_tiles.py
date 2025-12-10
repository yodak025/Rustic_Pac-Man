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
        """Sets a tile value for asymetric mazes."""
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return
        x -= 2
        if is_left:
            tiles[y, tiles_demirow_size -1 - x] = value
        else:
            tiles[y, tiles_demirow_size + x] = value

    def get_asym_tile(y, x, is_left: bool):
        """Retrieves a tile value for asymetric mazes."""
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
            set_asym_tile(3*i + 1, tiles_demirow_size+1 , '.', True)
            set_asym_tile(3*i + 1, tiles_demirow_size , '.', True)
            set_asym_tile(3*i + 1, tiles_demirow_size -1 , '.', True)
            set_asym_tile(3*i + 1, tiles_demirow_size -2 , '.', True)
            set_asym_tile(3*i + 1, tiles_demirow_size -3 , '.', True)
            no_tunnel = False
            LOGGER.debug(f"Found left tunnel at row {i}")
        if c.is_right_tunnel:
            set_asym_tile(3*i + 1, tiles_demirow_size+1 , '.', False)
            set_asym_tile(3*i + 1, tiles_demirow_size , '.', False)
            set_asym_tile(3*i + 1, tiles_demirow_size -1 , '.', False)
            no_tunnel = False
            LOGGER.debug(f"Found right tunnel at row {i}")
    if no_tunnel:
        LOGGER.debug("No top tunnels found, filling with walls")

    # Fill wall tiles adjacent to any path tile
    i, j = 0, 0
    # Before generating the wall tiles, we need to clean all the 
    # open paths on the edges that are not tunnels to ensure clean borders.
    LOGGER.debug("Processing tunnel pellet erasure...")
    x_erasing_edge = tiles_demirow_size - 1
    for y in range(tiles_col_size):
        if get_tile(y, x_erasing_edge) == '.':
            LOGGER.debug(f"Cleaning edge path at row {y}")
            erase_until_intersection(x_erasing_edge, y, get_tile, set_tile)
    
    # Fill tiles adjacent to paths with wall markers ('|')
    LOGGER.debug("Filling wall tiles adjacent to paths...")
    for i in range(aux_col_size):
        for j in range(aux_row_size):
            # if get_tile(i, j) == '_':
            #     if (get_tile(i - 1, j) == '.' or
            #         get_tile(i + 1, j) == '.' or
            #         get_tile(i, j - 1) == '.' or
            #         get_tile(i, j + 1) == '.' or
            #         get_tile(i - 1, j - 1) == '.' or
            #         get_tile(i - 1, j + 1) == '.' or
            #         get_tile(i + 1, j - 1) == '.' or 
            #         get_tile(i + 1, j + 1) == '.'):
            #         set_tile(i, j, '|')
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

    # Place power pellets evenly distributed in maze halves
    #! [SHIT CODE] Power pellet placement logic should be extracted to separate function for reusability
    num_power_pellets = 2  #! [HARD CODED] Total number of power pellets
    LOGGER.debug(f"Placing {num_power_pellets} power pellets in maze halves...")
    # Calculate vertical middle point for upper/lower distribution
    vertical_middle = aux_col_size // 2
    # Place half of the pellets in the upper half
    upper_pellets_placed = 0
    for i in range(num_power_pellets // 2):
        attempts = 0
        while attempts < 100:  # Limit attempts to prevent infinite loops
            # Random position within upper half
            random_y = random.randint(0, vertical_middle - 1)
            # [HARD CODED] Fixed x position: temporarily set to first/last column for better distribution
            random_x = aux_row_size - 3
            if get_tile(random_y, random_x) == '.':
                set_tile(random_y, random_x, 'o')
                upper_pellets_placed += 1
                LOGGER.debug(f"Placed power pellet in upper half at ({random_y}, {random_x})")
                break
            attempts += 1
    # Place remaining pellets in the lower half
    lower_pellets_placed = 0
    for i in range(num_power_pellets // 2):
        attempts = 0
        while attempts < 100:  # Limit attempts to prevent infinite loops
            # Random position within lower half
            random_y = random.randint(vertical_middle, aux_col_size - 1)
            # [HARD CODED] Fixed x position: temporarily set to first/last column for better distribution
            random_x = aux_row_size - 3 
            if get_tile(random_y, random_x) == '.':
                set_tile(random_y, random_x, 'o')
                lower_pellets_placed += 1
                LOGGER.debug(f"Placed power pellet in lower half at ({random_y}, {random_x})")
                break 
            attempts += 1
    LOGGER.debug(f"Power pellets placement completed: {upper_pellets_placed} upper, {lower_pellets_placed} lower")

    # Apply manual tile modifications via callback
    LOGGER.debug("Applying manual tile modifications...")
    set_manual_tiles(set_tile)
    
    LOGGER.info(f"Tile generation completed successfully. Final grid size: {tiles.shape}")
    return tiles


