import React from 'react'

export interface DebugDetailsProps {
  summary: string
  children: React.ReactNode
  open?: boolean
  className?: string
}

const DebugDetails: React.FC<DebugDetailsProps> = ({ 
  summary, 
  children, 
  open = false,
  className = ''
}) => {
  return (
    <details 
      className={`mb-2 glass-light rounded-tech px-2 py-1 ${className}`} 
      open={open}
    >
      <summary className="text-xs cursor-pointer hover:text-[var(--color-accent)] transition-organic font-mono">
        {summary}
      </summary>
      <div className="pl-2 mt-1 text-[var(--color-text-body)]">
        {children}
      </div>
    </details>
  )
}

export default DebugDetails
