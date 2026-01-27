'use client'
import { useEffect, useState } from 'react'
import type { PyodideInterface } from 'pyodide'

let pyodideInstance: PyodideInterface | null = null
let isInitializing = false
let initializationPromise: Promise<PyodideInterface> | null = null

async function loadPyodideInstance(): Promise<PyodideInterface> {
  if (isInitializing && initializationPromise) {
    return initializationPromise
  }

  if (pyodideInstance) {
    return pyodideInstance
  }

  isInitializing = true

  initializationPromise = (async () => {
    console.log('Loading Pyodide runtime...')

    // Importación dinámica correcta de pyodide (no usar next/dynamic para módulos no-React)
    const { loadPyodide } = await import('pyodide')

    const pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.2/full/',
    })

    console.log('Loading numpy package...')
    await pyodide.loadPackage('numpy')

    console.log('Loading maze generator Python files...')

    const pythonFiles = await Promise.all([
      fetch('/api/maze-gen/directions.py').then((r) => r.text()),
      fetch('/api/maze-gen/cell.py').then((r) => r.text()),
      fetch('/api/maze-gen/reset.py').then((r) => r.text()),
      fetch('/api/maze-gen/gen.py').then((r) => r.text()),
      fetch('/api/maze-gen/get_tiles.py').then((r) => r.text()),
      fetch('/api/maze-gen/is_desirable.py').then((r) => r.text()),
      fetch('/api/maze-gen/tunnels.py').then((r) => r.text()),
      fetch('/api/maze-gen/maze.py').then((r) => r.text()),
    ])

    const [directions, cell, reset, gen, getTiles, isDesirable, tunnels, maze] =
      pythonFiles

    pyodide.FS.writeFile('directions.py', directions)
    pyodide.FS.writeFile('cell.py', cell)
    pyodide.FS.writeFile('reset.py', reset)
    pyodide.FS.writeFile('gen.py', gen)
    pyodide.FS.writeFile('get_tiles.py', getTiles)
    pyodide.FS.writeFile('is_desirable.py', isDesirable)
    pyodide.FS.writeFile('tunnels.py', tunnels)
    pyodide.FS.writeFile('maze.py', maze)

    console.log('Pyodide initialized successfully')

    pyodideInstance = pyodide
    isInitializing = false
    return pyodide
  })()

  return initializationPromise
}

/**
 * Cleanup function to release Pyodide instance
 */
function cleanupPyodide(): void {
  if (pyodideInstance) {
    pyodideInstance = null
    initializationPromise = null
    isInitializing = false
    console.log('Pyodide instance released')
  }
}

interface UsePyodideReturn {
  pyodide: PyodideInterface | null
  isLoading: boolean
  error: Error | null
}

export function usePyodide(): UsePyodideReturn {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadPyodideInstance()
      .then((instance) => {
        setPyodide(instance)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load Pyodide:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      })

    return () => {
      cleanupPyodide()
    }
  }, [])

  return { pyodide, isLoading, error }
}
