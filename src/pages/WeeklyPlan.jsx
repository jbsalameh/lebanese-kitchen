import { useState } from 'react'
import recipes, { getCategoryGradient } from '../data/recipes'

function MealCard({ recipe, persons, onRemove, onOpen }) {
  const [imgError, setImgError] = useState(false)
  const totalTime = recipe.prepTime + recipe.cookTime
  const scaled = Math.ceil((recipe.calories * persons) / recipe.servings)

  return (
    <div className="weekly-meal-card">
      <div className="weekly-meal-img" onClick={() => onOpen(recipe.id)} style={{ cursor: 'pointer' }}>
        {!imgError ? (
          <img src={recipe.image} alt={recipe.name} onError={() => setImgError(true)} />
        ) : (
          <div className="weekly-meal-gradient" style={{ background: getCategoryGradient(recipe.category) }}>
            {recipe.emoji}
          </div>
        )}
      </div>
      <div className="weekly-meal-info" onClick={() => onOpen(recipe.id)} style={{ cursor: 'pointer' }}>
        <div className="weekly-meal-name">{recipe.name}</div>
        <div className="weekly-meal-meta">
          {totalTime} min · {scaled} kcal total
        </div>
      </div>
      <button className="weekly-meal-remove" onClick={() => onRemove(recipe.id)} title="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

export default function WeeklyPlan({ weeklyPlan, persons, setPersons, onRemoveFromWeekly, onOpenRecipe, onNavigate }) {
  const selectedRecipes = weeklyPlan
    .map(id => recipes.find(r => r.id === id))
    .filter(Boolean)

  const totalCalories = selectedRecipes.reduce((sum, r) => {
    return sum + Math.ceil((r.calories * persons) / r.servings)
  }, 0)

  return (
    <div className="page">
      <div className="weekly-header">
        <h1>My Week</h1>
        <p>
          {selectedRecipes.length === 0
            ? 'Add recipes from the gallery to plan your week'
            : `${selectedRecipes.length} meal${selectedRecipes.length > 1 ? 's' : ''} · ~${totalCalories.toLocaleString()} kcal total`}
        </p>

        <div className="persons-row">
          <div className="persons-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            People
          </div>
          <div className="persons-stepper">
            <button
              className="stepper-btn"
              onClick={() => setPersons(p => Math.max(1, p - 1))}
              disabled={persons <= 1}
            >−</button>
            <span className="persons-count">{persons}</span>
            <button
              className="stepper-btn"
              onClick={() => setPersons(p => Math.min(12, p + 1))}
              disabled={persons >= 12}
            >+</button>
          </div>
        </div>
      </div>

      {selectedRecipes.length === 0 ? (
        <div className="weekly-empty">
          <div className="weekly-empty-icon">📅</div>
          <h3>Your week is empty</h3>
          <p>Browse the recipe gallery and tap <strong>+</strong> to add meals to your week.</p>
        </div>
      ) : (
        <>
          <div className="weekly-section-title">Selected meals</div>
          <div className="weekly-meals">
            {selectedRecipes.map(recipe => (
              <MealCard
                key={recipe.id}
                recipe={recipe}
                persons={persons}
                onRemove={onRemoveFromWeekly}
                onOpen={onOpenRecipe}
              />
            ))}
          </div>

          <button
            className="goto-shopping-btn"
            onClick={() => onNavigate('shopping')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            View Shopping List
          </button>
        </>
      )}
    </div>
  )
}
