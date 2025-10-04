import { loadPyodide, type PyodideInterface } from "pyodide";

// Singleton para mantener una única instancia de Pyodide
let pyodideInstance: PyodideInterface | null = null;
let isInitializing = false;
let initializationPromise: Promise<PyodideInterface> | null = null;

/**
 * Inicializa Pyodide y carga todos los archivos Python necesarios
 */
async function initializePyodide(): Promise<PyodideInterface> {
  // Si ya está inicializando, esperar a que termine
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  // Si ya está inicializado, retornar la instancia
  if (pyodideInstance) {
    return pyodideInstance;
  }

  isInitializing = true;

  initializationPromise = (async () => {
    console.log("Inicializando Pyodide...");
    const pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.6/full/",
    });

    console.log("Cargando paquete numpy...");
    await pyodide.loadPackage("numpy");

    console.log("Cargando archivos del generador de laberintos...");

    // Cargar todos los archivos Python necesarios
    const pythonFiles = await Promise.all([
      fetch("/src/maze-gen/directions.py").then((r) => r.text()),
      fetch("/src/maze-gen/cell.py").then((r) => r.text()),
      fetch("/src/maze-gen/reset.py").then((r) => r.text()),
      fetch("/src/maze-gen/gen.py").then((r) => r.text()),
      fetch("/src/maze-gen/get_tiles.py").then((r) => r.text()),
      fetch("/src/maze-gen/is_desirable.py").then((r) => r.text()),
      fetch("/src/maze-gen/tunnels.py").then((r) => r.text()),
      fetch("/src/maze-gen/maze.py").then((r) => r.text()),
    ]);

    const [directions, cell, reset, gen, getTiles, isDesirable, tunnels, maze] =
      pythonFiles;

    // Escribir los archivos en el sistema de archivos virtual de Pyodide
    pyodide.FS.writeFile("directions.py", directions);
    pyodide.FS.writeFile("cell.py", cell);
    pyodide.FS.writeFile("reset.py", reset);
    pyodide.FS.writeFile("gen.py", gen);
    pyodide.FS.writeFile("get_tiles.py", getTiles);
    pyodide.FS.writeFile("is_desirable.py", isDesirable);
    pyodide.FS.writeFile("tunnels.py", tunnels);
    pyodide.FS.writeFile("maze.py", maze);

    console.log("Todos los archivos Python cargados correctamente");

    pyodideInstance = pyodide;
    isInitializing = false;
    return pyodide;
  })();

  return initializationPromise;
}

/**
 * Genera un nuevo laberinto usando el generador Python
 * @param rows Número de filas (default: 9)
 * @param cols Número de columnas (default: 5)
 * @param maxFigureSize Tamaño máximo de figura (default: 5)
 * @returns Array 2D con los tiles del laberinto
 */
export async function generateMaze(
  rows: number = 9,
  cols: number = 5,
  maxFigureSize: number = 5
): Promise<number[][]> {
  try {
    const pyodide = await initializePyodide();

    console.log(`Generando laberinto ${rows}x${cols}...`);

    // Ejecutar el código Python para generar el laberinto
    const result = await pyodide.runPythonAsync(`
      from maze import create_maze
      import json

      # Generar el laberinto
      maze_array = create_maze(${rows}, ${cols}, ${maxFigureSize})

      # Convertir a lista de Python para serializar
      maze_list = maze_array.tolist()

      # Retornar como JSON
      json.dumps(maze_list)
          `);

    // Parsear el resultado JSON
    const mazeData: number[][] = JSON.parse(result as string);

    console.log("Laberinto generado exitosamente");
    return mazeData;
  } catch (error) {
    console.error("Error al generar el laberinto:", error);
    throw new Error(`Error al generar el laberinto: ${error}`);
  }
}

/**
 * Libera la instancia de Pyodide (útil para limpieza)
 */
export function cleanupPyodide(): void {
  if (pyodideInstance) {
    pyodideInstance = null;
    initializationPromise = null;
    isInitializing = false;
    console.log("Instancia de Pyodide liberada");
  }
}

/**
 * Verifica si Pyodide está inicializado
 */
export function isPyodideReady(): boolean {
  return pyodideInstance !== null;
}
