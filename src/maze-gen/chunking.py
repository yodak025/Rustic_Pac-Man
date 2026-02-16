import logging
import random
from typing import List

from config_schema import MazeConfig

# Configure logging
logger = logging.getLogger(__name__)


class Chunk:
    """
    Represents a vertical chunk within a layer of the giant maze.
    
    A chunk is a contiguous vertical section of a layer. Multiple chunks
    within the same layer are NOT connected horizontally - navigation between
    them requires moving to adjacent layers via horizontal tunnels.
    """
    
    # Chunking probability constants
    SINGLE_CHUNK_PROBABILITY = 0.3
    TWO_CHUNKS_PROBABILITY = 0.5
    # THREE_CHUNKS_PROBABILITY = 0.2 (implicit: 1 - SINGLE - TWO)
    
    def __init__(
        self,
        layer_id: int,
        chunk_id: int,
        start_row: int,
        end_row: int,
        cols: int
    ):
        """
        Initialize a chunk.
        
        Args:
            layer_id: Index of the layer this chunk belongs to (0-based)
            chunk_id: Index of this chunk within the layer (0-based, top to bottom)
            start_row: Starting row index (inclusive, 0-based)
            end_row: Ending row index (exclusive, 0-based)
            cols: Number of columns (width) in cells
        """
        self.layer_id = layer_id
        self.chunk_id = chunk_id
        self.start_row = start_row
        self.end_row = end_row
        self.rows = end_row - start_row
        self.cols = cols
        # Tunnels are stored as lists since a chunk can have multiple connections
        self.left_tunnels: List[int] = []  # List of row positions for left tunnels
        self.right_tunnels: List[int] = []  # List of row positions for right tunnels
    
    def __repr__(self) -> str:
        return (
            f"Chunk(layer={self.layer_id}, id={self.chunk_id}, "
            f"rows={self.start_row}-{self.end_row}, "
            f"left_tunnels={self.left_tunnels}, right_tunnels={self.right_tunnels})"
        )


