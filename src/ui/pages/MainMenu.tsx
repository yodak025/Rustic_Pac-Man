'use client'

import React from 'react';
import useAppStateStore from '@/state/useAppStateStore';
import PageTitle from '@/ui/components/PageTitle';
import Button from '@/ui/components/Button';
import { VersionInfo } from '@/ui/components';

const MainMenu: React.FC = () => {
  const { goToGame, goToTutorial, goToDebugMazeAnalyzer, goToDebugSettings } = useAppStateStore();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] text-[var(--color-text-light)]">
      <VersionInfo />
      <PageTitle>RUSTIC PAC-MAN</PageTitle>
      
      <div className="flex flex-col gap-4">
        <Button onClick={goToGame}>
          PLAY
        </Button>

        <Button onClick={goToTutorial} variant="secondary">
          TUTORIAL
        </Button>

        <Button onClick={goToDebugMazeAnalyzer} variant="success">
          MAZE GENERATION
        </Button>

        <Button onClick={goToDebugSettings} variant="secondary">
          DEBUG SETTINGS
        </Button>
      </div>
    </div>
  );
};

export default MainMenu;