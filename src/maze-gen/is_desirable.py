import logging
import numpy as np
from directions import UP, RIGHT, DOWN, LEFT


LOGGER = logging.getLogger("maze-is-desirable")


def is_desirable(cells: np.ndarray) -> bool:
    """ 
    Evaluates if the generated maze cells configuration is desirable.
    A desirable configuration avoids certain patterns that could not 
    be managed during generation. Also manages 2x2 figures.
    """
    LOGGER.info("Evaluating maze desirability...")
    row_count = cells.shape[0]
    col_count = cells.shape[1]
    # Ensure the corner cells do not connect outwards
    c = cells[0, col_count - 1]
    if c.is_connected_at[UP] or c.is_connected_at[RIGHT]:
        LOGGER.info("Undesirable maze: Top-right corner cell connects outwards.")
        return False
    c = cells[row_count - 1, col_count - 1]
    if c.is_connected_at[DOWN] or c.is_connected_at[RIGHT]:
        LOGGER.info("Undesirable maze: Bottom-right corner cell connects outwards.")
        return False
    
    def is_hori(x, y):
        """Checks for horizontal 2-cell figure with form q1(x,y)---q2(x+1,y)."""
        q1 = cells[y, x].is_connected_at
        q2 = cells[y, x + 1].is_connected_at
        return (not q1[UP] and not q1[DOWN] and 
                    (x == 0 or not q1[LEFT]) and q1[RIGHT] and 
                not q2[UP] and not q2[DOWN] and 
                    q2[LEFT] and not q2[RIGHT])

    def is_vert(x, y):
        """Checks for vertical 2-cell figure with form q1(x,y)---q2(x,y+1)."""
        q1 = cells[y, x].is_connected_at
        q2 = cells[y + 1, x].is_connected_at
        if x == col_count - 1:
            return (not q1[LEFT] and not q1[UP] and not q1[DOWN] and
                    not q2[LEFT] and not q2[UP] and not q2[DOWN])
        return (not q1[LEFT] and not q1[RIGHT] and not q1[UP] and q1[DOWN] and
                not q2[LEFT] and not q2[RIGHT] and q2[UP] and not q2[DOWN])
    
    x: int; y: int 
    g: int
    for y in range(row_count - 1 ):
        for x in range(col_count - 1):
            # Check for 2x2-cell figures 
            if ((is_hori(x, y) and is_hori(x, y + 1)) or 
                (is_vert(x, y) and is_vert(x + 1, y))):
                # Discard those in the left edge (middle of the maze)
                if x == 0:
                    LOGGER.info("Undesirable maze: 2x2 figure at left edge.")
                    return False
                LOGGER.debug(f"2x2 figure found at ({x}, {y}), connecting cells...")
                # Connect the figure cells into same group
                cells[y, x].is_connected_at[DOWN] = True
                cells[y, x].is_connected_at[UP] = True
                g = cells[y, x].group_seq
                cells[y, x + 1].is_connected_at[DOWN] = True
                cells[y, x + 1].is_connected_at[LEFT] = True
                cells[y, x + 1].group_seq = g
                cells[y + 1, x].is_connected_at[UP] = True
                cells[y + 1, x].is_connected_at[RIGHT] = True
                cells[y + 1, x].group_seq = g
                cells[y + 1, x + 1].is_connected_at[UP] = True
                cells[y + 1, x + 1].is_connected_at[LEFT] = True
                cells[y + 1, x + 1].group_seq = g
    return True

