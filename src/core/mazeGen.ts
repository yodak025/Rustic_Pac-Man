import type { PyodideInterface } from "pyodide";

/**
 * Generates a new giant maze using the Python generator.
 * Giant mazes consist of multiple horizontally-connected layers with asymmetric tunnels.
 * @param pyodide Already initialized PyodideInterface instance
 * @param maxFigureSize Maximum figure size (default: 5)
 * @param initRow Initial row for first layer tunnel connection (default: 2)
 * @param finalRow Final row for last layer tunnel connection (default: 11)
 * @returns 2D array with maze tiles
 */
export async function generateMaze(
  pyodide: PyodideInterface,
  maxFigureSize: number = 5,
  initRow: number = 2,
  finalRow: number = 11
): Promise<number[][]> {
  try {
    console.log('Generating giant maze...');

    const result = await pyodide.runPythonAsync(`
      from maze import create_rustic_giant_maze
      import json

      # Generate giant maze with asymmetric layers
      maze_array = create_rustic_giant_maze(${maxFigureSize}, ${initRow}, ${finalRow})

      # Convert to Python list for serialization
      maze_list = maze_array.tolist()

      # Return as JSON
      json.dumps(maze_list)
    `);

    const mazeData: number[][] = JSON.parse(result as string);

    console.log("Giant maze generated successfully");
    return mazeData;
  } catch (error) {
    console.error("Error generating giant maze:", error);
    throw new Error(`Error generating giant maze: ${error}`);
  }
}

