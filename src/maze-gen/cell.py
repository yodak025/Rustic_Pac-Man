import numpy as np
from typing import Dict
from directions import UP, RIGHT, DOWN, LEFT


class Cell :
    """
    Class representing a cell in the maze. Contains properties for maze generation and pathfinding.
    """
    def __init__(self, connections: dict, nexts: dict, id, i, j) -> None:
        """
        Initialize a Cell instance.
        Args:
            connections (dict): A dictionary indicating connections in each direction.
            nexts (dict): A dictionary of references to adjacent cells.
            id (int): Unique identifier for the cell.
            i (int): Row index of the cell.
            j (int): Column index of the cell.
        Note:
            All dictionaries use keys: UP, RIGHT, DOWN, LEFT.
        """

        self.is_filled: bool = False
        # Unique identifier
        self.id: int = id  
        self.x: int = j 
        self.y: int = i  
        # Generation sequence number for the single cell
        self.seq: int = 0  
        # Generation sequence number for the cell group
        self.group_seq: int = 0  
        self.is_connected_at: Dict[int, bool] = connections
        self.next: Dict[int, Cell] = nexts

        # Tunnel and Dead-End gen atributes
        self.is_edge_tunnel_candidate = False
        self.is_void_tunnel_candidate = False
        self.is_single_dead_end_candidate = False
        self.single_dead_end_direction: int | None = None
        self.is_double_dead_end_candidate = False
        self.is_top_tunnel = False
        self.is_bottom_tunnel = False

    def __eq__(self, other):
        if isinstance(other, Cell):
            return (self.is_filled == other.is_filled and
                    self.seq == other.seq and
                    self.id == other.id and
                    self.x == other.x and
                    self.y == other.y and
                    self.group_seq == other.group_seq and
                    self.is_connected_at == other.is_connected_at)
        return False


def create_cell_array(rows: int, cols: int) -> np.ndarray:
    """
    Cell array factory function. 
    It creates a 2D numpy array of Cell instances from given dimensions.
    """
    empty_connections: Dict[int, bool] = {
        UP: False,
        RIGHT: False,
        DOWN: False,
        LEFT: False
    }
    empty_nexts: Dict[int, Cell | None] = {
        UP: None,
        RIGHT: None,
        DOWN: None,
        LEFT: None
    }
    return np.array([[
        Cell(empty_connections.copy(), empty_nexts.copy(), j + i * cols, i, j)
        for j in range(cols)] for i in range(rows)], dtype=object
    )
