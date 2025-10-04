import sys
from pathlib import Path

project_root = Path(__file__).resolve(
).parent.parent.parent  # Ajustar según el archivo
sys.path.insert(0, str(project_root))

import unittest
import numpy as np
from maze_generation.cell import Cell, create_cell_array, UP, RIGHT, DOWN, LEFT


class TestCells(unittest.TestCase):

    def test_init_connections(self):
        connections = {
            UP: True,
            RIGHT: False,
            DOWN: True,
            LEFT: False
        }

        self.assertIsNotNone(connections)
        self.assertEqual(connections[UP], True)
        self.assertEqual(connections[RIGHT], False)
        self.assertEqual(connections[DOWN], True)
        self.assertEqual(connections[LEFT], False)
        
        self.assertEqual(connections[0], True)
        self.assertEqual(connections[1], False)
        self.assertEqual(connections[2], True)
        self.assertEqual(connections[3], False)


    def test_init_nexts(self):
        connections = {
            UP: True,
            RIGHT: False,
            DOWN: True,
            LEFT: False
        }
        empty_nexts = {
            UP: None,
            RIGHT: None,
            DOWN: None,
            LEFT: None
        }
        up = Cell(connections.copy(), empty_nexts.copy(), 0, 0, 0)
        right = Cell(empty_nexts.copy(), connections.copy(), 1, 0, 1)
        down = Cell(empty_nexts.copy(), connections.copy(), 2, 0, 2)
        left = Cell(connections.copy(), empty_nexts.copy(), 3, 1, 0)

        up_copy = Cell(connections.copy(), empty_nexts.copy(), 0, 0, 0)
        right_copy = Cell(empty_nexts.copy(), connections.copy(), 1, 0, 1)
        down_copy = Cell(empty_nexts.copy(), connections.copy(), 2, 0, 2)
        left_copy = Cell(connections.copy(), empty_nexts.copy(), 3, 1, 0)

        nexts = {
            UP: up_copy,
            RIGHT: right_copy,
            DOWN: down_copy,
            LEFT: left_copy
        }

        self.assertIsNotNone(nexts)
        self.assertEqual(nexts[UP], up)
        self.assertEqual(nexts[RIGHT], right)
        self.assertEqual(nexts[DOWN], down)
        self.assertEqual(nexts[LEFT], left)
        
        self.assertEqual(nexts[0], up)
        self.assertEqual(nexts[1], right)
        self.assertEqual(nexts[2], down)
        self.assertEqual(nexts[3], left)


    def test_init_cell(self):
        connections = {
            UP: True,
            RIGHT: False,
            DOWN: True,
            LEFT: False
        }
        empty_nexts = {
            UP: None,
            RIGHT: None,
            DOWN: None,
            LEFT: None
        }
        up = Cell(connections.copy(), empty_nexts.copy(), 0, 0, 0)
        right = Cell(empty_nexts.copy(), connections.copy(), 1, 0, 1)
        down = Cell(empty_nexts.copy(), connections.copy(), 2, 0, 2)
        left = Cell(connections.copy(), empty_nexts.copy(), 3, 1, 0)

        nexts = {
            UP: None,
            RIGHT: None,
            DOWN: None,
            LEFT: None
        }

        cell = Cell(connections.copy(), nexts.copy(), 5, 1, 1)

        self.assertIsNotNone(cell)
        self.assertEqual(cell.is_filled, False)
        self.assertEqual(cell.id, 5)
        self.assertEqual(cell.seq, 0)
        self.assertEqual(cell.group_seq, 0)
        self.assertTrue(isinstance(cell.is_connected_at, dict))
        self.assertTrue(isinstance(cell.next, dict))
        self.assertFalse(cell.is_raise_height_candidate, False)
        self.assertFalse(cell.is_shrink_width_candidate, False)



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


    def test_eq_operations(self):
        

        # arregla el test para contemplar los cambios en la clase Cell
        connections = {
            UP: True,
            RIGHT: False,
            DOWN: True,
            LEFT: False
        }

        different_connections = {
            UP: True,
            RIGHT: False,
            DOWN: True,
            LEFT: True
        }
        
        empty_nexts = {
            UP: None,
            RIGHT: None,
            DOWN: None,
            LEFT: None
        }


        control_cell = Cell(connections.copy(), empty_nexts.copy(), 0, 0, 0)
        equal_cell = Cell(connections.copy(), empty_nexts.copy(), 0, 0, 0)
        different_cell = Cell(different_connections.copy(), empty_nexts.copy(), 1, 0, 1)
        same_cell_different_connections = Cell(different_connections.copy(), empty_nexts.copy(), 0, 0, 0)

        self.assertTrue(control_cell == equal_cell)
        self.assertNotEqual(control_cell, different_cell)
        self.assertNotEqual(control_cell, same_cell_different_connections)


if __name__ == '__main__':
    unittest.main()
