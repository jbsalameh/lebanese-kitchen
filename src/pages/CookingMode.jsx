import { useState, useEffect, useCallback } from 'react'
import recipes, { getCategoryGradient } from '../data/recipes'

export default function CookingMode({ recipeId, onExit }) {
  const [step, setStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState({})
  const [touchStart, setTouchStart] = useState(null)

  const recipe = recipes.find(r => r.id === recipeId)
  if (!recipe) return null

  const total = recipe.instructions.length
  const isLast = step === total - 1
  const isFirst = step === 0
  const progress = ((step + 1) / total) * 100

  // Wake Lock API — keep screen on while cooking
  useEffect(() => {
    let wakeLock = null
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch {}
    }
    requestWakeLock()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (wakeLock) wakeLock.release()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const goNext = useCallback(() => {
    if (!isLast) {
      setCompletedSteps(prev => ({ ...prev, [step]: true }))
      setStep(s => s + 1)
    }
  }, [step, isLast])

  const goPrev = useCallback(() => {
    if (!isFirst) setStep(s => s - 1)
  }, [isFirst])

  // Swipe handling
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext()
      else goPrev()
    }
    setTouchStart(null)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, onExit])

  return (
    <div
      className="cooking-mode"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="cooking-header">
        <button className="cooking-exit" onClick={onExit}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="cooking-recipe-name">{recipe.name}</div>
        <div className="cooking-step-count">
          {step + 1} / {total}
        </div>
      </div>

      {/* Progress bar */}
      <div className="cooking-progress">
        <div className="cooking-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step content */}
      <div className="cooking-content">
        <div className="cooking-step-badge">Step {step + 1}</div>
        <div className="cooking-instruction">
          {recipe.instructions[step]}
        </div>
      </div>

      {/* Step dots */}
      <div className="cooking-dots">
        {recipe.instructions.map((_, i) => (
          <button
            key={i}
            className={`cooking-dot ${i === step ? 'active' : ''} ${completedSteps[i] ? 'done' : ''}`}
            onClick={() => setStep(i)}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="cooking-nav">
        <button
          className="cooking-nav-btn prev"
          onClick={goPrev}
          disabled={isFirst}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Previous
        </button>

        {isLast ? (
          <button className="cooking-nav-btn done" onClick={onExit}>
            Done!
          </button>
        ) : (
          <button className="cooking-nav-btn next" onClick={goNext}>
            Next
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
