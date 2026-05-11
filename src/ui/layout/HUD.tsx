"use client";

import GameStatus from "@/types/gameStatus";
import InGameMenu from "@/ui/layout/InGameMenu";
import DebugBar from "@/ui/layout/DebugBar";
import MazeViewer from "@/ui/layout/MazeViewer";
import PlayerInGameInfo from "@/ui/common/PlayerInGameInfo";
import LevelInGameInfo from "@/ui/common/LevelInGameInfo";
import DeathScreen from "@/ui/pages/DeathScreen";
import VictoryScreen from "@/ui/pages/VictoryScreen";
import { useEffect } from "react";
import { usePacmanHotState, useGameHotState } from "@state/useHotState";
import useDebugConfigStore from "@/state/useDebugConfigStore";
import { useGameWorldContext } from "@core/contexts/GameWorldContext";
import { useWorldColors } from "@core/hooks/useWorldColors";

const HUD = () => {
  const { pauseGame, resumeGame } = useGameWorldContext();
  const gameState = useGameHotState();
  const pacman = usePacmanHotState();
  const { worldName } = useWorldColors();
  const { debug } = useDebugConfigStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (gameState.status === GameStatus.PLAYING) {
          pauseGame();
        } else if (gameState.status === GameStatus.PAUSED) {
          resumeGame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pauseGame, resumeGame, gameState.status]);

  return (
    <>
      {/* ── Top-right: level info ─────────────────────────────────────────────── */}
      <div className="fixed top-20 right-5 z-50">
        <LevelInGameInfo
          level={gameState.level}
          score={gameState.score}
          worldName={worldName}
        />
      </div>
      {/* ── Bottom-left: player info (lives, WNB, dash, medallions) ──────────── */}
      {gameState.status === GameStatus.PLAYING && (
        <div className="fixed top-20 left-20 z-50">
          <PlayerInGameInfo
            lives={pacman.health}
            wnbCount={pacman.wnbCount}
            dashEnergy={pacman.dashEnergy}
            dashMaxEnergy={pacman.dashMaxEnergy}
            isDashing={pacman.isDashing}
            medallionRack={pacman.medallionRack}
          />
        </div>
      )}
      {debug && <DebugBar />}
      {debug && <MazeViewer />}
      {gameState.status === GameStatus.PAUSED && <InGameMenu />}
      {gameState.status === GameStatus.LOST && <DeathScreen />}
      {gameState.status === GameStatus.WON && <VictoryScreen />}
    </>
  );
};

export default HUD;
