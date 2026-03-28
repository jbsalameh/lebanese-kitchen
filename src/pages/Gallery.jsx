import { useState, useMemo } from 'react'
import recipes, { categories, collections, getCategoryGradient, getDietary } from '../data/recipes'
import RecipeCard from '../components/RecipeCard'

const dietaryFilters = [
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'glutenFree', label: 'Gluten-Free', emoji: '🌾' },
  { id: 'dairyFree', label: 'Dairy-Free', emoji: '🥛' },
]

export default function Gallery({ weeklyPlan, favorites, recentlyViewed, onOpenRecipe, onAddToWeekly, onRemoveFromWeekly, onToggleFavorite, theme, onToggleTheme }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeDietary, setActiveDietary] = useState([])
  const [activeCollection, setActiveCollection] = useState(null)

  const toggleDietary = (id) => {
    setActiveDietary(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }

  const recentRecipes = useMemo(() => {
    if (!recentlyViewed || recentlyViewed.length === 0) return []
    return recentlyViewed.map(id => recipes.find(r => r.id === id)).filter(Boolean)
  }, [recentlyViewed])

  const collectionObj = activeCollection ? collections.find(c => c.id === activeCollection) : null

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      if (collectionObj) return collectionObj.filter(r)
      const matchCat = activeCategory === 'all'
        || (activeCategory === 'favorites' ? favorites.includes(r.id) : r.category === activeCategory)
      const q = search.toLowerCase()
      const matchSearch = !q ||
        r.name.toLowerCase().includes(q) ||
        r.nameAr.includes(q) ||
        r.tags.some(t => t.includes(q)) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some(ing => ing.name.toLowerCase().includes(q))
      const dietary = getDietary(r)
      const matchDietary = activeDietary.length === 0 || activeDietary.every(d => dietary[d])
      return matchCat && matchSearch && matchDietary
    })
  }, [search, activeCategory, favorites, activeDietary, collectionObj])

  const allCategories = [
    ...categories.slice(0, 1),
    { id: 'favorites', label: 'Favorites', emoji: '❤️' },
    ...categories.slice(1),
  ]

  const hasActiveFilters = search || activeCategory !== 'all' || activeDietary.length > 0 || activeCollection

  return (
    <div className="page">
      <div className="gallery-header">
        <div className="gallery-brand">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1>Lebanese Kitchen</h1>
            <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle dark mode">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <span>🇱🇧 {recipes.length} recipes</span>
        </div>

        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search recipes, ingredients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 18, lineHeight: 1 }}
              onClick={() => setSearch('')}
            >×</button>
          )}
        </div>

        <div className="category-chips">
          {allCategories.map(cat => (
            <button
              key={cat.id}
              className={`chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.emoji}</span>
              {cat.label}
              {cat.id === 'favorites' && favorites.length > 0 && (
                <span className="chip-count">{favorites.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="dietary-chips">
          {dietaryFilters.map(d => (
            <button
              key={d.id}
              className={`dietary-chip ${activeDietary.includes(d.id) ? 'active' : ''}`}
              onClick={() => toggleDietary(d.id)}
            >
              <span>{d.emoji}</span>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Collections */}
      {!search && !activeCollection && activeCategory === 'all' && activeDietary.length === 0 && (
        <div className="collections-section">
          <div className="collections-title">Collections</div>
          <div className="collections-scroll">
            {collections.map(col => (
              <button
                key={col.id}
                className="collection-card"
                onClick={() => setActiveCollection(col.id)}
                style={{ background: col.gradient }}
              >
                <span className="collection-emoji">{col.emoji}</span>
                <span className="collection-name">{col.title}</span>
                <span className="collection-sub">{col.subtitle}</span>
                <span className="collection-count">{recipes.filter(col.filter).length} recipes</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active collection header */}
      {activeCollection && collectionObj && (
        <div className="collection-active-header">
          <button className="collection-back" onClick={() => setActiveCollection(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Collections
          </button>
          <div className="collection-active-title">
            <span>{collectionObj.emoji}</span> {collectionObj.title}
          </div>
          <div className="collection-active-sub">{collectionObj.subtitle}</div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentRecipes.length > 0 && !search && activeCategory === 'all' && activeDietary.length === 0 && (
        <div className="recent-section">
          <div className="recent-title">Recently Viewed</div>
          <div className="recent-scroll">
            {recentRecipes.map(recipe => (
              <div key={recipe.id} className="recent-card" onClick={() => onOpenRecipe(recipe.id)}>
                <div className="recent-img">
                  {!recipe.useGradient && recipe.image ? (
                    <img src={recipe.image} alt={recipe.name} />
                  ) : (
                    <div className="recent-gradient" style={{ background: getCategoryGradient(recipe.category) }}>
                      {recipe.emoji}
                    </div>
                  )}
                </div>
                <div className="recent-name">{recipe.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        <>
          {hasActiveFilters && (
            <div className="results-count">
              {filtered.length} recipe{filtered.length !== 1 ? 's' : ''} found
              {activeDietary.length > 0 && (
                <button className="clear-filters" onClick={() => setActiveDietary([])}>
                  Clear dietary filters
                </button>
              )}
            </div>
          )}
          <div className="recipe-grid">
            {filtered.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isAdded={weeklyPlan.includes(recipe.id)}
                isFavorite={favorites.includes(recipe.id)}
                onSelect={onOpenRecipe}
                onAdd={(id) => weeklyPlan.includes(id) ? onRemoveFromWeekly(id) : onAddToWeekly(id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-results">
          <div className="empty-results-icon">{activeCategory === 'favorites' ? '❤️' : '🔍'}</div>
          <h3>{activeCategory === 'favorites' ? 'No favorites yet' : 'No recipes found'}</h3>
          <p>{activeCategory === 'favorites' ? 'Tap the heart on any recipe to save it here' : 'Try a different search or category'}</p>
        </div>
      )}
    </div>
  )
}
