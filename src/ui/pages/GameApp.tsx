'use client'

import GameScene from "@/scenes/GameScene"
import { useGameStatusStore } from "@state/store"
import gameStatusValue from "@custom-types/gameStatusValue"
import { Canvas } from "@react-three/fiber"
import MainMenu from "@/ui/pages/MainMenu"
import MazeTilemapAnalyzer from "@/ui/pages/MazeTilemapAnalyzer"
import DebugSettings from "@/ui/pages/DebugSettings"
import DeathScreen from "@/ui/pages/DeathScreen"
import TutorialPage from "@/ui/pages/TutorialPage"
import HUD from "@ui/layout/HUD"
import LoadingScreen from "@/ui/common/LoadingScreen"
import { Suspense, useMemo } from "react"

export default function GameApp() {
  const { status: gameStatus } = useGameStatusStore((state) => state)

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

  switch (gameStatus) {
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
