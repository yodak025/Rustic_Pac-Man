'use client'

import React from 'react'
import GlassPanel from './GlassPanel'

export interface TechPillProps {
  /**
   * Technology name to display
   */
  children: React.ReactNode
  
  /**
   * Additional CSS classes
   */
  className?: string
}

const TechPill: React.FC<TechPillProps> = ({ children, className = '' }) => {
  return (
    <GlassPanel
      variant="light"
      insetShadow="sm"
      showBorder={true}
      className={`
        px-4 py-2
        hover-magnetize
        transition-organic
        inline-flex items-center justify-center
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <span className="font-sans text-sm font-semibold text-[var(--color-text-body)]">
        {children}
      </span>
    </GlassPanel>
  )
}

export default TechPill
