'use client'

import React from 'react'
import GlassPanel from '@/ui/components/GlassPanel'
import type { InstrumentRole } from '@audio/instruments/base/Instrument'
import type { VariationType } from '@audio/generators/VariationEngine'

export interface InstrumentControlProps {
  role: InstrumentRole
  isActive: boolean
  onToggle: (role: InstrumentRole) => void
  onVariation: (role: InstrumentRole, type: VariationType) => void
}

const ROLE_LABEL: Record<InstrumentRole, string> = {
  percussion: 'PERCUSSION',
  bass: 'BASS',
  pad: 'PAD',
  lead1: 'LEAD I',
  lead2: 'LEAD II',
}

const ROLE_COLOR: Record<InstrumentRole, string> = {
  percussion: '#EF4444',  // alert red
  bass: '#F59E0B',        // accent amber
  pad: '#10B981',         // success emerald
  lead1: '#94A3B8',       // text-body slate
  lead2: '#64748B',       // muted slate
}

const VARIATION_TYPES: { type: VariationType; label: string }[] = [
  { type: 'shiftPitch',    label: 'PITCH' },
  { type: 'shiftRhythm',  label: 'RHYTHM' },
  { type: 'addNote',       label: 'ADD' },
  { type: 'removeNote',    label: 'REMOVE' },
  { type: 'scaleVelocity', label: 'VEL' },
  { type: 'invert',        label: 'INVERT' },
  { type: 'double',        label: 'DOUBLE' },
]

const InstrumentControl: React.FC<InstrumentControlProps> = ({
  role,
  isActive,
  onToggle,
  onVariation,
}) => {
  const accentColor = ROLE_COLOR[role]

  return (
    <GlassPanel
      variant={isActive ? 'medium' : 'light'}
      insetShadow="sm"
      className="p-4 flex flex-col gap-3 transition-organic"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Active indicator dot */}
          <span
            className="inline-block w-2 h-2 rounded-full transition-organic"
            style={{
              backgroundColor: isActive ? accentColor : 'var(--color-main-light)',
              boxShadow: isActive ? `0 0 6px ${accentColor}` : 'none',
            }}
          />
          <span
            className="font-mono text-sm font-bold tracking-widest"
            style={{ color: isActive ? accentColor : 'var(--color-text-body)' }}
          >
            {ROLE_LABEL[role]}
          </span>
        </div>

        <button
          onClick={() => onToggle(role)}
          className={`
            font-mono text-xs px-3 py-1 rounded-tech
            border transition-organic hover-magnetize
            ${isActive
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-[var(--color-main-light)] text-[var(--color-text-body)]'
            }
          `.trim().replace(/\s+/g, ' ')}
        >
          {isActive ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Variation buttons */}
      <div className="flex flex-wrap gap-1">
        {VARIATION_TYPES.map(({ type, label }) => (
          <button
            key={type}
            disabled={!isActive}
            onClick={() => onVariation(role, type)}
            className={`
              font-mono text-xs px-2 py-1 rounded-tech
              border border-[var(--color-main-light)]
              text-[var(--color-text-body)]
              hover-magnetize transition-organic
              disabled:opacity-30 disabled:cursor-not-allowed
            `.trim().replace(/\s+/g, ' ')}
          >
            {label}
          </button>
        ))}
      </div>
    </GlassPanel>
  )
}

export default InstrumentControl
