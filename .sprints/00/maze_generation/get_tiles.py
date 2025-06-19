from cell import Cell, create_cell_array
import numpy as np

# ? Control de Dislexia:
# ?     eje 0 = rows = i = y = vertical,
# ?     eje 1 = cols = j = x = horizontal.
# ?     
# ?     row size = number of elements in a row = number of cols = shape[1]
# ?     col size = number of elements in a col = number of rows = shape[0]

UP = 0
RIGHT = 1
DOWN = 2
LEFT = 3


def get_tiles(cells: np.ndarray[Cell]) -> np.ndarray[str]:

    # TODO - Explicar números mágicos
    tiles_demirow_size = cells.shape[1] * 3
    tiles_row_size = tiles_demirow_size * 2
    tiles_col_size = cells.shape[0] * 3

    aux_row_size = tiles_demirow_size + 2
    aux_col_size = tiles_col_size + 1

    #! RECUERDA - El tamaño de una fila define cuantas columnas tiene el array
    tiles = np.full((aux_col_size, tiles_row_size ), '_', dtype=str)
    aux_tiles = np.full((aux_col_size, aux_col_size), None, dtype=object)

    def set_tile(y, x, value):
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return
        x -= 2
        tiles[y, tiles_demirow_size + x] = value
        tiles[y, tiles_demirow_size-1 - x] = value

    def get_tile(y, x):
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return None
        x -= 2
        return tiles[y, tiles_demirow_size + x]

    def set_aux_tile(y, x, cell):
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return
        x -= 2
        aux_tiles[y, x] = cell

    def get_aux_tile(y, x):
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return None
        x -= 2
        return aux_tiles[y, x]

    # Se rellena el array auxiliar con referencias a las celdas
    # Esto es una fumada, involucra un offset de 2 y en general
    # mi entendimiento de esta parte del algoritmo original es muy limitado

    for i in range(cells.shape[0]):
        for j in range(cells.shape[1]):
            current_cell = cells[i, j]
            for x0 in range(3):
                for y0 in range(3):
                    set_aux_tile(3*i + y0 + 1, 3*j + x0, current_cell)

    # A partir de este array auxiliar se rellenan los tiles asociados a los
    # caminos detectando los cambios de grupo de celdas. Notese que se rellenan
    # las dos mitades simetricas de cada fila 
    i, j = 0, 0
    for i in range(tiles_col_size):
        for j in range(tiles_demirow_size):
            curr = get_aux_tile(i, j)
            prev_left = get_aux_tile(i, j - 1)
            prev_up = get_aux_tile(i - 1, j)

            # Cambios de grupo y camino superior 
            if curr:
                if (prev_left and (curr.group_seq != prev_left.group_seq) or
                    prev_up and (curr.group_seq != prev_up.group_seq) or
                        (not prev_up and not curr.is_connected_at[UP])):
                    set_tile(i, j, '.')
            # Caminos asociados al borde inferior y derecho-izquierdo 
            elif (((prev_left and not prev_left.is_connected_at[RIGHT])
                   or get_tile(i - 1, j)) or
                  ((prev_up and not prev_up.is_connected_at[DOWN])
                   or get_tile(i - 1, j))):
                set_tile(i, j, '.')

            if( get_tile(i - 1, j) == '.' and
               (get_tile(i, j - 1) == '.' and 
                get_tile(i - 1, j - 1) == '_')):
                set_tile(i, j, '.')

    # Se rellenan los tiles de las paredes siendo cualquier celda 
    # vacía colindante a un tile con un camino

    i, j = 0, 0
    
    for i in range(aux_col_size):
        for j in range(aux_row_size):
            if get_tile(i, j) == '_':
                if (get_tile(i - 1, j) == '.' or
                    get_tile(i + 1, j) == '.' or
                    get_tile(i, j - 1) == '.' or
                    get_tile(i, j + 1) == '.' or
                    get_tile(i - 1, j - 1) == '.' or
                    get_tile(i - 1, j + 1) == '.' or
                    get_tile(i + 1, j - 1) == '.' or
                    get_tile(i + 1, j + 1) == '.'):
                    set_tile(i, j, '|')
    
    return tiles


