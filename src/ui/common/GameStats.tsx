import React from 'react'
import GlassPanel from '@/ui/components/GlassPanel'

export interface GameStatsProps {
  level: number
  score: number
  currentPacDots?: number
  totalPacDots?: number
  className?: string
}

const GameStats: React.FC<GameStatsProps> = ({
  level,
  score,
  currentPacDots,
  totalPacDots,
  className = ''
}) => {
  return (
    <GlassPanel 
      variant="medium" 
      insetShadow="md"
      className={`flex gap-6 p-2 text-[var(--color-text-main)] font-mono text-lg ${className}`}
    >
      <div>Nivel: {level}</div>
      {currentPacDots !== undefined && totalPacDots !== undefined && (
        <div>PacDots: {`${currentPacDots}/${totalPacDots}`}</div>
      )}
      <div>Puntuación: {score}</div>
    </GlassPanel>
  )
}

export default GameStats
