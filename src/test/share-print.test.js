import { describe, it, expect } from 'vitest'
import recipes from '../data/recipes'

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

function buildShareText(recipe, servings) {
  const scale = servings / recipe.servings
  const totalTime = recipe.prepTime + recipe.cookTime
  const ingList = recipe.ingredients
    .map(ing => `  ${formatAmount(ing.amount, scale)} ${ing.unit} ${ing.name}`)
    .join('\n')
  return `${recipe.name} (${recipe.nameAr})\n${recipe.description}\n\nServings: ${servings} · ${totalTime} min · ${recipe.difficulty}\n\nIngredients:\n${ingList}\n\nInstructions:\n${recipe.instructions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nFrom Lebanese Kitchen 🇱🇧`
}

describe('formatAmount', () => {
  it('formats whole numbers', () => {
    expect(formatAmount(2, 1)).toBe('2')
    expect(formatAmount(1, 3)).toBe('3')
  })

  it('formats quarter fractions', () => {
    expect(formatAmount(1, 0.25)).toBe('¼')
    expect(formatAmount(1, 0.5)).toBe('½')
    expect(formatAmount(1, 0.75)).toBe('¾')
  })

  it('formats mixed numbers', () => {
    expect(formatAmount(1, 1.5)).toBe('1 ½')
    expect(formatAmount(1, 2.25)).toBe('2 ¼')
  })
})

describe('buildShareText', () => {
  const recipe = recipes[0]

  it('includes recipe name', () => {
    const text = buildShareText(recipe, recipe.servings)
    expect(text).toContain(recipe.name)
  })

  it('includes Arabic name', () => {
    const text = buildShareText(recipe, recipe.servings)
    expect(text).toContain(recipe.nameAr)
  })

  it('includes all ingredients', () => {
    const text = buildShareText(recipe, recipe.servings)
    recipe.ingredients.forEach(ing => {
      expect(text).toContain(ing.name)
    })
  })

  it('includes all instructions', () => {
    const text = buildShareText(recipe, recipe.servings)
    recipe.instructions.forEach((step, i) => {
      expect(text).toContain(`${i + 1}. ${step}`)
    })
  })

  it('includes branding', () => {
    const text = buildShareText(recipe, recipe.servings)
    expect(text).toContain('Lebanese Kitchen')
  })

  it('scales ingredients when servings change', () => {
    const baseText = buildShareText(recipe, recipe.servings)
    const doubledText = buildShareText(recipe, recipe.servings * 2)
    expect(baseText).not.toBe(doubledText)
  })
})

describe('Weekly plan share text', () => {
  it('formats plan with multiple recipes', () => {
    const selected = recipes.slice(0, 3)
    const persons = 4
    const totalCalories = selected.reduce((sum, r) => {
      return sum + Math.ceil((r.calories * persons) / r.servings)
    }, 0)

    const text = `My Weekly Meal Plan (${persons} people)\n${selected.map((r, i) => {
      const cal = Math.ceil((r.calories * persons) / r.servings)
      const time = r.prepTime + r.cookTime
      return `${i + 1}. ${r.name} (${r.nameAr})\n   ${time} min · ${cal} kcal · ${r.difficulty}`
    }).join('\n\n')}\n\nTotal: ~${totalCalories.toLocaleString()} kcal\n\nFrom Lebanese Kitchen 🇱🇧`

    expect(text).toContain('My Weekly Meal Plan')
    expect(text).toContain(selected[0].name)
    expect(text).toContain(selected[1].name)
    expect(text).toContain(selected[2].name)
    expect(text).toContain('Lebanese Kitchen')
  })
})
