import { useState, useMemo } from 'react'
import recipes, { categories } from '../data/recipes'
import RecipeCard from '../components/RecipeCard'

export default function Gallery({ weeklyPlan, onOpenRecipe, onAddToWeekly, onRemoveFromWeekly }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const matchCat = activeCategory === 'all' || r.category === activeCategory
      const q = search.toLowerCase()
      const matchSearch = !q ||
        r.name.toLowerCase().includes(q) ||
        r.nameAr.includes(q) ||
        r.tags.some(t => t.includes(q)) ||
        r.description.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [search, activeCategory])

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
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

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
                onSelect={onOpenRecipe}
                onAdd={(id) => weeklyPlan.includes(id) ? onRemoveFromWeekly(id) : onAddToWeekly(id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-results">
          <div className="empty-results-icon">🔍</div>
          <h3>No recipes found</h3>
          <p>Try a different search or category</p>
        </div>
      )}
    </div>
  )
}
