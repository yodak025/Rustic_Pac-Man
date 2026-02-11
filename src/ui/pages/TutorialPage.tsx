'use client'

import React from 'react';
import useAppStateStore from '@/state/useAppStateStore';
import PageTitle from '@/ui/components/PageTitle';
import Button from '@/ui/components/Button';
import GameControlsDisplay from '@/ui/common/GameControlsDisplay';

const TutorialPage: React.FC = () => {
  const { goToMainMenu } = useAppStateStore();

  const handleBackToMainMenu = () => {
    goToMainMenu();
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-text-main)] p-8">
      <Button
        onClick={handleBackToMainMenu}
        variant="primary"
        className="absolute top-8 left-8"
      >
        BACK TO MAIN MENU
      </Button>

      {/* Main content wrapper: centered horizontally and vertically, 60% width */}
      <div className="flex flex-col items-center justify-center w-full max-w-[80vw] mx-auto flex-grow">
        <PageTitle size="medium">HOW TO PLAY</PageTitle>

        <div className="flex flex-col md:flex-row justify-center items-start gap-20 mt-12 w-full">
          {/* Controls Section - now using GameControlsDisplay */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-3xl font-bold text-[var(--color-accent)] font-mono mb-8">Controls</h2>
            <GameControlsDisplay />
          </div>

          {/* Rules Section */}
          <div className="flex flex-col items-center md:items-start max-w-[40vw]">
            <h2 className="text-3xl font-bold text-[var(--color-accent)] font-mono mb-8">Rules</h2>
            <ul className="list-none space-y-4 text-lg font-mono">
              <li>- Collect all the Pac-Dots in the level to win.</li>
              <li>- If a ghost catches Pac-Man, he will lose one live. The game ends if Pacman loses all of his lifes.</li>
              <li>- When Pacman collects a Power-Pellet, all ghosts gets frightened. Try to catch them before they reach the ghost home!</li>
              <li>- Be careful! even the dead ghost will frightened</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Warning Section */}
      <div className="w-full max-w-[80vw] mx-auto mb-8 p-6 bg-yellow-900/30 border-2 border-yellow-500 rounded-lg">
        <p className="text-center text-xl font-bold text-yellow-400 font-mono">
          ⚠️ DEVELOPMENT WARNING ⚠️
        </p>
        <p className="text-center text-lg text-yellow-300 font-mono mt-4">
          <strong>Known Bug:</strong> When starting the first level, ghosts may not load correctly and appear stuck with Pac-Man in the top-left corner outside the maze. 
          <br />
          <strong>Workaround:</strong> Press <span className="bg-yellow-700 px-2 py-1 rounded">ESC</span> to open the in-game menu, then click <strong>RESUME GAME</strong> to fix the issue.
        </p>
      </div>
    </div>
  );
};

export default TutorialPage;
