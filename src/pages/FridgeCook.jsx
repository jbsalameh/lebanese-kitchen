import { useState, useMemo } from 'react'
import recipes from '../data/recipes'

// Extract all unique ingredient base names from recipes, excluding pantry staples
const STAPLES = ['salt', 'water', 'olive oil', 'black pepper', 'ground black pepper']

function normalizeIngName(name) {
  return name.toLowerCase()
    .replace(/^(fresh|dried|ground|large|small|medium|whole|finely|chopped|minced|thin|thick)\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getBaseIngredients() {
  const map = new Map()
  recipes.forEach(r => {
    r.ingredients.forEach(ing => {
      const norm = normalizeIngName(ing.name)
      if (STAPLES.some(s => norm.includes(s))) return
      if (!map.has(norm)) {
        map.set(norm, { name: ing.name, category: ing.category, count: 0 })
      }
      map.get(norm).count++
    })
  })
  return [...map.values()].sort((a, b) => b.count - a.count)
}

const allIngredients = getBaseIngredients()

const categoryLabels = {
  produce: '🥬 Produce',
  meat: '🥩 Meat',
  dairy: '🧀 Dairy',
  grains: '🌾 Grains',
  spices: '🌶️ Spices',
  condiments: '🫙 Condiments',
  pantry: '🏪 Pantry',
  bakery: '🥖 Bakery',
  other: '📦 Other',
}

function matchScore(recipe, selectedSet) {
  const key = recipe.ingredients
    .filter(ing => !STAPLES.some(s => normalizeIngName(ing.name).includes(s)))
  if (key.length === 0) return { pct: 0, have: 0, total: 0, missing: [] }
  const have = key.filter(ing => selectedSet.has(normalizeIngName(ing.name)))
  const missing = key.filter(ing => !selectedSet.has(normalizeIngName(ing.name)))
  return {
    pct: Math.round((have.length / key.length) * 100),
    have: have.length,
    total: key.length,
    missing: missing.map(m => m.name),
  }
}

export default function FridgeCook({ onOpenRecipe, onAddToWeekly, weeklyPlan }) {
  const [selected, setSelected] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('fridgeIngredients')) || []) } catch { return new Set() }
  })
  const [search, setSearch] = useState('')
  const [showBrowse, setShowBrowse] = useState(false)
  const [browseCategory, setBrowseCategory] = useState(null)

  const saveSelected = (newSet) => {
    setSelected(newSet)
    localStorage.setItem('fridgeIngredients', JSON.stringify([...newSet]))
  }

  const toggle = (name) => {
    const norm = normalizeIngName(name)
    const next = new Set(selected)
    if (next.has(norm)) next.delete(norm)
    else next.add(norm)
    saveSelected(next)
  }

  const clearAll = () => saveSelected(new Set())

  const selectedSet = selected

  // Filtered suggestions for search
  const suggestions = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return allIngredients
      .filter(ing => normalizeIngName(ing.name).includes(q) && !selectedSet.has(normalizeIngName(ing.name)))
      .slice(0, 8)
  }, [search, selectedSet])

  // Recipe matches
  const matches = useMemo(() => {
    if (selectedSet.size === 0) return []
    return recipes
      .map(r => ({ recipe: r, ...matchScore(r, selectedSet) }))
      .filter(m => m.pct > 0)
      .sort((a, b) => b.pct - a.pct || a.missing.length - b.missing.length)
  }, [selectedSet])

  // Browse ingredients by category
  const ingredientsByCategory = useMemo(() => {
    const cats = {}
    allIngredients.forEach(ing => {
      const cat = ing.category || 'other'
      if (!cats[cat]) cats[cat] = []
      cats[cat].push(ing)
    })
    return cats
  }, [])

  const selectedList = allIngredients.filter(ing => selectedSet.has(normalizeIngName(ing.name)))

  return (
    <div className="page fridge-page">
      <div className="fridge-header">
        <h1 className="fridge-title">
          <span className="fridge-icon">🧊</span>
          What's in your fridge?
        </h1>
        <p className="fridge-subtitle">Add ingredients you have and we'll find recipes you can make</p>
      </div>

      {/* Search input */}
      <div className="fridge-search-wrap">
        <svg className="fridge-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="fridge-search"
          type="text"
          placeholder="Type an ingredient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="fridge-search-clear" onClick={() => setSearch('')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Search suggestions */}
      {suggestions.length > 0 && (
        <div className="fridge-suggestions">
          {suggestions.map(ing => (
            <button
              key={ing.name}
              className="fridge-suggestion"
              onClick={() => { toggle(ing.name); setSearch('') }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {ing.name}
            </button>
          ))}
        </div>
      )}

      {/* Browse by category toggle */}
      <button className="fridge-browse-toggle" onClick={() => setShowBrowse(!showBrowse)}>
        {showBrowse ? 'Hide' : 'Browse'} all ingredients
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
          style={{ transform: showBrowse ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showBrowse && (
        <div className="fridge-browse">
          <div className="fridge-cat-chips">
            {Object.keys(ingredientsByCategory).map(cat => (
              <button
                key={cat}
                className={`fridge-cat-chip ${browseCategory === cat ? 'active' : ''}`}
                onClick={() => setBrowseCategory(browseCategory === cat ? null : cat)}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
          {browseCategory && (
            <div className="fridge-browse-list">
              {ingredientsByCategory[browseCategory]?.map(ing => {
                const norm = normalizeIngName(ing.name)
                const isSelected = selectedSet.has(norm)
                return (
                  <button
                    key={ing.name}
                    className={`fridge-browse-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggle(ing.name)}
                  >
                    {isSelected && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {ing.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected ingredients */}
      {selectedList.length > 0 && (
        <div className="fridge-selected">
          <div className="fridge-selected-header">
            <span className="fridge-selected-title">Your ingredients ({selectedList.length})</span>
            <button className="fridge-clear-btn" onClick={clearAll}>Clear all</button>
          </div>
          <div className="fridge-selected-chips">
            {selectedList.map(ing => (
              <button
                key={ing.name}
                className="fridge-chip"
                onClick={() => toggle(ing.name)}
              >
                {ing.name}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recipe matches */}
      {selectedSet.size > 0 && (
        <div className="fridge-results">
          <h2 className="fridge-results-title">
            {matches.length > 0 ? `${matches.length} recipe${matches.length !== 1 ? 's' : ''} you can make` : 'No matching recipes'}
          </h2>
          {matches.length === 0 && (
            <p className="fridge-no-results">Try adding more ingredients to find recipes.</p>
          )}
          {matches.map(m => {
            const isAdded = weeklyPlan.includes(m.recipe.id)
            return (
              <div key={m.recipe.id} className="fridge-match-card" onClick={() => onOpenRecipe(m.recipe.id)}>
                <div className="fridge-match-left">
                  <div className="fridge-match-pct" data-level={m.pct === 100 ? 'full' : m.pct >= 70 ? 'high' : m.pct >= 40 ? 'mid' : 'low'}>
                    {m.pct}%
                  </div>
                </div>
                <div className="fridge-match-info">
                  <div className="fridge-match-name">{m.recipe.name}</div>
                  <div className="fridge-match-meta">
                    {m.have}/{m.total} ingredients
                    {m.recipe.prepTime + m.recipe.cookTime > 0 && ` · ${m.recipe.prepTime + m.recipe.cookTime}m`}
                  </div>
                  {m.missing.length > 0 && m.missing.length <= 3 && (
                    <div className="fridge-match-missing">
                      Missing: {m.missing.join(', ')}
                    </div>
                  )}
                  {m.missing.length > 3 && (
                    <div className="fridge-match-missing">
                      Missing {m.missing.length} ingredients
                    </div>
                  )}
                </div>
                <div className="fridge-match-actions">
                  <button
                    className={`fridge-match-add ${isAdded ? 'added' : ''}`}
                    onClick={(e) => { e.stopPropagation(); if (!isAdded) onAddToWeekly(m.recipe.id) }}
                  >
                    {isAdded ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {selectedSet.size === 0 && (
        <div className="fridge-empty">
          <div className="fridge-empty-icon">🍳</div>
          <p>Search or browse ingredients above to get started</p>
        </div>
      )}
    </div>
  )
}
