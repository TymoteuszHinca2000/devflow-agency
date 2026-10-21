import { BrowserRouter } from 'react-router'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AppRoutes } from './app-routes'
import { AuthProvider } from '@/features/auth/session/auth-provider'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  )
}
