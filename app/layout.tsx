import type { Metadata } from 'next'
import '@/assets/styles/globals.css'

export const metadata: Metadata = {
  title: 'Chomp Crawler',
  description: 'Browser-based Pac-Man clone with procedurally generated mazes',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-mono antialiased">
        {children}
      </body>
    </html>
  )
}
