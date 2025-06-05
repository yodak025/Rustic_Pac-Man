
# ! KISS
# ? Recuerda:
# ?     eje 0 = rows = i = y,
# ?     eje 1 = cols = j = x.
# ? ...
# ? Que Dios nos pille confesados.

# TODO - A partir de aquí estaría bien hacer un poco de control de errores
# TODO - Arreglar la siguiente chapuza:
import sys
from pathlib import Path
project_root = Path(__file__).resolve(
).parent  # Ajustar según el archivo
sys.path.insert(0, str(project_root))

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
                cell.next[UP] = cells[i - 1, j]
            if i < rows - 1:
                cell.next[DOWN] = cells[i + 1, j]
            if j > 0:
                cell.next[LEFT] = cells[i, j - 1]
            if j < cols - 1:
                cell.next[RIGHT] = cells[i, j + 1]


def reset(cells: np.ndarray, manual_connections: Def[[np.ndarray], None] = None) -> None:
    link_cells(cells)
    if manual_connections:
        manual_connections(cells)


