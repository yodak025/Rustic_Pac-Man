
# ! KISS
# ? Recuerda:
# ?     eje 0 = rows = i = y,
# ?     eje 1 = cols = j = x.
# ? ...
# ? Que Dios nos pille confesados.


import numpy as np
import random as rd
from .cell import Cell
from .directions import UP, RIGHT, DOWN, LEFT

class CellConnectionsGenerator:
    def __init__(self, cells: np.ndarray, max_figure_size: int, seed: int | None = None) -> None:
        # Tamaño máximo de cada figura
        self.MAX_FIGURE_SIZE: int = max_figure_size
        # Tamaño para recalcular el centro
        self.MAX_RECENTER_SIZE: int = 2
        # Tamaño máximo de las figuras centradas en el tablero
        self.MAX_CENTRAL_FIGURE_SIZE: int = 3
    
        self.MAX_LONG_FIGURES: int = 1
        # Probabilidad de la mierda super específica
        self.SINGLE_CELL_JOIN_PROB: float = 0.35

        self.GROW_PROB_AT_SIZE: dict = { 
            1: 1,
            2: 0.75,
            3: 0.5,
            4: 0.1,
            5: 0
        }
        self.EXTEND_PROB_AT_SIZE: dict = {
            2: 1,
            3: 0.5,
            4: 0.5
        }

        self.cells: np.ndarray = cells

        self.center_cell: Cell  
        self.firts_cell: Cell 
        self.newest_cell: Cell 


        self.open_cells: list = []

        self.dir: int 

        self.filled_cells_count: int = 0
        self.groups_count: int = 0
        self.figure_size: int = 0

        self.single_count: dict = {
            0: 0,
            self.cells.shape[0] - 1: 0
        }

        self.long_figures: int = 0
        if seed:
            rd.seed(seed)

        

    def _get_left_empty_cells(self) -> list:
        left_cells = []
        for j in range(self.cells.shape[1]):
            for i in range(self.cells.shape[0]):
                if not self.cells[i, j].is_filled:
                    left_cells.append(self.cells[i, j])
            
            if left_cells:  
                break
        
        return left_cells


    @staticmethod
    def _is_open_cell(cell: Cell, i: int, prev_dir: int, size: int) -> bool:
        x, y = cell.x, cell.y
        # ! Es necesario ajustar para la posición inicial, quizá innecesario
        if y == 6 and x == 0 and i == DOWN or y == 7 and x == 0 and i == UP:
            return False
        
        # ! Igual no hace falta, previene la aparición de piezas largas de tamaño 3
        # ? Quizá esto tiene que ver con que el código original genera Ls en size 2
        if size == 2 and (i == prev_dir or i == (prev_dir + 2) % 4):
            return False
        
        # Apunta a la siguiente celda en la dirección determinada. 
        # Solo estará libre si la que tiene a su izquierda está llena porque lo dice 
        # el algoritmo (probablemente para evitar figuras 1x1).
        # ! Sería interesante ver que pasa si no se tiene en cuenta esta condición
        # ? Por si no lo pillas: 
        # ? Si la siguiente celda en la dirección i existe Y no está llena entonces 
        # ? Si la que se encuentra a la izquierda de la siguiente celda en la dirección 
        # ? también existe y i está llena, retornamos true.  
        if cell.next[i] and not cell.next[i].is_filled:
            left_at_next = cell.next[i].next[LEFT]
            if (left_at_next and left_at_next.is_filled) or not left_at_next:
                return True
        
        return False


    def _get_open_cells_directions(self, cell: Cell, prev_dir: int, size: int) -> list:
        open_cells_directions = []
        for i in range(4):
            if self._is_open_cell(cell, i, prev_dir, size):
                open_cells_directions.append(i)
        
        return open_cells_directions
    

    def _connect_cell(self, cell: Cell, dir: int) -> None:
        cell.is_connected_at[dir] = True
        cell.next[dir].is_connected_at[(dir + 2) % 4] = True

        if cell.x == 0 and dir == RIGHT:
            cell.is_connected_at[LEFT] = True


    def _fill_cell(self, cell: Cell) -> None:
        self.filled_cells_count += 1
        cell.is_filled = True
        
        cell.seq = self.filled_cells_count
        cell.group_seq = self.groups_count


    def _l_generator(self) -> bool:
        if (self.firts_cell.x > 0 
            and self.firts_cell.is_connected_at[RIGHT] #-- Si hay una celda conectada a la derecha
            and self.firts_cell.next[RIGHT]
            and self.firts_cell.next[RIGHT].next[RIGHT] #-- que tiene otra celda conectada a la derecha
            and self.long_figures <= self.MAX_LONG_FIGURES #-- y se cumplen las condiciones
            and rd.random() <= self.EXTEND_PROB_AT_SIZE[2]): # ! Numero magico

            #-- Entonces creamos una figura en forma de L
            l_corner_cell: Cell = self.firts_cell.next[RIGHT].next[RIGHT]
            is_open_direction_at: dict = {}
            direction: int | None = None

            #-- Puede ser hacia arriba o hacia abajo
            is_open_direction_at[UP] = self._is_open_cell(l_corner_cell, UP, 7, 7) 
            is_open_direction_at[DOWN] = self._is_open_cell(l_corner_cell,DOWN, 7, 7)

            if is_open_direction_at[UP] and is_open_direction_at[DOWN]:
                direction = [UP, DOWN][rd.randint(0, 1)]
            elif is_open_direction_at[UP]:
                direction = UP
            elif is_open_direction_at[DOWN]:
                direction = DOWN
            
            if direction:
                self._connect_cell(l_corner_cell, LEFT)
                self._fill_cell(l_corner_cell)
                self._connect_cell(l_corner_cell, direction)
                self._fill_cell(l_corner_cell.next[direction])
                self.long_figures += 1
                self.figure_size += 2
                return True
            
        return False


    def _grow_figure(self) -> bool:
        open_directions: list = self._get_open_cells_directions(self.center_cell, 7, self.figure_size)

        if (len(open_directions) == 0 
            and self.figure_size == self.MAX_RECENTER_SIZE):
            self.center_cell = self.newest_cell
            open_directions = self._get_open_cells_directions(self.center_cell, 7, self.figure_size)
        
        if len(open_directions) == 0:
            return True
        else:
            direction = open_directions[rd.randint(0, len(open_directions) - 1)] # ! El -1 lo he puesto en un momento que no tengo control del programa
            self.newest_cell = self.center_cell.next[direction]

            self._connect_cell(self.center_cell, direction)

            self._fill_cell(self.newest_cell)

            self.figure_size += 1

            if ((self.firts_cell.x == 0 
                and self.figure_size == self.MAX_CENTRAL_FIGURE_SIZE)
                or rd.random() <= self.GROW_PROB_AT_SIZE[self.figure_size]):
                return True
            

            return False
            
        
    def _close_figure(self) -> None:
        if (self.figure_size == 2 
            and self.firts_cell.x == self.cells.shape[1]):
            top_joining_cell: Cell = self.firts_cell

            if self.firts_cell.is_connected_at[UP]:
                top_joining_cell = self.firts_cell.next[UP]

            top_joining_cell.is_connected_at[RIGHT] = True
            top_joining_cell.next[DOWN].connect[RIGHT] = True

        elif (self.figure_size == (3 or 4)
              and self.long_figures < self.MAX_LONG_FIGURES
              and self.firts_cell.x > 0 
              and rd.random()<= self.EXTEND_PROB_AT_SIZE[self.figure_size]):
            directions: list = []

            for dir in range(4):
                if (self.center_cell.is_connected_at[dir]
                    and self._is_open_cell(self.firts_cell, dir, 7, 7)):
                    directions.append(dir)

                if(len(directions) > 0):
                    direction: int = rd.choice(directions)
                    long_leg_cell: Cell = self.center_cell.next[direction]
                    self._connect_cell(long_leg_cell, direction)
                    self._fill_cell(long_leg_cell.next[direction]) 
                    self.long_figures += 1
            

    
    def _generate_figure(self) -> None:
        while self.figure_size <= self.MAX_FIGURE_SIZE:
            stop_growing: bool = False

            # ! esto es un número mágico y se repite en l_generator
            if self.figure_size == 2:
                stop_growing = self._l_generator()

            if not stop_growing:
                stop_growing = self._grow_figure()

            if stop_growing:
                self._close_figure()
                self.groups_count += 1
                break # ! No estoy seguro 
            
    
    def generate(self) -> None:
        while True:
            self.groups_count += 1
            left_cells: list = self._get_left_empty_cells()

            if len(left_cells) == 0:
                break

            self.center_cell = self.firts_cell = rd.choice(left_cells)
            self._fill_cell(self.center_cell)

            # ? Finalmentchi: La mierda super especifica en python...
            if (self.center_cell.x < self.cells.shape[1] - 1 
                and (self.center_cell.y in self.single_count) 
                and rd.random() <= self.SINGLE_CELL_JOIN_PROB):

                if self.single_count[self.center_cell.y] == 0:
                    self.center_cell.is_connected_at[
                        UP if self.center_cell.y == 0 else DOWN] = True

            self.figure_size = 1

            if self.center_cell.x == self.cells.shape[1] - 1:
                self.center_cell.is_connected_at[RIGHT] = True
                self.center_cell.is_raise_height_candidate = True
            else:
                self._generate_figure()
