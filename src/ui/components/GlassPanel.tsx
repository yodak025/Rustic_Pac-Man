'use client'

import React from 'react'

export interface GlassPanelProps {
  /**
   * Variant controls the opacity and blur intensity
   * - light: 75% opacity, 4px blur - For subtle overlays, tooltips
   * - medium: 82.5% opacity, 10px blur - For standard containers, cards
   * - heavy: 90% opacity, 16px blur - For modals, critical overlays
   */
  variant?: 'light' | 'medium' | 'heavy'
  
  /**
   * Content to render inside the glass panel
   */
  children: React.ReactNode
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Enable internal shadows for depth (brutalist)
   */
  insetShadow?: 'none' | 'sm' | 'md' | 'lg'
  
  /**
   * Show border in --color-main-light
   */
  showBorder?: boolean
  
  /**
   * HTML element to render as (default: div)
   */
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer'
}

const GlassPanel: React.FC<GlassPanelProps> = ({
  variant = 'medium',
  children,
  className = '',
  insetShadow = 'sm',
  showBorder = true,
  as: Component = 'div',
}) => {
  // Map variant to glass utility class
  const glassClass = {
    light: 'glass-light',
    medium: 'glass-medium',
    heavy: 'glass-heavy',
  }[variant]
  
  // Map insetShadow to shadow utility class
  const shadowClass = {
    none: '',
    sm: 'shadow-inset-sm',
    md: 'shadow-inset-md',
    lg: 'shadow-inset-lg',
  }[insetShadow]
  
  // Border class
  const borderClass = showBorder 
    ? 'border-2 border-[var(--color-main-light)]' 
    : ''
  
  return (
    <Component
      className={`
        ${glassClass}
        ${shadowClass}
        ${borderClass}
        rounded-tech
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </Component>
  )
}

export default GlassPanel
