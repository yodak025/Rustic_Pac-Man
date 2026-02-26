'use client'

import React from 'react'
import GlassPanel from '@/ui/components/GlassPanel'
import Slider from '@/ui/components/Slider'
import Select from '@/ui/components/Select'
import type { SelectOption } from '@/ui/components/Select'
import type { TextureDensity } from '@audio/theory/MusicContext'
import type { LevelContextName } from '@audio/contexts'

export interface ContextPanelProps {
  /** Currently active level context preset name */
  contextName: LevelContextName
  intensity: number
  texture: TextureDensity
  tension: number
  bpm: number
  isRunning: boolean
  onContextChange: (name: LevelContextName) => void
  onIntensityChange: (value: number) => void
  onTextureChange: (value: TextureDensity) => void
  onTensionChange: (value: number) => void
}

const CONTEXT_OPTIONS: SelectOption<LevelContextName>[] = [
  { value: 'ambient',     label: 'AMBIENT' },
  { value: 'exploration', label: 'EXPLORATION' },
  { value: 'tension',     label: 'TENSION' },
  { value: 'chase',       label: 'CHASE' },
  { value: 'powerup',     label: 'POWER-UP' },
  { value: 'mystical',    label: 'MYSTICAL' },
  { value: 'deepDive',    label: 'DEEP DIVE' },
  { value: 'boss',        label: 'BOSS' },
  { value: 'horror',      label: 'HORROR' },
  { value: 'victory',     label: 'VICTORY' },
  { value: 'defeat',      label: 'DEFEAT' },
]

const TEXTURE_OPTIONS: SelectOption<TextureDensity>[] = [
  { value: 'sparse', label: 'SPARSE' },
  { value: 'medium', label: 'MEDIUM' },
  { value: 'dense',  label: 'DENSE' },
]

const ContextPanel: React.FC<ContextPanelProps> = ({
  contextName,
  intensity,
  texture,
  tension,
  bpm,
  onContextChange,
  onIntensityChange,
  onTextureChange,
  onTensionChange,
}) => {
  return (
    <GlassPanel variant="medium" insetShadow="md" className="p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-main-light)] pb-3">
        <h3 className="font-mono text-sm font-bold tracking-widest text-[var(--color-text-main)] uppercase">
          Music Context
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs text-[var(--color-text-body)]">BPM</span>
          <span className="font-mono text-sm text-[var(--color-accent)] tabular-nums">
            {bpm}
          </span>
        </div>
      </div>

      {/* Level preset selector */}
      <Select<LevelContextName>
        label="Level Preset"
        value={contextName}
        options={CONTEXT_OPTIONS}
        onChange={onContextChange}
      />

      {/* Sliders */}
      <Slider
        label="Intensity"
        value={intensity}
        onChange={onIntensityChange}
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />

      <Select<TextureDensity>
        label="Texture"
        value={texture}
        options={TEXTURE_OPTIONS}
        onChange={onTextureChange}
      />

      <Slider
        label="Tension"
        value={tension}
        onChange={onTensionChange}
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />
    </GlassPanel>
  )
}

export default ContextPanel
