import { useState, useEffect } from 'react'
import Gallery from './pages/Gallery'
import WeeklyPlan from './pages/WeeklyPlan'
import ShoppingList from './pages/ShoppingList'
import RecipeDetail from './pages/RecipeDetail'
import BottomNav from './components/BottomNav'

export default function App() {
  const [currentPage, setCurrentPage] = useState('gallery')
  const [previousPage, setPreviousPage] = useState('gallery')
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

  useEffect(() => {
    localStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan))
  }, [weeklyPlan])

  useEffect(() => {
    localStorage.setItem('persons', persons)
  }, [persons])

  useEffect(() => {
    localStorage.setItem('checkedItems', JSON.stringify(checkedItems))
  }, [checkedItems])

  const navigateTo = (page) => {
    setPreviousPage(currentPage)
    setCurrentPage(page)
  }

  const openRecipe = (recipeId) => {
    setPreviousPage(currentPage)
    setSelectedRecipeId(recipeId)
    setCurrentPage('recipe')
  }

  const goBack = () => {
    setCurrentPage(previousPage)
  }

  const addToWeekly = (recipeId) => {
    if (!weeklyPlan.includes(recipeId)) {
      setWeeklyPlan(prev => [...prev, recipeId])
    }
  }

  const removeFromWeekly = (recipeId) => {
    setWeeklyPlan(prev => prev.filter(id => id !== recipeId))
  }

  const toggleItem = (key) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const clearChecked = () => setCheckedItems({})
  const checkAll = () => {
    // handled in ShoppingList
  }

  const showNav = currentPage !== 'recipe'

  return (
    <div className="app">
      {currentPage === 'gallery' && (
        <Gallery
          weeklyPlan={weeklyPlan}
          onOpenRecipe={openRecipe}
          onAddToWeekly={addToWeekly}
          onRemoveFromWeekly={removeFromWeekly}
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
      {currentPage === 'recipe' && (
        <RecipeDetail
          recipeId={selectedRecipeId}
          weeklyPlan={weeklyPlan}
          persons={persons}
          onAddToWeekly={addToWeekly}
          onRemoveFromWeekly={removeFromWeekly}
          onBack={goBack}
        />
      )}
      {showNav && (
        <BottomNav
          currentPage={currentPage}
          onNavigate={navigateTo}
          weeklyCount={weeklyPlan.length}
        />
      )}
    </div>
  )
}
