#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from config_schema import MazeConfig
from entity_placement import place_entities_on_tilemap
from chunk_assembly import generate_giant_maze_with_chunks
import numpy as np
import logging
from typing import Dict, Any, Tuple


logging.basicConfig(level=logging.INFO)
LOGGER = logging.getLogger("maze-gen")


def _add_boundary_columns(maze: np.ndarray) -> np.ndarray:
    """
    Adds two boundary columns (left and right) to close the maze completely.

    Each boundary column has '_' in all positions except 3 positions that form
    a door structure around the entry/exit point.

    Args:
        maze: ASCII numpy array tilemap

    Returns:
        New tilemap with two extra columns (one at start, one at end)
    """
    rows, cols = maze.shape

    # Create new columns filled with '_'
    left_column = np.full((rows, 1), "_", dtype="<U1")
    right_column = np.full((rows, 1), "_", dtype="<U1")

    # Find entry point in leftmost column (first column of original maze)
    entry_row = None
    for row_idx in range(rows):
        if maze[row_idx, 0] == ".":
            entry_row = row_idx
            break

    if entry_row is not None:
        # Set the door structure in left column
        # The adjacent element in the same row should be '|'
        left_column[entry_row, 0] = "|"
        # The two surrounding elements should also be '|'
        if entry_row > 0:
            left_column[entry_row - 1, 0] = "|"
        if entry_row < rows - 1:
            left_column[entry_row + 1, 0] = "|"
        LOGGER.debug(f"Left boundary column door created at row {entry_row}")

    # Find exit point in rightmost column (last column of original maze)
    exit_row = None
    for row_idx in range(rows):
        if maze[row_idx, cols - 1] == ".":
            exit_row = row_idx
            break

    if exit_row is not None:
        # Set the door structure in right column
        # The adjacent element in the same row should be '|'
        right_column[exit_row, 0] = "|"
        # The two surrounding elements should also be '|'
        if exit_row > 0:
            right_column[exit_row - 1, 0] = "|"
        if exit_row < rows - 1:
            right_column[exit_row + 1, 0] = "|"
        LOGGER.debug(f"Right boundary column door created at row {exit_row}")

    # Concatenate: left_column + original_maze + right_column
    maze_with_boundaries = np.hstack([left_column, maze, right_column])
    LOGGER.info(f"Boundary columns added: {maze.shape} -> {maze_with_boundaries.shape}")

    return maze_with_boundaries


def create_giant_maze_with_entities(
    config: MazeConfig,
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Generates a giant maze with entity placement (power pellets, chomp, echoes).

    Uses the chunk assembly system with MST-based connectivity and entity placement.

    Simplified tilemap:
    - '_' = empty/void
    - '.' = pacdot
    - '|' = wall
    - 'c' = chomp (player) spawn
    - 'x' = echo (ghost) spawn
    - 'o' = power pellet

    Workflow:
    1. Generate giant maze using chunk assembly system (max 50 attempts)
    2. If chunk assembly fails, retry up to 10000 times
    3. Convert integer tilemap to ASCII tilemap
    4. Place entities using spatial distribution algorithms
    5. Add boundary columns to close the maze completely
    6. Return ASCII tilemap and metadata

    """
    LOGGER.info("Generating giant maze with entities using chunk assembly system...")

    MAX_CHUNK_ATTEMPTS = 700
    MAX_MACRO_RETRIES = 10000

    for macro_retry in range(MAX_MACRO_RETRIES):
        try:
            LOGGER.info(
                f"Macro retry {macro_retry + 1}/{MAX_MACRO_RETRIES}: Attempting chunk assembly..."
            )
            # Generate giant maze with chunk assembly system
            # Returns ASCII tilemap directly
            ascii_maze = generate_giant_maze_with_chunks(
                config, max_macro_attempts=MAX_CHUNK_ATTEMPTS
            )

            LOGGER.info(f"Chunk assembly successful: {ascii_maze.shape}")

            # Add boundary columns to close the maze
            LOGGER.info("Adding boundary columns...")
            maze_with_boundaries = _add_boundary_columns(ascii_maze)

            # Place entities on the ASCII maze
            LOGGER.info("Placing entities (power pellets, chomp, echoes)...")
            maze_with_entities, metadata = place_entities_on_tilemap(
                maze_with_boundaries, config
            )

            LOGGER.info(
                f"Giant maze with entities generated successfully: {maze_with_entities.shape}, "
                f"{metadata['pacdot_count']} pacdots, {metadata['powerpellet_count']} power pellets, "
                f"{metadata['echo_count']} echoes"
            )

            return maze_with_entities, metadata

        except (ValueError, RuntimeError) as e:
            LOGGER.warning(
                f"Macro retry {macro_retry + 1}/{MAX_MACRO_RETRIES} failed: {e}. Retrying..."
            )
            continue

    raise RuntimeError(
        f"Failed to generate giant maze with entities after {MAX_MACRO_RETRIES} macro retries. "
        f"Consider adjusting configuration parameters."
    )


if __name__ == "__main__":
    # Test NEW giant maze generation with entities
    print("=== Testing Giant Maze with Entity Placement ===\n")

    config = MazeConfig(
        {
            "dimensions": {"layer_rows": 36, "layer_cols": 5, "num_layers": 4},
            "tunnels": {"entry_position": 10, "exit_position": 25},
            "entities": {"ghost_ratio": 100, "powerpellet_ratio": 60},
        }
    )

    maze_ascii, metadata = create_giant_maze_with_entities(config)

    print(f"\n=== Generation Results ===")
    print(f"Maze size: {maze_ascii.shape}")
    print(f"Pacdots: {metadata['pacdot_count']}")
    print(f"Power Pellets: {metadata['powerpellet_count']}")
    print(f"Echoes: {metadata['echo_count']}")
    print(f"Chomp spawn: {metadata['chomp_spawn']}")
    print(f"Echo spawns: {len(metadata['echo_spawns'])} positions")

    print("\n=== ASCII Tilemap (first 50 rows) ===")
    print(
        "Legend: _ = empty, . = pacdot, | = wall, o = powerpellet, c = chomp, x = echo"
    )
    for row in maze_ascii[:50]:
        print("".join(row))
