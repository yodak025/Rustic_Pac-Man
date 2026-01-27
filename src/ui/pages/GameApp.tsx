'use client'

import { useEffect, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import GameScene from "@/scenes/GameScene"
import { useGameStatusStore } from "@state/store"
import gameStatusValue from "@custom-types/gameStatusValue"
import { usePyodide, useGameEngine } from "@core/hooks"
import MainMenu from "@/ui/pages/MainMenu"
import MazeTilemapAnalyzer from "@/ui/pages/MazeTilemapAnalyzer"
import DebugSettings from "@/ui/pages/DebugSettings"
import DeathScreen from "@/ui/pages/DeathScreen"
import TutorialPage from "@/ui/pages/TutorialPage"
import HUD from "@ui/layout/HUD"
import LoadingScreen from "@/ui/common/LoadingScreen"

export default function GameApp() {
  const { status: gameStatus, setNotStartedStatus } = useGameStatusStore((state) => state)
  
  const { pyodide, error: pyodideError } = usePyodide()
  
  useGameEngine(pyodide)

  useEffect(() => {
    if (pyodide && gameStatus === gameStatusValue.INITIAL_LOADING) {
      setNotStartedStatus()
    }
  }, [pyodide, gameStatus, setNotStartedStatus])

  const sceneLayout = useMemo(() => {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <HUD />
        <Canvas
          className="z-0"
          style={{ 
            height: "100vh",
            background: "var(--color-background)"
          }}
        >
          <Suspense>
            <GameScene />
          </Suspense>
        </Canvas>
      </Suspense>
    )
  }, [])

  if (pyodideError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl text-[var(--color-alert-error)] mb-4">
            Failed to load game engine
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            {pyodideError.message}
          </p>
        </div>
      </div>
    )
  }

  switch (gameStatus) {
    case gameStatusValue.INITIAL_LOADING:
      return <LoadingScreen />

    case gameStatusValue.NOT_STARTED:
      return <MainMenu />

    case gameStatusValue.DEBUG_MAZE_ANALYZER:
      return <MazeTilemapAnalyzer />

    case gameStatusValue.DEBUG_SETTINGS:
      return <DebugSettings />

    case gameStatusValue.TUTORIAL:
      return <TutorialPage />

    case gameStatusValue.READY_TO_LOAD:
    case gameStatusValue.LOADING_CORE:
    case gameStatusValue.WON:
    case gameStatusValue.RESTARTING:
      return <LoadingScreen />

    case gameStatusValue.PLAYING:
    case gameStatusValue.PAUSED:
    case gameStatusValue.CORE_LOADED:
    case gameStatusValue.LOADING_GRAPHICS:
    case gameStatusValue.GRAPHICS_LOADED:
      return sceneLayout

    case gameStatusValue.LOST:
      return <DeathScreen />

    default:
      throw new Error(`Unknown game status: ${gameStatus}`)
  }
}
