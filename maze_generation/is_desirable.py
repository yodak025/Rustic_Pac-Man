import numpy as np
from .directions import UP, RIGHT, DOWN, LEFT
from .cell import Cell


def is_desirable(cells: np.ndarray) -> bool:
    row_count = cells.shape[0]
    col_count = cells.shape[1]
    # -- Asegurar esquinas --#
    c: Cell = cells[0, 4]
    if c.is_connected_at[UP] or c.is_connected_at[RIGHT]:
        return False

    c = cells[row_count - 1, 4]
    if c.is_connected_at[DOWN] or c.is_connected_at[RIGHT]:
        return False

    # -- Funciones para localizar piezas de 2 celdas --#
    def is_hori(x, y):
        q1 = cells[y, x].is_connected_at
        q2 = cells[y, x + 1].is_connected_at
        return (not q1[UP] and not q1[DOWN] and 
                    (x == 0 or not q1[LEFT]) and q1[RIGHT] and 
                not q2[UP] and not q2[DOWN] and 
                    q2[LEFT] and not q2[RIGHT])

    def is_vert(x, y):
        q1 = cells[y, x].is_connected_at
        q2 = cells[y + 1, x].is_connected_at
        if x == col_count - 1:
            return (not q1[LEFT] and not q1[UP] and not q1[DOWN] and
                    not q2[LEFT] and not q2[UP] and not q2[DOWN])
        return (not q1[LEFT] and not q1[RIGHT] and not q1[UP] and q1[DOWN] and
                not q2[LEFT] and not q2[RIGHT] and q2[UP] and not q2[DOWN])
    
    x: int; y: int 
    g: int
    for y in range(row_count - 1 ):
        for x in range(col_count - 1):
            if ((is_hori(x, y) and is_hori(x, y + 1)) or 
                (is_vert(x, y) and is_vert(x + 1, y))):
                return False
                # ? Si se tiene una pareja de figuras de 2 celdas
                if x == 0:
                    # ? Descartamos las que se encuenten en el centro 
                    return False
                # ? Juntamos el resto de parejas en un solo grupo
                cells[y, x].is_connected_at[DOWN] = True
                cells[y, x].is_connected_at[UP] = True
                g = cells[y, x].group_seq

                cells[y, x + 1].is_connected_at[DOWN] = True
                cells[y, x + 1].is_connected_at[LEFT] = True
                cells[y, x + 1].group_seq = g

                cells[y + 1, x].is_connected_at[UP] = True
                cells[y + 1, x].is_connected_at[RIGHT] = True
                cells[y + 1, x].group_seq = g

                cells[y + 1, x + 1].is_connected_at[UP] = True
                cells[y + 1, x + 1].is_connected_at[LEFT] = True
                cells[y + 1, x + 1].group_seq = g

    return True

