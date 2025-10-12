import React from 'react';
import useGameStatusStore from '@/state/useGameStatusStore';
import PageTitle from '@/ui/components/PageTitle';
import Button from '@/ui/components/Button';
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-400">
      <PageTitle>RUSTIC PAC-MAN</PageTitle>
      
      <div className="flex flex-col gap-4">
        <Button
          onClick={handlePlay}
          className="px-8 py-4 text-xl border-4 shadow-2xl shadow-yellow-400/50"
        >
          PLAY
        </Button>

        <Button
          onClick={game.setDebugMazeAnalyzerStatus}
          variant = "success"
          className="px-8 py-4 text-xl border-4 shadow-2xl shadow-green-400/50"
        >
          MAZE GENERATION
        </Button>

        <Button
          onClick={handleDebugSettings}
          variant="secondary"
          className="px-8 py-4 text-xl border-4 shadow-2xl shadow-blue-400/50"
        >
          DEBUG SETTINGS
        </Button>
      </div>
    </div>
  );
};

export default MainMenu;