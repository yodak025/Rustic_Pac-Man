'use client'

import React from 'react'
import GlassPanel from '@/ui/components/GlassPanel'
import Button from '@/ui/components/Button'
import ContextPanel from '@/ui/common/ContextPanel'
import type { TextureDensity } from '@audio/theory/MusicContext'
import type { LevelContextName } from '@audio/contexts'

export interface MusicGeneratorControlsProps {
  contextName: LevelContextName
  intensity: number
  texture: TextureDensity
  tension: number
  bpm: number
  isRunning: boolean
  isInitialized: boolean
  isTransitioning: boolean
  onStart: () => void
  onStop: () => void
  onContextChange: (name: LevelContextName) => void
  onIntensityChange: (value: number) => void
  onTextureChange: (value: TextureDensity) => void
  onTensionChange: (value: number) => void
}

const MusicGeneratorControls: React.FC<MusicGeneratorControlsProps> = ({
  contextName,
  intensity,
  texture,
  tension,
  bpm,
  isRunning,
  isInitialized,
  isTransitioning,
  onStart,
  onStop,
  onContextChange,
  onIntensityChange,
  onTextureChange,
  onTensionChange,
}) => {
  return (
    <GlassPanel variant="heavy" insetShadow="md" className="p-6 flex flex-col gap-5">
      {/* Section title */}
      <div className="flex items-center gap-3 border-b border-[var(--color-main-light)] pb-4">
        <span className="font-mono text-base font-bold tracking-widest text-[var(--color-accent)] uppercase">
          Engine
        </span>
        {isTransitioning && (
          <span className="font-sans text-xs text-[var(--color-text-body)] animate-pulse">
            transitioning...
          </span>
        )}
      </div>

      {/* Transport controls */}
      <div className="flex gap-3">
        <Button
          onClick={onStart}
          disabled={isRunning}
          variant="primary"
          className="flex-1"
        >
          PLAY
        </Button>
        <Button
          onClick={onStop}
          disabled={!isRunning}
          variant="danger"
          className="flex-1"
        >
          STOP
        </Button>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full transition-organic ${
            isRunning ? 'bg-[var(--color-success)]' : 'bg-[var(--color-main-light)]'
          }`}
          style={isRunning ? { boxShadow: '0 0 6px var(--color-success)' } : {}}
        />
        <span className="font-sans text-xs text-[var(--color-text-body)] uppercase tracking-widest">
          {!isInitialized ? 'Click PLAY to initialise' : isRunning ? 'Running' : 'Stopped'}
        </span>
      </div>

      {/* Context panel */}
      <ContextPanel
        contextName={contextName}
        intensity={intensity}
        texture={texture}
        tension={tension}
        bpm={bpm}
        isRunning={isRunning}
        onContextChange={onContextChange}
        onIntensityChange={onIntensityChange}
        onTextureChange={onTextureChange}
        onTensionChange={onTensionChange}
      />
    </GlassPanel>
  )
}

export default MusicGeneratorControls
