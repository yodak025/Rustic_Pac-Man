"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import GameScene from "@/scenes/GameScene";
import AppView from "@custom-types/appView";
import useAppStateStore from "@/state/useAppStateStore";
import { usePyodide, useGameEngine } from "@core/hooks";
import { GameWorldProvider } from "@core/contexts/GameWorldContext";
import MainMenu from "@/ui/pages/MainMenu";
import MazeTilemapAnalyzer from "@/ui/pages/MazeTilemapAnalyzer";
import DebugSettings from "@/ui/pages/DebugSettings";
import TutorialPage from "@/ui/pages/TutorialPage";
import HUD from "@ui/layout/HUD";
import LoadingScreen from "@/ui/common/LoadingScreen";

export default function GameApp() {
  const {
    view,
    setPyodideReady,
    setEngineReady,
    goToMainMenu,
    showGameCanvas,
    isLevelTransition,
    setIsLevelTransition,
    isRestarting,
    setIsRestarting,
  } = useAppStateStore();

  const { pyodide, error: pyodideError } = usePyodide();

  const { contextValue, isReady: engineReady } = useGameEngine(pyodide);

  const gameInitializedRef = useRef(false);
  const assetsLoadedRef = useRef(false);

  // Update app state when Pyodide loads
  useEffect(() => {
    if (pyodide) {
      setPyodideReady(true);
      goToMainMenu();
    }
  }, [pyodide, setPyodideReady, goToMainMenu]);

  // Update app state when engine is ready
  useEffect(() => {
    if (engineReady) {
      setEngineReady(true);
    }
  }, [engineReady, setEngineReady]);

  // When view changes to LOADING_GAME, start loading the game core or next level
  useEffect(() => {
    if (view === AppView.LOADING_GAME) {
      if (isLevelTransition) {
        // Level transition - load next level
        console.log("[GameApp] Loading next level...");
        assetsLoadedRef.current = false;
        contextValue
          .loadNextLevel(false)
          .then(() => {
            console.log("[GameApp] Next level loaded, waiting for assets...");
            setIsLevelTransition(false);
          })
          .catch((error: Error) => {
            console.error("[GameApp] Failed to load next level:", error);
            setIsLevelTransition(false);
          });
      } else if (isRestarting) {
        // Restart current level - reload from scratch
        console.log("[GameApp] Restarting level...");
        assetsLoadedRef.current = false;
        contextValue
          .restartGame()
          .then(() => {
            console.log("[GameApp] Level restarted, waiting for assets...");
            setIsRestarting(false);
          })
          .catch((error: Error) => {
            console.error("[GameApp] Failed to restart level:", error);
            setIsRestarting(false);
          });
      } else if (!gameInitializedRef.current) {
        // New game - load from scratch
        gameInitializedRef.current = true;
        assetsLoadedRef.current = false;

        console.log("[GameApp] Starting new game...");
        contextValue
          .startNewGame()
          .then(() => {
            console.log("[GameApp] Core loaded, starting game...");
            contextValue.beginGame();
            console.log("[GameApp] Game started, showing canvas... ");
            showGameCanvas();
          })
          .catch((error: Error) => {
            console.error("[GameApp] Failed to start new game:", error);
          });
      }
    }
  }, [
    view,
    contextValue,
    isLevelTransition,
    setIsLevelTransition,
    isRestarting,
    setIsRestarting,
    showGameCanvas,
  ]);

  // Reset refs when leaving game canvas
  useEffect(() => {
    if (view !== AppView.LOADING_GAME && view !== AppView.GAME_CANVAS) {
      gameInitializedRef.current = false;
      assetsLoadedRef.current = false;
    }
  }, [view]);

  const sceneLayout = useMemo(() => {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <HUD />
        <Canvas
          className="z-0"
          style={{
            height: "100vh",
            background: "var(--color-background)",
          }}
        >
          <Suspense>
            <GameScene />
          </Suspense>
        </Canvas>
      </Suspense>
    );
  }, []);

  if (pyodideError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl text-[var(--color-alert)] mb-4">
            Failed to load game engine
          </h1>
          <p className="text-[var(--color-text-body)]">
            {pyodideError.message}
          </p>
        </div>
      </div>
    );
  }

  // Wrap entire app with GameWorldContext provider
  return (
    <GameWorldProvider value={contextValue}>
      {(() => {
        switch (view) {
          case AppView.LOADING_PYODIDE:
            return <LoadingScreen />;

          case AppView.MAIN_MENU:
            return <MainMenu />;

          case AppView.DEBUG_MAZE_ANALYZER:
            return <MazeTilemapAnalyzer />;

          case AppView.DEBUG_SETTINGS:
            return <DebugSettings />;

          case AppView.TUTORIAL:
            return <TutorialPage />;

          case AppView.LOADING_GAME:
            return (
              <>
                <LoadingScreen />
              </>
            );

          case AppView.GAME_CANVAS:
            return sceneLayout;

          default:
            throw new Error(`Unknown app view: ${view}`);
        }
      })()}
    </GameWorldProvider>
  );
}
