'use client'

import React, { useMemo } from 'react'

export interface DashBarProps {
  energy: number
  maxEnergy: number
  costPerDash: number
  isDashing: boolean
  /** Radius of the circular glass panel this arc wraps around, in px */
  panelRadius: number
  /** Gap between panel edge and arc track, in px */
  gap?: number
  /** Stroke width of the arc track, in px */
  strokeWidth?: number
}

/**
 * Renders a 120° arc centred on the left (180°) that visualises dash energy.
 * Tick marks divide the filled portion into per-dash segments.
 *
 * Coordinate convention: angle 0° = right, increases clockwise (SVG default).
 * Arc spans from START_ANGLE (120°) to END_ANGLE (240°), centred at 180°.
 */
const ARC_SPAN = 120
const ARC_CENTER = 180
const START_ANGLE = ARC_CENTER - ARC_SPAN / 2  // 120°
const END_ANGLE   = ARC_CENTER + ARC_SPAN / 2  // 240°

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = toRad(angleDeg)
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarToCartesian(cx, cy, r, startDeg)
  const end   = polarToCartesian(cx, cy, r, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

const DashBar: React.FC<DashBarProps> = ({
  energy,
  maxEnergy,
  costPerDash,
  isDashing,
  panelRadius,
  gap = 8,
  strokeWidth = 6,
}) => {
  const arcRadius = panelRadius + gap + strokeWidth / 2

  // SVG canvas: needs to fit the full arc.
  // The arc is on the left side. Centre of the arc circle sits at the right
  // edge of the SVG so that only the left half (and a bit) is drawn.
  const padding = strokeWidth + 4
  const canvasW = arcRadius + padding
  const canvasH = arcRadius * 2 + padding * 2
  const cx = canvasW - padding  // circle centre X (right edge)
  const cy = canvasH / 2         // circle centre Y (vertical middle)

  const fillPct = maxEnergy > 0 ? Math.min(energy / maxEnergy, 1) : 0
  const filledAngle = START_ANGLE + fillPct * ARC_SPAN
  const fillId = 'dashbar-fill-clip'

  // Tick angles: one tick per full dash boundary (exclude start/end)
  const totalDashes = maxEnergy > 0 ? Math.floor(maxEnergy / costPerDash) : 0
  const tickAngles = useMemo(() => {
    const angles: number[] = []
    for (let i = 1; i < totalDashes; i++) {
      angles.push(START_ANGLE + (i / totalDashes) * ARC_SPAN)
    }
    return angles
  }, [totalDashes])

  const trackColor    = 'var(--color-main-dark)'
  const fillColor     = isDashing ? 'var(--color-success)' : 'var(--color-accent)'
  const tickColor     = 'var(--color-main-dark)'
  const tickLength    = strokeWidth + 3

  return (
    <svg
      width={canvasW}
      height={canvasH}
      viewBox={`0 0 ${canvasW} ${canvasH}`}
      style={{ overflow: 'visible', display: 'block' }}
      aria-hidden="true"
    >
      {/* Clip path: filled arc sector, used to mask tick marks */}
      <defs>
        <clipPath id={fillId}>
          {fillPct > 0 && (
            <path
              d={[
                `M ${cx} ${cy}`,
                `L ${polarToCartesian(cx, cy, arcRadius + strokeWidth, START_ANGLE).x} ${polarToCartesian(cx, cy, arcRadius + strokeWidth, START_ANGLE).y}`,
                arcPath(cx, cy, arcRadius + strokeWidth, START_ANGLE, filledAngle),
                `L ${polarToCartesian(cx, cy, arcRadius - strokeWidth, filledAngle).x} ${polarToCartesian(cx, cy, arcRadius - strokeWidth, filledAngle).y}`,
                arcPath(cx, cy, arcRadius - strokeWidth, filledAngle, START_ANGLE).replace('M', 'L').replace('1 1', '1 0'),
                'Z',
              ].join(' ')}
            />
          )}
        </clipPath>
      </defs>

      {/* Background track (full arc, always visible) */}
      <path
        d={arcPath(cx, cy, arcRadius, START_ANGLE, END_ANGLE)}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Filled portion */}
      {fillPct > 0 && (
        <path
          d={arcPath(cx, cy, arcRadius, START_ANGLE, filledAngle)}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: 'stroke 150ms ease' }}
        />
      )}

      {/* Tick marks — only visible over the filled portion */}
      <g clipPath={`url(#${fillId})`}>
        {tickAngles.map((angle) => {
          const inner = polarToCartesian(cx, cy, arcRadius - tickLength / 2, angle)
          const outer = polarToCartesian(cx, cy, arcRadius + tickLength / 2, angle)
          return (
            <line
              key={angle}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={tickColor}
              strokeWidth={2}
              strokeLinecap="round"
            />
          )
        })}
      </g>
    </svg>
  )
}

export default DashBar
