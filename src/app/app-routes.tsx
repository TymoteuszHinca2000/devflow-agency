import { Route, Routes } from 'react-router'
import { RouteLayout } from '@/components/layout/route-layout'
import { WelcomePage } from '@/features/welcome/welcome-page'
import { appModules } from './app-modules'
import { ModulePreviewPage } from './pages/module-preview-page'
import { NotFoundPage } from './pages/not-found-page'
import { WorkspaceIndexPage } from './pages/workspace-index-page'
import { RouteEffects } from './route-effects'

export function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route element={<RouteLayout />}>
          <Route path="app">
            <Route index element={<WorkspaceIndexPage />} />
            {appModules.map((module) => (
              <Route
                key={module.path}
                path={module.path}
                element={<ModulePreviewPage module={module} />}
              />
            ))}
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <RouteEffects />
    </>
  )
}
