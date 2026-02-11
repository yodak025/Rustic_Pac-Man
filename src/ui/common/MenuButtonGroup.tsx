import React from 'react'
import Button from '@/ui/components/Button'

export interface MenuButtonGroupProps {
  onPlay?: () => void
  onRestart?: () => void
  onMainMenu?: () => void
  onContinue?: () => void
  onDebug?: () => void
  playLabel?: string
  restartLabel?: string
  mainMenuLabel?: string
  continueLabel?: string
  debugLabel?: string
  className?: string
}

const MenuButtonGroup: React.FC<MenuButtonGroupProps> = ({ 
  onPlay,
  onRestart,
  onMainMenu,
  onContinue,
  onDebug,
  playLabel = 'PLAY',
  restartLabel = 'RESTART GAME',
  mainMenuLabel = 'MAIN MENU',
  continueLabel = 'CONTINUE PLAYING',
  debugLabel = 'DEBUG',
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-4 w-64 mx-auto ${className}`}>
      {onContinue && (
        <Button onClick={onContinue}>
          {continueLabel}
        </Button>
      )}
      
      {onPlay && (
        <Button onClick={onPlay}>
          {playLabel}
        </Button>
      )}
      
      {onRestart && (
        <Button onClick={onRestart}>
          {restartLabel}
        </Button>
      )}
      
      {onMainMenu && (
        <Button onClick={onMainMenu}>
          {mainMenuLabel}
        </Button>
      )}
      
      {onDebug && (
        <Button onClick={onDebug}>
          {debugLabel}
        </Button>
      )}
    </div>
  );
};

export default MenuButtonGroup;
