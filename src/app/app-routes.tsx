import { Route, Routes } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { RouteLayout } from '@/components/layout/route-layout'
import { WelcomePage } from '@/features/welcome/welcome-page'
import { appModules } from './app-modules'
import { ModulePreviewPage } from './pages/module-preview-page'
import { NotFoundPage } from './pages/not-found-page'
import { WorkspaceIndexPage } from './pages/workspace-index-page'
import { RouteEffects } from './route-effects'
import { RequireAuth } from '@/features/auth/components/require-auth'
import { LoginPage } from '@/features/auth/pages/login-page'
import { AccountControls } from '@/features/auth/components/account-controls'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { RegisterPage } from '@/features/auth/pages/register-page'
import { CheckEmailPage } from '@/features/auth/pages/check-email-page'
import { ConfirmEmailPage } from '@/features/auth/pages/confirm-email-page'

export function AppRoutes() {
  const { state } = useAuth()
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route element={<RequireAuth />}>
          <Route path="app" element={<AppLayout accountControls={<AccountControls />} />}>
            <Route index element={<WorkspaceIndexPage />} />
            {appModules.map((module) => (
              <Route
                key={module.path}
                path={module.path}
                element={<ModulePreviewPage module={module} />}
              />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
        <Route element={<RouteLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="check-email" element={<CheckEmailPage />} />
          <Route path="auth/confirm" element={<ConfirmEmailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <RouteEffects sessionStatus={state.status} />
    </>
  )
}
