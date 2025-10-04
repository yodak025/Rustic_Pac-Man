#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from directions import UP, RIGHT, DOWN, LEFT
from cell import create_cell_array
from reset import reset
from gen import CellConnectionsGenerator
from get_tiles import get_tiles
from is_desirable import is_desirable
from tunnels import TunnelsGenerator
import numpy as np


def _ghost_home_cells(cells, cols):
    """Configura las celdas de la casa de los fantasmas"""
    i = 3 * cols 
    x = i % cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[LEFT] = c.is_connected_at[RIGHT] = c.is_connected_at[DOWN] = True

    i += 1
    x = i % cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[LEFT] = c.is_connected_at[DOWN] = True

    i += cols - 1
    x = i % cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[RIGHT] = c.is_connected_at[UP] = c.is_connected_at[LEFT] = True

    i += 1
    x = i % cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[LEFT] = c.is_connected_at[UP] = True


def _set_ghost_home_door_tiles(set_tiles):
    """Configura los tiles de la puerta de la casa de los fantasmas"""
    set_tiles(11, 2, "h")
    set_tiles(12, 2, "h")
    set_tiles(13, 2, "h")
    set_tiles(14, 2, "h")
    set_tiles(12, 3, "h")
    set_tiles(13, 3, "h")
    set_tiles(14, 3, "h")
    set_tiles(12, 4, "h")
    set_tiles(13, 4, "h")
    set_tiles(14, 4, "h")


def create_maze(rows=9, cols=5, max_figure_size=5):
    """Genera un laberinto completo y retorna el array de tiles"""
    while True:
        print("Generando laberinto...")
        
        # Generar estructura de cells
        cells = create_cell_array(rows, cols)
        reset(cells, lambda c: _ghost_home_cells(c, cols))
        cell_connections = CellConnectionsGenerator(cells, max_figure_size)
        cell_connections.generate()
        
        # Validar si el laberinto es deseable
        if not is_desirable(cells):
            print("Laberinto no deseable, regenerando...")
            continue
        
        # Generar túneles
        tunnels = TunnelsGenerator(cells)
        tunnels.generate()
        
        if not tunnels.is_valid_cell_map:
            print("Mapa de celdas no válido, regenerando...")
            continue
        
        print("Laberinto generado correctamente")
        
        # Convertir cells a tiles
        tiles = get_tiles(cells, _set_ghost_home_door_tiles)
        tiles_array = np.where(tiles == '.', 0, 
                      np.where(tiles == '|', 1, 
                      np.where(tiles == 'o', 2,
                      np.where(tiles == '_', -2, 
                      np.where(tiles == 'h', -3,
                      np.where(tiles == 'd', -4,
                      np.where(tiles == '-', 3, -1))))))).astype(int)
        
        return tiles_array


if __name__ == '__main__':
    print(create_maze())
