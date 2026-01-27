import { useEffect, useRef, useState } from 'react'
import type { PyodideInterface } from 'pyodide'
import { RusticGameEngine } from '@core/engine'

interface UseGameEngineReturn {
  engine: RusticGameEngine | null
  isReady: boolean
}

export function useGameEngine(pyodide: PyodideInterface | null): UseGameEngineReturn {
  const engineRef = useRef<RusticGameEngine | null>(null)
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    if (!pyodide) {
      return
    }

    if (engineRef.current) {
      setIsReady(true)
      return
    }

    try {
      console.log('Initializing RusticGameEngine...')
      engineRef.current = new RusticGameEngine(pyodide)
      engineRef.current.start()
      console.log('RusticGameEngine started successfully')
      setIsReady(true)
    } catch (error) {
      console.error('Failed to initialize game engine:', error)
      setIsReady(false)
    }
  }, [pyodide])

  return {
    engine: engineRef.current,
    isReady,
  }
}
