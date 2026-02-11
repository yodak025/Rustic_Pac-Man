import React from 'react'
import NextLink from 'next/link'

export interface LinkProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'text'
  prefetch?: boolean
  className?: string
}

const Link: React.FC<LinkProps> = ({
  href,
  children,
  variant = 'primary',
  prefetch = false,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `
          font-mono font-bold text-lg uppercase tracking-wide
          px-8 py-3
          bg-[var(--color-accent)]
          text-[var(--color-background)]
          hover:text-[var(--color-text-main)]
          rounded-tech
          shadow-inset-sm
          hover-magnetize
          inline-flex items-center justify-center
        `
      case 'secondary':
        return `
          font-mono text-base
          text-[var(--color-text-main)]
          hover:text-[var(--color-accent)]
          transition-organic
          inline-flex items-center
          underline decoration-transparent hover:decoration-[var(--color-accent)]
        `
      case 'text':
        return `
          font-mono text-sm
          text-[var(--color-text-body)]
          hover:text-[var(--color-text-main)]
          transition-organic
        `
      default:
        return ''
    }
  }

  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      className={`${getVariantStyles().trim().replace(/\s+/g, ' ')} ${className}`}
    >
      {children}
    </NextLink>
  )
}

export default Link
