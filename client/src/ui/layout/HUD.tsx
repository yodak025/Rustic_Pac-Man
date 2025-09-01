import { useGameStatusStore } from "@state/store";
import useMazeState from "@/state/useMazeStore";
import gameStatusValue from "@/types/gameStatusValue";
import InGameMenu from "@ui/components/InGameMenu";
import DebugBar from "@ui/components/DebugBar";
import MazeViewer from "@/ui/components/MazeViewer";
import { useEffect } from "react";
import usePacmanStore from "@state/usePacmanStore";
import ConfigManager from "@services/configManager";


const HUD = () => {
  const { level, score, status, setPauseStatus } = useGameStatusStore(
    (state) => state
  );
  const lives = usePacmanStore((state) => state.pacman.components.health.value);
  const {total: pdt, current:pdc} = useMazeState((state) => state.maze.info.pacdots)

  const debugConfig = new ConfigManager().getDebugConfig();

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
        <div className="flex items-center gap-2">
          <span>Vidas:</span>
          <div className="flex gap-1 bg-black">
            {Array.from({ length: lives }, (_, index) => (
              <span key={index} className="text-red-500">
                ❤️
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-6 bg-black">
          <div>Nivel: {level}</div>
          <div>PacDots: {`${pdc}/${pdt}`}</div>
        </div>
      </div>
      {debugConfig.debug && <DebugBar />}
      {debugConfig.debug && <MazeViewer />}

      {status === gameStatusValue.PAUSED && <InGameMenu />}
    </>
  );
};

export default HUD;
