import sys
from pathlib import Path

project_root = Path(__file__).resolve(
).parent.parent.parent  # Ajustar según el archivo
sys.path.insert(0, str(project_root))

import unittest
import numpy as np
from maze_generation.cell import Direction, Cell, create_cell_array


class TestCells(unittest.TestCase):
    def test_init_connections(self):
        connection = Direction(True, False, True, False)

        self.assertIsNotNone(connection)
        self.assertEqual(connection.up, True)
        self.assertEqual(connection.right, False)
        self.assertEqual(connection.down, True)
        self.assertEqual(connection.left, False)

    def test_init_nexts(self):
        up = Cell(Direction(True, False, True, False),
                  Direction(None, None, None, None))
        right = Cell(Direction(None, None, None, None),
                     Direction(False, True, False, True))
        down = Cell(Direction(None, None, None, None),
                    Direction(True, False, True, False))
        left = Cell(Direction(False, True, False, True),
                    Direction(None, None, None, None))

        nexts = Direction(up, right, down, left)

        self.assertIsNotNone(nexts)
        self.assertEqual(nexts.up, up)
        self.assertEqual(nexts.right, right)
        self.assertEqual(nexts.down, down)
        self.assertEqual(nexts.left, left)

    def test_init_cell(self):
        up = Cell(Direction(True, False, True, False),
                  Direction(None, None, None, None))
        right = Cell(Direction(None, None, None, None),
                     Direction(False, True, False, True))
        down = Cell(Direction(None, None, None, None),
                    Direction(True, False, True, False))
        left = Cell(Direction(False, True, False, True),
                    Direction(None, None, None, None))

        nexts = Direction(up, right, down, left)

        cell = Cell(Direction(True, False, True, False), nexts)

        self.assertIsNotNone(cell)
        self.assertEqual(cell.is_filled, False)
        self.assertEqual(cell.id, 0)
        self.assertEqual(cell.group_id, 0)
        self.assertTrue(isinstance(cell.is_connected, Direction))
        self.assertTrue(isinstance(cell.next, Direction))

    def test_create_cell_array(self):
        rows = 5
        cols = 7

        cell_array = create_cell_array(rows, cols)

        self.assertIsNotNone(cell_array)
        self.assertEqual(cell_array.shape, (rows, cols))

        def check_cell(cell):
            self.assertIsNotNone(cell)
            self.assertTrue(isinstance(cell, Cell))

        check_each_cell = np.vectorize(check_cell)
        check_each_cell(cell_array)

    # ! El test falla porque es necesario implementar el método __eq__ 
    # ! en la clase Direction, y quizá una comprobación de igualdad 
    # ! por elementos en la clase Cell
    # TODO - Implementar test de igualdad para Direction y arreglar el de Cell
    def test_cell_eq(self):
        control_cell = Cell(Direction(True, False, True, False),
                     Direction(None, None, None, None))
        equal_cell = Cell(Direction(True, False, True, False),
                     Direction(None, None, None, None))
        different_cell = Cell(Direction(False, True, True, False),
                     Direction(None, None, None, None))

        self.assertTrue(control_cell == equal_cell)
        self.assertNotEqual(control_cell, different_cell)


if __name__ == '__main__':
    unittest.main()
