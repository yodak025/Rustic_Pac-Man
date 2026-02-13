import Link from '@/ui/components/Link'
import PageTitle from '@/ui/components/PageTitle'
import SectionTitle from '@/ui/components/SectionTitle'
import TechPill from '@/ui/components/TechPill'
import ImagePlaceholder from '@/ui/components/ImagePlaceholder'
import GlassPanel from '@/ui/components/GlassPanel'
import { VersionInfo } from '@/ui/components'

export default function LandingPage() {
  const technologies = [
    'Next.js 16',
    'React 19',
    'Three.js',
    'React Three Fiber',
    'Zustand',
    'TypeScript',
    'Tailwind CSS',
    'Pyodide',
    'Python',
  ]

  const features = [
    {
      title: 'Procedural Maze Generation',
      description: 'Python-powered Prim\'s algorithm generates symmetric, arcade-authentic mazes on-the-fly. Inspired by Shaun LeBron\'s research, every level follows classic Pac-Man design constraints while being completely unique.',
      icon: '🔄',
    },
    {
      title: '3D Rogue-like Perspective',
      description: 'Experience the maze from a whole new angle. Three.js rendering with isometric camera brings depth and modern visuals to the classic top-down gameplay.',
      icon: '🎮',
    },
    {
      title: 'Fully Client-Side',
      description: 'Zero servers, zero downloads. The entire game—rendering, logic, and maze generation—runs in your browser using React, TypeScript, and Pyodide (Python via WebAssembly).',
      icon: '🌐',
    },
    {
      title: 'Endless Arcade',
      description: 'Classic ghost AI, pellet collection, and power-ups meet infinite procedural generation. How many mazes can you conquer?',
      icon: '✨',
    },
  ]

  return (
    <main className="bg-[var(--color-background)] text-[var(--color-text-main)]">
      <VersionInfo />
      
      {/* ========== SECTION 1: HERO ========== */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full text-center">
          <PageTitle size="large">
            CHOMP CRAWLER
          </PageTitle>

          <p className="font-sans text-lg md:text-xl text-[var(--color-text-body)] leading-relaxed mb-12 max-w-3xl mx-auto">
            Endless arcade meets procedural algorithms. A browser-based Pac-Man reimagined with rogue-like perspective and infinite mazes.
          </p>

          <div className="mb-8">
            <Link href="/game" prefetch={false} variant="primary" className="text-lg px-10 py-4">
              → PLAY NOW ←
            </Link>
          </div>

          <p className="font-sans text-sm text-[var(--color-text-body)] opacity-70">
            No installation required. Runs in any modern browser.
          </p>
        </div>
      </section>

      {/* ========== SECTION 2: INTRODUCTION ========== */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionTitle size="medium">
            WHAT IS CHOMP CRAWLER?
          </SectionTitle>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
            <div>
              <p className="font-sans text-base text-[var(--color-text-body)] leading-relaxed mb-4">
                Chomp Crawler is a modern take on the classic Pac-Man formula. Built as a thesis project for Engineering in Audiovisual Systems, it combines nostalgic arcade gameplay with cutting-edge web technologies.
              </p>
              <p className="font-sans text-base text-[var(--color-text-body)] leading-relaxed mb-4">
                Every maze is procedurally generated using Python algorithms running directly in your browser via WebAssembly. No two runs are ever the same.
              </p>
              <p className="font-sans text-base text-[var(--color-text-body)] leading-relaxed">
                Experience familiar ghost-chasing action through a fresh 3D rogue-like perspective, powered by Three.js and rendered in real-time.
              </p>
            </div>
            
            <div>
              <ImagePlaceholder 
                height="400px" 
                label="Game Screenshot"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: FEATURES GRID ========== */}
      <section className="py-16 md:py-24 px-4 bg-[var(--color-main-dark)]">
        <div className="max-w-6xl mx-auto">
          <SectionTitle size="medium">
            GAME FEATURES
          </SectionTitle>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <GlassPanel
                key={index}
                variant="light"
                insetShadow="sm"
                className="p-6 hover-magnetize transition-organic"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-sans text-xl font-semibold text-[var(--color-text-main)] mb-3">
                  {feature.title}
                </h3>
                <p className="font-sans text-base text-[var(--color-text-body)] leading-relaxed">
                  {feature.description}
                </p>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: TECH STACK ========== */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionTitle size="medium">
            BUILT WITH MODERN WEB
          </SectionTitle>

          <p className="font-sans text-base text-[var(--color-text-body)] text-center mb-8 max-w-2xl mx-auto">
            A showcase of cutting-edge web technologies working together to deliver a seamless gaming experience entirely in your browser.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <TechPill key={index}>
                {tech}
              </TechPill>
            ))}
          </div>

          <div className="mt-12">
            <ImagePlaceholder 
              height="300px" 
              label="Tech Architecture Diagram"
            />
          </div>
        </div>
      </section>

      {/* ========== SECTION 5: ACADEMIC CONTEXT ========== */}
      <section className="py-16 md:py-24 px-4 bg-[var(--color-main-dark)]">
        <div className="max-w-3xl mx-auto">
          <SectionTitle size="small">
            THESIS PROJECT
          </SectionTitle>

          <GlassPanel variant="medium" insetShadow="md" className="p-8">
            <p className="font-sans text-base text-[var(--color-text-body)] leading-relaxed mb-4">
              This project is the third iteration in my thesis for <strong className="text-[var(--color-accent)]">Engineering in Audiovisual Systems</strong> at <strong className="text-[var(--color-accent)]">Universidad Rey Juan Carlos</strong>.
            </p>
            
            <p className="font-sans text-base text-[var(--color-text-body)] leading-relaxed mb-4">
              <strong className="text-[var(--color-text-main)]">Current Goals:</strong>
            </p>
            <ul className="font-sans text-base text-[var(--color-text-body)] list-disc list-inside mb-4 space-y-2 ml-4">
              <li>Explore procedural maze generation for arcade games</li>
              <li>Implement fully client-side architecture using WebAssembly</li>
              <li>Bridge Python algorithms with modern web rendering</li>
            </ul>

            <p className="font-sans text-base text-[var(--color-text-body)] leading-relaxed mb-4">
              <strong className="text-[var(--color-text-main)]">Future Roadmap:</strong> Decentralized WebRTC multiplayer for 1-4 players, enabling collaborative maze-running without servers.
            </p>

            <p className="font-sans text-sm text-[var(--color-text-body)] opacity-70 mt-6">
              <strong>Inspiration:</strong> Maze generation algorithms inspired by <a href="https://shaunlebron.github.io/pacman-mazegen/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Shaun LeBron's Pac-Man maze research</a>.
            </p>

            <div className="mt-6 pt-6 border-t border-[var(--color-main-light)]">
              <p className="font-sans text-sm text-[var(--color-text-body)]">
                <strong className="text-[var(--color-text-main)]">Author:</strong> @yodak025
              </p>
              <p className="font-sans text-sm text-[var(--color-text-body)]">
                <strong className="text-[var(--color-text-main)]">Version:</strong> 3.0.0
              </p>
              <p className="font-sans text-sm text-[var(--color-text-body)]">
                <strong className="text-[var(--color-text-main)]">License:</strong> CC-BY-SA-4.0
              </p>
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* ========== SECTION 6: CTA FINAL ========== */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <GlassPanel variant="heavy" insetShadow="lg" className="p-12 text-center">
            <h2 className="font-mono text-3xl md:text-4xl tracking-widest text-[var(--color-text-main)] mb-4">
              START YOUR EXPEDITION
            </h2>
            
            <p className="font-sans text-lg text-[var(--color-text-body)] mb-8 max-w-2xl mx-auto">
              Every maze is unique. Every run is different. How long will you survive?
            </p>

            <Link href="/game" prefetch={false} variant="primary" className="text-lg px-10 py-5">
              PLAY NOW
            </Link>

            <p className="font-sans text-sm text-[var(--color-text-body)] opacity-60 mt-6">
              Works on Chrome, Firefox, Safari, Edge • Keyboard controls required
            </p>
          </GlassPanel>
        </div>
      </section>

      {/* ========== SECTION 7: FOOTER ========== */}
      <footer className="py-12 px-4 border-t border-[var(--color-main-light)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Column 1: Project Info */}
            <div>
              <h3 className="font-mono text-lg tracking-wider text-[var(--color-accent)] mb-3">
                PROJECT
              </h3>
              <p className="font-sans text-sm text-[var(--color-text-body)] mb-2">
                <strong className="text-[var(--color-text-main)]">Chomp Crawler</strong>
              </p>
              <p className="font-sans text-sm text-[var(--color-text-body)] mb-1">
                Version 3.0.0
              </p>
              <p className="font-sans text-sm text-[var(--color-text-body)] mb-1">
                License: CC-BY-SA-4.0
              </p>
              <p className="font-sans text-sm text-[var(--color-text-body)]">
                Open Source
              </p>
            </div>

            {/* Column 2: Tech Links */}
            <div>
              <h3 className="font-mono text-lg tracking-wider text-[var(--color-accent)] mb-3">
                TECHNOLOGIES
              </h3>
              <ul className="font-sans text-sm text-[var(--color-text-body)] space-y-1">
                <li>
                  <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-organic">
                    Next.js Documentation
                  </a>
                </li>
                <li>
                  <a href="https://threejs.org" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-organic">
                    Three.js Documentation
                  </a>
                </li>
                <li>
                  <a href="https://pyodide.org" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-organic">
                    Pyodide Documentation
                  </a>
                </li>
                <li>
                  <a href="https://docs.pmnd.rs/react-three-fiber" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-organic">
                    React Three Fiber
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Author & Resources */}
            <div>
              <h3 className="font-mono text-lg tracking-wider text-[var(--color-accent)] mb-3">
                AUTHOR
              </h3>
              <p className="font-sans text-sm text-[var(--color-text-body)] mb-2">
                @yodak025
              </p>
              <p className="font-sans text-sm text-[var(--color-text-body)] mb-3">
                <a href="https://github.com/yodak025/chomp-crawler" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-organic">
                  GitHub Repository →
                </a>
              </p>
              <p className="font-sans text-sm text-[var(--color-text-body)] mb-3">
                <Link href="/styleguide" variant="text" className="text-sm">
                  Design System →
                </Link>
              </p>
              <p className="font-sans text-sm text-[var(--color-text-body)]">
                © 2026
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-[var(--color-main-light)] text-center">
            <p className="font-sans text-sm text-[var(--color-text-body)] opacity-70">
              Engineering in Audiovisual Systems Thesis Project • Universidad Rey Juan Carlos
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
