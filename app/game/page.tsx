'use client'

import dynamic from 'next/dynamic'
import LoadingScreen from '@/ui/common/LoadingScreen'

const GameWrapper = dynamic(() => import('@/ui/pages/GameWrapper'), {
  ssr: false,
  loading: () => <LoadingScreen />
})

export default function GamePage() {
  return <GameWrapper />
}
