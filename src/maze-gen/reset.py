from typing import Callable as Def
import numpy as np
from directions import UP, RIGHT, DOWN, LEFT
import logging

LOGGER = logging.getLogger("maze-cell-reset")

def _link_cells(cells: np.ndarray) -> None:
    """Creates the next references between neighboring cells in the maze."""
    rows, cols = cells.shape
    for i in range(rows):
        for j in range(cols):
            cell = cells[i, j]
            if i > 0:
                cell.next[UP] = cells[i - 1, j]
            if i < rows - 1:
                cell.next[DOWN] = cells[i + 1, j]
            if j > 0:
                cell.next[LEFT] = cells[i, j - 1]
            if j < cols - 1:
                cell.next[RIGHT] = cells[i, j + 1]

def reset(cells: np.ndarray, manual_connections: Def[[np.ndarray],None] | None = None) -> None:
    """
    Resets the maze cells to their initial state for regeneration. 
    It creates the neighbour references on the cells.
    Accepts an optional callback to create manual connections.
    """
    LOGGER.info("Resetting maze cells...")
    LOGGER.debug("Linking cells...")
    _link_cells(cells)
    if manual_connections:
        LOGGER.debug("Callback for manual connections provided.")
        LOGGER.debug("Applying manual connections...")
        manual_connections(cells)


