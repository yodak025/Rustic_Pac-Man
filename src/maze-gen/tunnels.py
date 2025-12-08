import logging
import random as rd
from directions import UP, DOWN, LEFT, RIGHT
from cell import Cell

LOGGER = logging.getLogger("tunnels-generator")

class TunnelsGenerator:
    """
    Class responsible for generating tunnels in the maze. 
    It identifies potential tunnel candidates and selects the most suitable ones
    based on predefined criteria. 
    """
    def __init__(self, cells):
        """
        Recieves the cells and creates a complex state from it.
        The state is composed of different kinds of tunnel candidates.
        """
        self.cells = cells
        self.height = cells.shape[0]
        self.width = cells.shape[1]
        self.is_valid_cell_map = True # Marks tunnel generation success
        # Declare candidates:
        # Best candidates
        self._void_tunnel_cells = []
        self._top_void_tunnel_cells = []
        self._bottom_void_tunnel_cells = []
        # Good candidates
        self._single_dead_end_cells = []
        self._top_single_dead_end_cells = []
        self._bottom_single_dead_end_cells = []
        self._double_dead_end_cells = []
        # Generic candidates (less desirable). 
        # Could intersect with other types but is only used 
        # if no other type is found so then its values are exclusive.
        self._edge_tunnel_cells = []
        self._top_edge_tunnel_cells = []
        self._bottom_edge_tunnel_cells = []
        

    def _prepare_candidates(self):
        """
        Prepares the different tunnel candidates by iterating through the rightmost column
        of the maze and checking each cell for tunnel conditions.
        """
        #! [HARCODED] values for top and bottom conditions
        top_condition_value = 2
        bottom_condition_value = 5
        y: int
        c: Cell
        is_up_head: bool
        is_down_head: bool
        # Iterate through the rightmost column and find candidates
        for y in range(self.height):
            c = self.cells[y, self.width - 1]
            if c.is_connected_at[UP]:
                # Discard cells that connect upwards.
                #? Upward connections create a 2-shape wall that would block the tunnel
                continue
            # All cells ([0, n-1]) in the range [1, n-2] are edge tunnel candidates
            if c.y > 1 and c.y < self.height - 2:
                c.is_edge_tunnel_candidate = True
                self._edge_tunnel_cells.append(c)
                if c.y <= top_condition_value:
                    self._top_edge_tunnel_cells.append(c)
                elif c.y >= bottom_condition_value:  
                    self._bottom_edge_tunnel_cells.append(c)
            # Checks if upper and lower neighbours are connected to the right
            # That implies that they are not part of figures, ergo ensures 
            # a clean spot for tunnel creation.
            is_up_head = False
            is_down_head = False
            if c.next[UP] is not None:
                is_up_head = c.next[UP].is_connected_at[RIGHT]
            if c.next[DOWN] is not None:
                is_down_head = c.next[DOWN].is_connected_at[RIGHT]
            # Void tunnels condition. The cell is connected to the right
            # (is not part of a figure) and upper neighbour is too.
            if c.is_connected_at[RIGHT]:
                if is_up_head:
                    c.is_void_tunnel_candidate = True
                    self._void_tunnel_cells.append(c)
                    if c.y <= top_condition_value:
                        self._top_void_tunnel_cells.append(c)
                    elif c.y >= bottom_condition_value + 1:
                        self._bottom_void_tunnel_cells.append(c)
            # Try to get dead end candidates
            else :
                # For dead-end candidates, the cell must not be connected downwards
                if c.is_connected_at[DOWN]:
                    continue
                # Single dead-end condition cases
                if is_up_head != is_down_head:
                    # Ensuere that the cell is not at the maze bottom
                    # And theres no wall blocking the tunnel
                    if y < self.height - 1 and not c.next[LEFT].is_connected_at[LEFT]:
                        self._single_dead_end_cells.append(c)
                        c.is_single_dead_end_candidate = True
                        c.single_dead_end_direction = UP if is_up_head else DOWN
                        offset = 1 if is_up_head else 0
                        if c.y <= top_condition_value + offset - 1:
                            self._top_single_dead_end_cells.append(c)
                        elif c.y >= bottom_condition_value + offset:
                            self._bottom_single_dead_end_cells.append(c)
                # Double dead-end condition cases
                elif is_up_head and is_down_head:
                    # Ensure that the cell is not at the maze borders
                    if y > 0 and y < self.height - 1:
                        #? And there's a consistent wall next to the tunnel
                        if c.next[LEFT].is_connected_at[UP] and c.next[LEFT].is_connected_at[DOWN]:
                            if c.y >= top_condition_value and c.y <= bottom_condition_value:
                                c.is_double_dead_end_candidate = True
                                self._double_dead_end_cells.append(c)    


    def _choose_tunnels(self) -> bool:
        """
        Chooses and marks the tunnels to be created in the maze. It tries 
        to create the best possible tunnels based on the candidates found.
        """
        # [TODO] Add 2 tunnels logic
        # number_of_tunnels = rd.randint(1, 2)  
        c: Cell | None
        c = None
        if len(self._void_tunnel_cells) > 1:
            c = self._void_tunnel_cells[rd.randint(0, len(self._void_tunnel_cells) - 1)]
            LOGGER.debug("Chosen tunnel cell is a void tunnel candidate.")
        elif len(self._single_dead_end_cells) > 1:
            c = self._single_dead_end_cells[rd.randint(0, len(self._single_dead_end_cells) - 1)]
            LOGGER.debug("Chosen tunnel cell is a single dead-end candidate.")
        elif len(self._edge_tunnel_cells) > 1:
            c = self._edge_tunnel_cells[rd.randint(0, len(self._edge_tunnel_cells) - 1)]
            LOGGER.debug("Chosen tunnel cell is an edge tunnel candidate.")
        if not c:
            LOGGER.debug("No valid tunnel candidates found.")
            return False
        c.is_top_tunnel = True
        LOGGER.debug(f"Tunnel created at cell ({c.x}, {c.y}).")
        return True
    

    def _is_valid_tunnels(self):
        """ Ensures that no vertical paths cut through the tunnels. """
        exit_tunnel = True
        topy = None
        for y in range(self.height):
            c : Cell = self.cells[y, self.width - 1]
            if c.is_top_tunnel:
                exit_tunnel = True
                topy = c.y
                while c.next[LEFT]:
                    c = c.next[LEFT]
                    # Check if cell is at same level and doesn't connect upward
                    if not c.is_connected_at[UP] and c.y == topy:
                        continue
                    else:
                        exit_tunnel = False
                        break
                if exit_tunnel:
                    return False
        return True
    

    def _clear_dead_ends(self):
        """ Removes dead ends created by tunnels by connecting them upwards. """
        # [QUARENTINE]: I think it is erasable, but don't harm to keep it.
        length = len(self._void_tunnel_cells)
        c: Cell
        def replace_group(old_group, new_group):
            for y in range(self.height):
                for x in range(self.width):
                    cell = self.cells[y, x]
                    if hasattr(cell, 'group') and cell.group == old_group:
                        cell.group = new_group
        for i in range(length):
            c = self._void_tunnel_cells[i]
            if not c.is_top_tunnel:
                replace_group(c.group_seq, c.next[UP].group_seq)
                c.is_connected_at[UP] = True
                c.next[UP].is_connected_at[DOWN] = True


    def generate(self):
        LOGGER.info("Generating tunnels...")
        LOGGER.debug("Preparing tunnel candidates...")
        self._prepare_candidates()
        LOGGER.debug("Candidates found:")
        LOGGER.debug(f"Single dead end cells: {len(self._single_dead_end_cells)}")
        LOGGER.debug(f"  - Top: {len(self._top_single_dead_end_cells)}")
        LOGGER.debug(f"  - Bottom: {len(self._bottom_single_dead_end_cells)}")
        LOGGER.debug(f"Double dead end cells: {len(self._double_dead_end_cells)}")
        LOGGER.debug(f"Void tunnel cells: {len(self._void_tunnel_cells)}")
        LOGGER.debug(f"  - Top: {len(self._top_void_tunnel_cells)}")
        LOGGER.debug(f"  - Bottom: {len(self._bottom_void_tunnel_cells)}")
        LOGGER.debug(f"Edge tunnel cells: {len(self._edge_tunnel_cells)}")
        LOGGER.debug(f"  - Top: {len(self._top_edge_tunnel_cells)}")
        LOGGER.debug(f"  - Bottom: {len(self._bottom_edge_tunnel_cells)}")
        if not self._choose_tunnels():
            LOGGER.info("Tunnel generation failed: No valid candidates.")
            self.is_valid_cell_map = False
            return
        if not self._is_valid_tunnels():
            LOGGER.info("Tunnel generation failed: Invalid tunnel configuration.")
            self.is_valid_cell_map = False
            return
        self._clear_dead_ends()

