import numpy as np
from .cell import Cell
from .directions import UP, RIGHT, DOWN, LEFT
from typing import Callable as Def
import random

# ? Control de Dislexia:
# ?     eje 0 = rows = i = y = vertical,
# ?     eje 1 = cols = j = x = horizontal.
# ?     
# ?     row size = number of elements in a row = number of cols = shape[1]
# ?     col size = number of elements in a col = number of rows = shape[0]

def get_tiles(cells: np.ndarray, set_manual_tiles: Def[[Def[[int, int, str], None]], None]) -> np.ndarray:

    # TODO - Explicar números mágicos
    tiles_demirow_size = cells.shape[1] * 3 + 1
    tiles_row_size = tiles_demirow_size * 2
    tiles_col_size = cells.shape[0] * 3 + 2

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

    def get_aux_tile(y, x) -> Cell | None:
        if x < 0 or x >= aux_row_size or y < 0 or y >= aux_col_size:
            return None
        x -= 2
        return aux_tiles[y, x] 
    # ! Este error se debe a que el compilador no entiende que 
    # ! esto es un Cell porque no se como tipar un np.ndarray de Cells. 
    # ! Funciona bien en tiempo de ejecución

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
            elif ((prev_left and (not prev_left.is_connected_at[RIGHT]
                   or get_tile(i , j - 1) == '.')) or
                  (prev_up and (not prev_up.is_connected_at[DOWN]
                   or get_tile(i - 1, j) == '.'))):
                set_tile(i, j, '.')

            if( get_tile(i - 1, j) == '.' and
               (get_tile(i, j - 1) == '.' and 
                get_tile(i - 1, j - 1) == '_')):
                set_tile(i, j, '.')


    no_tunnel = True
    for i in range(cells.shape[0]):
        c = cells[i, cells.shape[1] - 1]
        if c.is_top_tunnel:
            set_tile(3*i + 1, tiles_demirow_size , '.')
            set_tile(3*i + 1, tiles_demirow_size - 1, '.')
            no_tunnel = False
            print(f"Se ha encontrado un túnel superior en la fila {i}")
    if no_tunnel:
        print("No hay túneles superiores, se rellenan con paredes")

    # Se rellenan los tiles de las paredes siendo cualquier celda 
    # vacía colindante a un tile con un camino

    i, j = 0, 0
    
    # Erase pellets in the tunnels
    def erase_until_intersection(x, y, get_tile_func, set_tile_func):
        """Erase pellets in a tunnel path until reaching an intersection."""
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

    # Check for tunnels on the right edge
    x = tiles_demirow_size - 1
    for y in range(tiles_col_size):
        if get_tile(y, x) == '.':
            # Uncomment to enable tunnel pellet erasure
            erase_until_intersection(x, y, get_tile, set_tile)
            pass
    
    #-- Rellenar los tiles de las paredes
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

    #[SPAGHETTI] Should be a function in order to improve the generation of powerpellets
    # Place power pellets evenly in upper and lower halves
    num_power_pellets = 2  # Total number of power pellets
    
    # Define vertical middle point
    vertical_middle = aux_col_size // 2
    
    # Place half of the pellets in the upper part
    for i in range(num_power_pellets // 2):
        attempts = 0
        while attempts < 100:  # Limit attempts to avoid infinite loop
            # Random position within the upper half
            random_y = random.randint(0, vertical_middle - 1)
            random_x = random.randint(0, tiles_row_size - 1)
            
            if get_tile(random_y, random_x) == '.':
                set_tile(random_y, random_x, 'o')
                break
                
            attempts += 1
    
    # Place the other half in the lower part
    for i in range(num_power_pellets // 2):
        attempts = 0
        while attempts < 100:  # Limit attempts to avoid infinite loop
            # Random position within the lower half
            random_y = random.randint(vertical_middle, aux_col_size - 1)
            random_x = random.randint(0, tiles_row_size - 1)
            
            if get_tile(random_y, random_x) == '.':
                set_tile(random_y, random_x, 'o')
                break
                
            attempts += 1


    
    

    #-- Modificaciones manuales
    set_manual_tiles(set_tile)
    
    return tiles


