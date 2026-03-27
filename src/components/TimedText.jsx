const timePattern = /(\d+)[\s–-]*(?:to[\s–-]*(\d+)\s*)?(?:minutes?|mins?|hours?|hrs?)/gi

function parseTimesFromText(text) {
  const matches = []
  let match
  const regex = new RegExp(timePattern)
  while ((match = regex.exec(text)) !== null) {
    const min = parseInt(match[1])
    const max = match[2] ? parseInt(match[2]) : min
    // Use the max value for the timer
    const minutes = match[0].toLowerCase().includes('hour') ? max * 60 : max
    if (minutes > 0 && minutes <= 480) {
      matches.push({
        text: match[0],
        minutes,
        index: match.index,
        length: match[0].length,
      })
    }
  }
  return matches
}

export default function TimedText({ text, onStartTimer }) {
  const times = parseTimesFromText(text)

  if (times.length === 0) return <>{text}</>

  const parts = []
  let lastIndex = 0

  times.forEach((t, i) => {
    if (t.index > lastIndex) {
      parts.push(<span key={`t-${i}`}>{text.slice(lastIndex, t.index)}</span>)
    }
    parts.push(
      <button
        key={`btn-${i}`}
        className="time-chip"
        onClick={(e) => {
          e.stopPropagation()
          onStartTimer(t.minutes, t.text)
        }}
        title={`Start ${t.minutes} min timer`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {t.text}
      </button>
    )
    lastIndex = t.index + t.length
  })

  if (lastIndex < text.length) {
    parts.push(<span key="end">{text.slice(lastIndex)}</span>)
  }

  return <>{parts}</>
}
