import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { APP_ROUTES } from '../consts/routes';

import { ProtectedRoute } from './elements/protectedRoute';
import { PublicRoute } from './elements/publicRoute';
import { SignIn } from './views/auth/signIn';
import { SignUp } from './views/auth/signUp';
import { Dashboard } from './views/dashboard/dashboard';
import { NotFound } from './views/notFound/notFound';
import StockDetails from './views/stockDetails/stockDetails';
import Portfolio from './views/portfolio/portfolio';

import { Navigation } from './elements/navigation';

const MainLayout = () => {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <Navigation />
      <main className="flex-1 pt-16 overflow-y-auto flex flex-col">
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
    <Routes>
      <Route path={APP_ROUTES.HOME} element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />

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
          element={<Navigate to={APP_ROUTES.DASHBOARD} replace />}
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
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
