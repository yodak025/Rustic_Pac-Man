from cell import create_cell_array, Cell
from reset import reset
from gen import CellConnectionsGenerator
from get_tiles import get_tiles
import numpy as np



class MazeState:
    def __init__(self):
        self.cells = None

    def create_new_maze(self, rows, cols, max_figure_size):
        """Crea un nuevo laberinto con el número de filas y columnas especificado"""
        self.cells = create_cell_array(rows, cols)
        reset(self.cells)
        generator = CellConnectionsGenerator(self.cells, max_figure_size)
        generator.generate()

    def get_tiles_as_json(self):
        """Convierte las celdas a un formato JSON serializable"""
        tiles = get_tiles(self.cells)
        numeric_tiles = np.where(tiles == '.', 0,
                        np.where(tiles == '|', 1,
                        np.where(tiles == '_', -1,
                        -1))).astype(int)
        return numeric_tiles.tolist()

maze_state = MazeState()
