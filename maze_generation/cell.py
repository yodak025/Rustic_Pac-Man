
#! KISS
# TODO - Control de errores

import numpy as np
from typing import Dict
from .directions import UP, RIGHT, DOWN, LEFT


class Cell:
    def __init__(self, connections: dict, nexts: dict, id, i, j) -> None:
        self.is_filled: bool = False
        self.id: int = id  # Identificador único
        self.x: int = j  # Coordenada x
        self.y: int = i  # Coordenada y
        self.seq: int = 0  # Orden de creación en generación
        self.group_seq: int = 0  # Orden de creación referente al grupo

        self.is_connected_at: Dict[int, bool] = connections
        self.next = nexts
        
        #!- Actualmente en desuso
        self.is_raise_height_candidate = False
        self.is_shrink_width_candidate = False

        #-- propiedades asociadas a la fase de generación de túneles
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
