import numpy as np
import unittest
import sys
from pathlib import Path

project_root = Path(__file__).resolve(
).parent.parent.parent  # Ajustar según el archivo
sys.path.insert(0, str(project_root))

from maze_generation.reset import link_cells, reset
from maze_generation.cell import create_cell_array, UP, RIGHT, DOWN, LEFT

# Lo primero, pido perdón a cualquier ser humano que tenga que leer esto.


class TestCase(unittest.TestCase):
    def test_link_cells(self):
        cells = create_cell_array(3, 3)
        link_cells(cells)

        self.assertEqual(cells[0, 0].next[UP], None)
        self.assertEqual(cells[0, 0].next[RIGHT], cells[0, 1])
        self.assertEqual(cells[0, 0].next[DOWN], cells[1, 0])
        self.assertEqual(cells[0, 0].next[LEFT], None)

        self.assertEqual(cells[0, 1].next[UP], None)
        self.assertEqual(cells[0, 1].next[RIGHT], cells[0, 2])
        self.assertEqual(cells[0, 1].next[DOWN], cells[1, 1])
        self.assertEqual(cells[0, 1].next[LEFT], cells[0, 0])

        self.assertEqual(cells[0, 2].next[UP], None)
        self.assertEqual(cells[0, 2].next[RIGHT], None)
        self.assertEqual(cells[0, 2].next[DOWN], cells[1, 2])
        self.assertEqual(cells[0, 2].next[LEFT], cells[0, 1])

        self.assertEqual(cells[1, 0].next[UP], cells[0, 0])
        self.assertEqual(cells[1, 0].next[RIGHT], cells[1, 1])
        self.assertEqual(cells[1, 0].next[DOWN], cells[2, 0])
        self.assertEqual(cells[1, 0].next[LEFT], None)

        self.assertEqual(cells[1, 1].next[UP], cells[0, 1])
        self.assertEqual(cells[1, 1].next[RIGHT], cells[1, 2])
        self.assertEqual(cells[1, 1].next[DOWN], cells[2, 1])
        self.assertEqual(cells[1, 1].next[LEFT], cells[1, 0])

        self.assertEqual(cells[1, 2].next[UP], cells[0, 2])
        self.assertEqual(cells[1, 2].next[RIGHT], None)
        self.assertEqual(cells[1, 2].next[DOWN], cells[2, 2])
        self.assertEqual(cells[1, 2].next[LEFT], cells[1, 1])

        self.assertEqual(cells[2, 0].next[UP], cells[1, 0])
        self.assertEqual(cells[2, 0].next[RIGHT], cells[2, 1])
        self.assertEqual(cells[2, 0].next[DOWN], None)
        self.assertEqual(cells[2, 0].next[LEFT], None)

        self.assertEqual(cells[2, 1].next[UP], cells[1, 1])
        self.assertEqual(cells[2, 1].next[RIGHT], cells[2, 2])
        self.assertEqual(cells[2, 1].next[DOWN], None)
        self.assertEqual(cells[2, 1].next[LEFT], cells[2, 0])

        self.assertEqual(cells[2, 2].next[UP], cells[1, 2])
        self.assertEqual(cells[2, 2].next[RIGHT], None)
        self.assertEqual(cells[2, 2].next[DOWN], None)
        self.assertEqual(cells[2, 2].next[LEFT], cells[2, 1])

    def test_reset_function(self):
        control_cells = create_cell_array(2, 1)
        vanilla_cells = create_cell_array(2, 1)
        manual_cells = create_cell_array(2, 1)

        def manual_connections(cells: np.ndarray) -> None:
            cells[0, 0].is_connected_at[RIGHT] = True
            cells[1, 0].is_connected_at[LEFT] = True

        reset(control_cells)
        reset(vanilla_cells)
        reset(manual_cells, manual_connections)

        self.assertTrue(np.array_equal(control_cells, vanilla_cells))


if __name__ == '__main__':
    unittest.main()