import React from 'react';
import useGameStatusStore from '@/state/useGameStatusStore';
import PageTitle from '@/ui/components/PageTitle';
import Button from '@/ui/components/Button';
import { VersionInfo } from '@/ui/components';
import gameStatusValue from '@/types/gameStatusValue';

const MainMenu: React.FC = () => {
  const game = useGameStatusStore((state) => state);
  
  const handlePlay = () => {
    game.setReadyToLoadStatus();
    console.log('Game status set to READY_TO_LOAD');
  };

  const handleDebugSettings = () => {
    useGameStatusStore.setState({ status: gameStatusValue.DEBUG_SETTINGS });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] text-[var(--color-text-light)]">
      <VersionInfo />
      <PageTitle>RUSTIC PAC-MAN</PageTitle>
      
      <div className="flex flex-col gap-4">
        <Button
          onClick={handlePlay}
        >
          PLAY
        </Button>

        <Button
          onClick={() => useGameStatusStore.setState({ status: gameStatusValue.TUTORIAL })}
          variant="secondary"
        >
          TUTORIAL
        </Button>

        <Button
          onClick={game.setDebugMazeAnalyzerStatus}
          variant = "success"
        >
          MAZE GENERATION
        </Button>

        <Button
          onClick={handleDebugSettings}
          variant="secondary"
        >
          DEBUG SETTINGS
        </Button>
      </div>
    </div>
  );
};

export default MainMenu;