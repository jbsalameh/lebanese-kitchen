import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transition')
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 350)
  }

  return { theme, toggleTheme }
}
