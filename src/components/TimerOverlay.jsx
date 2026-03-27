import { useState, useEffect, useRef } from 'react'

export default function TimerOverlay({ timers, onRemoveTimer }) {
  const [now, setNow] = useState(Date.now())
  const intervalRef = useRef(null)

  useEffect(() => {
    if (timers.length > 0) {
      intervalRef.current = setInterval(() => setNow(Date.now()), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [timers.length])

  // Play alarm sound when timer finishes
  useEffect(() => {
    timers.forEach(t => {
      const remaining = Math.max(0, t.endsAt - now)
      if (remaining === 0 && !t.notified) {
        t.notified = true
        try {
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200])
        } catch {}
      }
    })
  }, [now, timers])

  if (timers.length === 0) return null

  return (
    <div className="timer-overlay">
      {timers.map(timer => {
        const remaining = Math.max(0, timer.endsAt - now)
        const mins = Math.floor(remaining / 60000)
        const secs = Math.floor((remaining % 60000) / 1000)
        const isDone = remaining === 0
        const progress = 1 - (remaining / (timer.duration * 60000))

        return (
          <div key={timer.id} className={`timer-pill ${isDone ? 'done' : ''}`}>
            <div className="timer-pill-progress" style={{ width: `${progress * 100}%` }} />
            <div className="timer-pill-content">
              <span className="timer-pill-label">{timer.label}</span>
              <span className="timer-pill-time">
                {isDone ? 'Done!' : `${mins}:${secs.toString().padStart(2, '0')}`}
              </span>
              <button className="timer-pill-close" onClick={() => onRemoveTimer(timer.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
