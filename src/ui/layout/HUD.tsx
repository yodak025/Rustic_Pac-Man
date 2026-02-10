'use client'

import GameStatus from "@/types/gameStatus";
import InGameMenu from "@/ui/layout/InGameMenu";
import DebugBar from "@/ui/layout/DebugBar";
import MazeViewer from "@/ui/layout/MazeViewer";
import LivesDisplay from "@/ui/common/LivesDisplay";
import GameStats from "@/ui/common/GameStats";
import DeathScreen from "@/ui/pages/DeathScreen";
import { useEffect } from "react";
import { usePacmanHotState, useGameHotState, useMazeHotState } from "@state/useHotState";
import useDebugConfigStore from "@/state/useDebugConfigStore";
import { useGameWorldContext } from "@core/contexts/GameWorldContext";


const HUD = () => {
  const { pauseGame } = useGameWorldContext();
  const gameState = useGameHotState();
  const lives = usePacmanHotState().health;
  const mazeState = useMazeHotState();

  const { debug } = useDebugConfigStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && gameState.status === GameStatus.PLAYING) {
        pauseGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pauseGame, gameState.status]);

  return (
    <>
      <div className="fixed top-5 left-5  right-5 z-50 p-4">
        <div className="absolute top-4 left-4">
          <LivesDisplay lives={lives} />
        </div>
        <div className="absolute top-4 right-4">
          <GameStats 
            level={gameState.level} 
            score={gameState.score} 
            currentPacDots={mazeState.pacDotsCollected}
            totalPacDots={mazeState.pacDotsTotal}
          />
        </div>
      </div>
      
      {debug && <DebugBar />}
      {debug && <MazeViewer />}

      {gameState.status === GameStatus.PAUSED && <InGameMenu />}
      {gameState.status === GameStatus.LOST && <DeathScreen />}
    </>
  );
};

export default HUD;
