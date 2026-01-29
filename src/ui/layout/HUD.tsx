'use client'

import { USE_ECS_PACMAN } from "@config/featureFlags";
import { useGameStatusStore } from "@state/store";
import useMazeState from "@/state/useMazeStore";
import gameStatusValue from "@/types/gameStatusValue";
import InGameMenu from "@/ui/layout/InGameMenu";
import DebugBar from "@/ui/layout/DebugBar";
import MazeViewer from "@/ui/layout/MazeViewer";
import LivesDisplay from "@/ui/common/LivesDisplay";
import GameStats from "@/ui/common/GameStats";
import { useEffect } from "react";
import usePacmanStore from "@state/usePacmanStore";
import { usePacmanHotState } from "@state/useHotState";
import useDebugConfigStore from "@/state/useDebugConfigStore";


const HUD = () => {
  const { level, score, status, setPauseStatus, setGameOverStatus } = useGameStatusStore(
    (state) => state
  );
  
  // Get lives from appropriate source based on flag
  const lives = USE_ECS_PACMAN 
    ? usePacmanHotState().health
    : usePacmanStore((state) => state.pacman.components.health.value);
    
  const {total: pdt, current:pdc} = useMazeState((state) => state.maze.info.pacDots)

  const { debug } = useDebugConfigStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPauseStatus();
      }
      if (event.key.toLowerCase() === "n") {
        const isWin = true;
        setGameOverStatus(isWin);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setPauseStatus, setGameOverStatus]);

  return (
    <>
          <div className="fixed top-5 left-5  right-5 z-50 p-4">
            <div className="absolute top-4 left-4">
              <LivesDisplay lives={lives} />
            </div>
            <div className="absolute top-4 right-4">
              <GameStats 
                level={level} 
                score={score} 
                currentPacDots={pdc}
                totalPacDots={pdt}
              />
            </div>
          </div>      {debug && <DebugBar />}
      {debug && <MazeViewer />}

      {status === gameStatusValue.PAUSED && <InGameMenu />}
    </>
  );
};

export default HUD;
