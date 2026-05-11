"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { PyodideInterface } from "pyodide";

import Maze from "./meshes/maze/Maze";
import ChompMesh from "./meshes/entities/ChompMesh";
import HUD from "@ui/layout/HUD";
import LoadingScreen from "@/ui/common/LoadingScreen";
import { useWorldColors } from "@core/hooks/useWorldColors";
import { useGameEngine } from "@core/hooks";
import { GameWorldProvider } from "@core/contexts/GameWorldContext";
import useAppStateStore from "@/state/useAppStateStore";
import AppView from "@custom-types/appView";
import { useCameraControl } from "./hooks/useCameraControl";
import { useThree } from "@react-three/fiber";

// ── Inner 3D scene (must live inside Canvas) ──────────────────────────────────

function GameScene() {
  const { scene } = useThree();
  const { void: voidColor } = useWorldColors();

  useEffect(() => {
    scene.background = new THREE.Color(voidColor);
  }, [scene, voidColor]);

  useCameraControl();

  return (
    <>
      <ambientLight intensity={0.2} />
      <Maze />
      <ChompMesh />
    </>
  );
}

// ── Game orchestrator ─────────────────────────────────────────────────────────

interface GameSceneProps {
  pyodide: PyodideInterface;
}

export default function Game({ pyodide }: GameSceneProps) {
  const {
    view,
    setEngineReady,
    showGameCanvas,
    isLevelTransition,
    setIsLevelTransition,
    isRestarting,
    setIsRestarting,
  } = useAppStateStore();

  const { contextValue, isReady: engineReady } = useGameEngine(pyodide);

  const gameInitializedRef = useRef(false);

  // Propagate engine readiness to app store
  useEffect(() => {
    if (engineReady) {
      setEngineReady(true);
    }
  }, [engineReady, setEngineReady]);

  // Drive game loading based on current view.
  // engineReady guards against running before the engine is initialized:
  // Game mounts at the same time view becomes LOADING_GAME, so on the first
  // render engineRef.current is null. Without this guard, startNewGame()
  // resolves immediately (null → Promise.resolve()) and showGameCanvas() fires
  // before any maze is loaded.
  useEffect(() => {
    if (!engineReady || view !== AppView.LOADING_GAME) return;
    if (isLevelTransition) {
        console.log("[GameScene] Loading next level...");
        contextValue
          .loadNextLevel(false)
          .then(() => {
            console.log("[GameScene] Next level loaded, starting game...");
            contextValue.beginGame();
            console.log("[GameScene] Game started, showing canvas...");
            // Hack: keep LoadingScreen overlay up briefly so the Canvas has
            // time to render the first frames before we reveal it.
            setTimeout(() => {
              showGameCanvas();
              setIsLevelTransition(false);
            }, 500);
          })
          .catch((error: Error) => {
            console.error("[GameScene] Failed to load next level:", error);
            setIsLevelTransition(false);
          });
      } else if (isRestarting) {
        console.log("[GameScene] Restarting level...");
        contextValue
          .restartGame()
          .then(() => {
            console.log("[GameScene] Level restarted, showing canvas...");
            // Hack: keep LoadingScreen overlay up briefly so the Canvas has
            // time to render the first frames before we reveal it.
            setTimeout(() => {
              showGameCanvas();
              setIsRestarting(false);
            }, 500);
          })
          .catch((error: Error) => {
            console.error("[GameScene] Failed to restart level:", error);
            setIsRestarting(false);
          });
      } else if (!gameInitializedRef.current) {
        gameInitializedRef.current = true;

        console.log("[GameScene] Starting new game...");
      contextValue
        .startNewGame()
        .then(() => {
          console.log("[GameScene] Core loaded, starting game...");
          contextValue.beginGame();
          console.log("[GameScene] Game started, showing canvas...");
          // Hack: keep LoadingScreen overlay up briefly so the Canvas has
          // time to render the first frames before we reveal it.
          setTimeout(() => {
            showGameCanvas();
          }, 500);
        })
        .catch((error: Error) => {
          console.error("[GameScene] Failed to start new game:", error);
        });
    }
  }, [
    view,
    engineReady,
    contextValue,
    isLevelTransition,
    setIsLevelTransition,
    isRestarting,
    setIsRestarting,
    showGameCanvas,
  ]);

  return (
    <GameWorldProvider value={contextValue}>
      <HUD />
      <Canvas
        className="z-0"
        style={{
          height: "100vh",
          background: "var(--color-background)",
        }}
      >
        <GameScene />
      </Canvas>
      {view !== AppView.GAME_CANVAS && <LoadingScreen />}
    </GameWorldProvider>
  );
}
