import { useState } from 'react'
import recipes, { getCategoryGradient } from '../data/recipes'

function formatAmount(amount, scale) {
  const val = amount * scale
  if (val === Math.floor(val)) return val.toString()
  const rounded = Math.round(val * 4) / 4
  if (rounded === Math.floor(rounded)) return rounded.toString()
  const whole = Math.floor(rounded)
  const frac = rounded - whole
  const fracs = { 0.25: '¼', 0.5: '½', 0.75: '¾' }
  const fracStr = fracs[frac] || val.toFixed(1)
  return whole > 0 ? `${whole} ${fracStr}` : fracStr
}

export default function RecipeDetail({ recipeId, weeklyPlan, persons, onAddToWeekly, onRemoveFromWeekly, onBack }) {
  const [activeTab, setActiveTab] = useState('ingredients')
  const [imgError, setImgError] = useState(false)

  const recipe = recipes.find(r => r.id === recipeId)
  if (!recipe) return null

  const isAdded = weeklyPlan.includes(recipe.id)
  const scale = persons / recipe.servings
  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <div className="page recipe-detail">
      <div className="detail-hero">
        {!imgError && !recipe.useGradient ? (
          <img
            src={recipe.image}
            alt={recipe.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="detail-hero-gradient"
            style={{ background: getCategoryGradient(recipe.category) }}
          >
            {recipe.emoji}
          </div>
        )}
        <div className="detail-hero-overlay" />

        <button className="detail-back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          className={`detail-add-hero-btn ${isAdded ? 'added' : ''}`}
          onClick={() => isAdded ? onRemoveFromWeekly(recipe.id) : onAddToWeekly(recipe.id)}
        >
          {isAdded ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add to week
            </>
          )}
        </button>
      </div>

      <div className="detail-body">
        <h1 className="detail-title">{recipe.name}</h1>
        <div className="detail-title-ar">{recipe.nameAr}</div>

        <div className="detail-stats">
          <div className="stat-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Prep {recipe.prepTime}m
          </div>
          <div className="stat-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
              <path d="M12 6v6l4 2" />
            </svg>
            Cook {recipe.cookTime}m
          </div>
          <div className="stat-pill" style={{ background: recipe.difficulty === 'easy' ? '#D1FAE5' : recipe.difficulty === 'medium' ? '#FEF9C3' : '#FEE2E2' }}>
            {recipe.difficulty === 'easy' ? '⭐' : recipe.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
            &nbsp;{recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </div>
          <div className="stat-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {persons} people
          </div>
        </div>

        <p className="detail-description">{recipe.description}</p>

        <div className="nutrition-strip">
          {[
            { label: 'Calories', value: Math.round(recipe.calories * scale), unit: '' },
            { label: 'Protein', value: Math.round(recipe.protein * scale), unit: 'g' },
            { label: 'Carbs', value: Math.round(recipe.carbs * scale), unit: 'g' },
            { label: 'Fat', value: Math.round(recipe.fat * scale), unit: 'g' },
            { label: 'Fiber', value: Math.round(recipe.fiber * scale), unit: 'g' },
          ].map(item => (
            <div key={item.label} className="nutrition-item">
              <span className="nutrition-value">{item.value}{item.unit}</span>
              <span className="nutrition-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="detail-tabs">
          {['ingredients', 'instructions', 'tips'].map(tab => (
            <button
              key={tab}
              className={`detail-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'ingredients' && (
          <div className="ingredient-list">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="ingredient-item">
                <span className="ingredient-name">{ing.name}</span>
                <span className="ingredient-amount">
                  {formatAmount(ing.amount, scale)} {ing.unit}
                </span>
              </div>
            ))}
            {scale !== 1 && (
              <div style={{ padding: '10px 14px 0', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Quantities scaled for {persons} people (base: {recipe.servings})
              </div>
            )}
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="instruction-list">
            {recipe.instructions.map((step, i) => (
              <div key={i} className="instruction-step">
                <div className="step-number">{i + 1}</div>
                <div className="step-text">{step}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="tips-list">
            {recipe.tips && recipe.tips.length > 0 ? (
              recipe.tips.map((tip, i) => (
                <div key={i} className="tip-item">{tip}</div>
              ))
            ) : (
              <div className="tip-item">No additional tips for this recipe.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
