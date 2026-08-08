import { Outlet, Route, Routes } from 'react-router-dom';
import { APP_ROUTES } from '../consts/routes';
import { Navigation } from './elements/navigation';
import { ProtectedRoute } from './elements/protectedRoute';
import { PublicRoute } from './elements/publicRoute';
import { SignIn } from './views/auth/signIn';
import { SignUp } from './views/auth/signUp';
import { Dashboard } from './views/dashboard/dashboard';
import { NotFound } from './views/notFound/notFound';
import { Interests } from './views/onboarding/interests';
import { RiskTolerance } from './views/onboarding/riskTolerance';
import { Portfolio } from './views/portfolio/portfolio';
import { StockDetails } from './views/stockDetails/stockDetails';
import { Chat } from './views/chat/chat';
import { Landing } from './views/landing/landing';
import { Profile } from './views/profile/profile';
import { Performance } from './views/performance/performance';
import { TooltipProvider } from '@/components/ui/tooltip';

const MainLayout = () => {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
};

export const App = () => {
  return (
    <TooltipProvider>
      <Routes>
        <Route path={APP_ROUTES.HOME} element={<Landing />} />

        <Route element={<MainLayout />}>
          <Route
            path={APP_ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.STOCK_DETAILS}
            element={
              <ProtectedRoute>
                <StockDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.PORTFOLIO}
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.CHAT}
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.PERFORMANCE}
            element={
              <ProtectedRoute>
                <Performance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:sessionId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route element={<AuthLayout />}>
          <Route
            path={APP_ROUTES.SIGN_IN}
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />
          <Route
            path={APP_ROUTES.SIGN_UP}
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path={APP_ROUTES.RISK_TOLERANCE}
            element={
              <ProtectedRoute>
                <RiskTolerance />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.INTERESTS}
            element={
              <ProtectedRoute>
                <Interests />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
};
