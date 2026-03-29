import { useState, useEffect } from 'react'
import Gallery from './pages/Gallery'
import WeeklyPlan from './pages/WeeklyPlan'
import ShoppingList from './pages/ShoppingList'
import RecipeDetail from './pages/RecipeDetail'
import CookingMode from './pages/CookingMode'
import FridgeCook from './pages/FridgeCook'
import BottomNav from './components/BottomNav'
import TimerOverlay from './components/TimerOverlay'
import AiRecipeDetail from './pages/AiRecipeDetail'
import { OfflineBanner, UpdateBanner, InstallPrompt } from './components/PWAPrompts'
import { usePWA } from './hooks/usePWA'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const [currentPage, setCurrentPage] = useState('gallery')
  const [pageHistory, setPageHistory] = useState(['gallery'])
  const [selectedRecipeId, setSelectedRecipeId] = useState(null)
  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    try { return JSON.parse(localStorage.getItem('weeklyPlan')) || [] } catch { return [] }
  })
  const [persons, setPersons] = useState(() => {
    return parseInt(localStorage.getItem('persons')) || 4
  })
  const [checkedItems, setCheckedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('checkedItems')) || {} } catch { return {} }
  })
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites')) || [] } catch { return [] }
  })
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentlyViewed')) || [] } catch { return [] }
  })
  const [savedAiRecipes, setSavedAiRecipes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedAiRecipes')) || [] } catch { return [] }
  })
  const [selectedAiRecipe, setSelectedAiRecipe] = useState(null)

  useEffect(() => {
    localStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan))
  }, [weeklyPlan])

  useEffect(() => {
    localStorage.setItem('persons', persons)
  }, [persons])

  useEffect(() => {
    localStorage.setItem('checkedItems', JSON.stringify(checkedItems))
  }, [checkedItems])

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed))
  }, [recentlyViewed])

  useEffect(() => {
    localStorage.setItem('savedAiRecipes', JSON.stringify(savedAiRecipes))
  }, [savedAiRecipes])

  const navigateTo = (page) => {
    setPageHistory(prev => [...prev, page])
    setCurrentPage(page)
  }

  const openRecipe = (recipeId) => {
    setPageHistory(prev => [...prev, 'recipe'])
    setSelectedRecipeId(recipeId)
    setCurrentPage('recipe')
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== recipeId)
      return [recipeId, ...filtered].slice(0, 10)
    })
  }

  const goBack = () => {
    setPageHistory(prev => {
      if (prev.length <= 1) return ['gallery']
      const newHistory = prev.slice(0, -1)
      setCurrentPage(newHistory[newHistory.length - 1])
      return newHistory
    })
  }

  const addToWeekly = (recipeId) => {
    if (!weeklyPlan.includes(recipeId)) {
      setWeeklyPlan(prev => [...prev, recipeId])
    }
  }

  const removeFromWeekly = (recipeId) => {
    setWeeklyPlan(prev => prev.filter(id => id !== recipeId))
  }

  const toggleFavorite = (recipeId) => {
    setFavorites(prev =>
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    )
  }

  const toggleItem = (key) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const [timers, setTimers] = useState([])

  const addTimer = (minutes, label) => {
    setTimers(prev => [...prev, {
      id: Date.now(),
      label,
      duration: minutes,
      endsAt: Date.now() + minutes * 60000,
      notified: false,
    }])
  }

  const removeTimer = (id) => {
    setTimers(prev => prev.filter(t => t.id !== id))
  }

  const clearChecked = () => setCheckedItems({})

  const saveAiRecipe = (recipe) => {
    const exists = savedAiRecipes.some(r => r.name === recipe.name)
    if (exists) return
    setSavedAiRecipes(prev => [{ ...recipe, savedAt: Date.now() }, ...prev])
  }

  const removeAiRecipe = (index) => {
    setSavedAiRecipes(prev => prev.filter((_, i) => i !== index))
    if (currentPage === 'aiRecipe') goBack()
  }

  const openAiRecipe = (index) => {
    setPageHistory(prev => [...prev, 'aiRecipe'])
    setSelectedAiRecipe(index)
    setCurrentPage('aiRecipe')
  }

  const startCooking = (recipeId) => {
    setPageHistory(prev => [...prev, 'cooking'])
    setSelectedRecipeId(recipeId)
    setCurrentPage('cooking')
  }

  const { isOffline, needRefresh, installPrompt, doUpdate, doInstall, dismissUpdate } = usePWA()
  const { theme, toggleTheme } = useTheme()

  const showNav = currentPage !== 'recipe' && currentPage !== 'cooking' && currentPage !== 'aiRecipe'

  return (
    <div className="app">
      <OfflineBanner isOffline={isOffline} />
      <UpdateBanner needRefresh={needRefresh} onUpdate={doUpdate} onDismiss={dismissUpdate} />
      {currentPage === 'gallery' && (
        <Gallery
          weeklyPlan={weeklyPlan}
          favorites={favorites}
          recentlyViewed={recentlyViewed}
          onOpenRecipe={openRecipe}
          onAddToWeekly={addToWeekly}
          onRemoveFromWeekly={removeFromWeekly}
          onToggleFavorite={toggleFavorite}
          theme={theme}
          onToggleTheme={toggleTheme}
          savedAiRecipes={savedAiRecipes}
          onOpenAiRecipe={openAiRecipe}
        />
      )}
      {currentPage === 'weekly' && (
        <WeeklyPlan
          weeklyPlan={weeklyPlan}
          persons={persons}
          setPersons={setPersons}
          onRemoveFromWeekly={removeFromWeekly}
          onOpenRecipe={openRecipe}
          onNavigate={navigateTo}
        />
      )}
      {currentPage === 'shopping' && (
        <ShoppingList
          weeklyPlan={weeklyPlan}
          persons={persons}
          checkedItems={checkedItems}
          onToggleItem={toggleItem}
          onClearChecked={clearChecked}
          onNavigate={navigateTo}
          onOpenRecipe={openRecipe}
        />
      )}
      {currentPage === 'fridge' && (
        <FridgeCook
          onOpenRecipe={openRecipe}
          onAddToWeekly={addToWeekly}
          weeklyPlan={weeklyPlan}
          onStartTimer={addTimer}
          savedAiRecipes={savedAiRecipes}
          onSaveAiRecipe={saveAiRecipe}
        />
      )}
      {currentPage === 'recipe' && (
        <RecipeDetail
          recipeId={selectedRecipeId}
          weeklyPlan={weeklyPlan}
          persons={persons}
          favorites={favorites}
          onAddToWeekly={addToWeekly}
          onRemoveFromWeekly={removeFromWeekly}
          onToggleFavorite={toggleFavorite}
          onStartCooking={startCooking}
          onStartTimer={addTimer}
          onBack={goBack}
        />
      )}
      {currentPage === 'aiRecipe' && selectedAiRecipe !== null && savedAiRecipes[selectedAiRecipe] && (
        <AiRecipeDetail
          recipe={savedAiRecipes[selectedAiRecipe]}
          index={selectedAiRecipe}
          onStartTimer={addTimer}
          onRemove={removeAiRecipe}
          onBack={goBack}
        />
      )}
      {currentPage === 'cooking' && (
        <CookingMode
          recipeId={selectedRecipeId}
          onStartTimer={addTimer}
          onExit={goBack}
        />
      )}
      {showNav && (
        <BottomNav
          currentPage={currentPage}
          onNavigate={navigateTo}
          weeklyCount={weeklyPlan.length}
        />
      )}
      <TimerOverlay timers={timers} onRemoveTimer={removeTimer} />
      <InstallPrompt installPrompt={installPrompt} onInstall={doInstall} />
    </div>
  )
}
