export function OfflineBanner({ isOffline }) {
  if (!isOffline) return null
  return (
    <div className="offline-banner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      You're offline — recipes & saved data still available
    </div>
  )
}

export function UpdateBanner({ needRefresh, onUpdate, onDismiss }) {
  if (!needRefresh) return null
  return (
    <div className="update-banner">
      <span>A new version is available!</span>
      <div className="update-actions">
        <button className="update-btn" onClick={onUpdate}>Update</button>
        <button className="update-dismiss" onClick={onDismiss}>Later</button>
      </div>
    </div>
  )
}

export function InstallPrompt({ installPrompt, onInstall }) {
  if (!installPrompt) return null
  return (
    <div className="install-prompt">
      <div className="install-content">
        <span className="install-icon">🇱🇧</span>
        <div className="install-text">
          <strong>Install Lebanese Kitchen</strong>
          <span>Add to home screen for quick access</span>
        </div>
      </div>
      <button className="install-btn" onClick={onInstall}>Install</button>
    </div>
  )
}
