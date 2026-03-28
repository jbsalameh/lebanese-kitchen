import { describe, it, expect } from 'vitest'
import recipes, { categories, collections, getCategoryGradient, getDietary } from '../data/recipes'

describe('Recipe data integrity', () => {
  it('has 42 recipes', () => {
    expect(recipes).toHaveLength(42)
  })

  it('every recipe has required fields', () => {
    const requiredFields = [
      'id', 'name', 'nameAr', 'category', 'description', 'emoji',
      'prepTime', 'cookTime', 'servings', 'difficulty',
      'calories', 'protein', 'carbs', 'fat', 'fiber',
      'ingredients', 'instructions', 'tags',
    ]
    recipes.forEach(recipe => {
      requiredFields.forEach(field => {
        expect(recipe, `Recipe "${recipe.name}" missing "${field}"`).toHaveProperty(field)
      })
    })
  })

  it('every recipe has unique id', () => {
    const ids = recipes.map(r => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every recipe has valid category', () => {
    const validCats = categories.map(c => c.id)
    recipes.forEach(recipe => {
      expect(validCats, `"${recipe.name}" has invalid category "${recipe.category}"`).toContain(recipe.category)
    })
  })

  it('every recipe has valid difficulty', () => {
    recipes.forEach(recipe => {
      expect(['easy', 'medium', 'hard']).toContain(recipe.difficulty)
    })
  })

  it('every recipe has positive numeric times', () => {
    recipes.forEach(recipe => {
      expect(recipe.prepTime).toBeGreaterThan(0)
      expect(recipe.cookTime).toBeGreaterThanOrEqual(0)
      expect(recipe.servings).toBeGreaterThan(0)
    })
  })

  it('every recipe has at least 2 ingredients', () => {
    recipes.forEach(recipe => {
      expect(recipe.ingredients.length, `"${recipe.name}" has too few ingredients`).toBeGreaterThanOrEqual(2)
    })
  })

  it('every ingredient has name, amount, and unit', () => {
    recipes.forEach(recipe => {
      recipe.ingredients.forEach((ing, i) => {
        expect(ing, `"${recipe.name}" ingredient ${i}`).toHaveProperty('name')
        expect(ing, `"${recipe.name}" ingredient ${i}`).toHaveProperty('amount')
        expect(ing, `"${recipe.name}" ingredient ${i}`).toHaveProperty('unit')
        expect(typeof ing.amount).toBe('number')
        expect(ing.amount).toBeGreaterThan(0)
      })
    })
  })

  it('every recipe has at least 2 instruction steps', () => {
    recipes.forEach(recipe => {
      expect(recipe.instructions.length, `"${recipe.name}" has too few steps`).toBeGreaterThanOrEqual(2)
    })
  })

  it('every recipe has valid nutrition (positive numbers)', () => {
    recipes.forEach(recipe => {
      expect(recipe.calories).toBeGreaterThan(0)
      expect(recipe.protein).toBeGreaterThanOrEqual(0)
      expect(recipe.carbs).toBeGreaterThanOrEqual(0)
      expect(recipe.fat).toBeGreaterThanOrEqual(0)
      expect(recipe.fiber).toBeGreaterThanOrEqual(0)
    })
  })

  it('every recipe has an Arabic name', () => {
    recipes.forEach(recipe => {
      expect(recipe.nameAr.length, `"${recipe.name}" has empty Arabic name`).toBeGreaterThan(0)
    })
  })

  it('recipes with useGradient have an emoji', () => {
    recipes.filter(r => r.useGradient).forEach(recipe => {
      expect(recipe.emoji, `"${recipe.name}" uses gradient but has no emoji`).toBeTruthy()
    })
  })
})

describe('Categories', () => {
  it('has expected categories', () => {
    const ids = categories.map(c => c.id)
    expect(ids).toContain('all')
    expect(ids).toContain('main')
    expect(ids).toContain('mezze')
    expect(ids).toContain('dessert')
  })

  it('every category has label and emoji', () => {
    categories.forEach(cat => {
      expect(cat.label).toBeTruthy()
      expect(cat.emoji).toBeTruthy()
    })
  })
})

describe('Collections', () => {
  it('has 7 collections', () => {
    expect(collections).toHaveLength(7)
  })

  it('every collection has required fields', () => {
    collections.forEach(col => {
      expect(col).toHaveProperty('id')
      expect(col).toHaveProperty('title')
      expect(col).toHaveProperty('subtitle')
      expect(col).toHaveProperty('emoji')
      expect(col).toHaveProperty('gradient')
      expect(col).toHaveProperty('filter')
      expect(typeof col.filter).toBe('function')
    })
  })

  it('every collection matches at least 1 recipe', () => {
    collections.forEach(col => {
      const matched = recipes.filter(col.filter)
      expect(matched.length, `Collection "${col.title}" matches no recipes`).toBeGreaterThan(0)
    })
  })
})

describe('getCategoryGradient', () => {
  it('returns gradient for valid category', () => {
    expect(getCategoryGradient('main')).toContain('linear-gradient')
    expect(getCategoryGradient('mezze')).toContain('linear-gradient')
  })

  it('returns fallback for unknown category', () => {
    expect(getCategoryGradient('unknown')).toContain('linear-gradient')
  })
})

describe('getDietary', () => {
  it('classifies a recipe with meat as non-vegetarian', () => {
    const meatRecipe = recipes.find(r => r.ingredients.some(i => i.category === 'meat'))
    if (meatRecipe) {
      const dietary = getDietary(meatRecipe)
      expect(dietary.vegetarian).toBe(false)
      expect(dietary.vegan).toBe(false)
    }
  })

  it('classifies hummus as vegetarian', () => {
    const hummus = recipes.find(r => r.name.toLowerCase().includes('hummus'))
    if (hummus) {
      const dietary = getDietary(hummus)
      expect(dietary.vegetarian).toBe(true)
    }
  })

  it('returns all four dietary flags', () => {
    const dietary = getDietary(recipes[0])
    expect(dietary).toHaveProperty('vegetarian')
    expect(dietary).toHaveProperty('vegan')
    expect(dietary).toHaveProperty('glutenFree')
    expect(dietary).toHaveProperty('dairyFree')
  })
})
