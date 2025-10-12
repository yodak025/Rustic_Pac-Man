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
import useDebugConfigStore from "@/state/useDebugConfigStore";


const HUD = () => {
  const { level, score, status, setPauseStatus } = useGameStatusStore(
    (state) => state
  );
  const lives = usePacmanStore((state) => state.pacman.components.health.value);
  const {total: pdt, current:pdc} = useMazeState((state) => state.maze.info.pacDots)

  const { debug } = useDebugConfigStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPauseStatus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setPauseStatus]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-black text-yellow-400 font-bold text-lg border-b-2 border-blue-500">
        <LivesDisplay lives={lives} />
        <GameStats 
          level={level} 
          score={score} 
          currentPacDots={pdc}
          totalPacDots={pdt}
        />
      </div>
      {debug && <DebugBar />}
      {debug && <MazeViewer />}

      {status === gameStatusValue.PAUSED && <InGameMenu />}
    </>
  );
};

export default HUD;
