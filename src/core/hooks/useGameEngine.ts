import { useEffect, useRef, useState, useMemo } from "react";
import type { PyodideInterface } from "pyodide";
import { RusticGameEngine } from "@core/engine";
import type { GameWorldContextValue } from "@core/contexts/GameWorldContext";
import useAppStateStore from "@/state/useAppStateStore";
import AppView from "@custom-types/appView";

interface UseGameEngineReturn {
  engine: RusticGameEngine | null;
  isReady: boolean;
  contextValue: GameWorldContextValue;
}

export function useGameEngine(
  pyodide: PyodideInterface | null,
): UseGameEngineReturn {
  const engineRef = useRef<RusticGameEngine | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (!pyodide) {
      return;
    }
    if (engineRef.current) {
      setIsReady(true);
      return;
    }

    try {
      console.log("[useGameEngine] Initializing RusticGameEngine...");
      engineRef.current = new RusticGameEngine(pyodide);
      // Note: Do NOT call start() here - game loop starts when beginGame() is called
      console.log("[useGameEngine] RusticGameEngine initialized");
      setIsReady(true);
    } catch (error) {
      console.error("[useGameEngine] Failed to initialize game engine:", error);
      setIsReady(false);
    }

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [pyodide]);

  // Create context value with engine commands
  const contextValue = useMemo<GameWorldContextValue>(
    () => ({
      gameWorld: engineRef.current?.getGameWorld() ?? null,
      startNewGame: () =>
        engineRef.current?.startNewGame() ?? Promise.resolve(),
      beginGame: () => engineRef.current?.beginGame(),
      pauseGame: () => engineRef.current?.pauseGame(),
      resumeGame: () => engineRef.current?.resumeGame(),
      restartGame: () => engineRef.current?.restartGame() ?? Promise.resolve(),
      startRestartLevel: () => {
        // Mark as restarting and trigger transition to LOADING_GAME view
        useAppStateStore.getState().setIsRestarting(true);
        useAppStateStore.getState().setView(AppView.LOADING_GAME);
      },
      exitToMenu: () => engineRef.current?.exitToMenu(),
      startNextLevel: () => {
        // Mark as level transition and trigger transition to LOADING_GAME view
        useAppStateStore.getState().setIsLevelTransition(true);
        useAppStateStore.getState().setView(AppView.LOADING_GAME);
      },
      loadNextLevel: (autoStart: boolean) =>
        engineRef.current?.loadNextLevel(autoStart) ?? Promise.resolve(),
    }),
    [],
  );

  return {
    engine: engineRef.current,
    isReady,
    contextValue,
  };
}
