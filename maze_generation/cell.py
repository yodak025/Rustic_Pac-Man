
#! KISS
# TODO - Control de errores

import numpy as np


class Direction:
    def __init__(self, up, right, down, left) -> None:
        self.up = up
        self.right = right
        self.down = down
        self.left = left


class Cell:
    def __init__(self, connections: Direction, nexts: Direction) -> None:
        self.is_filled: bool = False
        self.id: int = 0
        self.group_id: int = 0

        self.is_connected = connections
        self.next = nexts
    
    def __eq__(self, other):
        if isinstance(other, Cell):
            return self.__dict__ == other.__dict__
        return False


def create_cell_array(rows: int, cols: int) -> list:
    initial_conections = Direction(False, False, False, False)
    initial_nexts = Direction(None, None, None, None)

    return np.array([[
        Cell(initial_conections, initial_nexts)
        for _ in range(cols)] for _ in range(rows)], dtype=object
    )
