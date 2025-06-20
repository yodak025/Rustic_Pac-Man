from .directions import UP, DOWN, LEFT, RIGHT
import random as rd
from .cell import Cell


class TunnelsGenerator:
    def __init__(self, cells):
        self.cells = cells
        self.height = cells.shape[0]
        self.width = cells.shape[1]

        self.is_valid_cell_map = True

        # -- Declarar candidatos
        self.single_dead_end_cells = []
        self.top_single_dead_end_cells = []
        self.bottom_single_dead_end_cells = []

        self.void_tunnel_cells = []
        self.top_void_tunnel_cells = []
        self.bottom_void_tunnel_cells = []

        self.edge_tunnel_cells = []
        self.top_edge_tunnel_cells = []
        self.bottom_edge_tunnel_cells = []

        self.double_dead_end_cells = []

    def _prepare_candidates(self):
        #!- Se debe generalizar para cualquier número de filas
        #!- El principal problema es que no entiendes la importancia 
        #!- de diferencia entre los tuneles de la parte superior e inferior
        #!- ni la intención subyacente
        top_condition_value = 2
        bottom_condition_value = 5


        y: int
        c: Cell

        is_up_head: bool
        is_down_head: bool

        #-- Recorrer las celdas extremas y preparar los candidatos
        for y in range(self.height):
            c = self.cells[y, self.width - 1]

            if c.is_connected_at[UP]:
                #?- No tengo claro por qué se descartan todos los conectados UP
                continue
            #?- Posiblemente es 2 porque el rango de indexado es 0, h-1,
            #?- y no quiere tener en cuenta ni la primera ni la última celda de la columna
            if c.y > 1 and c.y < self.height - 2:
                #?- No termino de ver como se diferencian los edge tunnel del resto de casos
                c.is_edge_tunnel_candidate = True
                self.edge_tunnel_cells.append(c)
                if c.y <= top_condition_value:
                    self.top_edge_tunnel_cells.append(c)
                elif c.y >= bottom_condition_value:  
                    self.bottom_edge_tunnel_cells.append(c)

            is_up_head = False
            is_down_head = False
            
            if c.next[UP] is not None:
                is_up_head = c.next[UP].is_connected_at[RIGHT]
            
            if c.next[DOWN] is not None:
                is_down_head = c.next[DOWN].is_connected_at[RIGHT]

            if c.is_connected_at[RIGHT]:
                #?- Condición para túneles void
                if is_up_head:
                    c.is_void_tunnel_candidate = True
                    self.void_tunnel_cells.append(c)
                    if c.y <= top_condition_value:
                        self.top_void_tunnel_cells.append(c)
                    elif c.y >= bottom_condition_value + 1:
                        self.bottom_void_tunnel_cells.append(c)
            else :
                if c.is_connected_at[DOWN]:
                    #?- Solo valen los que están conectados hacia abajo si también están conectados hacia la derecha
                    continue

                if is_up_head != is_down_head:
                    #?- Condición para los túneles de un solo extremo
                    if y < self.height - 1 and not c.next[LEFT].is_connected_at[LEFT]:
                        self.single_dead_end_cells.append(c)
                        c.is_single_dead_end_candidate = True
                        c.single_dead_end_direction = UP if is_up_head else DOWN
                        offset = 1 if is_up_head else 0
                        if c.y <= top_condition_value + offset - 1:
                            self.top_single_dead_end_cells.append(c)
                        elif c.y >= bottom_condition_value + offset:
                            self.bottom_single_dead_end_cells.append(c)
                
                elif is_up_head and is_down_head:
                    if y > 0 and y < self.height - 1:
                        #?- Condición para los túneles de dos extremos
                        if c.next[LEFT].is_connected_at[UP] and c.next[LEFT].is_connected_at[DOWN]:
                            c.is_double_dead_end_candidate = True
                            if c.y >= top_condition_value and c.y <= bottom_condition_value:
                                self.double_dead_end_cells.append(c)    


    def _choose_tunnels(self) -> bool:
        number_of_tunnels = rd.randint(1, 2)  
        c: Cell | None
        c = None
        # Check if void_tunnel_cells is not empty
        if len(self.void_tunnel_cells) > 1:
            c = self.void_tunnel_cells[rd.randint(0, len(self.void_tunnel_cells) - 1)]
        if c:
            c.is_top_tunnel = True
        else:
            # Check if single_dead_end_cells is not empty
            if len(self.single_dead_end_cells) > 1:
                c = self.single_dead_end_cells[rd.randint(0, len(self.single_dead_end_cells) - 1)]
            if c:
                c.is_top_tunnel = True
            else:
                return False
        #!- Falta implementar el caso de 2 tuneles 
            

        return True
    
    def _is_valid_tunnels(self):
        exit_tunnel = True
        topy = None
        
        for y in range(self.height):
            c : Cell = self.cells[y, self.width - 1]
            if c.is_top_tunnel:
                exit_tunnel = True
                topy = c.y * 3 # Assuming final_y attribute exists
                
                while c.next[LEFT]:
                    c = c.next[LEFT]
                    # Check if cell is at same level and doesn't connect upward
                    if not c.is_connected_at[UP] and c.y * 3 == topy:
                        continue
                    else:
                        exit_tunnel = False
                        break
                
                if exit_tunnel:
                    return False
        
        return True
    

    def _clear_dead_ends(self):
        length = len(self.void_tunnel_cells)
        c: Cell

        def replace_group(old_group, new_group):

            for y in range(self.height):
                for x in range(self.width):
                    cell = self.cells[y, x]
                    if hasattr(cell, 'group') and cell.group == old_group:
                        cell.group = new_group

        for i in range(length):
            c = self.void_tunnel_cells[i]
            if not c.is_top_tunnel:
                replace_group(c.group_seq, c.next[UP].group_seq)
                c.is_connected_at[UP] = True
                c.next[UP].is_connected_at[DOWN] = True


    def generate(self):
        self._prepare_candidates()
        # Print the number of candidates of each type
        print(f"Single dead end cells: {len(self.single_dead_end_cells)}")
        print(f"  - Top: {len(self.top_single_dead_end_cells)}")
        print(f"  - Bottom: {len(self.bottom_single_dead_end_cells)}")

        print(f"Void tunnel cells: {len(self.void_tunnel_cells)}")
        print(f"  - Top: {len(self.top_void_tunnel_cells)}")
        print(f"  - Bottom: {len(self.bottom_void_tunnel_cells)}")

        print(f"Edge tunnel cells: {len(self.edge_tunnel_cells)}")
        print(f"  - Top: {len(self.top_edge_tunnel_cells)}")
        print(f"  - Bottom: {len(self.bottom_edge_tunnel_cells)}")

        print(f"Double dead end cells: {len(self.double_dead_end_cells)}")
        if not self._choose_tunnels():
            self.is_valid_cell_map = False
            return
        if not self._is_valid_tunnels():
            self.is_valid_cell_map = False
            return
        self._clear_dead_ends()

