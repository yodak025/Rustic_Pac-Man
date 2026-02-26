'use client'

import dynamic from 'next/dynamic'
import LoadingScreen from '@/ui/common/LoadingScreen'

const MusicGenerator = dynamic(() => import('@/ui/pages/MusicGenerator'), {
  ssr: false,
  loading: () => <LoadingScreen />,
})

export default function MusicGeneratorPage() {
  return <MusicGenerator />
}
