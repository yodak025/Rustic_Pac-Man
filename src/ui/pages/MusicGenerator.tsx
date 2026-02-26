'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import Link from '@/ui/components/Link'
import PageTitle from '@/ui/components/PageTitle'
import MusicGeneratorControls from '@/ui/layout/MusicGeneratorControls'
import InstrumentLayers from '@/ui/layout/InstrumentLayers'
import { MusicOrchestrator } from '@audio/orchestrator/MusicOrchestrator'
import { MusicContext } from '@audio/theory/MusicContext'
import { LEVEL_CONTEXTS } from '@audio/contexts/LevelContexts'
import type { TextureDensity } from '@audio/theory/MusicContext'
import type { LevelContextName } from '@audio/contexts/LevelContexts'
import type { InstrumentRole } from '@audio/instruments/base/Instrument'
import type { VariationType } from '@audio/generators/VariationEngine'

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL_CONTEXT_NAME: LevelContextName = 'exploration'

const INITIAL_LAYERS: Record<InstrumentRole, boolean> = {
  percussion: true,
  bass: true,
  pad: true,
  lead1: true,
  lead2: true,
}

// ---------------------------------------------------------------------------
// MusicGenerator page component
// ---------------------------------------------------------------------------

const MusicGenerator: React.FC = () => {
  // Engine state
  const [isInitialized, setIsInitialized] = useState(false)
  const [isRunning, setIsRunning]         = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Musical controls (mirrors orchestrator state for UI)
  const [contextName, setContextName] = useState<LevelContextName>(INITIAL_CONTEXT_NAME)
  const [intensity, setIntensityState] = useState(LEVEL_CONTEXTS[INITIAL_CONTEXT_NAME].intensity ?? 0.5)
  const [texture, setTextureState]    = useState<TextureDensity>(LEVEL_CONTEXTS[INITIAL_CONTEXT_NAME].texture ?? 'medium')
  const [tension, setTensionState]    = useState(LEVEL_CONTEXTS[INITIAL_CONTEXT_NAME].tension ?? 0.0)
  const [bpm, setBpm]                 = useState(LEVEL_CONTEXTS[INITIAL_CONTEXT_NAME].bpm)
  const [layers, setLayers]           = useState<Record<InstrumentRole, boolean>>(INITIAL_LAYERS)

  // Poll transition state every 200 ms while running
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const startPolling = useCallback(() => {
    stopPolling()
    pollRef.current = setInterval(() => {
      const orch = MusicOrchestrator.getInstance()
      if (!orch.isInitialized) return
      const snap = orch.getSnapshot()
      setIsTransitioning(snap.isTransitioning)
      setBpm(snap.context.bpm)
      setLayers({ ...snap.layers })
    }, 200)
  }, [stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
      const orch = MusicOrchestrator.getInstance()
      if (orch.isInitialized) {
        orch.stop()
        orch.dispose()
      }
    }
  }, [stopPolling])

  // ---------------------------------------------------------------------------
  // Transport handlers
  // ---------------------------------------------------------------------------

  const handleStart = useCallback(async () => {
    const orch = MusicOrchestrator.getInstance()

    if (!orch.isInitialized) {
      const ctx = MusicContext.fromPreset(LEVEL_CONTEXTS[contextName])
      await orch.initialize(ctx)
      setIsInitialized(true)
    }

    orch.start()
    setIsRunning(true)
    startPolling()
  }, [contextName, startPolling])

  const handleStop = useCallback(() => {
    const orch = MusicOrchestrator.getInstance()
    orch.stop()
    setIsRunning(false)
    stopPolling()
    setIsTransitioning(false)
  }, [stopPolling])

  // ---------------------------------------------------------------------------
  // Musical control handlers
  // ---------------------------------------------------------------------------

  const handleContextChange = useCallback((name: LevelContextName) => {
    setContextName(name)
    const preset = LEVEL_CONTEXTS[name]
    setIntensityState(preset.intensity ?? 0.5)
    setTextureState(preset.texture ?? 'medium')
    setTensionState(preset.tension ?? 0.0)

    if (!isRunning) return
    const orch = MusicOrchestrator.getInstance()
    const ctx = MusicContext.fromPreset(preset)
    orch.setLevelContext(ctx)
  }, [isRunning])

  const handleIntensityChange = useCallback((value: number) => {
    setIntensityState(value)
    if (!isRunning) return
    MusicOrchestrator.getInstance().setIntensity(value)
  }, [isRunning])

  const handleTextureChange = useCallback((value: TextureDensity) => {
    setTextureState(value)
    if (!isRunning) return
    MusicOrchestrator.getInstance().setTexture(value)
  }, [isRunning])

  const handleTensionChange = useCallback((value: number) => {
    setTensionState(value)
    if (!isRunning) return
    MusicOrchestrator.getInstance().setTension(value)
  }, [isRunning])

  // ---------------------------------------------------------------------------
  // Layer handlers
  // ---------------------------------------------------------------------------

  const handleToggleLayer = useCallback((role: InstrumentRole) => {
    if (!isRunning) return
    const orch = MusicOrchestrator.getInstance()
    const current = orch.isLayerEnabled(role)
    if (current) {
      orch.disableLayer(role)
    } else {
      orch.enableLayer(role)
    }
    setLayers((prev) => ({ ...prev, [role]: !current }))
  }, [isRunning])

  const handleVariation = useCallback((role: InstrumentRole, type: VariationType) => {
    if (!isRunning) return
    MusicOrchestrator.getInstance().triggerVariation(role, { type, amount: 0.5 })
  }, [isRunning])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-main)] flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex flex-col items-center gap-2">
        <PageTitle>MUSIC GENERATOR</PageTitle>
        <p className="font-sans text-sm text-[var(--color-text-body)] text-center max-w-lg">
          Adaptive music engine sandbox. Initialise, switch contexts and mutate
          layers in real time.
        </p>
        <Link href="/" variant="secondary" className="mt-2 text-xs">
          ← BACK TO MENU
        </Link>
      </header>

      {/* Main layout */}
      <main className="flex-1 px-6 pb-10 flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto w-full">
        {/* Left column: engine + context controls */}
        <div className="flex-1 min-w-0">
          <MusicGeneratorControls
            contextName={contextName}
            intensity={intensity}
            texture={texture}
            tension={tension}
            bpm={bpm}
            isRunning={isRunning}
            isInitialized={isInitialized}
            isTransitioning={isTransitioning}
            onStart={handleStart}
            onStop={handleStop}
            onContextChange={handleContextChange}
            onIntensityChange={handleIntensityChange}
            onTextureChange={handleTextureChange}
            onTensionChange={handleTensionChange}
          />
        </div>

        {/* Right column: instrument layers */}
        <div className="flex-1 min-w-0">
          <InstrumentLayers
            layers={layers}
            isInitialized={isInitialized}
            onToggleLayer={handleToggleLayer}
            onVariation={handleVariation}
          />
        </div>
      </main>
    </div>
  )
}

export default MusicGenerator
