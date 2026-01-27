'use client'

import dynamic from 'next/dynamic'
import LoadingScreen from '@/ui/common/LoadingScreen'

const GameApp = dynamic(() => import('@/ui/pages/GameApp'), {
  ssr: false,
  loading: () => <LoadingScreen />
})

export default function GamePage() {
  return <GameApp />
}
