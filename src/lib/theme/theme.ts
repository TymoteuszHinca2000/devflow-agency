export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = Exclude<ThemePreference, 'system'>

export const themeStorageKey = 'devflow-theme'

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(themeStorageKey)
    return isThemePreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}
