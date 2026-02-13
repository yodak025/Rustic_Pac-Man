import React from 'react'
import Image from 'next/image'
import HeartIcon from '@/ui/components/HeartIcon'
import GlassPanel from '@/ui/components/GlassPanel'

export interface LivesDisplayProps {
  lives: number
  className?: string
}

const LivesDisplay: React.FC<LivesDisplayProps> = ({ lives, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Chomp Character */}
      <Image
        src="/assets/images/chomp-hud-base.webp"
        alt="Chomp"
        width={144}
        height={144}
        className="w-36 h-36 object-contain"
      />

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
