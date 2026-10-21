import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import { ApplicationErrorBoundary } from './errors/application-error-boundary'
import '@fontsource-variable/manrope'
import '@fontsource-variable/dm-sans'
import '@/styles/globals.css'

const root = document.getElementById('root')
if (!root) throw new Error('Nie znaleziono elementu głównego aplikacji.')

createRoot(root).render(
  <StrictMode>
    <ApplicationErrorBoundary>
      <App />
    </ApplicationErrorBoundary>
  </StrictMode>,
)
