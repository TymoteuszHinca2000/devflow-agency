import { WelcomePage } from '@/features/welcome/welcome-page'
import { ThemeProvider } from '@/lib/theme/theme-provider'

export function App() {
  return (
    <ThemeProvider>
      <WelcomePage />
    </ThemeProvider>
  )
}
