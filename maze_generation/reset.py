
# ! KISS
# ? Recuerda:
# ?     eje 0 = rows = i = y,
# ?     eje 1 = cols = j = x.
# ? ...
# ? Que Dios nos ayude.

# TODO - A partir de aquí estaría bien hacer un poco de control de errores

from typing import Callable as Def
import numpy as np
from cell import Cell

# TODO - Generalizar estas constantes de alguna manera
UP = 0
RIGHT = 1
DOWN = 2
LEFT = 3


def link_cells(cells: np.ndarray) -> None:
    rows, cols = cells.shape
    for i in range(rows):
        for j in range(cols):
            cell = cells[i, j]
            if i > 0:
                cell.next.up = cells[i - 1, j]
            if i < rows - 1:
                cell.next.down = cells[i + 1, j]
            if j > 0:
                cell.next.left = cells[i, j - 1]
            if j < cols - 1:
                cell.next.right = cells[i, j + 1]


def reset(cells: np.ndarray, manual_connections: Def[[np.ndarray], None] = None) -> None:
    link_cells(cells)
    if manual_connections:
        manual_connections(cells)


