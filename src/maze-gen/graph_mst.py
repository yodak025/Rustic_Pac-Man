#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Graph construction and Minimum Spanning Tree (MST) generation for chunk connectivity.
Ensures all chunks are reachable by building a graph over chunks and applying MST.
"""

import logging
import random
from typing import List, Tuple, Set, Dict, Optional

from chunking import Chunk

# Configure logging
logger = logging.getLogger(__name__)


class ChunkGraph:
    """
    Graph representation of chunks and their potential connections.

    Nodes: Individual chunks
    Edges: Potential horizontal tunnels between chunks in adjacent layers
    """

    def __init__(self, chunk_map: List[List[Chunk]]):
        """
        Initialize graph from chunk map.

        Args:
            chunk_map: List of lists where chunk_map[layer_id] = [Chunk, ...]
        """
        self.chunk_map = chunk_map
        self.num_layers = len(chunk_map)
        self.edges: List[
            Tuple[Chunk, Chunk, int]
        ] = []  # (chunk_left, chunk_right, weight)

        self._build_graph()

    def _chunks_overlap(self, chunk1: Chunk, chunk2: Chunk) -> bool:
        """
        Check if two chunks overlap vertically (share at least one row).

        Args:
            chunk1: First chunk
            chunk2: Second chunk

        Returns:
            True if chunks overlap in their row ranges, False otherwise
        """
        overlap_start = max(chunk1.start_row, chunk2.start_row)
        overlap_end = min(chunk1.end_row, chunk2.end_row)
        return overlap_start < overlap_end

    def _build_graph(self):
        """
        Build graph by creating edges between chunks in horizontally adjacent layers.

        Edge rules:
        - Only connect chunks between layer_i and layer_{i+1}
        - Only create edge if chunks physically overlap vertically
        - Edge weight is random (for MST variety)
        """
        logger.info(f"Building chunk graph for {self.num_layers} layers")

        for layer_id in range(self.num_layers - 1):
            left_chunks = self.chunk_map[layer_id]
            right_chunks = self.chunk_map[layer_id + 1]

            edges_created = 0

            # Create edges only between overlapping chunks in adjacent layers
            for left_chunk in left_chunks:
                for right_chunk in right_chunks:
                    # Check if chunks overlap vertically
                    if self._chunks_overlap(left_chunk, right_chunk):
                        # Random weight for MST variety (1-100)
                        weight = random.randint(1, 100)
                        edge = (left_chunk, right_chunk, weight)
                        self.edges.append(edge)
                        edges_created += 1

            logger.debug(
                f"Layer {layer_id} → {layer_id + 1}: "
                f"{edges_created} edges created (from {len(left_chunks)} × {len(right_chunks)} chunk pairs)"
            )

        logger.info(f"Graph built with {len(self.edges)} total edges")

    def get_all_chunks(self) -> List[Chunk]:
        """Get flat list of all chunks across all layers."""
        all_chunks = []
        for layer_chunks in self.chunk_map:
            all_chunks.extend(layer_chunks)
        return all_chunks


class UnionFind:
    """
    Union-Find (Disjoint Set Union) data structure for Kruskal's MST algorithm.
    Supports efficient union and find operations with path compression and union by rank.
    """

    def __init__(self, elements: List[Chunk]):
        """
        Initialize Union-Find with each chunk in its own set.

        Args:
            elements: List of all chunks
        """
        self.parent: Dict[Chunk, Chunk] = {chunk: chunk for chunk in elements}
        self.rank: Dict[Chunk, int] = {chunk: 0 for chunk in elements}

    def find(self, chunk: Chunk) -> Chunk:
        """
        Find the root/representative of the set containing chunk.
        Uses path compression for efficiency.

        Args:
            chunk: The chunk to find

        Returns:
            Root chunk of the set
        """
        if self.parent[chunk] != chunk:
            # Path compression: make chunk point directly to root
            self.parent[chunk] = self.find(self.parent[chunk])
        return self.parent[chunk]

    def union(self, chunk1: Chunk, chunk2: Chunk) -> bool:
        """
        Unite the sets containing chunk1 and chunk2.
        Uses union by rank for efficiency.

        Args:
            chunk1: First chunk
            chunk2: Second chunk

        Returns:
            True if chunks were in different sets (union performed), False otherwise
        """
        root1 = self.find(chunk1)
        root2 = self.find(chunk2)

        if root1 == root2:
            return False  # Already in same set

        # Union by rank: attach smaller tree under root of larger tree
        if self.rank[root1] < self.rank[root2]:
            self.parent[root1] = root2
        elif self.rank[root1] > self.rank[root2]:
            self.parent[root2] = root1
        else:
            self.parent[root2] = root1
            self.rank[root1] += 1

        return True


def kruskal_mst(graph: ChunkGraph) -> List[Tuple[Chunk, Chunk]]:
    """
    Compute Minimum Spanning Tree using Kruskal's algorithm.

    Algorithm:
    1. Sort edges by weight
    2. Iterate through edges in ascending weight order
    3. Add edge to MST if it connects two different components
    4. Stop when all chunks are connected

    Args:
        graph: ChunkGraph with edges

    Returns:
        List of MST edges as (chunk_left, chunk_right) tuples
    """
    logger.info("Computing MST using Kruskal's algorithm")

    # Sort edges by weight (ascending)
    sorted_edges = sorted(graph.edges, key=lambda e: e[2])

    # Initialize Union-Find
    all_chunks = graph.get_all_chunks()
    uf = UnionFind(all_chunks)

    mst_edges = []

    for left_chunk, right_chunk, weight in sorted_edges:
        # Try to add edge to MST
        if uf.union(left_chunk, right_chunk):
            mst_edges.append((left_chunk, right_chunk))
            logger.debug(
                f"MST edge: Layer {left_chunk.layer_id} Chunk {left_chunk.chunk_id} ↔ "
                f"Layer {right_chunk.layer_id} Chunk {right_chunk.chunk_id} (weight={weight})"
            )

        # Early termination: MST has n-1 edges for n nodes
        if len(mst_edges) == len(all_chunks) - 1:
            break

    logger.info(f"MST computed with {len(mst_edges)} edges")

    return mst_edges


def assign_tunnel_positions(
    mst_edges: List[Tuple[Chunk, Chunk]], chunk_map: List[List[Chunk]]
) -> None:
    """
    Assign tunnel positions to chunks based on MST edges.

    For each MST edge between two chunks:
    1. Calculate relative offset: offset = right_chunk_id - left_chunk_id
       - Each chunk adds 1 cell (3 tiles) of vertical offset due to get_tiles() borders
       - Positive offset: right chunk appears shifted DOWN
       - Negative offset: right chunk appears shifted UP
    2. Adjust overlap range to account for this offset
    3. Select random row within adjusted overlap for tunnel
    4. Append tunnel position to left_tunnels and right_tunnels lists

    Modifies chunks in-place.

    Args:
        mst_edges: List of MST edges (chunk_left, chunk_right)
        chunk_map: Original chunk map (for reference)

    Raises:
        ValueError: If chunks don't overlap after offset adjustment
    """
    logger.info(
        "Assigning tunnel positions based on MST with relative offset correction"
    )

    for left_chunk, right_chunk in mst_edges:
        # Calculate RELATIVE offset between the two chunks
        # Each chunk index difference adds 1 cell (3 tiles) of vertical offset
        # offset = right_chunk_id - left_chunk_id
        #   Positive: right chunk shifted DOWN relative to left
        #   Negative: right chunk shifted UP relative to left
        #   Zero: aligned
        offset = right_chunk.chunk_id - left_chunk.chunk_id

        # Find overlapping row range with offset applied to right chunk
        # From left chunk's perspective, right chunk's actual position is (right.row + offset)
        overlap_start = max(left_chunk.start_row, right_chunk.start_row + offset)
        overlap_end = min(left_chunk.end_row, right_chunk.end_row + offset)

        if overlap_start >= overlap_end:
            raise ValueError(
                f"No overlap between chunks after relative offset correction: "
                f"Layer {left_chunk.layer_id} Chunk {left_chunk.chunk_id} "
                f"(rows {left_chunk.start_row}-{left_chunk.end_row}) and "
                f"Layer {right_chunk.layer_id} Chunk {right_chunk.chunk_id} "
                f"(rows {right_chunk.start_row}-{right_chunk.end_row}, relative_offset={offset})"
            )

        # Select random tunnel position within adjusted overlap (in left chunk's coordinate space)
        tunnel_y_left = random.randint(overlap_start, overlap_end - 1)

        # For left chunk: use tunnel_y_left as is
        left_chunk.right_tunnels.append(tunnel_y_left)

        # For right chunk: subtract offset to convert to right chunk's coordinate space
        tunnel_y_right = tunnel_y_left - offset
        right_chunk.left_tunnels.append(tunnel_y_right)

        logger.debug(
            f"Tunnel connection (relative_offset={offset:+d}): "
            f"Layer {left_chunk.layer_id} Chunk {left_chunk.chunk_id} row {tunnel_y_left} ↔ "
            f"Layer {right_chunk.layer_id} Chunk {right_chunk.chunk_id} row {tunnel_y_right}"
        )

    logger.info(
        "Tunnel positions assigned successfully with relative offset correction"
    )


def assign_entry_exit_tunnels(
    chunk_map: List[List[Chunk]],
    entry_position: Optional[int],
    exit_position: Optional[int],
) -> None:
    """
    Assign entry and exit tunnels to first and last layers.

    Entry tunnel: Left tunnel on first layer at specified position (or random if None)
    Exit tunnel: Right tunnel on last layer at specified position (or random if None)

    The function finds which chunk contains the specified position and adds the tunnel.

    Args:
        chunk_map: Chunk map with all chunks
        entry_position: Absolute row position for entry tunnel (None = random)
        exit_position: Absolute row position for exit tunnel (None = random)

    Modifies chunks in-place.
    """
    logger.info("Assigning entry and exit tunnels")

    if not chunk_map or not chunk_map[0]:
        logger.warning("No chunks to assign entry/exit tunnels")
        return

    # === ENTRY TUNNEL (First Layer) ===
    first_layer = chunk_map[0]

    if entry_position is not None:
        # Find chunk that contains entry_position
        entry_chunk = None
        for chunk in first_layer:
            if chunk.start_row <= entry_position < chunk.end_row:
                entry_chunk = chunk
                break

        if entry_chunk is None:
            raise ValueError(
                f"Entry position {entry_position} is outside layer range "
                f"(0-{first_layer[-1].end_row})"
            )

        entry_chunk.left_tunnels.append(entry_position)
        logger.info(
            f"Entry tunnel assigned: Layer 0 Chunk {entry_chunk.chunk_id} at row {entry_position}"
        )
    else:
        # Random entry position in a random chunk
        entry_chunk = random.choice(first_layer)
        random_row = random.randint(entry_chunk.start_row, entry_chunk.end_row - 1)
        entry_chunk.left_tunnels.append(random_row)
        logger.info(
            f"Entry tunnel assigned (random): Layer 0 Chunk {entry_chunk.chunk_id} at row {random_row}"
        )

    # === EXIT TUNNEL (Last Layer) ===
    last_layer = chunk_map[-1]
    last_layer_id = len(chunk_map) - 1

    if exit_position is not None:
        # Find chunk that contains exit_position
        exit_chunk = None
        for chunk in last_layer:
            if chunk.start_row <= exit_position < chunk.end_row:
                exit_chunk = chunk
                break

        if exit_chunk is None:
            raise ValueError(
                f"Exit position {exit_position} is outside layer range "
                f"(0-{last_layer[-1].end_row})"
            )

        exit_chunk.right_tunnels.append(exit_position)
        logger.info(
            f"Exit tunnel assigned: Layer {last_layer_id} Chunk {exit_chunk.chunk_id} "
            f"at row {exit_position}"
        )
    else:
        # Random exit position in a random chunk
        exit_chunk = random.choice(last_layer)
        random_row = random.randint(exit_chunk.start_row, exit_chunk.end_row - 1)
        exit_chunk.right_tunnels.append(random_row)
        logger.info(
            f"Exit tunnel assigned (random): Layer {last_layer_id} Chunk {exit_chunk.chunk_id} "
            f"at row {random_row}"
        )


def validate_navigability(chunk_map: List[List[Chunk]]) -> bool:
    """
    Validate that all chunks are reachable using BFS from the first chunk.

    IMPORTANT: Tunnel positions are in different coordinate spaces due to offset.
    Must apply relative offset when checking tunnel connections.

    Args:
        chunk_map: Chunk map with assigned tunnel positions

    Returns:
        True if all chunks are reachable, False otherwise
    """
    logger.info("Validating navigability with BFS (with offset correction)")

    # Get all chunks
    all_chunks = []
    for layer_chunks in chunk_map:
        all_chunks.extend(layer_chunks)

    if not all_chunks:
        logger.warning("No chunks to validate")
        return True

    # Build adjacency list from tunnel assignments
    adjacency: Dict[Chunk, List[Chunk]] = {chunk: [] for chunk in all_chunks}

    for layer_id in range(len(chunk_map) - 1):
        left_chunks = chunk_map[layer_id]
        right_chunks = chunk_map[layer_id + 1]

        for left_chunk in left_chunks:
            for right_chunk in right_chunks:
                # Calculate relative offset (same as in assign_tunnel_positions)
                offset = right_chunk.chunk_id - left_chunk.chunk_id

                # Check if there's any tunnel connecting these chunks
                # Tunnel positions are in different coordinate spaces, must apply offset
                for left_tunnel_y in left_chunk.right_tunnels:
                    # Convert left tunnel position to right chunk's coordinate space
                    # We subtract offset because tunnel_y_right = tunnel_y_left - offset
                    left_tunnel_in_right_space = left_tunnel_y - offset

                    if left_tunnel_in_right_space in right_chunk.left_tunnels:
                        adjacency[left_chunk].append(right_chunk)
                        adjacency[right_chunk].append(left_chunk)
                        logger.debug(
                            f"Connection found: Layer {left_chunk.layer_id} Chunk {left_chunk.chunk_id} "
                            f"row {left_tunnel_y} ↔ Layer {right_chunk.layer_id} Chunk {right_chunk.chunk_id} "
                            f"row {left_tunnel_in_right_space} (offset={offset:+d})"
                        )
                        # Only add connection once per chunk pair
                        break

    # BFS from first chunk
    start_chunk = all_chunks[0]
    visited: Set[Chunk] = {start_chunk}
    queue: List[Chunk] = [start_chunk]

    while queue:
        current = queue.pop(0)

        for neighbor in adjacency[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    # Check if all chunks were visited
    is_navigable = len(visited) == len(all_chunks)

    if is_navigable:
        logger.info(f"✓ All {len(all_chunks)} chunks are reachable")
    else:
        logger.error(
            f"✗ Only {len(visited)}/{len(all_chunks)} chunks reachable. "
            f"Maze is not fully navigable!"
        )

    return is_navigable


def generate_mst_and_assign_tunnels(
    chunk_map: List[List[Chunk]],
    entry_position: Optional[int] = None,
    exit_position: Optional[int] = None,
) -> bool:
    """
    Main function to generate MST and assign tunnel positions.

    Workflow:
    1. Build chunk graph (only overlapping chunks connected)
    2. Compute MST using Kruskal's algorithm
    3. Assign tunnel positions based on MST edges (with offset correction)
    4. Assign entry and exit tunnels
    5. Validate navigability with BFS

    Args:
        chunk_map: Chunk map from chunking.py
        entry_position: Optional row position for entry tunnel (first layer, left side)
        exit_position: Optional row position for exit tunnel (last layer, right side)

    Returns:
        True if navigable, False otherwise

    Raises:
        ValueError: If tunnel assignment fails (no overlap between chunks)
    """
    # Build graph
    graph = ChunkGraph(chunk_map)

    # Compute MST
    mst_edges = kruskal_mst(graph)

    # Assign tunnel positions with offset correction
    assign_tunnel_positions(mst_edges, chunk_map)

    # Assign entry and exit tunnels
    assign_entry_exit_tunnels(chunk_map, entry_position, exit_position)

    # Validate navigability
    is_navigable = validate_navigability(chunk_map)

    return is_navigable


if __name__ == "__main__":
    # Configure logging for testing
    logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s")

    from config_schema import MazeConfig
    from chunking import generate_chunk_map

    # Test configuration
    test_config = MazeConfig(
        {
            "dimensions": {"num_layers": 4, "layer_rows": 36, "layer_cols": 5},
            "chunking": {"min_chunk_size": 8, "max_chunks_per_layer": 3},
        }
    )

    print("=== Testing MST and Tunnel Assignment ===")
    print(
        f"Config: {test_config.num_layers} layers, {test_config.layer_rows}×{test_config.layer_cols} cells"
    )
    print()

    # Run 10 iterations to test reliability
    successes = 0
    for iteration in range(10):
        print(f"\n--- Iteration {iteration + 1} ---")

        # Generate chunk map
        chunk_map = generate_chunk_map(test_config)

        # Generate MST and assign tunnels
        try:
            is_navigable = generate_mst_and_assign_tunnels(chunk_map)
            if is_navigable:
                successes += 1
                print("✓ Success: Maze is navigable")
            else:
                print("✗ Failed: Maze is not navigable")
        except ValueError as e:
            print(f"✗ Error: {e}")

    print(f"\n=== Results: {successes}/10 iterations successful ===")

    # Show detailed example
    print("\n=== Detailed Example ===")
    chunk_map = generate_chunk_map(test_config)
    generate_mst_and_assign_tunnels(chunk_map)

    print("\nChunk details with tunnel assignments:")
    for layer_id, chunks in enumerate(chunk_map):
        print(f"\nLayer {layer_id}:")
        for chunk in chunks:
            print(f"  {chunk}")
