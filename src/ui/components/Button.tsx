'use client'

import React from 'react'

export interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  disabled?: boolean
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  className = ''
}) => {
  const variantStyles = {
    primary: `
      bg-[var(--color-accent)] 
      text-[var(--color-background)]
      hover:text-[var(--color-text-main)]
    `,
    secondary: `
      bg-[var(--color-main)] 
      text-[var(--color-text-main)]
    `,
    danger: `
      bg-[var(--color-alert)] 
      text-[var(--color-text-main)]
    `,
    success: `
      bg-[var(--color-success)] 
      text-[var(--color-background)]
      hover:text-[var(--color-text-main)]
    `,
  }

  const baseStyles = `
    font-mono font-bold text-lg uppercase tracking-wide
    px-8 py-3
    rounded-tech
    shadow-inset-sm
    hover-magnetize
    ${variantStyles[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
    inline-flex items-center justify-center
  `

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={baseStyles.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </button>
  )
}

export default Button
