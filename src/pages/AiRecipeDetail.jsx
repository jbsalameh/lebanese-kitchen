import TimedText from '../components/TimedText'

export default function AiRecipeDetail({ recipe, index, onStartTimer, onRemove, onBack }) {
  if (!recipe) return null

  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <div className="page recipe-detail">
      <div className="detail-hero">
        <div
          className="detail-hero-gradient"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
        >
          <span>🤖</span>
        </div>
        <div className="detail-hero-overlay" />

        <button className="detail-back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="detail-hero-actions">
          <button
            className="detail-action-btn"
            onClick={() => onRemove(index)}
            title="Delete recipe"
            style={{ color: '#EF4444' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="detail-body">
        <div className="ai-recipe-badge" style={{ marginBottom: 8 }}>AI Generated</div>
        <h1 className="detail-title">{recipe.name}</h1>
        {recipe.nameAr && <div className="detail-title-ar">{recipe.nameAr}</div>}

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
          <div className="stat-pill" style={{
            background: recipe.difficulty === 'easy' ? '#D1FAE5' : recipe.difficulty === 'medium' ? '#FEF9C3' : '#FEE2E2'
          }}>
            {recipe.difficulty === 'easy' ? '⭐' : recipe.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
            &nbsp;{recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </div>
        </div>

        <div className="serving-scaler">
          <span className="serving-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Servings
          </span>
          <span className="serving-count" style={{ padding: '0 8px' }}>{recipe.servings}</span>
        </div>

        <p className="detail-description">{recipe.description}</p>

        {recipe.calories && (
          <div className="nutrition-strip">
            {[
              { label: 'Calories', value: recipe.calories, unit: '' },
              { label: 'Protein', value: recipe.protein, unit: 'g' },
              { label: 'Carbs', value: recipe.carbs, unit: 'g' },
              { label: 'Fat', value: recipe.fat, unit: 'g' },
            ].filter(i => i.value).map(item => (
              <div key={item.label} className="nutrition-item">
                <span className="nutrition-value">{item.value}{item.unit}</span>
                <span className="nutrition-label">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ fontSize: 16, margin: '20px 0 10px', color: 'var(--text)' }}>Ingredients</h3>
        <div className="ingredient-list">
          {recipe.ingredients?.map((ing, i) => (
            <div key={i} className="ingredient-item">
              <span className="ingredient-name">{ing.name}</span>
              <span className="ingredient-amount">{ing.amount} {ing.unit}</span>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 16, margin: '20px 0 10px', color: 'var(--text)' }}>Instructions</h3>
        <div className="instruction-list">
          {recipe.instructions?.map((step, i) => (
            <div key={i} className="instruction-step">
              <div className="step-number">{i + 1}</div>
              <div className="step-text">
                <TimedText text={step} onStartTimer={onStartTimer} />
              </div>
            </div>
          ))}
        </div>

        {recipe.tips?.length > 0 && (
          <>
            <h3 style={{ fontSize: 16, margin: '20px 0 10px', color: 'var(--text)' }}>Tips</h3>
            <div className="tips-list">
              {recipe.tips.map((tip, i) => (
                <div key={i} className="tip-item">{tip}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
