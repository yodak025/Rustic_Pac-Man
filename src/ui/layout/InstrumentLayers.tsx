'use client'

import React from 'react'
import GlassPanel from '@/ui/components/GlassPanel'
import InstrumentControl from '@/ui/common/InstrumentControl'
import type { InstrumentRole } from '@audio/instruments/base/Instrument'
import type { VariationType } from '@audio/generators/VariationEngine'

export interface InstrumentLayersProps {
  layers: Record<InstrumentRole, boolean>
  isInitialized: boolean
  onToggleLayer: (role: InstrumentRole) => void
  onVariation: (role: InstrumentRole, type: VariationType) => void
}

const LAYER_ORDER: InstrumentRole[] = ['percussion', 'bass', 'pad', 'lead1', 'lead2']

const InstrumentLayers: React.FC<InstrumentLayersProps> = ({
  layers,
  isInitialized,
  onToggleLayer,
  onVariation,
}) => {
  return (
    <GlassPanel variant="heavy" insetShadow="md" className="p-6 flex flex-col gap-4">
      {/* Section title */}
      <div className="border-b border-[var(--color-main-light)] pb-4">
        <span className="font-mono text-base font-bold tracking-widest text-[var(--color-accent)] uppercase">
          Layers
        </span>
        <p className="font-sans text-xs text-[var(--color-text-body)] mt-1">
          Toggle layers and apply mutations in real time.
        </p>
      </div>

      {/* Layer cascade */}
      <div className="flex flex-col gap-2">
        {LAYER_ORDER.map((role, idx) => (
          <div key={role} className="relative">
            {/* Cascade line connector */}
            {idx < LAYER_ORDER.length - 1 && (
              <div className="absolute left-5 bottom-0 w-px h-2 bg-[var(--color-main-light)] translate-y-full z-10" />
            )}
            <div
              className={`transition-organic ${!isInitialized ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <InstrumentControl
                role={role}
                isActive={layers[role]}
                onToggle={onToggleLayer}
                onVariation={onVariation}
              />
            </div>
          </div>
        ))}
      </div>

      {!isInitialized && (
        <p className="font-sans text-xs text-[var(--color-text-body)] text-center mt-2">
          Start the engine to activate layers
        </p>
      )}
    </GlassPanel>
  )
}

export default InstrumentLayers
