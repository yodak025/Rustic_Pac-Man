import React from 'react'

export interface SectionTitleProps {
  /**
   * Title text
   */
  children: React.ReactNode
  
  /**
   * Size variant
   */
  size?: 'large' | 'medium' | 'small'
  
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right'
  
  /**
   * Additional CSS classes
   */
  className?: string
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  size = 'medium',
  align = 'center',
  className = '',
}) => {
  const sizeClasses = {
    large: 'text-4xl md:text-5xl',
    medium: 'text-3xl md:text-4xl',
    small: 'text-2xl md:text-3xl',
  }[size]
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align]
  
  return (
    <h2
      className={`
        font-mono
        tracking-widest
        text-[var(--color-accent)]
        mb-6
        ${sizeClasses}
        ${alignClasses}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        textShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
      }}
    >
      {children}
    </h2>
  )
}

export default SectionTitle
