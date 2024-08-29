import numpy as np
from abc import ABC, abstractmethod

DIRECTIONS = {"UP": 0, "RIGHT": 1, "DOWN": 2, "LEFT": 3}

class D2Vector:
    def __init__(self, x, y) -> None:
        self.x = x
        self.y = y

LAYER_SIZE = D2Vector(16, 64)


class Cell:
    def __init__(self) -> None:
        self.isOpen = True


class Cells(ABC): 
    def __init__(self, cells) -> None:
        self.size = LAYER_SIZE
        if cells is None:
            self.cells = np.array([[Cell() for _ in range(self.size.x)] for _ in range(self.size.y)])
        else:
            self.cells = cells

    @abstractmethod    
    def get_cells(self) -> np.array:
        return self.cells


class LayerCells(Cells):
    def __init__(self, cells=None) -> None:
        super().__init__(cells)

    def get_cells(self) -> np.array:
        return super().get_cells() 

    def get_left_open_cells(self):
        for i in range(self.size.y):
            for j in range(self.size.x):
                if self.cells[i][j].isOpen:
                    return D2Vector(j, i)


class PrintCells(Cells):
    def __init__(self, cells=None) -> None:
        super().__init__(cells) 

    def get_cells(self) -> np.array:
        return super().get_cells()

    def print(self):
        for i in range(self.size.y):
            for j in range(self.size.x):
                print(int(self.cells[i][j].isOpen), end=' ')
            print()
    

if __name__ == '__main__':
    layer = LayerCells()
    display = PrintCells(layer.get_cells())
    display.print()