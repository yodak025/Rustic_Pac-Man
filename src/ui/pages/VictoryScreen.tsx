'use client'

import React from 'react'
import Modal from '@/ui/common/Modal'
import MenuButtonGroup from '@/ui/common/MenuButtonGroup'
import ScoreAnimator from '@/ui/common/ScoreAnimator'
import { useGameWorldContext } from '@core/contexts/GameWorldContext'
import useAppStateStore from '@/state/useAppStateStore'
import { useGameHotState, usePacmanHotState } from '@state/useHotState'
import { useWorldColors } from '@core/hooks/useWorldColors'

const LEVEL_BONUS = 1000

const VictoryScreen: React.FC = () => {
  const { startNextLevel, startRestartLevel, exitToMenu } = useGameWorldContext()
  const { goToMainMenu } = useAppStateStore()
  const gameState = useGameHotState()
  const lives = usePacmanHotState().health
  const { worldName } = useWorldColors()

  const handleNextLevel = () => {
    startNextLevel()
  }

  const handleMainMenu = () => {
    exitToMenu()
    goToMainMenu()
  }

  // Score before bonus was added
  const scoreBeforeBonus = gameState.score - LEVEL_BONUS

  return (
    <Modal isOpen={true} title="LEVEL COMPLETE" className="w-3xl">
      <div className="flex flex-col items-center gap-6">
        {/* Level Info */}
        <div className="text-center font-mono">
          <div className="text-2xl text-[var(--color-text-main)] mb-2">
            Level {gameState.level}
            {worldName && (
              <span className="text-[var(--color-accent)] ml-2">({worldName})</span>
            )}
          </div>
          <div className="text-lg text-[var(--color-text-body)]">
            Lives: {lives}
          </div>
        </div>

        {/* Animated Score */}
        <ScoreAnimator 
          initialScore={scoreBeforeBonus}
          bonus={LEVEL_BONUS}
          className="my-4"
        />

        {/* Buttons */}
        <MenuButtonGroup
          onContinue={handleNextLevel}
          onRestart={startRestartLevel}
          onMainMenu={handleMainMenu}
          continueLabel="NEXT LEVEL"
          restartLabel="RESTART"
          mainMenuLabel="MAIN MENU"
        />
      </div>
    </Modal>
  )
}

export default VictoryScreen
