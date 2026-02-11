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
          text-[var(--color-accent)]
          hover:text-[var(--color-text-body)]
          transition-all duration-200 transform hover:scale-105
          inline-flex items-center justify-center
          px-8 py-3
          border-2 border-[var(--color-accent)]
          hover:border-[var(--color-text-body)]
          rounded
        `
      case 'secondary':
        return `
          font-mono text-base
          text-[var(--color-text-main)]
          hover:text-[var(--color-accent)]
          transition-all duration-200
          inline-flex items-center
        `
      case 'text':
        return `
          font-mono text-sm
          text-[var(--color-text-body)]
          hover:text-[var(--color-text-main)]
          transition-all duration-200
        `
      default:
        return ''
    }
  }

  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      className={`${getVariantStyles()} ${className}`}
    >
      {children}
    </NextLink>
  )
}

export default Link
