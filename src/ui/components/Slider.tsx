'use client'

import React from 'react'

export interface SliderProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  /** Format the displayed value (default: 2 decimal places) */
  formatValue?: (value: number) => string
  className?: string
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  disabled = false,
  formatValue = (v) => v.toFixed(2),
  className = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-baseline">
        <label className="font-sans text-xs uppercase tracking-widest text-[var(--color-text-body)]">
          {label}
        </label>
        <span className="font-mono text-xs text-[var(--color-accent)]">
          {formatValue(value)}
        </span>
      </div>

      <div className="relative flex items-center h-6">
        {/* Track background */}
        <div className="absolute w-full h-1 rounded-tech bg-[var(--color-main)] shadow-inset-sm" />

        {/* Filled portion */}
        <div
          className="absolute h-1 rounded-tech bg-[var(--color-accent)] transition-organic"
          style={{ width: `${percentage}%` }}
        />

        {/* Native range input (transparent, sits on top) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`
            relative w-full h-1
            appearance-none bg-transparent
            cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-40
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[var(--color-accent)]
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[var(--color-background)]
            [&::-webkit-slider-thumb]:shadow-inset-sm
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[var(--color-accent)]
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-[var(--color-background)]
            [&::-moz-range-thumb]:border-solid
          `.trim().replace(/\s+/g, ' ')}
        />
      </div>
    </div>
  )
}

export default Slider
