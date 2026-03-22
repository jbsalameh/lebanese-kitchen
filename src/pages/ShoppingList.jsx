import { useMemo, useState } from 'react'
import recipes, { getCategoryGradient } from '../data/recipes'

const categoryConfig = {
  produce: { label: 'Fresh Produce', emoji: '🥬' },
  meat: { label: 'Meat & Fish', emoji: '🥩' },
  dairy: { label: 'Dairy & Eggs', emoji: '🧀' },
  grains: { label: 'Grains & Bread', emoji: '🌾' },
  pantry: { label: 'Pantry', emoji: '🫙' },
  spices: { label: 'Spices & Herbs', emoji: '🌿' },
  condiments: { label: 'Oils & Condiments', emoji: '🫒' },
  bakery: { label: 'Bakery', emoji: '🍞' },
  other: { label: 'Other', emoji: '📦' },
}

function formatAmount(amount) {
  if (amount === Math.floor(amount)) return amount.toString()
  const rounded = Math.round(amount * 4) / 4
  if (rounded === Math.floor(rounded)) return rounded.toString()
  const whole = Math.floor(rounded)
  const frac = rounded - whole
  const fractions = { 0.25: '¼', 0.5: '½', 0.75: '¾' }
  const fracStr = fractions[frac] || frac.toFixed(2)
  return whole > 0 ? `${whole}${fracStr}` : fracStr
}

function CookRecipeRow({ recipe, onOpenRecipe }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--card)', borderRadius: 12,
      padding: '10px 14px', marginBottom: 8,
      boxShadow: 'var(--shadow)', cursor: 'pointer',
    }} onClick={() => onOpenRecipe(recipe.id)}>
      <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
        {!imgErr && !recipe.useGradient ? (
          <img src={recipe.image} alt={recipe.name} onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: getCategoryGradient(recipe.category),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>{recipe.emoji}</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {recipe.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {recipe.prepTime + recipe.cookTime} min · {recipe.nameAr}
        </div>
      </div>
      <div style={{
        padding: '7px 14px', background: 'var(--primary)', color: 'white',
        borderRadius: 8, fontSize: 13, fontWeight: 600, flexShrink: 0,
      }}>
        Cook →
      </div>
    </div>
  )
}

export default function ShoppingList({ weeklyPlan, persons, checkedItems, onToggleItem, onClearChecked, onNavigate, onOpenRecipe }) {
  const grouped = useMemo(() => {
    const map = {}

    weeklyPlan.forEach(recipeId => {
      const recipe = recipes.find(r => r.id === recipeId)
      if (!recipe) return

      const scale = persons / recipe.servings

      recipe.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}__${ing.unit}`
        if (!map[key]) {
          map[key] = {
            name: ing.name,
            unit: ing.unit,
            category: ing.category,
            amount: 0,
          }
        }
        map[key].amount += ing.amount * scale
      })
    })

    const byCat = {}
    Object.entries(map).forEach(([key, item]) => {
      const cat = item.category || 'other'
      if (!byCat[cat]) byCat[cat] = []
      byCat[cat].push({ ...item, key })
    })

    Object.values(byCat).forEach(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))

    const order = ['produce', 'meat', 'dairy', 'grains', 'pantry', 'spices', 'condiments', 'bakery', 'other']
    return order.filter(cat => byCat[cat]).map(cat => ({ cat, items: byCat[cat] }))
  }, [weeklyPlan, persons])

  const allItems = grouped.flatMap(g => g.items)
  const checkedCount = allItems.filter(item => checkedItems[item.key]).length
  const total = allItems.length
  const progress = total === 0 ? 0 : (checkedCount / total) * 100

  if (weeklyPlan.length === 0) {
    return (
      <div className="page">
        <div className="shopping-header">
          <h1>Shopping List</h1>
        </div>
        <div className="shopping-empty">
          <div className="shopping-empty-icon">🛒</div>
          <h3>Nothing to shop for yet</h3>
          <p>Add recipes to your week and your shopping list will appear here automatically.</p>
          <br />
          <button
            onClick={() => onNavigate('gallery')}
            style={{
              padding: '12px 24px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontFamily: 'var(--font)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Browse Recipes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="shopping-header">
        <h1>Shopping List</h1>
        <div className="shopping-summary">
          {weeklyPlan.length} meal{weeklyPlan.length > 1 ? 's' : ''} · {persons} people · {total} items
        </div>
        <div className="shopping-actions">
          <button className="action-btn" onClick={onClearChecked}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
            </svg>
            Uncheck all
          </button>
        </div>
      </div>

      {total > 0 && (
        <div className="progress-bar-wrap">
          <div className="progress-bar-label">
            <span>Progress</span>
            <span>{checkedCount} / {total} items</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {grouped.map(({ cat, items }) => {
        const config = categoryConfig[cat] || { label: cat, emoji: '📦' }
        return (
          <div key={cat} className="shopping-group">
            <div className="shopping-group-title">
              <span>{config.emoji}</span>
              {config.label}
            </div>
            <div className="shopping-items">
              {items.map(item => {
                const checked = !!checkedItems[item.key]
                return (
                  <div
                    key={item.key}
                    className={`shopping-item ${checked ? 'checked' : ''}`}
                    onClick={() => onToggleItem(item.key)}
                  >
                    <div className="shopping-checkbox">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="shopping-item-name">{item.name}</span>
                    <span className="shopping-item-amount">
                      {formatAmount(item.amount)} {item.unit}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* ── Ready to Cook ─────────────────────── */}
      <div style={{ padding: '8px 16px 32px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 14, paddingTop: 8,
          borderTop: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 18 }}>👨‍🍳</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)' }}>
              Ready to Cook
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Your recipes for this week</div>
          </div>
        </div>
        {weeklyPlan.map(id => {
          const r = recipes.find(x => x.id === id)
          if (!r) return null
          return <CookRecipeRow key={id} recipe={r} onOpenRecipe={onOpenRecipe} />
        })}
      </div>
    </div>
  )
}
