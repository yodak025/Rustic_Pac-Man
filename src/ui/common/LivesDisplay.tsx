import React from 'react'
import HeartIcon from '@/ui/components/HeartIcon'
import GlassPanel from '@/ui/components/GlassPanel'

export interface LivesDisplayProps {
  lives: number
  className?: string
}

const LivesDisplay: React.FC<LivesDisplayProps> = ({ lives, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Pac-Man Sphere */}
      <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] shadow-inset-md"></div>
      
      {/* Lives Count */}
      <GlassPanel 
        variant="medium" 
        insetShadow="md"
        className="flex items-center gap-1 p-1 text-[var(--color-text-main)] font-mono text-lg"
      >
        <HeartIcon />
        <span className='text-2xl'>:{lives}</span>
      </GlassPanel>
    </div>
  )
}

export default LivesDisplay
