import numpy as np

DIRECTIONS = {"UP": 0, "RIGHT": 1, "DOWN": 2, "LEFT": 3}

class D2Vector:
    def __init__(self, x, y) -> None:
        self.x = x
        self.y = y

class Cell:
    def __init__(self) -> None:
        self.isOpen = True



class LayerCells:
    def __init__(self, dim:D2Vector) -> None:
        self.dim = dim
        self.cells = np.array([[Cell() for _ in range(dim.x)] for _ in range(dim.y)])

    def get_left_open_cells(self):
        for i in range(self.dim.y):
            for j in range(self.dim.x):
                if self.cells[i][j].isOpen:
                    return D2Vector(j, i)

    def print(self):
        for i in range(self.dim.y):
            for j in range(self.dim.x):
                print(int(self.cells[i][j].isOpen), end=' ')
            print()

if __name__ == '__main__':
    layer = LayerCells(D2Vector(50, 50))
    layer.print()