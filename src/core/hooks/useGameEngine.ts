import { useEffect, useRef, useState, useMemo } from 'react'
import type { PyodideInterface } from 'pyodide'
import { RusticGameEngine } from '@core/engine'
import type { GameWorldContextValue } from '@core/contexts/GameWorldContext'

interface UseGameEngineReturn {
  engine: RusticGameEngine | null
  isReady: boolean
  contextValue: GameWorldContextValue
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
      console.log('[useGameEngine] Initializing RusticGameEngine...')
      engineRef.current = new RusticGameEngine(pyodide)
      // Note: Do NOT call start() here - game loop starts when beginGame() is called
      console.log('[useGameEngine] RusticGameEngine initialized')
      setIsReady(true)
    } catch (error) {
      console.error('[useGameEngine] Failed to initialize game engine:', error)
      setIsReady(false)
    }
  }, [pyodide])

  // Create context value with engine commands
  const contextValue = useMemo<GameWorldContextValue>(() => ({
    gameWorld: engineRef.current?.getGameWorld() ?? null,
    startNewGame: () => engineRef.current?.startNewGame() ?? Promise.resolve(),
    beginGame: () => engineRef.current?.beginGame(),
    pauseGame: () => engineRef.current?.pauseGame(),
    resumeGame: () => engineRef.current?.resumeGame(),
    restartGame: () => engineRef.current?.restartGame() ?? Promise.resolve(),
    exitToMenu: () => engineRef.current?.exitToMenu(),
  }), [isReady])

  return {
    engine: engineRef.current,
    isReady,
    contextValue,
  }
}
