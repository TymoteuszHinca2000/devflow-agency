import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from './theme-context'
import {
  getSystemTheme,
  isThemePreference,
  readThemePreference,
  subscribeToSystemTheme,
  themeStorageKey,
} from './theme'
import type { ThemePreference } from './theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState(readThemePreference)
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme)
  const resolvedTheme = preference === 'system' ? systemTheme : preference

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolvedTheme === 'dark' ? '#111b15' : '#f6f8f6')
  }, [resolvedTheme])

  useEffect(() => {
    function syncPreference(event: StorageEvent) {
      if (event.key !== themeStorageKey && event.key !== null) return
      setPreferenceState(isThemePreference(event.newValue) ? event.newValue : 'system')
    }
    window.addEventListener('storage', syncPreference)
    return () => window.removeEventListener('storage', syncPreference)
  }, [])

  function setPreference(nextPreference: ThemePreference) {
    setPreferenceState(nextPreference)
    try {
      window.localStorage.setItem(themeStorageKey, nextPreference)
    } catch {
      // Keep the selection for this session when storage is unavailable.
    }
  }

  return <ThemeContext value={{ preference, setPreference }}>{children}</ThemeContext>
}
