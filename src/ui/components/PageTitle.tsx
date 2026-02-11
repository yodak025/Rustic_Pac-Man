import React from 'react'

export interface PageTitleProps {
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const PageTitle: React.FC<PageTitleProps> = ({ 
  children, 
  size = 'large',
  className = ''
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'text-2xl'
      case 'medium':
        return 'text-4xl'
      case 'large':
        return 'text-6xl'
      default:
        return 'text-6xl'
    }
  }

  return (
    <h1 
      className={`
        font-bold mb-8 
        text-[var(--color-accent)] 
        font-mono 
        tracking-widest
        ${getSizeStyles()} 
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        textShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)'
      }}
    >
      {children}
    </h1>
  )
}

export default PageTitle
