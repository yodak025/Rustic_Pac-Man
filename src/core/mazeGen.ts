import type { PyodideInterface } from "pyodide";

/**
 * Generates a new maze using the Python generator
 * @param pyodide Already initialized PyodideInterface instance
 * @param rows Number of rows (default: 9)
 * @param cols Number of columns (default: 5)
 * @param maxFigureSize Maximum figure size (default: 5)
 * @returns 2D array with maze tiles
 */
export async function generateMaze(
  pyodide: PyodideInterface,
  rows: number = 9,
  cols: number = 5,
  maxFigureSize: number = 5
): Promise<number[][]> {
  try {
    console.log(`Generating maze ${rows}x${cols}...`);

    const result = await pyodide.runPythonAsync(`
      from maze import create_maze
      import json

      # Generate maze
      maze_array = create_maze(${rows}, ${cols}, ${maxFigureSize})

      # Convert to Python list for serialization
      maze_list = maze_array.tolist()

      # Return as JSON
      json.dumps(maze_list)
    `);

    const mazeData: number[][] = JSON.parse(result as string);

    console.log("Maze generated successfully");
    return mazeData;
  } catch (error) {
    console.error("Error generating maze:", error);
    throw new Error(`Error generating maze: ${error}`);
  }
}

