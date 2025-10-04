import numpy as np
from cell import create_cell_array
from reset import reset
from get_tiles import get_tiles
from gen import CellConnectionsGenerator


def parse_tiles(tiles: np.ndarray[str]) -> str:
    return '\n'.join([''.join(row) for row in tiles])

if __name__ == "__main__":
    # Example usage
    rows, cols = 8, 5
    cells = create_cell_array(rows, cols)
    reset(cells)
    generator = CellConnectionsGenerator(cells, 10)
    generator.generate()
    tiles = get_tiles(cells)
    print(parse_tiles(tiles))
