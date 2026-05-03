'use client'

import React from 'react'
import Image from 'next/image'
import GlassPanel from '@/ui/components/GlassPanel'
import HeartIcon from '@/ui/components/HeartIcon'
import WNBIcon from '@/ui/components/WNBIcon'
import DashBar from '@/ui/common/DashBar'
import MedallionDisplay from '@/ui/common/MedallionDisplay'
import type { MedallionRack } from '@custom-types/components'
import gameDefaults from '@config/gameDefaults.json'

export interface PlayerInGameInfoProps {
  lives: number
  wnbCount: number
  dashEnergy: number
  dashMaxEnergy: number
  isDashing: boolean
  medallionRack: MedallionRack
  className?: string
}

/**
 * Geometry constants — single source of truth.
 *
 * The circular panel is the anchor of the whole composition.
 * All arcs are drawn so that their mathematical centre (cx) coincides
 * exactly with the centre of the circular panel.
 *
 * Layout strategy:
 *  - The outer wrapper uses position:relative with a fixed size.
 *  - The circular panel is absolutely centred inside it.
 *  - DashBar and MedallionDisplay SVGs/divs are absolutely positioned
 *    so their internal cx/cy (always at their own right/vertical-centre)
 *    lands on the panel centre via: right = containerRight - panelCentreX
 *    which simplifies to right = PANEL_RADIUS (distance from panel centre
 *    to the right edge of the container when the panel is centred).
 *  - The rectangular info panel is placed to the right, overlapping
 *    the circular panel by OVERLAP px.
 */
const PANEL_DIAMETER  = 96
const PANEL_RADIUS    = PANEL_DIAMETER / 2
const DASH_GAP        = 8
const DASH_STROKE     = 6
const MEDALLION_GAP   = 20

// Arc radii — measured from the shared centre point
const dashArcRadius      = PANEL_RADIUS + DASH_GAP + DASH_STROKE / 2
const medallionArcRadius = dashArcRadius + DASH_STROKE / 2 + MEDALLION_GAP

// The arcs extend leftward by their radius. The container must be wide enough
// to hold the panel + the arcs to its left. We only need the left extension of
// the outermost arc (medallion), which equals medallionArcRadius + its padding.
// We give the container exactly PANEL_DIAMETER width and let arcs overflow:visible.
const OVERLAP = 16

// Padding inside the arc canvases (DashBar adds strokeWidth+4 internally)
const DASHBAR_PADDING    = DASH_STROKE + 4
// MedallionDisplay adds SELECTED_SIZE/2 + 4 internally
const MEDALLION_SELECTED = 52
const MEDALLION_PADDING  = MEDALLION_SELECTED / 2 + 4

// Right offset for each arc wrapper so that its internal cx lands on the
// panel centre. Formula: PANEL_RADIUS - internal_padding
const DASHBAR_RIGHT    = PANEL_RADIUS - DASHBAR_PADDING
const MEDALLION_RIGHT  = PANEL_RADIUS - MEDALLION_PADDING

const PlayerInGameInfo: React.FC<PlayerInGameInfoProps> = ({
  lives,
  wnbCount,
  dashEnergy,
  dashMaxEnergy,
  isDashing,
  medallionRack,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center ${className}`}
      style={{ position: 'relative' }}
    >
      {/*
        ── Left cluster: arcs + circular panel ──────────────────────────────
        Width = PANEL_DIAMETER. The circular panel fills it exactly.
        overflow:visible lets arc SVGs bleed to the left.
      */}
      <div
        style={{
          position: 'relative',
          width: PANEL_DIAMETER,
          height: PANEL_DIAMETER,
          flexShrink: 0,
          overflow: 'visible',
        }}
      >
        {/*
          Arc wrappers use `right` positioning.
          Each arc component places its cx at its own right edge minus internal
          padding. By setting right = ARC_RIGHT_OFFSET we shift that right edge
          to land on the panel centre (PANEL_RADIUS from the container's right).
        */}

        {/* MedallionDisplay — outermost arc */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: MEDALLION_RIGHT,
            transform: 'translateY(-50%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <MedallionDisplay
            medallionRack={medallionRack}
            arcRadius={medallionArcRadius}
          />
        </div>

        {/* DashBar — inner arc */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: DASHBAR_RIGHT,
            transform: 'translateY(-50%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <DashBar
            energy={dashEnergy}
            maxEnergy={dashMaxEnergy}
            costPerDash={gameDefaults.abilities.dash.costPerDash}
            isDashing={isDashing}
            panelRadius={PANEL_RADIUS}
            gap={DASH_GAP}
            strokeWidth={DASH_STROKE}
          />
        </div>

        {/* Circular glass panel — centred in the container */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: PANEL_DIAMETER,
            height: PANEL_DIAMETER,
            borderRadius: '50%',
            overflow: 'hidden',
            zIndex: 3,
          }}
        >
          <GlassPanel
            variant="medium"
            insetShadow="md"
            showBorder={false}
            className="w-full h-full flex items-center justify-center"
          >
            <Image
              src="/assets/images/chomp-hud-base.webp"
              alt="Chomp"
              width={PANEL_DIAMETER}
              height={PANEL_DIAMETER}
              className="object-contain"
              style={{ clipPath: 'circle(60% at center)' }}
            />
          </GlassPanel>
        </div>
      </div>

      {/* ── Rectangular panel: lives + WNB ────────────────────────────────── */}
      <div style={{ marginLeft: -OVERLAP, zIndex: 2, position: 'relative' }}>
        <GlassPanel
          variant="medium"
          insetShadow="md"
          className="flex flex-col justify-center gap-1 pl-8 pr-3 py-2 font-mono text-[var(--color-text-main)]"
        >
          <div className="flex items-center gap-1 text-lg">
            <HeartIcon />
            <span className="text-2xl">:{lives}</span>
          </div>
          <div className="flex items-center gap-1 text-base">
            <WNBIcon />
            <span>×{wnbCount}</span>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}

export default PlayerInGameInfo
