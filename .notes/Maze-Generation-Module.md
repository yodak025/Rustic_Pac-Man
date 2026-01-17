---
title: "Maze Generation Module"
generated_by: agent
date: 2025-11-10
version: 1.0
---

# Maze Generation Module

## Summary

The maze generation module is a Python-based procedural generation system that creates symmetric, Pac-Man-style mazes represented as tilemaps. It implements a figure-based algorithm inspired by [Shaun LeBron's work](https://shaunlebron.github.io/pacman-mazegen/), adapted to generate playable arcade-style mazes with controlled geometry, tunnels, and a ghost house (Echoes Chamber). The module operates as a self-contained process that takes dimension parameters and returns a 2D integer array representing the complete maze tilemap.

---

## 1. Overview

### Purpose
This module generates procedural Pac-Man mazes that adhere to classic design constraints while introducing variability through randomized figure placement. It produces tilemaps suitable for rendering in a game environment, with paths, walls, power pellets, and special zones (ghost house) properly positioned.

### Context
The module is designed to run within Pyodide in the Rustic Pac-Man project, but can also execute standalone via command-line. It serves as the level generation backend, providing the spatial structure for gameplay. The generated tilemaps are consumed by the game's rendering and logic systems.

### Boundaries
- **Generates**: Maze structure (cell connectivity, wall patterns, tunnels)
- **Does not handle**: Game logic, entity behavior, rendering, or real-time modifications
- **Output format**: 2D NumPy array of integers representing tile types

---

## 2. Architecture & Structure

### Directory Layout
```
src/maze-gen/
├── maze.py              # Main entry point and orchestrator
├── cell.py              # Cell class and array factory
├── directions.py        # Direction constants (UP, RIGHT, DOWN, LEFT)
├── reset.py             # Cell array initialization and linking
├── gen.py               # Figure-based cell connection generator
├── get_tiles.py         # Cell-to-tilemap conversion
├── is_desirable.py      # Maze validation and 2x2 figure handling
├── tunnels.py           # Tunnel candidate detection and selection
└── tests/               # Unit tests for core components
    ├── test_cell.py
    ├── test_gen.py
    └── test_reset.py
```

### Key Modules

#### `maze.py` - Orchestrator
Main entry point that coordinates the generation pipeline. Contains:
- `create_maze(rows=9, cols=5, max_figure_size=5)`: Public API that returns a tilemap
- `_echoes_chamber_cells()`: Manually creates ghost house structure
- `_set_echoes_chamber_door_tiles()`: Places ghost house door tiles
- Generation loop with validation and retry logic

#### `cell.py` - Data Model
Defines the `Cell` class representing individual maze cells with:
- **Position**: `x` (column), `y` (row), `id` (unique identifier)
- **Connections**: `is_connected_at` dict mapping directions to boolean connectivity
- **References**: `next` dict pointing to adjacent cells
- **Generation metadata**: `is_filled`, `seq`, `group_seq`
- **Tunnel markers**: Multiple boolean flags for tunnel candidates

Factory function `create_cell_array(rows, cols)` initializes a 2D NumPy array of cells.

#### `gen.py` - Figure-Based Generator (CellConnectionsGenerator)
Core algorithm that creates cell connectivity patterns through a figure-based approach. Generates "figures" (groups of connected cells) that define wall structures:
- Iterates column-by-column (left to right) filling empty cells
- Groups cells into figures with controlled sizes (1-5 cells)
- Creates variety through L-shaped figures and "long legs"
- Ensures geometric constraints (no sharp turns, proper wall thickness)

#### `reset.py` - Initialization
Prepares cell arrays for generation:
- `_link_cells()`: Establishes neighbor references between adjacent cells
- `reset()`: Resets cell state and optionally applies manual connections

#### `is_desirable.py` - Validation
Validates generated cell maps against design rules:
- Prevents outward connections at corner cells
- Detects and handles 2x2 cell figures
- Rejects configurations that would create problematic symmetry

#### `tunnels.py` - Tunnel Generator (TunnelsGenerator)
Identifies and selects tunnel positions on the maze edges:
- Categorizes potential tunnel cells (void, single dead-end, double dead-end, edge)
- Prioritizes cleaner tunnel configurations
- Validates tunnel paths don't intersect vertical corridors
- Currently generates 1 tunnel (designed for future multi-tunnel support)

#### `get_tiles.py` - Tilemap Conversion
Converts cell connectivity graph to visual tilemap representation:
- Expands cells into 3x3 tile regions
- Generates symmetric maze (left-right mirror)
- Places paths where cell groups change
- Adds walls adjacent to paths
- Randomly places 2 power pellets (upper/lower distribution)
- Applies manual tile modifications via callback

---

## 3. Algorithm Explanation

### Theoretical Overview

The maze generation follows a multi-stage pipeline that progressively refines a cell-based graph into a playable tilemap:

**Stage 1: Cell Graph Generation (Figure-Based Algorithm)**

The core innovation is the "figure-based" approach, where cells are grouped into "figures" that represent simplified wall structures. The algorithm operates on only **half the maze** (right side), with symmetry applied later.

1. **Column-by-column progression**: Starting from the leftmost column, find unfilled cells
2. **Figure initialization**: Select a random unfilled cell as the "first cell" and "center cell" of a new figure
3. **Figure growth**: Iteratively connect adjacent cells following these rules:
   - A cell can only grow into an empty neighbor if its left neighbor is already filled
   - This ensures proper wall thickness and prevents isolated paths
   - Growth direction is randomized among valid options
   - Probabilistic stopping based on current figure size (larger figures less likely to grow)
4. **Special patterns**:
   - **L-shaped figures**: At size 2, may extend with a perpendicular "leg" to create L-shapes
   - **Long legs**: Figures of size 3-4 may add an extra protruding cell for variety
5. **Recentering**: If center cell has no valid neighbors, shift center to newest cell
6. **Figure completion**: When no growth is possible or probability triggers stop, close the figure

The algorithm produces a cell graph where:
- Cells within a figure share a `group_seq` number
- Connections define which cells are linked (will become paths in tilemap)
- Wall structures emerge from figure boundaries

**Stage 2: Desirability Check**

Validates the cell graph doesn't contain problematic patterns:
- Corner cells must not connect outward (would break symmetry)
- 2x2 cell blocks are detected and internally connected to prevent visual artifacts

**Stage 3: Tunnel Generation**

Analyzes the rightmost column to find suitable tunnel exit points:
- **Void tunnels**: Cells already connected right with clean upper neighbor (best)
- **Dead-end tunnels**: Isolated cells that can be opened (good)
- **Edge tunnels**: Generic boundary cells (acceptable)
- Selects one tunnel randomly from available candidates
- Validates no vertical paths cross the tunnel horizontally

**Stage 4: Tilemap Expansion**

Converts the abstract cell graph into a concrete tilemap:
1. Each cell expands into a 3x3 tile region
2. Paths are drawn where:
   - Cell group boundaries exist (different `group_seq`)
   - Cells have explicit connections
3. Walls (`|`) are placed adjacent to any path tile
4. Symmetric mirroring creates the full maze from the half-maze
5. Power pellets randomly placed in path tiles
6. Manual modifications (ghost house door) applied

**Stage 5: Numeric Encoding**

String tiles converted to integers:
- `.` → `0` (path with dot)
- `|` → `1` (wall)
- `o` → `2` (power pellet)
- `_` → `-2` (void/empty)
- `h` → `-3` (ghost house)
- `d` → `-4` (ghost house door)

---

## 4. Usage & Examples

### Basic Usage (Standalone)

```python
from maze import create_maze

# Generate default 9x5 maze
maze_tilemap = create_maze()
# Returns: numpy.ndarray of shape (29, 32) with integer tile values

# Custom dimensions
maze_tilemap = create_maze(rows=9, cols=5, max_figure_size=5)
```

### Command-Line Execution

```bash
python src/maze-gen/maze.py
```

This runs the `__main__` block, which:
1. Generates a maze with default parameters
2. Converts integer tiles back to string representation
3. Prints the maze to stdout

### Integration via Pyodide

The module is loaded in `src/core/mazeGen.ts` which:
1. Initializes Pyodide with NumPy
2. Loads all `.py` files into virtual filesystem
3. Calls `create_maze()` via `runPythonAsync()`
4. Returns JSON-serialized tilemap

```typescript
import { generateMaze } from '@/core/mazeGen';

const tilemap = await generateMaze(9, 5, 5);
// Returns: number[][] - 2D array ready for game consumption
```

### Tile Type Reference

| Value | Symbol | Meaning |
|-------|--------|---------|
| `0`   | `.`    | Path with pac-dot |
| `1`   | `\|`   | Wall |
| `2`   | `o`    | Power pellet |
| `-2`  | `_`    | Void (unused) |
| `-3`  | `h`    | Ghost house (Echoes Chamber) |
| `-4`  | `d`    | Ghost house door |

---

## 5. Modification & Extension

### Configuration Parameters

Key constants in `gen.py` (CellConnectionsGenerator):

```python
MAX_FIGURE_SIZE: int = 5              # Maximum cells in a figure
MAX_RECENTER_SIZE: int = 2            # Size threshold for recentering
MAX_CENTRAL_FIGURE_SIZE: int = 3      # Max size for center column figures
MAX_LONG_FIGURES: int = 1             # Limit on long leg extensions
SINGLE_CELL_JOIN_PROB: float = 0.35   # Probability of border attachment
```

These control figure generation behavior and variety. Future plans include exposing these as function parameters.

### Extension Points

1. **Ghost House Customization** (`maze.py`):
   - Modify `_echoes_chamber_cells()` to change structure
   - Currently hardcoded at position `3 * cols`
   - Future: Randomize position and shape

2. **Tunnel Count** (`tunnels.py`):
   - `_choose_tunnels()` contains TODO for 2-tunnel generation
   - Requires distributing tunnels (top/bottom halves)
   - Candidate lists already segregated (`_top_*`, `_bottom_*`)

3. **Power Pellet Placement** (`get_tiles.py`):
   - Currently: 2 pellets, 1 upper + 1 lower
   - Extract placement logic to separate function
   - Make count and distribution configurable

4. **Tile Encoding** (`maze.py`):
   - `tile_map` dict defines string-to-int mapping
   - Add new tile types by extending this dictionary
   - Update `get_tiles()` to generate new symbols

### Seeded Generation

`CellConnectionsGenerator` accepts optional `seed` parameter:

```python
generator = CellConnectionsGenerator(cells, max_figure_size, seed=12345)
```

This enables reproducible maze generation for testing or sharing.

---

## 6. Dependencies & Interactions

### External Dependencies
- **NumPy**: Array operations, cell storage, tilemap manipulation
- **Python 3.10+**: Type hints, modern syntax
- **logging**: Extensive debug/info logging throughout

### Internal Dependencies
```
maze.py
  ├─> cell.py (create_cell_array)
  ├─> reset.py (reset)
  ├─> gen.py (CellConnectionsGenerator)
  ├─> is_desirable.py (is_desirable)
  ├─> tunnels.py (TunnelsGenerator)
  └─> get_tiles.py (get_tiles)

All modules depend on:
  └─> directions.py (UP, RIGHT, DOWN, LEFT constants)
```

### Data Contracts

**Input**: `create_maze(rows: int, cols: int, max_figure_size: int)`
- `rows`: Number of cell rows (typical: 9)
- `cols`: Number of cell columns (typical: 5)
- `max_figure_size`: Max cells per figure (typical: 5)

**Output**: `numpy.ndarray[int]`
- Shape: `(rows * 3 + 2, cols * 3 * 2)` approximately
- Values: Integer tile codes (see Tile Type Reference)
- Symmetric: Left and right halves are mirrors

---

## 7. Constraints, Invariants & Warnings

### Design Constraints (LeBron-inspired)
- **Symmetric levels**: Maze mirrors across vertical center axis
- **1-tile thick paths**: No wide corridors
- **No sharp turns**: Paths don't bend 90° immediately
- **No dead ends**: All paths loop or connect (except tunnels)
- **Wall shapes**: Only I, L, T, or + configurations allowed
- **Wall thickness**: Non-rectangular walls are 2 tiles thick

### Runtime Constraints
- **Retry loop**: `create_maze()` regenerates until valid maze found
  - Can theoretically loop indefinitely with bad parameters
  - Typical convergence: 1-5 attempts
- **Logging level**: 
  - `INFO` for production (minimal output)
  - `DEBUG` for development (verbose step-by-step)

### Known Limitations
1. **Ghost house position**: Fixed location, not randomized
2. **Tunnel count**: Only 1 tunnel currently generated
3. **Power pellet placement**: Simple random, may cluster
4. **Magic numbers**: Tile expansion coefficients in `get_tiles.py` are opaque
5. **2x2 figures**: Must not appear at center column (enforced by `is_desirable`)

### Parameter Constraints
- **Minimum size**: `rows >= 3`, `cols >= 3` (untested below this)
- **Typical size**: `rows=9`, `cols=5` (default, well-tested)
- **Maximum size**: Limited by memory and generation time
- **max_figure_size**: Range `[1, 5]`, other values may break assumptions

### Warnings
- Modifying `L_SHAPE_TRIGERRING_SIZE` in `gen.py` affects L-shape logic
- Changing expansion coefficients in `get_tiles.py` will break symmetry
- Top/bottom tunnel conditions in `tunnels.py` are hardcoded for 9-row mazes

---

## 8. Assumptions & Gaps

### Assumptions Made
1. **Coordinate system**: Assumed `x` = horizontal (column), `y` = vertical (row)
   - Comments in code confirm: "Axis 0 = rows = i = y = vertical"
2. **Symmetry axis**: Left edge (column 0) is center of symmetric output
3. **Pyodide context**: Module runs in isolated environment with NumPy available
4. **Single-threaded**: No concurrency considerations needed

### Gaps & Uncertainties
1. **Expansion math**: The 3x expansion and offset-by-2 logic in `get_tiles.py` lacks clear documentation of why these specific values
2. **Desirability criteria**: Full rationale for rejecting certain patterns not documented beyond code comments
3. **Probability tuning**: No documentation on how `GROW_PROB_AT_SIZE` values were derived
4. **Future refactoring**: Multiple `[SHIT CODE]` and `[HARD CODED]` markers indicate planned improvements not yet scoped

### Areas for Human Review
- Validate typical maze generation time and memory usage
- Confirm intended behavior for edge cases (very small/large mazes)
- Review if tunnel generation should always succeed or allow tunnel-free mazes
- Clarify roadmap for exposing configuration parameters as API surface

---

## 9. References

### Algorithm Origin
Based on **Shaun LeBron's Pac-Man Maze Generator**:
- Original work: https://shaunlebron.github.io/pacman-mazegen/
- This implementation adapts the figure-based approach to Python
- Adds tunnels, ghost house, and symmetric tilemap generation

### Related Documentation
- Global project architecture: See project `README.md`
- Game logic integration: See `src/core/mazeGen.ts` (Pyodide wrapper)
- State management: See `src/state/useMazeStore.ts` (game state consumer)

---

## 10. Checklist / Review Notes

**Documentation Completeness:**
- [x] Algorithm theory clearly explained (figure-based approach)
- [x] All module files documented with purpose
- [x] Usage examples provided (standalone, Pyodide, CLI)
- [x] Tile encoding reference table included
- [x] Extension points identified
- [x] Dependencies and data contracts specified
- [x] Design constraints from LeBron enumerated
- [x] Known limitations flagged
- [x] Assumptions and gaps explicitly stated

**Technical Accuracy:**
- [x] File paths verified against workspace structure
- [x] Function signatures match source code
- [x] Tile value mappings confirmed
- [x] Integration flow with TypeScript described
- [ ] Performance characteristics (not measured, flagged as gap)
- [ ] Edge case behavior (minimal testing exists)

**Clarity:**
- [x] Non-technical summary provided
- [x] Multi-stage algorithm broken down step-by-step
- [x] Visual/conceptual examples (tile symbols, tree structure)
- [x] Warnings highlighted for modification hazards

**Omissions by Design:**
- Integration details (covered by global docs)
- Coordinate system internals (marked as non-essential)
- Magic number origins (acknowledged as gap)
- Technical debt markers (not end-user concern)
