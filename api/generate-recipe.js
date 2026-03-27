const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  const { ingredients } = req.body
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'Ingredients array is required' })
  }

  const prompt = `You are a Lebanese grandmother who is an expert in traditional Lebanese cuisine. Given these ingredients the user has: ${ingredients.join(', ')}.

Generate ONE authentic Lebanese recipe that uses as many of these ingredients as possible. You may include common pantry staples (salt, olive oil, water, black pepper) even if not listed.

Respond in ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "name": "Recipe name in English (Lebanese transliteration)",
  "nameAr": "Recipe name in Arabic",
  "description": "2-3 sentence description",
  "prepTime": 15,
  "cookTime": 30,
  "difficulty": "easy",
  "servings": 4,
  "matchedIngredients": ["ingredient1", "ingredient2"],
  "extraIngredients": ["any additional ingredients needed"],
  "ingredients": [
    {"name": "Ingredient name", "amount": 2, "unit": "cups"}
  ],
  "instructions": [
    "Step 1 with specific times like 'cook for 10 minutes'",
    "Step 2..."
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"]
}`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', err)
      return res.status(502).json({ error: 'Failed to generate recipe' })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return res.status(502).json({ error: 'Empty response from AI' })
    }

    // Clean potential markdown fences
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const recipe = JSON.parse(cleaned)

    return res.status(200).json({ recipe })
  } catch (err) {
    console.error('Generate recipe error:', err)
    return res.status(500).json({ error: 'Failed to generate recipe' })
  }
}
