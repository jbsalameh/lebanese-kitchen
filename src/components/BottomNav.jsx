export default function BottomNav({ currentPage, onNavigate, weeklyCount }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${currentPage === 'gallery' ? 'active' : ''}`}
        onClick={() => onNavigate('gallery')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        Recipes
      </button>

      <button
        className={`nav-item ${currentPage === 'weekly' ? 'active' : ''}`}
        onClick={() => onNavigate('weekly')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {weeklyCount > 0 && <span className="nav-badge">{weeklyCount}</span>}
        My Week
      </button>

      <button
        className={`nav-item ${currentPage === 'shopping' ? 'active' : ''}`}
        onClick={() => onNavigate('shopping')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        Shopping
      </button>
    </nav>
  )
}
