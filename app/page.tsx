import Link from '@/ui/components/Link'
import PageTitle from '@/ui/components/PageTitle'
import { VersionInfo } from '@/ui/components'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] text-[var(--color-text-light)] px-4">
      <VersionInfo />
      
      <PageTitle size="large">
        CHOMP CRAWLER
      </PageTitle>

      <p className="text-center text-lg mb-8 max-w-2xl text-[var(--color-text-light)] opacity-90">
        A browser-based Pac-Man clone with procedurally generated mazes.
        <br />
        Experience endless arcade gameplay with rogue-like perspective.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl">
        <div className="text-center p-4 border border-[var(--color-primary-light)] rounded">
          <h3 className="text-[var(--color-primary-light)] font-bold mb-2">PROCEDURAL MAZES</h3>
          <p className="text-sm opacity-80">Every game is unique with algorithmically generated levels</p>
        </div>
        <div className="text-center p-4 border border-[var(--color-accent)] rounded">
          <h3 className="text-[var(--color-accent)] font-bold mb-2">3D PERSPECTIVE</h3>
          <p className="text-sm opacity-80">Rogue-like camera view powered by Three.js</p>
        </div>
        <div className="text-center p-4 border border-[var(--color-primary-medium)] rounded">
          <h3 className="text-[var(--color-primary-medium)] font-bold mb-2">FULLY CLIENT-SIDE</h3>
          <p className="text-sm opacity-80">Runs entirely in your browser with Pyodide</p>
        </div>
      </div>

      <Link href="/game" prefetch={false}>
        → PLAY NOW ←
      </Link>

      <footer className="absolute bottom-4 text-sm opacity-60">
        <p>Thesis project - Engineering in Audiovisual Systems</p>
      </footer>
    </div>
  )
}
