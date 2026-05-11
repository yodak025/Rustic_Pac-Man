#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Entity and collectible placement for procedurally generated mazes.
Uses numpy operations for efficient spatial distribution of entities.
Works directly with ASCII tilemap representation.
"""

import logging
import numpy as np
from typing import Tuple, Dict, Any, List
from config_schema import MazeConfig


LOGGER = logging.getLogger("entity-placement")


# ASCII Tile character constants (simplified)
TILE_EMPTY = "_"  # Empty/void space
TILE_PACDOT = "."  # Pacdot (collectible)
TILE_WALL = "|"  # Wall (any orientation)
TILE_CHOMP = "c"  # Chomp (player) spawn position
TILE_ECHO = "x"  # Echo (ghost) spawn position
TILE_POWERPELLET = "o"  # Power pellet spawn position


def place_entities_on_tilemap(
    tilemap: np.ndarray, config: MazeConfig
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Place entities and collectibles on a generated ASCII tilemap using spatial distribution.

    Workflow:
    1. Count pacdots (tile char '.') in the tilemap
    2. Calculate entity counts based on config ratios
    3. Divide maze into spatial regions for balanced distribution
    4. Replace random pacdots with power pellets (uniform distribution per region)
    5. Find suitable spawn positions for chomp and echoes
    6. Return modified tilemap and metadata

    Args:
        tilemap: String numpy array representing the maze (dtype='<U1')
        config: MazeConfig with entity ratios and parameters

    Returns:
        Tuple of (modified_tilemap, metadata_dict) where metadata contains:
        - pacdot_count: Total number of pacdots (excluding replaced ones)
        - powerpellet_count: Number of power pellets placed
        - echo_count: Number of echoes (ghosts) to spawn
        - chomp_spawn: (y, x) position for chomp (player)
        - echo_spawns: List of (y, x) positions for echoes
    """
    LOGGER.info("Starting entity placement on ASCII tilemap...")

    # Make a copy to avoid modifying original
    modified_tilemap = tilemap.copy()
    # Count pacdots (tile char '.')
    pacdot_mask = modified_tilemap == TILE_PACDOT
    total_pacdots = np.sum(pacdot_mask)
    LOGGER.info(f"Found {total_pacdots} pacdots in tilemap")

    if total_pacdots == 0:
        LOGGER.warning("No pacdots found in tilemap, cannot place entities")
        return modified_tilemap, {
            "pacdot_count": 0,
            "powerpellet_count": 0,
            "echo_count": 0,
            "chomp_spawn": None,
            "echo_spawns": [],
        }

    # Calculate entity counts
    num_powerpellets = max(1, total_pacdots // config.powerpellet_ratio)
    num_echoes = max(1, total_pacdots // config.ghost_ratio)
    LOGGER.info(
        f"Calculated entities: {num_powerpellets} power pellets "
        f"(ratio 1:{config.powerpellet_ratio}), "
        f"{num_echoes} echoes (ratio 1:{config.ghost_ratio})"
    )

    # Place power pellets with spatial distribution
    modified_tilemap, powerpellets_placed = _place_powerpellets_spatially(
        modified_tilemap, num_powerpellets
    )
    # Find chomp spawn position (prefer entry tunnel area or center-left)
    chomp_spawn = _find_chomp_spawn(modified_tilemap)
    # Find echo spawn positions (distributed spatially)
    echo_spawns = _find_echo_spawns(modified_tilemap, num_echoes, chomp_spawn)
    # Mark spawn positions on tilemap
    if chomp_spawn is not None:
        modified_tilemap[chomp_spawn] = TILE_CHOMP
        LOGGER.info(f"Chomp spawn placed at {chomp_spawn}")
    for idx, echo_pos in enumerate(echo_spawns):
        modified_tilemap[echo_pos] = TILE_ECHO
        LOGGER.debug(f"Echo {idx + 1} spawn placed at {echo_pos}")

    # Calculate final pacdot count (after power pellet replacement and spawns)
    final_pacdot_count = np.sum(modified_tilemap == TILE_PACDOT)
    # Convert numpy types to native Python types for JSON serialization
    metadata = {
        "pacdot_count": int(final_pacdot_count),
        "powerpellet_count": int(powerpellets_placed),
        "echo_count": int(num_echoes),
        "chomp_spawn": tuple(int(x) for x in chomp_spawn)
        if chomp_spawn is not None
        else None,
        "echo_spawns": [tuple(int(x) for x in pos) for pos in echo_spawns],
    }
    LOGGER.info(
        f"Entity placement complete: {final_pacdot_count} pacdots, "
        f"{powerpellets_placed} power pellets, "
        f"{num_echoes} echoes, chomp at {chomp_spawn}"
    )
    return modified_tilemap, metadata


def _place_powerpellets_spatially(
    tilemap: np.ndarray, num_powerpellets: int
) -> Tuple[np.ndarray, int]:
    """
    Replace pacdots with power pellets using spatial grid distribution.

    Strategy:
    1. Divide tilemap into a grid of regions (e.g., 4x4 or 3x3)
    2. For each region, find pacdot positions
    3. Use numpy.random.choice to randomly select pacdots from each region
    4. This ensures power pellets are distributed across the entire maze

    Args:
        tilemap: ASCII maze tilemap
        num_powerpellets: Number of power pellets to place

    Returns:
        Tuple of (modified_tilemap, actual_count_placed)
    """
    LOGGER.debug(
        f"Placing {num_powerpellets} power pellets with spatial distribution..."
    )

    modified_tilemap = tilemap.copy()
    height, width = tilemap.shape

    # Find all pacdot positions using numpy.argwhere
    pacdot_positions = np.argwhere(tilemap == TILE_PACDOT)

    if len(pacdot_positions) == 0:
        LOGGER.warning("No pacdots available for power pellet placement")
        return modified_tilemap, 0

    # Cap at available pacdots
    num_to_place = min(num_powerpellets, len(pacdot_positions))

    # Divide maze into regions (adaptive grid size based on maze dimensions)
    # Use 3x3 grid for smaller mazes, 4x4 for larger mazes
    grid_size = 3 if max(height, width) < 200 else 4

    # Calculate positions per region
    positions_per_region = max(1, num_to_place // (grid_size * grid_size))

    placed_positions = []

    # Iterate through grid regions
    for row_idx in range(grid_size):
        for col_idx in range(grid_size):
            # Calculate region boundaries
            row_start = (height * row_idx) // grid_size
            row_end = (height * (row_idx + 1)) // grid_size
            col_start = (width * col_idx) // grid_size
            col_end = (width * (col_idx + 1)) // grid_size

            # Find pacdots in this region using boolean mask
            region_mask = (
                (pacdot_positions[:, 0] >= row_start)
                & (pacdot_positions[:, 0] < row_end)
                & (pacdot_positions[:, 1] >= col_start)
                & (pacdot_positions[:, 1] < col_end)
            )
            region_pacdots = pacdot_positions[region_mask]

            if len(region_pacdots) == 0:
                continue

            # Randomly select positions from this region using numpy.random.choice
            num_in_region = min(positions_per_region, len(region_pacdots))
            selected_indices = np.random.choice(
                len(region_pacdots), size=num_in_region, replace=False
            )
            selected_positions = region_pacdots[selected_indices]

            placed_positions.extend(selected_positions.tolist())

            # Stop if we've placed enough
            if len(placed_positions) >= num_to_place:
                break

        if len(placed_positions) >= num_to_place:
            break

    # If we still need more (edge case), fill remaining randomly
    if len(placed_positions) < num_to_place:
        remaining = num_to_place - len(placed_positions)
        placed_set = set(map(tuple, placed_positions))
        available = [tuple(p) for p in pacdot_positions if tuple(p) not in placed_set]

        if available:
            additional_indices = np.random.choice(
                len(available), size=min(remaining, len(available)), replace=False
            )
            placed_positions.extend([available[i] for i in additional_indices])

    # Place power pellets at selected positions
    for pos in placed_positions[:num_to_place]:
        modified_tilemap[tuple(pos)] = TILE_POWERPELLET

    actual_placed = len(placed_positions[:num_to_place])
    LOGGER.debug(
        f"Placed {actual_placed} power pellets across {grid_size}x{grid_size} regions"
    )

    return modified_tilemap, actual_placed


def _find_chomp_spawn(tilemap: np.ndarray) -> Tuple[int, int] | None:
    """
    Find suitable spawn position for chomp (player).

    Strategy:
    - Look for the unique pacdot in the first column (x=1)
    - This pacdot marks the entry tunnel position
    - If not found, fall back to searching nearby columns

    Args:
        tilemap: ASCII maze tilemap
        config: Configuration (not used in new strategy)

    Returns:
        (y, x) tuple for chomp spawn position, or None if not found
    """
    _, width = tilemap.shape

    # Search for pacdot in the first column (entry tunnel)
    first_column = tilemap[:, 1]
    pacdot_rows = np.argwhere(first_column == TILE_PACDOT)
    if len(pacdot_rows) > 0:
        # Found pacdot(s) in first column - use the first one
        spawn_row = int(pacdot_rows[0][0])
        spawn_pos = (spawn_row, 1)
        LOGGER.info(f"Chomp spawn found at entry tunnel (first column): {spawn_pos}")
        return spawn_pos

    # Fallback: Search in first few columns if nothing found in column 0
    LOGGER.warning("No pacdot found in first column, searching nearby columns...")
    for col in range(min(5, width), 1):
        column = tilemap[:, col]
        pacdot_rows = np.argwhere(column == TILE_PACDOT)

        if len(pacdot_rows) > 0:
            spawn_row = int(pacdot_rows[0][0])
            spawn_pos = (spawn_row, col)
            LOGGER.warning(f"Chomp spawn found in column {col}: {spawn_pos}")
            return spawn_pos

    # Final fallback: Any pacdot position in the maze
    pacdot_positions = np.argwhere(tilemap == TILE_PACDOT)

    if len(pacdot_positions) == 0:
        LOGGER.error("No pacdot positions available for chomp spawn")
        return None

    spawn_idx = np.random.choice(len(pacdot_positions))
    spawn_pos = (
        int(pacdot_positions[spawn_idx][0]),
        int(pacdot_positions[spawn_idx][1]),
    )
    LOGGER.error(f"Chomp spawn fallback to random position: {spawn_pos}")
    return spawn_pos


def _find_echo_spawns(
    tilemap: np.ndarray, num_echoes: int, chomp_spawn: Tuple[int, int] | None
) -> List[Tuple[int, int]]:
    """
    Find spawn positions for echoes (ghosts) with spatial distribution.

    Strategy:
    - Divide maze into regions
    - Place echoes evenly across regions using numpy operations
    - Avoid positions too close to chomp spawn (using numpy distance calculation)
    - Must be pacdot positions (tile char '.')

    Args:
        tilemap: ASCII maze tilemap
        num_echoes: Number of echoes to spawn
        chomp_spawn: Chomp spawn position (y, x)

    Returns:
        List of (y, x) tuples for echo spawn positions
    """
    height, width = tilemap.shape

    # Find all pacdot positions
    pacdot_positions = np.argwhere(tilemap == TILE_PACDOT)

    if len(pacdot_positions) == 0:
        LOGGER.warning("No pacdot positions available for echo spawns")
        return []

    # Filter out positions too close to chomp using numpy vectorized distance calculation
    MIN_DISTANCE_FROM_CHOMP = 30  # Tiles

    if chomp_spawn is not None:
        distances = np.sqrt(
            (pacdot_positions[:, 0] - chomp_spawn[0]) ** 2
            + (pacdot_positions[:, 1] - chomp_spawn[1]) ** 2
        )
        far_from_chomp_mask = distances >= MIN_DISTANCE_FROM_CHOMP
        candidate_positions = pacdot_positions[far_from_chomp_mask]
    else:
        candidate_positions = pacdot_positions

    if len(candidate_positions) == 0:
        # If all positions are too close, just use all pacdots
        candidate_positions = pacdot_positions
        LOGGER.warning("All pacdot positions are close to chomp, using all positions")

    # Cap at available positions
    num_to_place = min(num_echoes, len(candidate_positions))

    # Divide maze into regions for distribution
    grid_size = max(2, int(np.sqrt(num_to_place)))
    echoes_per_region = max(1, num_to_place // (grid_size * grid_size))

    echo_positions = []

    # Iterate through grid regions
    for row_idx in range(grid_size):
        for col_idx in range(grid_size):
            # Calculate region boundaries
            row_start = (height * row_idx) // grid_size
            row_end = (height * (row_idx + 1)) // grid_size
            col_start = (width * col_idx) // grid_size
            col_end = (width * (col_idx + 1)) // grid_size

            # Find candidates in this region using boolean mask
            region_mask = (
                (candidate_positions[:, 0] >= row_start)
                & (candidate_positions[:, 0] < row_end)
                & (candidate_positions[:, 1] >= col_start)
                & (candidate_positions[:, 1] < col_end)
            )
            region_candidates = candidate_positions[region_mask]

            if len(region_candidates) == 0:
                continue

            # Randomly select positions from this region using numpy.random.choice
            num_in_region = min(echoes_per_region, len(region_candidates))
            selected_indices = np.random.choice(
                len(region_candidates), size=num_in_region, replace=False
            )
            selected_positions = region_candidates[selected_indices]

            echo_positions.extend([(int(p[0]), int(p[1])) for p in selected_positions])

            # Stop if we've placed enough
            if len(echo_positions) >= num_to_place:
                break

        if len(echo_positions) >= num_to_place:
            break

    # If we still need more, fill remaining randomly
    if len(echo_positions) < num_to_place:
        remaining = num_to_place - len(echo_positions)
        placed_set = set(echo_positions)
        available = [
            (int(p[0]), int(p[1]))
            for p in candidate_positions
            if (int(p[0]), int(p[1])) not in placed_set
        ]

        if available:
            additional_indices = np.random.choice(
                len(available), size=min(remaining, len(available)), replace=False
            )
            echo_positions.extend([available[i] for i in additional_indices])

    final_positions = echo_positions[:num_to_place]
    LOGGER.debug(
        f"Placed {len(final_positions)} echo spawns across {grid_size}x{grid_size} regions"
    )

    return final_positions


if __name__ == "__main__":
    # Test entity placement with a simple ASCII tilemap
    logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s")

    print("=== Testing Entity Placement ===\n")

    # Create a simple test tilemap (30x40 with pacdots and walls)
    test_tilemap = np.full((30, 40), TILE_PACDOT, dtype="<U1")
    # Add some walls
    test_tilemap[10:12, :] = TILE_WALL
    test_tilemap[:, 20:22] = TILE_WALL
    # Add empty borders
    test_tilemap[0, :] = TILE_EMPTY
    test_tilemap[-1, :] = TILE_EMPTY
    test_tilemap[:, 0] = TILE_EMPTY
    test_tilemap[:, -1] = TILE_EMPTY

    test_config = MazeConfig(
        {
            "dimensions": {"num_layers": 1, "layer_rows": 10, "layer_cols": 10},
            "entities": {"ghost_ratio": 50, "powerpellet_ratio": 30},
        }
    )

    pacdot_count = np.sum(test_tilemap == TILE_PACDOT)
    print(f"Test tilemap: {test_tilemap.shape}, {pacdot_count} pacdots")
    print(
        f"Config: ghost_ratio={test_config.ghost_ratio}, powerpellet_ratio={test_config.powerpellet_ratio}\n"
    )

    modified_tilemap, metadata = place_entities_on_tilemap(test_tilemap, test_config)

    print("\n=== Results ===")
    print(f"Pacdots: {metadata['pacdot_count']}")
    print(f"Power Pellets: {metadata['powerpellet_count']}")
    print(f"Echoes: {metadata['echo_count']}")
    print(f"Chomp spawn: {metadata['chomp_spawn']}")
    print(f"Echo spawns: {len(metadata['echo_spawns'])} positions")

    # Visualize
    print("\n=== Tilemap Visualization ===")
    print(
        "Legend: _ = empty, . = pacdot, | = wall, o = powerpellet, c = chomp, x = echo"
    )
    for row in modified_tilemap:
        print("".join(row))
