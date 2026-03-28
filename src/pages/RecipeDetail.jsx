import { useState, useCallback } from 'react'
import recipes, { getCategoryGradient } from '../data/recipes'
import TimedText from '../components/TimedText'

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

export default function RecipeDetail({ recipeId, weeklyPlan, persons, favorites, onAddToWeekly, onRemoveFromWeekly, onToggleFavorite, onStartCooking, onStartTimer, onBack }) {
  const [activeTab, setActiveTab] = useState('ingredients')
  const [imgError, setImgError] = useState(false)
  const [localServings, setLocalServings] = useState(null)

  const recipe = recipes.find(r => r.id === recipeId)
  if (!recipe) return null

  const isAdded = weeklyPlan.includes(recipe.id)
  const isFavorite = favorites.includes(recipe.id)
  const servings = localServings ?? persons
  const scale = servings / recipe.servings
  const totalTime = recipe.prepTime + recipe.cookTime
  const [copied, setCopied] = useState(false)

  const buildShareText = useCallback(() => {
    const ingList = recipe.ingredients
      .map(ing => `  ${formatAmount(ing.amount, scale)} ${ing.unit} ${ing.name}`)
      .join('\n')
    return `${recipe.name} (${recipe.nameAr})\n${recipe.description}\n\nServings: ${servings} · ${totalTime} min · ${recipe.difficulty}\n\nIngredients:\n${ingList}\n\nInstructions:\n${recipe.instructions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nFrom Lebanese Kitchen 🇱🇧`
  }, [recipe, servings, scale, totalTime])

  const handleShare = async () => {
    const text = buildShareText()
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.name, text })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    const text = buildShareText()
    const printWin = window.open('', '_blank')
    printWin.document.write(`<!DOCTYPE html><html><head><title>${recipe.name}</title><style>
      body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
      h1 { margin-bottom: 4px; font-size: 28px; }
      .arabic { font-size: 18px; color: #666; margin-bottom: 16px; }
      .meta { display: flex; gap: 16px; margin: 12px 0 20px; font-size: 14px; color: #555; }
      .meta span { padding: 4px 12px; background: #f3f0ec; border-radius: 20px; }
      p.desc { font-style: italic; color: #444; margin-bottom: 20px; }
      h2 { font-size: 18px; margin: 24px 0 10px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
      .ingredients { list-style: none; padding: 0; }
      .ingredients li { padding: 6px 0; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; }
      .instructions { padding-left: 20px; }
      .instructions li { margin-bottom: 10px; }
      .nutrition { display: flex; gap: 20px; margin: 16px 0; }
      .nutrition div { text-align: center; }
      .nutrition .val { font-weight: bold; font-size: 18px; }
      .nutrition .lbl { font-size: 12px; color: #888; }
      .tips { background: #f9f7f4; padding: 16px; border-radius: 8px; margin-top: 16px; }
      .tips p { margin: 6px 0; }
      .footer { margin-top: 30px; font-size: 12px; color: #aaa; text-align: center; }
      @media print { body { margin: 20px; } }
    </style></head><body>
      <h1>${recipe.name}</h1>
      <div class="arabic">${recipe.nameAr}</div>
      <div class="meta">
        <span>Prep: ${recipe.prepTime}m</span>
        <span>Cook: ${recipe.cookTime}m</span>
        <span>${recipe.difficulty}</span>
        <span>${servings} servings</span>
      </div>
      <p class="desc">${recipe.description}</p>
      <div class="nutrition">
        ${[
          { l: 'Calories', v: Math.round(recipe.calories * scale) },
          { l: 'Protein', v: Math.round(recipe.protein * scale) + 'g' },
          { l: 'Carbs', v: Math.round(recipe.carbs * scale) + 'g' },
          { l: 'Fat', v: Math.round(recipe.fat * scale) + 'g' },
          { l: 'Fiber', v: Math.round(recipe.fiber * scale) + 'g' },
        ].map(n => `<div><div class="val">${n.v}</div><div class="lbl">${n.l}</div></div>`).join('')}
      </div>
      <h2>Ingredients</h2>
      <ul class="ingredients">
        ${recipe.ingredients.map(ing => `<li><span>${ing.name}</span><span>${formatAmount(ing.amount, scale)} ${ing.unit}</span></li>`).join('')}
      </ul>
      <h2>Instructions</h2>
      <ol class="instructions">
        ${recipe.instructions.map(s => `<li>${s}</li>`).join('')}
      </ol>
      ${recipe.tips && recipe.tips.length > 0 ? `<h2>Tips</h2><div class="tips">${recipe.tips.map(t => `<p>💡 ${t}</p>`).join('')}</div>` : ''}
      <div class="footer">Lebanese Kitchen 🇱🇧</div>
    </body></html>`)
    printWin.document.close()
    printWin.focus()
    printWin.print()
  }

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

        <div className="detail-hero-actions">
          <button className="detail-action-btn" onClick={handleShare} title={copied ? 'Copied!' : 'Share'}>
            {copied ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            )}
          </button>
          <button className="detail-action-btn" onClick={handlePrint} title="Print">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
          </button>
          <button
            className={`detail-fav-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(recipe.id)}
          >
            <svg viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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
        </div>

        {/* Serving scaler */}
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
          <div className="serving-stepper">
            <button
              className="stepper-btn"
              onClick={() => setLocalServings(Math.max(1, servings - 1))}
              disabled={servings <= 1}
            >−</button>
            <span className="serving-count">{servings}</span>
            <button
              className="stepper-btn"
              onClick={() => setLocalServings(servings + 1)}
              disabled={servings >= 20}
            >+</button>
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
                Quantities scaled for {servings} people (base: {recipe.servings})
              </div>
            )}
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="instruction-list">
            {recipe.instructions.map((step, i) => (
              <div key={i} className="instruction-step">
                <div className="step-number">{i + 1}</div>
                <div className="step-text">
                  <TimedText text={step} onStartTimer={onStartTimer} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Start Cooking button */}
        {activeTab === 'instructions' && (
          <button className="start-cooking-btn" onClick={() => onStartCooking(recipe.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Cooking
          </button>
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
