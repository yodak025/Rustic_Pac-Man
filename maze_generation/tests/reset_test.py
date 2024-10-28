from maze_generation.reset import link_cells, reset
from maze_generation.cell import create_cell_array
import numpy as np
import unittest
import sys
from pathlib import Path

project_root = Path(__file__).resolve(
).parent.parent.parent  # Ajustar según el archivo
sys.path.insert(0, str(project_root))
 
# Lo primero, pido perdón a cualquier ser humano que tenga que leer esto.


class TestCase(unittest.TestCase):
    def test_link_cells(self):
        cells = create_cell_array(3, 3)
        link_cells(cells)

        self.assertEqual(cells[0, 0].next.up, None)
        self.assertEqual(cells[0, 0].next.right, cells[0, 1])
        self.assertEqual(cells[0, 0].next.down, cells[1, 0])
        self.assertEqual(cells[0, 0].next.left, None)

        self.assertEqual(cells[0, 1].next.up, None)
        self.assertEqual(cells[0, 1].next.right, cells[0, 2])
        self.assertEqual(cells[0, 1].next.down, cells[1, 1])
        self.assertEqual(cells[0, 1].next.left, cells[0, 0])

        self.assertEqual(cells[0, 2].next.up, None)
        self.assertEqual(cells[0, 2].next.right, None)
        self.assertEqual(cells[0, 2].next.down, cells[1, 2])
        self.assertEqual(cells[0, 2].next.left, cells[0, 1])

        self.assertEqual(cells[1, 0].next.up, cells[0, 0])
        self.assertEqual(cells[1, 0].next.right, cells[1, 1])
        self.assertEqual(cells[1, 0].next.down, cells[2, 0])
        self.assertEqual(cells[1, 0].next.left, None)

        self.assertEqual(cells[1, 1].next.up, cells[0, 1])
        self.assertEqual(cells[1, 1].next.right, cells[1, 2])
        self.assertEqual(cells[1, 1].next.down, cells[2, 1])
        self.assertEqual(cells[1, 1].next.left, cells[1, 0])

        self.assertEqual(cells[1, 2].next.up, cells[0, 2])
        self.assertEqual(cells[1, 2].next.right, None)
        self.assertEqual(cells[1, 2].next.down, cells[2, 2])
        self.assertEqual(cells[1, 2].next.left, cells[1, 1])

        self.assertEqual(cells[2, 0].next.up, cells[1, 0])
        self.assertEqual(cells[2, 0].next.right, cells[2, 1])
        self.assertEqual(cells[2, 0].next.down, None)
        self.assertEqual(cells[2, 0].next.left, None)

        self.assertEqual(cells[2, 1].next.up, cells[1, 1])
        self.assertEqual(cells[2, 1].next.right, cells[2, 2])
        self.assertEqual(cells[2, 1].next.down, None)
        self.assertEqual(cells[2, 1].next.left, cells[2, 0])

        self.assertEqual(cells[2, 2].next.up, cells[1, 2])
        self.assertEqual(cells[2, 2].next.right, None)
        self.assertEqual(cells[2, 2].next.down, None)
        self.assertEqual(cells[2, 2].next.left, cells[2, 1])

    def test_reset(self):
        control_cells = create_cell_array(2, 1)
        vanilla_cells = create_cell_array(2, 1)
        manual_cells = create_cell_array(2, 1)

        def manual_connections(cells: np.ndarray) -> None:
            cells[0, 0].is_connected.right = True
            cells[1, 0].is_connected.left = True

        reset(control_cells)
        reset(vanilla_cells)
        reset(manual_cells, manual_connections)

        self.assertTrue(control_cells==vanilla_cells)
