import React from 'react'

export interface ProgressBarProps {
  progress: number
  showPercentage?: boolean
  className?: string
  animated?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  showPercentage = false,
  className = '',
  animated = true
}) => {
  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <div className="w-96 h-4 glass-medium border-2 border-[var(--color-accent)] relative overflow-hidden rounded-tech shadow-inset-sm">
        <div 
          className={`
            h-full 
            bg-[var(--color-accent)]
            ${animated ? 'transition-organic' : ''}
          `.trim().replace(/\s+/g, ' ')}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {showPercentage && (
        <p className="text-lg font-mono text-[var(--color-accent)]">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  )
}

export default ProgressBar
