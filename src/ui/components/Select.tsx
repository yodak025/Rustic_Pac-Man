'use client'

import React from 'react'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}

export interface SelectProps<T extends string = string> {
  label: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
  className?: string
}

function Select<T extends string = string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  className = '',
}: SelectProps<T>): React.ReactElement {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="font-sans text-xs uppercase tracking-widest text-[var(--color-text-body)]">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as T)}
          className={`
            w-full appearance-none
            glass-medium rounded-tech
            border border-[var(--color-main-light)]
            px-3 py-2 pr-8
            font-mono text-xs text-[var(--color-text-main)]
            shadow-inset-sm
            hover-magnetize
            transition-organic
            cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-40
            focus:outline-none
            bg-transparent
          `.trim().replace(/\s+/g, ' ')}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[var(--color-main-dark)] text-[var(--color-text-main)]"
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron */}
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-accent)] text-xs">
          ▼
        </div>
      </div>
    </div>
  )
}

export default Select
