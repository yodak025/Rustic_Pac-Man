import React from 'react'
import GlassPanel from './GlassPanel'

export interface ImagePlaceholderProps {
  /**
   * Width of placeholder
   */
  width?: string
  
  /**
   * Height of placeholder
   */
  height?: string
  
  /**
   * Label text to display
   */
  label?: string
  
  /**
   * Additional CSS classes
   */
  className?: string
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  width = '100%',
  height = '300px',
  label = 'Image Placeholder',
  className = '',
}) => {
  return (
    <div style={{ width, height }}>
      <GlassPanel
        variant="medium"
        insetShadow="md"
        showBorder={true}
        className={`
          flex items-center justify-center
          w-full h-full
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      >
        <div className="text-center">
          <div className="text-6xl mb-2 opacity-30">📷</div>
          <p className="font-sans text-sm text-[var(--color-text-body)] opacity-50">
            {label}
          </p>
        </div>
      </GlassPanel>
    </div>
  )
}

export default ImagePlaceholder
