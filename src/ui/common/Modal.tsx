import React from 'react'
import GlassPanel from '@/ui/components/GlassPanel'

export interface ModalProps {
  isOpen: boolean
  children: React.ReactNode
  title?: string
  className?: string
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  children, 
  title,
  className = ''
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-[var(--color-background)]/80 p-4">
      <GlassPanel 
        variant="heavy" 
        insetShadow="lg"
        className={`p-8 border-2 border-[var(--color-accent)] w-full h-auto max-w-3xl max-h-[95vh] overflow-y-auto ${className}`}
      >
        {title && (
          <h2 className="text-4xl font-bold text-[var(--color-accent)] font-mono text-center mb-8 tracking-widest">
            {title}
          </h2>
        )}
        {children}
      </GlassPanel>
    </div>
  )
}

export default Modal
