import { BrowserRouter } from 'react-router'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AppRoutes } from './app-routes'

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}
