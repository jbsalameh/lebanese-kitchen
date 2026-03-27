import { useState, useMemo } from 'react'
import recipes, { categories } from '../data/recipes'
import RecipeCard from '../components/RecipeCard'
import { getCategoryGradient } from '../data/recipes'

export default function Gallery({ weeklyPlan, favorites, recentlyViewed, onOpenRecipe, onAddToWeekly, onRemoveFromWeekly, onToggleFavorite }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const recentRecipes = useMemo(() => {
    if (!recentlyViewed || recentlyViewed.length === 0) return []
    return recentlyViewed.map(id => recipes.find(r => r.id === id)).filter(Boolean)
  }, [recentlyViewed])

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const matchCat = activeCategory === 'all'
        || (activeCategory === 'favorites' ? favorites.includes(r.id) : r.category === activeCategory)
      const q = search.toLowerCase()
      const matchSearch = !q ||
        r.name.toLowerCase().includes(q) ||
        r.nameAr.includes(q) ||
        r.tags.some(t => t.includes(q)) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some(ing => ing.name.toLowerCase().includes(q))
      return matchCat && matchSearch
    })
  }, [search, activeCategory, favorites])

  const allCategories = [
    ...categories.slice(0, 1),
    { id: 'favorites', label: 'Favorites', emoji: '❤️' },
    ...categories.slice(1),
  ]

  return (
    <div className="page">
      <div className="gallery-header">
        <div className="gallery-brand">
          <h1>Lebanese Kitchen</h1>
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
      </div>

      {/* Recently Viewed */}
      {recentRecipes.length > 0 && !search && activeCategory === 'all' && (
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
          {(search || activeCategory !== 'all') && (
            <div className="results-count">
              {filtered.length} recipe{filtered.length !== 1 ? 's' : ''} found
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
