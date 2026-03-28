import { useState, useEffect } from 'react'
import Gallery from './pages/Gallery'
import WeeklyPlan from './pages/WeeklyPlan'
import ShoppingList from './pages/ShoppingList'
import RecipeDetail from './pages/RecipeDetail'
import CookingMode from './pages/CookingMode'
import FridgeCook from './pages/FridgeCook'
import BottomNav from './components/BottomNav'
import TimerOverlay from './components/TimerOverlay'
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

  const startCooking = (recipeId) => {
    setPageHistory(prev => [...prev, 'cooking'])
    setSelectedRecipeId(recipeId)
    setCurrentPage('cooking')
  }

  const { isOffline, needRefresh, installPrompt, doUpdate, doInstall, dismissUpdate } = usePWA()
  const { theme, toggleTheme } = useTheme()

  const showNav = currentPage !== 'recipe' && currentPage !== 'cooking'

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
