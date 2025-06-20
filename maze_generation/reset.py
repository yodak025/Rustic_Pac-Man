
# ! KISS
# ? Recuerda:
# ?     eje 0 = rows = i = y,
# ?     eje 1 = cols = j = x.
# ? ...
# ? Que Dios nos pille confesados.


from typing import Callable as Def
import numpy as np
from .cell import Cell
from .directions import UP, RIGHT, DOWN, LEFT

# TODO - Control de errores

def link_cells(cells: np.ndarray) -> None:
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
    link_cells(cells)
    if manual_connections:
        manual_connections(cells)


