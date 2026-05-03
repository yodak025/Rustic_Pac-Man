import React from 'react'
import GlassPanel from '@/ui/components/GlassPanel'

export interface LevelInGameInfoProps {
  level: number
  score: number
  worldName?: string
  className?: string
}

const LevelInGameInfo: React.FC<LevelInGameInfoProps> = ({
  level,
  score,
  worldName,
  className = '',
}) => {
  return (
    <GlassPanel
      variant="medium"
      insetShadow="md"
      className={`flex gap-6 p-2 text-[var(--color-text-main)] font-mono text-lg ${className}`}
    >
      <div>
        Lv{level}
        {worldName && (
          <span className="text-[var(--color-accent)] ml-2">{worldName}</span>
        )}
      </div>
      <div>{score}</div>
    </GlassPanel>
  )
}

export default LevelInGameInfo
