import { Monitor, Moon, Sun } from 'lucide-react'
import { useId } from 'react'
import { isThemePreference } from '@/lib/theme/theme'
import { useTheme } from '@/lib/theme/theme-context'
import '@/styles/theme-selector.css'

const themeIcons = { light: Sun, dark: Moon, system: Monitor }

export function ThemeSelector() {
  const selectId = useId()
  const { preference, setPreference } = useTheme()
  const Icon = themeIcons[preference]

  return (
    <div className="theme-selector">
      <label htmlFor={selectId} className="sr-only">
        Motyw kolorystyczny
      </label>
      <Icon size={16} aria-hidden="true" />
      <select
        id={selectId}
        value={preference}
        onChange={(event) => {
          const nextPreference = event.target.value
          if (isThemePreference(nextPreference)) setPreference(nextPreference)
        }}
      >
        <option value="light">Jasny</option>
        <option value="dark">Ciemny</option>
        <option value="system">Systemowy</option>
      </select>
    </div>
  )
}
