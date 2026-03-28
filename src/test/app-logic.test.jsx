import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

// Mock the virtual:pwa-register module used by usePWA
vi.mock('virtual:pwa-register', () => ({
  registerSW: () => () => {},
}))

describe('App navigation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders gallery page by default', () => {
    render(<App />)
    expect(screen.getByText('Lebanese Kitchen')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search recipes, ingredients...')).toBeInTheDocument()
  })

  it('navigates to My Week tab', () => {
    render(<App />)
    fireEvent.click(screen.getByText('My Week'))
    expect(screen.getByText('Your week is empty')).toBeInTheDocument()
  })

  it('navigates to Fridge tab', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Fridge'))
    expect(screen.getByPlaceholderText('Type an ingredient...')).toBeInTheDocument()
  })

  it('navigates to Shopping tab', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Shopping'))
    expect(screen.getByText('Shopping List')).toBeInTheDocument()
  })

  it('opens a recipe detail when card is clicked', () => {
    render(<App />)
    const firstCard = screen.getAllByRole('button', { name: /Add to favorites/i })[0]
    // Click the parent card area (not the button itself)
    const card = firstCard.closest('.recipe-card')
    fireEvent.click(card)
    // Should show detail page with back button
    expect(screen.getByText('Ingredients')).toBeInTheDocument()
    expect(screen.getByText('Instructions')).toBeInTheDocument()
    expect(screen.getByText('Tips')).toBeInTheDocument()
  })
})

describe('Gallery filtering', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('filters by search query', () => {
    render(<App />)
    const searchInput = screen.getByPlaceholderText('Search recipes, ingredients...')
    fireEvent.change(searchInput, { target: { value: 'hummus' } })
    expect(screen.getByText('Hummus')).toBeInTheDocument()
  })

  it('filters by category', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Desserts'))
    // Should only show dessert recipes
    expect(screen.queryByText('Kafta')).not.toBeInTheDocument()
  })
})

describe('Weekly plan state', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists weekly plan to localStorage', () => {
    render(<App />)
    // Find an "Add to week" button and click it
    const addBtns = screen.getAllByTitle('Add to week')
    fireEvent.click(addBtns[0])

    // Check localStorage
    const plan = JSON.parse(localStorage.getItem('weeklyPlan'))
    expect(plan).toHaveLength(1)
  })
})

describe('Favorites state', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists favorites to localStorage', () => {
    render(<App />)
    const favBtns = screen.getAllByTitle('Add to favorites')
    fireEvent.click(favBtns[0])

    const favs = JSON.parse(localStorage.getItem('favorites'))
    expect(favs).toHaveLength(1)
  })
})

describe('Dark mode', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles dark mode', () => {
    render(<App />)
    const toggle = screen.getByLabelText('Toggle dark mode')
    expect(toggle.textContent).toBe('🌙')
    fireEvent.click(toggle)
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
