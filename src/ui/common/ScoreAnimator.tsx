'use client'

import React, { useState, useEffect } from 'react'

// Animation timing constants (milliseconds)
const BONUS_APPEAR_DELAY = 100
const BONUS_DISPLAY_DURATION = 1000
const SCORE_INCREMENT_DURATION = 25
const MAX_INCREMENT_STEPS = 30

export interface ScoreAnimatorProps {
  initialScore: number
  bonus: number
  className?: string
}

const ScoreAnimator: React.FC<ScoreAnimatorProps> = ({
  initialScore,
  bonus,
  className = ''
}) => {
  const [currentScore, setCurrentScore] = useState(initialScore)
  const [showBonus, setShowBonus] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const finalScore = initialScore + bonus

  useEffect(() => {
    // Step 1: Show bonus after a short delay
    const bonusTimeout = setTimeout(() => {
      setShowBonus(true)
    }, BONUS_APPEAR_DELAY)

    // Step 2: Start incrementing after bonus is shown
    const startAnimationTimeout = setTimeout(() => {
      setShowBonus(false)
      setIsAnimating(true)
    }, BONUS_APPEAR_DELAY + BONUS_DISPLAY_DURATION)

    return () => {
      clearTimeout(bonusTimeout)
      clearTimeout(startAnimationTimeout)
    }
  }, [])

  useEffect(() => {
    if (!isAnimating || currentScore >= finalScore) {
      return
    }

    // Increment animation
    const steps = Math.min(bonus, MAX_INCREMENT_STEPS)
    const increment = Math.ceil(bonus / steps)
    const interval = SCORE_INCREMENT_DURATION / steps

    const timer = setInterval(() => {
      setCurrentScore(prev => {
        const next = prev + increment
        if (next >= finalScore) {
          clearInterval(timer)
          return finalScore
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isAnimating, currentScore, finalScore, bonus])

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="text-5xl font-bold text-[var(--color-accent)] font-mono">
        {currentScore.toLocaleString()}
      </div>

      {/* Always reserve space for bonus text */}
      <div
        className="text-2xl font-bold text-[var(--color-text-main)] font-mono h-8 flex items-center justify-center"
        style={{
          animation: showBonus ? `fadeInOut ${BONUS_DISPLAY_DURATION}ms ease-in-out` : 'none',
          opacity: showBonus ? 1 : 0
        }}
      >
        {showBonus ? `+${bonus} BONUS` : '\u00A0'}
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

export default ScoreAnimator
