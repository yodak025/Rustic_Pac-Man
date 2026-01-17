'use client'

import { useEffect, useRef } from 'react'
import { RusticGameEngine } from '@/core/engine'
import GameApp from './GameApp'

export default function GameWrapper() {
  const engineRef = useRef<RusticGameEngine | null>(null)

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new RusticGameEngine()
      engineRef.current.start()
      console.log('RusticGameEngine initialized')
    }

    return () => {
      if (engineRef.current) {
        console.log('RusticGameEngine cleanup')
      }
    }
  }, [])

  return <GameApp />
}