def chunk_layer_iterative(
    layer_id: int,
    total_rows: int,
    cols: int,
    min_chunk_size: int,
    max_chunks: int
) -> List[Chunk]:
    """
    Divide a layer into vertical chunks using iterative probabilistic algorithm.
    
    Algorithm:
    1. Decide number of chunks (1, 2, or 3) based on probabilities
    2. If 1 chunk: entire layer is a single chunk
    3. If 2+ chunks: iteratively divide remaining space
    
    Args:
        layer_id: Index of the layer (0-based)
        total_rows: Total number of rows in the layer
        cols: Number of columns in the layer
        min_chunk_size: Minimum chunk height in cells
        max_chunks: Maximum chunks per layer (typically 3)
    
    Returns:
        List of Chunk objects for this layer
    """
    # Determine number of chunks probabilistically
    rand = random.random()
    if rand < Chunk.SINGLE_CHUNK_PROBABILITY:
        num_chunks = 1
    elif rand < Chunk.SINGLE_CHUNK_PROBABILITY + Chunk.TWO_CHUNKS_PROBABILITY:
        num_chunks = 2
    else:
        num_chunks = 3
    
    # Cap at max_chunks
    num_chunks = min(num_chunks, max_chunks)
    
    # Validate we can fit num_chunks with min_chunk_size
    if num_chunks * min_chunk_size > total_rows:
        logger.warning(
            f"Layer {layer_id}: Cannot fit {num_chunks} chunks with "
            f"min_chunk_size={min_chunk_size}. Reducing to {total_rows // min_chunk_size} chunks."
        )
        num_chunks = max(1, total_rows // min_chunk_size)
    
    logger.debug(f"Layer {layer_id}: Generating {num_chunks} chunk(s)")
    
    # Single chunk case
    if num_chunks == 1:
        chunk = Chunk(
            layer_id=layer_id,
            chunk_id=0,
            start_row=0,
            end_row=total_rows,
            cols=cols
        )
        return [chunk]
    
    # Multiple chunks: iterative division
    chunks = []
    remaining_rows = total_rows
    current_start = 0
    
    for i in range(num_chunks):
        is_last = (i == num_chunks - 1)
        
        if is_last:
            # Last chunk takes all remaining rows
            chunk_rows = remaining_rows
        else:
            # Non-last chunk: random size between min and max available
            chunks_left = num_chunks - i
            max_available = remaining_rows - (chunks_left - 1) * min_chunk_size
            chunk_rows = random.randint(min_chunk_size, max_available)
        
        chunk = Chunk(
            layer_id=layer_id,
            chunk_id=i,
            start_row=current_start,
            end_row=current_start + chunk_rows,
            cols=cols
        )
        chunks.append(chunk)
        
        logger.debug(f"  Chunk {i}: rows {current_start}-{current_start + chunk_rows} (height={chunk_rows})")
        
        current_start += chunk_rows
        remaining_rows -= chunk_rows
    
    return chunks


def generate_chunk_map(config: MazeConfig) -> List[List[Chunk]]:
    """
    Generate complete chunk map for all layers in the giant maze.
    
    Args:
        config: MazeConfig object with maze parameters
    
    Returns:
        List of lists: chunk_map[layer_id] = [Chunk, Chunk, ...]
    """
    chunk_map = []
    
    logger.info(
        f"Generating chunk map for {config.num_layers} layers, "
        f"{config.layer_rows}×{config.layer_cols} cells each"
    )
    
    for layer_id in range(config.num_layers):
        chunks = chunk_layer_iterative(
            layer_id=layer_id,
            total_rows=config.layer_rows,
            cols=config.layer_cols,
            min_chunk_size=config.min_chunk_size,
            max_chunks=config.max_chunks_per_layer
        )
        chunk_map.append(chunks)
        logger.info(f"Layer {layer_id}: {len(chunks)} chunk(s)")
    
    return chunk_map


if __name__ == '__main__':
    # Configure logging for testing
    logging.basicConfig(level=logging.DEBUG, format='%(levelname)s: %(message)s')
    
    # Test configuration
    test_config = MazeConfig({
        'dimensions': {
            'num_layers': 4,
            'layer_rows': 36,
            'layer_cols': 5
        },
        'chunking': {
            'min_chunk_size': 8,
            'max_chunks_per_layer': 3
        }
    })
    
    print("=== Testing Chunking System ===")
    print(f"Config: {test_config.num_layers} layers, {test_config.layer_rows}×{test_config.layer_cols} cells")
    print(f"Min chunk size: {test_config.min_chunk_size}, Max chunks: {test_config.max_chunks_per_layer}")
    print(f"Probabilities: 1-chunk={Chunk.SINGLE_CHUNK_PROBABILITY}, 2-chunk={Chunk.TWO_CHUNKS_PROBABILITY}")
    print()
    
    # Run 100 iterations to verify distribution
    chunk_count_distribution = {1: 0, 2: 0, 3: 0}
    
    for iteration in range(100):
        chunk_map = generate_chunk_map(test_config)
        
        # Count chunk distribution across all layers
        for layer_chunks in chunk_map:
            num_chunks = len(layer_chunks)
            chunk_count_distribution[num_chunks] += 1
    
    print("\n=== Distribution Results (400 layers total across 100 iterations) ===")
    total_layers = sum(chunk_count_distribution.values())
    for num_chunks, count in sorted(chunk_count_distribution.items()):
        percentage = (count / total_layers) * 100
        print(f"{num_chunks} chunk(s): {count}/{total_layers} ({percentage:.1f}%)")
    
    print("\n=== Sample Generation ===")
    sample_map = generate_chunk_map(test_config)
    for layer_id, chunks in enumerate(sample_map):
        print(f"\nLayer {layer_id}:")
        for chunk in chunks:
            print(f"  {chunk}")
