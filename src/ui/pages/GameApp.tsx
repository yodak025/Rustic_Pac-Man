"use client";

import { useEffect } from "react";
import AppView from "@custom-types/appView";
import useAppStateStore from "@/state/useAppStateStore";
import { usePyodide } from "@core/hooks";
import Game from "@/scenes/Game";
import MainMenu from "@/ui/pages/MainMenu";
import MazeTilemapAnalyzer from "@/ui/pages/MazeTilemapAnalyzer";
import TutorialPage from "@/ui/pages/TutorialPage";
import LoadingScreen from "@/ui/common/LoadingScreen";

export default function GameApp() {
  const { view, setPyodideReady, goToMainMenu } = useAppStateStore();

  const { pyodide, error: pyodideError } = usePyodide();

  useEffect(() => {
    if (pyodide) {
      setPyodideReady(true);
      goToMainMenu();
    }
  }, [pyodide, setPyodideReady, goToMainMenu]);

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

  switch (view) {
    case AppView.LOADING_PYODIDE:
      return <LoadingScreen />;

    case AppView.MAIN_MENU:
      return <MainMenu />;

    case AppView.DEBUG_MAZE_ANALYZER:
      return <MazeTilemapAnalyzer />;

    case AppView.TUTORIAL:
      return <TutorialPage />;

    case AppView.LOADING_GAME:
    case AppView.GAME_CANVAS:
      // pyodide is guaranteed non-null here: LOADING_GAME is only reached
      // after pyodide loads and goToMainMenu() is called.
      return <Game pyodide={pyodide!} />;

    default:
      throw new Error(`Unknown app view: ${view}`);
  }
}
