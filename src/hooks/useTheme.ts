import { useState, useEffect, useCallback } from 'react'
import { getSettings, updateSettings } from '@/lib/storage'
import type { AppSettings } from '@/types'

type Theme = AppSettings['theme']

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    getSettings().then(s => setThemeState(s.theme))
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function resolve() {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')
      } else {
        setResolvedTheme(theme)
      }
    }

    resolve()
    mediaQuery.addEventListener('change', resolve)
    return () => mediaQuery.removeEventListener('change', resolve)
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme)
    await updateSettings({ theme: newTheme })
  }, [])

  return { theme, resolvedTheme, setTheme }
}
