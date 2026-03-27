import { useState } from 'react'
import { getCategoryGradient } from '../data/recipes'

export default function RecipeCard({ recipe, isAdded, isFavorite, onSelect, onAdd, onToggleFavorite }) {
  const [imgError, setImgError] = useState(false)
  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <div className="recipe-card" onClick={() => onSelect(recipe.id)}>
      <div className="card-img-wrap">
        {!imgError && !recipe.useGradient ? (
          <img
            src={recipe.image}
            alt={recipe.name}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="card-gradient-bg"
            style={{ background: getCategoryGradient(recipe.category) }}
          >
            {recipe.emoji}
          </div>
        )}

        <button
          className={`card-fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(recipe.id)
          }}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        <button
          className={`card-add-btn ${isAdded ? 'added' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onAdd(recipe.id)
          }}
          title={isAdded ? 'Added to week' : 'Add to week'}
        >
          {isAdded ? (
            <svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          )}
        </button>
      </div>

      <div className="card-info">
        <div className="card-name">{recipe.name}</div>
        <div className="card-name-ar">{recipe.nameAr}</div>
        <div className="card-meta">
          <span className="card-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {totalTime}m
          </span>
          <span className={`diff-badge diff-${recipe.difficulty}`}>
            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
