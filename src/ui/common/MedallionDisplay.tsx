'use client'

import React, { useMemo } from 'react'
import type { MedallionRack } from '@custom-types/components'
import { MedallionKind } from '@custom-types/gameComponents'
import { getMedallionXpThreshold, getMedallionActivationCost } from '@config/medallionAttributes'

export interface MedallionDisplayProps {
  /** Full medallion rack from ECS / HotState */
  medallionRack: MedallionRack
  /** Radius of the arc on which medallion centres are placed, in px */
  arcRadius: number
}

// ── Arc geometry ─────────────────────────────────────────────────────────────
const ARC_SPAN   = 150
const ARC_CENTER = 180
const START_ANGLE = ARC_CENTER - ARC_SPAN / 2  // 105°

const SELECTED_SIZE   = 52
const UNSELECTED_SIZE = 32

/** One-letter label per medallion kind */
const KIND_LABEL: Record<MedallionKind, string> = {
  [MedallionKind.HEALTH]:  'H',
  [MedallionKind.STEALTH]: 'S',
  [MedallionKind.VISION]:  'V',
  [MedallionKind.SHOUT]:   'X',
  [MedallionKind.SPEED]:   'Z',
  [MedallionKind.ESSENCE]: 'E',
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Returns charge progress [0, 1] for a single slot.
 * - Level < 5: progress toward next level-up threshold.
 * - Level = 5: progress toward activation cost.
 * - HEALTH (no levels): progress toward activationCost.
 */
function slotChargePct(kind: MedallionKind, level: number, chargeXP: number): number {
  const isHealth = kind === MedallionKind.HEALTH

  if (isHealth) {
    const cost = getMedallionActivationCost(kind)
    return cost > 0 ? Math.min(chargeXP / cost, 1) : 0
  }

  if (level >= 5) {
    const cost = getMedallionActivationCost(kind)
    return cost > 0 ? Math.min(chargeXP / cost, 1) : 0
  }

  const threshold = getMedallionXpThreshold(kind, level)
  return threshold > 0 && threshold !== Infinity ? Math.min(chargeXP / threshold, 1) : 0
}

/**
 * Medallion rack UI — distributes all slots on a 150° arc centred left.
 * Reads real data from `medallionRack`; navigation is driven by ECS (no local state).
 */
const MedallionDisplay: React.FC<MedallionDisplayProps> = ({ medallionRack, arcRadius }) => {
  const { slots, selectedIndex } = medallionRack
  const count = slots.length

  const items = useMemo(() => {
    if (count === 0) return []

    return slots.map((slot, i) => {
      const angle = count > 1
        ? START_ANGLE + (i / (count - 1)) * ARC_SPAN
        : ARC_CENTER
      const rad        = toRad(angle)
      const isSelected = i === selectedIndex
      const size       = isSelected ? SELECTED_SIZE : UNSELECTED_SIZE
      const x          = arcRadius * Math.cos(rad)
      const y          = arcRadius * Math.sin(rad)
      const chargePct  = slotChargePct(slot.kind, slot.level, slot.chargeXP)
      const label      = KIND_LABEL[slot.kind] ?? '?'
      return { kind: slot.kind, level: slot.level, chargePct, label, angle, x, y, isSelected, size }
    })
  }, [slots, selectedIndex, arcRadius, count])

  const padding = SELECTED_SIZE / 2 + 4
  const canvasW = arcRadius + padding
  const canvasH = arcRadius * 2 + padding * 2
  const cx = canvasW - padding
  const cy = canvasH / 2

  return (
    <div
      style={{ width: canvasW, height: canvasH, position: 'relative', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {items.map((item, i) => {
        const left = cx + item.x - item.size / 2
        const top  = cy + item.y - item.size / 2
        // Dark overlay covers from top; recedes upward as charge grows
        const overlayHeight = `${(1 - item.chargePct) * 100}%`

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width:  item.size,
              height: item.size,
              borderRadius: '50%',
              border: item.isSelected
                ? '2px solid var(--color-accent)'
                : '2px solid var(--color-main-light)',
              overflow: 'hidden',
              transition: 'width 200ms ease, height 200ms ease, left 200ms ease, top 200ms ease',
              background: 'var(--color-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: item.isSelected ? 16 : 11,
              color: 'var(--color-text-body)',
              fontFamily: 'monospace',
              boxShadow: item.isSelected ? '0 0 8px var(--color-accent)' : 'none',
            }}
          >
            {/* Medallion background fill */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--color-main-light)',
                borderRadius: '50%',
              }}
            />

            {/* Charge overlay — covers top portion, recedes upward as charge grows */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: overlayHeight,
                background: 'rgba(0, 0, 0, 0.72)',
                transition: 'height 150ms ease',
              }}
            />

            {/* Label + level */}
            <span style={{ position: 'relative', zIndex: 1, userSelect: 'none' }}>
              {item.label}
              {item.level > 0 && (
                <sup style={{ fontSize: '0.6em', marginLeft: 1 }}>{item.level}</sup>
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default MedallionDisplay
