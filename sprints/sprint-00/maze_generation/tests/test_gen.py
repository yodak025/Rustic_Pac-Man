import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent.parent  # Ajusta según la ubicación real
sys.path.insert(0, str(project_root))

import unittest
import numpy as np
from maze_generation.gen import CellConnectionsGenerator, UP, RIGHT, DOWN, LEFT  
from maze_generation.cell import Cell, create_cell_array
from maze_generation.reset import reset

class TestGenMethods(unittest.TestCase):

    def test_constructor(self):
        # Prueba el constructor de CellConnectionsGenerator
        cells = create_cell_array(5, 5)
        max_figure_size = 5
        generator = CellConnectionsGenerator(cells, max_figure_size)

        # Verifica que los atributos se inicializan correctamente
        self.assertEqual(generator.MAX_FIGURE_SIZE, max_figure_size)
        self.assertTrue(np.array_equal(generator.cells, cells))
        self.assertEqual(generator.cell_pointer, {
                         "current": None, "previous": None, "first": None})
        self.assertEqual(generator.open_cells, [])
        self.assertIsNone(generator.dir)
        self.assertEqual(generator.filled_cells_count, 0)
        self.assertEqual(generator.groups_count, 0)
        self.assertEqual(generator.current_group_size, 0)
        self.assertEqual(generator.GROW_PROB_AT_SIZE, {
                         1: 0, 2: 0.1, 3: 0.5, 4: 0.75, 5: 1})
        self.assertEqual(generator.single_count, {0: 0, cells.shape[0] - 1: 0})
        self.assertEqual(generator.long_figures, 0)
        self.assertEqual(generator.EXTEND_PROB_AT_SIZE, {
                         3: 0.125, 4: 0.0625, 5: 0.03125})


    def test_get_left_empty_cells(self):
        # Prueba el método _get_left_empty_cells
        cells = create_cell_array(3, 3)
        cells[0, 0].is_filled = True
        cells[1, 0].is_filled = True
        cells[2, 0].is_filled = False
        cells[0, 1].is_filled = False
        cells[1, 1].is_filled = True
        cells[2, 1].is_filled = False

        generator = CellConnectionsGenerator(cells, 5)
        left_empty_cells = generator._get_left_empty_cells()

        # Verifica que se obtienen las celdas vacías correctas
        expected_cells = [cells[2, 0]]
        self.assertEqual(left_empty_cells, expected_cells)


    def test_is_open_cell(self):
        # Prueba el método _is_open_cell
        cells = create_cell_array(3, 3)
        reset(cells)
        cells[0, 0].is_filled = True
        cells[1, 0].is_filled = True
        cells[2, 1].is_filled = False

        generator = CellConnectionsGenerator(cells, 5)
        # Verifica que la celda es abierta
        self.assertTrue(generator._is_open_cell(cells[1, 1], UP, DOWN, 1))
        # Verifica que la celda no es abierta
        self.assertFalse(generator._is_open_cell(cells[1, 1], DOWN, UP, 1))
        # Verifica que la celda no es abierta porque no tiene 
        # una celda abierta a la izquierda
        self.assertFalse(generator._is_open_cell(cells[1, 0], UP, DOWN, 1))


    def test_get_open_cell(self):
        # Prueba el método _get_open_cell
        cells = create_cell_array(3, 3)
        reset(cells)
        cells[0, 0].is_filled = True
        cells[0, 1].is_filled = True
        cells[1, 0].is_filled = True

        generator = CellConnectionsGenerator(cells, 5)
        open_cells = generator._get_open_cells_directions(cells[0, 1], 2, 1)
        # Verifica que se obtienen las celdas abiertas correctas
        self.assertEqual(open_cells, [1, 2])


    def test_connect_cell(self):
        # Prueba el método _connect_cell
        cells = create_cell_array(5, 5)
        cells[0, 0].next[RIGHT] = cells[0, 1]
        cells[0, 1].next[LEFT] = cells[0, 0]

        generator = CellConnectionsGenerator(cells, 5)
        generator._connect_cell(cells[0, 0], RIGHT)

        # Verifica que las celdas están conectadas correctamente
        self.assertTrue(cells[0, 0].is_connected_at[RIGHT])
        self.assertTrue(cells[0, 1].is_connected_at[LEFT])



if __name__ == '__main__':
    unittest.main()