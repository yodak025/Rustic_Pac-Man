'use client'

import React, { useState } from 'react'
import GlassPanel from '@/ui/components/GlassPanel'
import Button from '@/ui/components/Button'
import Link from '@/ui/components/Link'
import PageTitle from '@/ui/components/PageTitle'
import SectionTitle from '@/ui/components/SectionTitle'
import ProgressBar from '@/ui/components/ProgressBar'
import Checkbox from '@/ui/components/Checkbox'
import KeyDisplay from '@/ui/components/KeyDisplay'
import TechPill from '@/ui/components/TechPill'
import ImagePlaceholder from '@/ui/components/ImagePlaceholder'
import HeartIcon from '@/ui/components/HeartIcon'
import TileCell from '@/ui/components/TileCell'
import VersionInfo from '@/ui/components/VersionInfo'

const Styleguide: React.FC = () => {
  const [checkboxState, setCheckboxState] = useState(false)
  const [showBackdrop, setShowBackdrop] = useState(true)

  return (
    <div className="relative min-h-screen p-8 bg-[var(--color-background)]">
      {/* Backdrop toggle */}
      <div className="fixed top-4 right-4 z-50">
        <GlassPanel variant="medium" className="p-4">
          <Checkbox
            checked={showBackdrop}
            onChange={setShowBackdrop}
            label="Show 3D Backdrop"
          />
        </GlassPanel>
      </div>

      {/* Simulated 3D backdrop */}
      {showBackdrop && (
        <div
          className="fixed inset-0 z-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(245, 158, 11, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(239, 68, 68, 0.08) 0%, transparent 40%),
              linear-gradient(135deg, #1E293B 0%, #0F172A 100%)
            `,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <PageTitle size="large">Design System</PageTitle>
          <p className="text-[var(--color-text-body)] text-xl font-sans">
            Hermetic Expedition Panel - Visual Styleguide
          </p>
          <Link href="/" variant="secondary">
            Back to Game
          </Link>
        </div>

        {/* Typography Section */}
        <section>
          <GlassPanel variant="medium" className="p-8">
            <h2 className="text-3xl font-bold font-mono text-[var(--color-accent)] mb-6">
              Typography System
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-[var(--color-text-body)] font-sans mb-2">
                  Display Font: Sixtyfour (Titles, Headings, Brand)
                </p>
                <PageTitle size="large">Chomp Crawler</PageTitle>
                <PageTitle size="medium">Level Complete</PageTitle>
                <PageTitle size="small">Game Over</PageTitle>
              </div>

              <div>
                <p className="text-sm text-[var(--color-text-body)] font-sans mb-2">
                  Body Font: Montserrat (Data, Paragraphs, UI Text)
                </p>
                <p className="text-xl font-sans text-[var(--color-text-main)] font-semibold">
                  Score: 1,234,567 (SemiBold 600)
                </p>
                <p className="text-base font-sans text-[var(--color-text-body)]">
                  Navigate through procedurally generated mazes. Collect pac-dots and avoid ghosts. (Regular 400)
                </p>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Color Palette Section */}
        <section>
          <GlassPanel variant="medium" className="p-8">
            <h2 className="text-3xl font-bold font-mono text-[var(--color-accent)] mb-6">
              Color Palette - Chomp Core
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Accent', var: '--color-accent', hex: '#F59E0B', desc: 'Amber - Primary' },
                { name: 'Main', var: '--color-main', hex: '#1E293B', desc: 'Slate Navy Base' },
                { name: 'Main Light', var: '--color-main-light', hex: '#334155', desc: 'Interactive' },
                { name: 'Main Dark', var: '--color-main-dark', hex: '#0F172A', desc: 'Deep Containers' },
                { name: 'Background', var: '--color-background', hex: '#020617', desc: 'App Background' },
                { name: 'Text Main', var: '--color-text-main', hex: '#F1F5F9', desc: 'Headings' },
                { name: 'Text Body', var: '--color-text-body', hex: '#94A3B8', desc: 'Paragraphs' },
                { name: 'Success', var: '--color-success', hex: '#10B981', desc: 'Emerald' },
                { name: 'Alert', var: '--color-alert', hex: '#EF4444', desc: 'Matte Red' },
              ].map((color) => (
                <div key={color.var} className="flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-tech border-2 border-[var(--color-main-light)] shadow-inset-sm"
                    style={{ backgroundColor: `var(${color.var})` }}
                  />
                  <div>
                    <p className="font-mono text-sm text-[var(--color-text-main)] font-bold">
                      {color.name}
                    </p>
                    <p className="font-sans text-xs text-[var(--color-text-body)]">
                      {color.hex}
                    </p>
                    <p className="font-sans text-xs text-[var(--color-text-body)]">
                      {color.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        {/* GlassPanel Variants Section */}
        <section>
          <GlassPanel variant="medium" className="p-8">
            <h2 className="text-3xl font-bold font-mono text-[var(--color-accent)] mb-6">
              GlassPanel Variants
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-3">Light</h3>
                <GlassPanel variant="light" className="p-6 h-40">
                  <p className="font-sans text-[var(--color-text-body)]">
                    75% opacity, 4px blur
                  </p>
                  <p className="font-sans text-sm text-[var(--color-text-body)] mt-2">
                    For subtle overlays, tooltips
                  </p>
                </GlassPanel>
              </div>

              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-3">Medium</h3>
                <GlassPanel variant="medium" className="p-6 h-40">
                  <p className="font-sans text-[var(--color-text-body)]">
                    82.5% opacity, 10px blur
                  </p>
                  <p className="font-sans text-sm text-[var(--color-text-body)] mt-2">
                    For standard containers, cards
                  </p>
                </GlassPanel>
              </div>

              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-3">Heavy</h3>
                <GlassPanel variant="heavy" className="p-6 h-40">
                  <p className="font-sans text-[var(--color-text-body)]">
                    90% opacity, 16px blur
                  </p>
                  <p className="font-sans text-sm text-[var(--color-text-body)] mt-2">
                    For modals, critical overlays
                  </p>
                </GlassPanel>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Inset Shadows Section */}
        <section>
          <GlassPanel variant="medium" className="p-8">
            <h2 className="text-3xl font-bold font-mono text-[var(--color-accent)] mb-6">
              Inset Shadows - Brutalist Depth
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {(['none', 'sm', 'md', 'lg'] as const).map((shadow) => (
                <div key={shadow}>
                  <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-3 capitalize">
                    {shadow === 'none' ? 'None' : shadow.toUpperCase()}
                  </h3>
                  <GlassPanel
                    variant="medium"
                    insetShadow={shadow}
                    className="p-6 h-32"
                  >
                    <p className="font-sans text-sm text-[var(--color-text-body)]">
                      {shadow === 'none' ? 'No shadow' : `shadow-inset-${shadow}`}
                    </p>
                  </GlassPanel>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        {/* Button Variants Section */}
        <section>
          <GlassPanel variant="medium" className="p-8">
            <h2 className="text-3xl font-bold font-mono text-[var(--color-accent)] mb-6">
              Button Variants
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-3">Default States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => { }} variant="primary">Primary Button</Button>
                  <Button onClick={() => { }} variant="secondary">Secondary Button</Button>
                  <Button onClick={() => { }} variant="danger">Danger Button</Button>
                  <Button onClick={() => { }} variant="success">Success Button</Button>
                </div>
              </div>

              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-3">Disabled State</h3>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => { }} variant="primary" disabled>Disabled Primary</Button>
                  <Button onClick={() => { }} variant="secondary" disabled>Disabled Secondary</Button>
                </div>
              </div>

              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-3">Hover Instructions</h3>
                <p className="font-sans text-[var(--color-text-body)] mb-3">
                  Hover over buttons to see the "Magnetic Solidification" effect: increased opacity + amber border + subtle inset glow
                </p>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Link Variants Section */}
        <section>
          <GlassPanel variant="medium" className="p-8">
            <h2 className="text-3xl font-bold font-mono text-[var(--color-accent)] mb-6">
              Link Variants
            </h2>

            <div className="flex flex-wrap gap-6">
              <Link href="#" variant="primary">Primary Link</Link>
              <Link href="#" variant="secondary">Secondary Link</Link>
              <Link href="#" variant="text">Text Link</Link>
            </div>
          </GlassPanel>
        </section>

        {/* Interactive Components Section */}
        <section>
          <GlassPanel variant="medium" className="p-8">
            <h2 className="text-3xl font-bold font-mono text-[var(--color-accent)] mb-6">
              Interactive Components
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-4">Progress Bar</h3>
                <ProgressBar progress={65} showPercentage animated />
              </div>

              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-4">Checkbox</h3>
                <Checkbox
                  checked={checkboxState}
                  onChange={setCheckboxState}
                  label="Toggle this checkbox"
                />
              </div>

              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-4">Key Display</h3>
                <div className="flex gap-3">
                  <KeyDisplay value="W" />
                  <KeyDisplay value="A" />
                  <KeyDisplay value="S" />
                  <KeyDisplay value="D" />
                </div>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Geometric Properties Section */}
        <section>
          <GlassPanel variant="medium" className="p-8">
            <h2 className="text-3xl font-bold font-mono text-[var(--color-accent)] mb-6">
              Geometric Properties
            </h2>

            <div className="space-y-4">
              <div>
                <p className="font-sans text-[var(--color-text-body)] mb-2">
                  <span className="font-semibold text-[var(--color-text-main)]">Border Radius (Technical):</span> 5px
                </p>
                <p className="font-sans text-sm text-[var(--color-text-body)]">
                  Functional moderate rounding - balance between modern and severe
                </p>
              </div>

              <div>
                <p className="font-sans text-[var(--color-text-body)] mb-2">
                  <span className="font-semibold text-[var(--color-text-main)]">Transition (Organic):</span> 250ms ease-out
                </p>
                <p className="font-sans text-sm text-[var(--color-text-body)]">
                  Moderate organic timing - like filament warming up
                </p>
              </div>

              <div>
                <p className="font-sans text-[var(--color-text-body)] mb-2">
                  <span className="font-semibold text-[var(--color-text-main)]">Philosophy:</span> Functional Brutalism
                </p>
                <p className="font-sans text-sm text-[var(--color-text-body)]">
                  Solid blocks, minimal curves, magnetic anchoring, industrial weight
                </p>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* New Components Section - Landing Page Elements */}
        <section>
          <GlassPanel variant="medium" className="p-8">
            <h2 className="text-3xl font-bold font-mono text-[var(--color-accent)] mb-6">
              Landing Page Components
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-4">SectionTitle</h3>
                <SectionTitle size="large">Large Section Title</SectionTitle>
                <SectionTitle size="medium">Medium Section Title</SectionTitle>
                <SectionTitle size="small">Small Section Title</SectionTitle>
              </div>

              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-4">TechPill</h3>
                <div className="flex flex-wrap gap-3">
                  <TechPill>Next.js 16</TechPill>
                  <TechPill>React 19</TechPill>
                  <TechPill>TypeScript</TechPill>
                  <TechPill>Three.js</TechPill>
                </div>
              </div>

              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-4">ImagePlaceholder</h3>
                <ImagePlaceholder height="200px" label="Screenshot Placeholder" />
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Game UI Components Section */}
        <section>
          <GlassPanel variant="medium" className="p-8">
            <h2 className="text-3xl font-bold font-mono text-[var(--color-accent)] mb-6">
              Game UI Components
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-4">HeartIcon</h3>
                <div className="flex gap-2">
                  <HeartIcon />
                  <HeartIcon />
                  <HeartIcon />
                </div>
              </div>

              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-4">TileCell</h3>
                <div className="flex gap-2">
                  <TileCell value={0} rowIndex={0} colIndex={0} tileTypes={{ 0: 'Empty' }} />
                  <TileCell value={1} rowIndex={0} colIndex={1} tileTypes={{ 1: 'Wall' }} />
                  <TileCell value={2} rowIndex={0} colIndex={2} tileTypes={{ 2: 'Pellet' }} />
                  <TileCell value={3} rowIndex={0} colIndex={3} tileTypes={{ 3: 'Power' }} />
                  <TileCell value={4} rowIndex={0} colIndex={4} tileTypes={{ 4: 'Special' }} />
                </div>
                <p className="font-sans text-sm text-[var(--color-text-body)] mt-2">
                  Types: 0=Empty, 1=Wall, 2=Pellet, 3=Power, 4=Special
                </p>
              </div>

              <div>
                <h3 className="font-mono text-lg text-[var(--color-text-main)] mb-4">VersionInfo</h3>
                <VersionInfo />
              </div>
            </div>
          </GlassPanel>
        </section>
      </div>
    </div>
  )
}

export default Styleguide
