# ----------------------------------------------------------------------
# NOTE: Matrix indexing reference for clarity:                         |
#   Axis 0 = rows = i = y = vertical                                   |
#   Axis 1 = cols = j = x = horizontal                                 |
#   row size = number of elements in a row = number of cols = shape[1] |
#   col size = number of elements in a col = number of rows = shape[0] |
# ----------------------------------------------------------------------

import logging
import numpy as np
import random as rd
from cell import Cell
from directions import UP, RIGHT, DOWN, LEFT


LOGGER = logging.getLogger("cell-connections-generator")


class CellConnectionsGenerator:
    """
    Generates a maze first model using a figure-based algorithm.
    It operates at the cell level, creating a graph that represents a half-maze structure.
    It's relations are later used to define the paths in the final maze.
    """
    def __init__(self, cells: np.ndarray, max_figure_size: int, seed: int | None = None) -> None:
        """Initializes the maze generator with the given cell array and configuration parameters."""
        LOGGER.debug("Initializing CellConnectionsGenerator")
        # Config parameters
        self.MAX_FIGURE_SIZE: int = 5
        self.MAX_RECENTER_SIZE: int = 2 
        self.MAX_CENTRAL_FIGURE_SIZE: int = 3
        self.MAX_LONG_FIGURES: int = 1
        self.SINGLE_CELL_JOIN_PROB: float = 0.35
        self.GROW_PROB_AT_SIZE: dict = {
            1: 1,
            2: 1,
            3: 0.9,
            4: 0.5,
            5: 0
        }
        self.EXTEND_PROB_AT_SIZE: dict = {
            2: 1,
            3: 0.5,
            4: 0.5
        }
        #! Coupled with l_generator logic, do not change lightly
        self.L_SHAPE_TRIGERRING_SIZE: int = 2 
        self.cells: np.ndarray = cells
        self.center_cell: Cell
        self.first_cell: Cell
        self.newest_cell: Cell
        self.open_cells: list = []
        self.dir: int
        self.filled_cells_count: int = 0
        self.groups_count: int = 0
        self.figure_size: int = 0
        self.single_count: dict = {
            0: 0,
            self.cells.shape[0] - 1: 0
        }
        self.long_figures: int = 0
        if seed:
            rd.seed(seed)
        self.last_direction = -1

    def _get_left_empty_cells(self) -> list:
        """Iterate through the cell array cols and returns a list of unfilled cells if exist."""
        LOGGER.debug("Getting left empty cells...")
        left_cells = []
        for j in range(self.cells.shape[1]):
            for i in range(self.cells.shape[0]):
                if not self.cells[i, j].is_filled:
                    left_cells.append(self.cells[i, j])
            if left_cells:
                LOGGER.debug(f"Found {len(left_cells)} left empty cells at column {j}")
                break
        return left_cells

    @staticmethod
    def _is_open_cell(cell: Cell, i: int, prev_dir: int, size: int) -> bool:
        """Determines if a cell can be connected in a given direction."""
        x, y = cell.x, cell.y
        #? [CLEARING]: This is here to avoid creating connections in chomp starting position.
        if y == 6 and x == 0 and i == DOWN or y == 7 and x == 0 and i == UP:
            LOGGER.debug("Avoiding connection in chomp starting position")
            return False
        #? [CLEARING]: Maybe we do not need this. 
        #? Probably is here because of the restrictive nature of the original algorithm.
        if size == 2 and (i == prev_dir or i == (prev_dir + 2) % 4):
            LOGGER.debug("Avoiding straight connections at size 2")
            return False
        """
        Just in case you don't get it:
        If the next cell in direction i exists AND is not filled then
        If the cell located to the left of that next cell also exists and is filled, return True.
        """
        if cell.next[i] and not cell.next[i].is_filled:
            left_at_next = cell.next[i].next[LEFT]
            if (left_at_next and left_at_next.is_filled) or not left_at_next:
                LOGGER.debug(f"Cell at ({cell.x}, {cell.y}) can be opened to direction {i}")
                return True
        LOGGER.debug(f"Cell at ({cell.x}, {cell.y}) cannot be opened to direction {i}")
        return False

    def _get_open_cells_directions(self, cell: Cell, prev_dir: int, size: int) -> list:
        """Returns a list of directions where the cell can be connected."""
        open_cells_directions = []
        for i in range(4):
            if self._is_open_cell(cell, i, prev_dir, size):
                open_cells_directions.append(i)
        LOGGER.debug(f"Open directions for cell at ({cell.x}, {cell.y}): {open_cells_directions}")
        return open_cells_directions

    def _connect_cell(self, cell: Cell, dir: int) -> None:
        """Sets the connection between two cells in the given direction."""
        LOGGER.debug(f"Connecting cell at ({cell.x}, {cell.y}) to direction {dir}")
        cell.is_connected_at[dir] = True
        cell.next[dir].is_connected_at[(dir + 2) % 4] = True
        if cell.x == 0 and dir == RIGHT:
            LOGGER.debug("Central figure right connection detected. Connecting to left side as well.")
            cell.is_connected_at[LEFT] = True

    def _fill_cell(self, cell: Cell) -> None:
        LOGGER.debug(f"Filling cell at ({cell.x}, {cell.y})")
        self.filled_cells_count += 1
        cell.is_filled = True
        cell.seq = self.filled_cells_count
        cell.group_seq = self.groups_count

    def _l_generator(self) -> bool:
        """
        Randomly generates an L-shaped figure if possible.
        This method is needed to create these figures since 
        the main algorithm do not generate them by itself.
        """
        LOGGER.debug("Attempting to generate L-shaped figure...")
        if (self.first_cell.x > 0
            # if the first cell has other connected to the right
            and self.first_cell.is_connected_at[RIGHT]
            # that is connected to the right too
            and self.first_cell.next[RIGHT]
            # and the third cell in that "to the right" direction exists
            and self.first_cell.next[RIGHT].next[RIGHT]
            # when we do not exceed the amount of long figures
            and self.long_figures <= self.MAX_LONG_FIGURES  
            # we roll the dices...
            and rd.random() <= self.EXTEND_PROB_AT_SIZE[self.L_SHAPE_TRIGERRING_SIZE]): 
            
            # And ocasionally we reach this code that generates L-shape figures.
            LOGGER.debug("Searching a valid direction to grow for the L-shaped figure...")
            l_corner_cell = self.first_cell.next[RIGHT].next[RIGHT]
            is_open_direction_at: dict = {}
            direction: int | None = None
            # Manage the possible directions (UP/DOWN) where to extend the L shape
            is_open_direction_at[UP] = self._is_open_cell(
                l_corner_cell, UP, self.last_direction, self.figure_size)
            is_open_direction_at[DOWN] = self._is_open_cell(
                l_corner_cell, DOWN, self.last_direction, self.figure_size)
            if is_open_direction_at[UP] and is_open_direction_at[DOWN]:
                direction = [UP, DOWN][rd.randint(0, 1)]
            elif is_open_direction_at[UP]:
                direction = UP
            elif is_open_direction_at[DOWN]:
                direction = DOWN

            if direction:
                LOGGER.debug(f"L-shaped figure will be generated towards {direction}")
                self._connect_cell(l_corner_cell, LEFT)
                self._fill_cell(l_corner_cell)
                self._connect_cell(l_corner_cell, direction)
                self._fill_cell(l_corner_cell.next[direction])
                self.long_figures += 1
                self.figure_size += 2
                self.last_direction = direction
                LOGGER.debug(
                    f"L-shaped figure generated for group {self.groups_count}: \n"
                    f"start_seq={self.first_cell.seq}, \n"
                    f"right_seq={self.first_cell.next[RIGHT].seq}, \n"
                    f"right_right_seq={self.first_cell.next[RIGHT].next[RIGHT].seq}, \n"
                    f"corner_seq={l_corner_cell.seq}."
                )
                return True
        LOGGER.debug("The L-shape figure was not generated.")
        return False

    def _grow_figure(self) -> bool:
        """Attempts to grow the current figure by one cell in a random valid direction."""
        LOGGER.debug(f"Checking possible growth directions for the figure for group {self.center_cell.group_seq}...")
        open_directions: list = self._get_open_cells_directions(
            cell=self.center_cell, 
            prev_dir=self.last_direction, 
            size=self.figure_size)
        #Try to redefine the center of the figure if no directions are available
        if (len(open_directions) == 0
                and self.figure_size == self.MAX_RECENTER_SIZE):
            self.center_cell = self.newest_cell
            open_directions = self._get_open_cells_directions(
                cell=self.center_cell, 
                prev_dir=self.last_direction, 
                size=self.figure_size)

        # In case there are still no available directions, we stop growing
        if len(open_directions) == 0:
            LOGGER.debug(f"No available directions to grow the figure.")
            return True
        else:
            LOGGER.debug(f"Electing a random direction to grow the figure.")
            direction = open_directions[rd.randint(0, len(open_directions) - 1)]
            self.last_direction = direction
            self.newest_cell = self.center_cell.next[direction]
            self._connect_cell(self.center_cell, direction)
            self._fill_cell(self.newest_cell)
            self.figure_size += 1
            if ((self.first_cell.x == 0
                and self.figure_size == self.MAX_CENTRAL_FIGURE_SIZE)
                    or self.GROW_PROB_AT_SIZE[self.figure_size] <= rd.random()):
                LOGGER.debug(f"Growing the figure at direction {direction}.")
                return True
            LOGGER.debug(f"Stopping growth of the figure at size {self.figure_size}.")
            return False
        
    def _close_figure(self) -> None:
        """ Some figures need special handling when being closed. This method manages those cases."""
        # Attach the 2-size figures to the maze boundaries if the first cell is located at the far right
        #~ I'm afraid that this condition is never met because we treat this condition in the main generation method.
        if (self.figure_size == 2 and self.first_cell.x == self.cells.shape[1] - 1 ):
            LOGGER.debug("Closing 2-size figure at maze boundaries.")
            top_joining_cell = self.first_cell
            if self.first_cell.is_connected_at[UP]:
                # if the first cell is the bottom one, we need to point to its upper neighbor
                top_joining_cell = self.first_cell.next[UP]
            top_joining_cell.is_connected_at[RIGHT] = True
            top_joining_cell.next[DOWN].is_connected_at[RIGHT] = True
        # Extend figures of size 3 or 4 with a long leg if possible and chances allow it
        elif (self.figure_size == (3 or 4)
              and self.long_figures < self.MAX_LONG_FIGURES
              and self.first_cell.x > 0
              and rd.random() <= self.EXTEND_PROB_AT_SIZE[self.figure_size]):
            LOGGER.debug("Looking for directions to extend a figure with a long leg...")
            directions: list = []
            for dir in range(4):
                if (self.center_cell.is_connected_at[dir]
                        and self._is_open_cell(self.first_cell, dir, self.last_direction, self.figure_size)):
                    directions.append(dir)
            if (len(directions) > 0):
                LOGGER.debug(f"Extending figure with a long leg...")
                direction: int = rd.choice(directions)
                long_leg_cell: Cell = self.center_cell.next[direction]
                self._connect_cell(long_leg_cell, direction)
                self._fill_cell(long_leg_cell.next[direction])
                self.long_figures += 1
                LOGGER.debug(f"Figure extended with a long leg towards direction {direction}.")
            else:
                LOGGER.debug("No valid directions found to extend the figure with a long leg.")


    def _generate_figure(self) -> None:
        """
        Generates a figure by connecting cells. 
        It defines the cell groups and operates in a intra group level.
        The method manages how to grow the figure until it reaches its maximum size or cannot grow anymore.
        """
        LOGGER.debug(f"Generating figure for group {self.groups_count}...")
        while self.figure_size <= self.MAX_FIGURE_SIZE:
            stop_growing: bool = False
            if self.figure_size == self.L_SHAPE_TRIGERRING_SIZE:
                stop_growing = self._l_generator()
            if not stop_growing:
                stop_growing = self._grow_figure()
            if stop_growing:
                LOGGER.debug(f"Closing figure for group {self.groups_count} at size {self.figure_size}.")
                self._close_figure()
                break 

    def generate(self) -> None:
        """
        Main method to generate the cell connections for the maze. 
        It loops until all cells are filled.
        Finds left unfilled cells. Sellects one at random as the starting point.
        From there, it generates figures as cell groups connecting those cells to unconnected neighbors.
        """
        LOGGER.info("Starting cell connections generation using figure-based algorithm...")
        while True:
            self.groups_count += 1
            left_cells: list = self._get_left_empty_cells()
            if len(left_cells) == 0:
                LOGGER.info("All cells filled. Maze generation complete.")
                break
            self.center_cell = self.first_cell = rd.choice(left_cells)
            self._fill_cell(self.center_cell)

            # Randomly attach single cells at the maze top/bottom border to increase difficulty
            if (self.center_cell.x < self.cells.shape[1] - 1
                and (self.center_cell.y in self.single_count)
                    and rd.random() <= self.SINGLE_CELL_JOIN_PROB):
                if self.single_count[self.center_cell.y] == 0:
                    self.center_cell.is_connected_at[
                        UP if self.center_cell.y == 0 else DOWN] = True
            self.figure_size = 1
            self.last_direction = -1

            #! The right corner cells of the maze do not enter in figures generation.
            #! They are attached to the maze boundaries. This is crucial for 
            #! later tunnel generation.
            if self.center_cell.x == self.cells.shape[1] - 1:
                self.center_cell.is_connected_at[RIGHT] = True
            else:
                self._generate_figure()

