import { BrowserRouter } from 'react-router'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import { AppRoutes } from './app-routes'

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}
