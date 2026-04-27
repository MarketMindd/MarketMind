import { Navigate, Route, Routes } from 'react-router-dom';

import { APP_ROUTES } from '../consts/routes';

import { ProtectedRoute } from './elements/protectedRoute';
import { PublicRoute } from './elements/publicRoute';
import { SignIn } from './views/auth/signIn';
import { SignUp } from './views/auth/signUp';
import { Dashboard } from './views/dashboard/dashboard';
import { NotFound } from './views/notFound/notFound';
import StockDetails from './views/stockDetails/stockDetails';

import { Navigation } from './elements/navigation';

export const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      <Navigation />
      <Routes>
        <Route path={APP_ROUTES.HOME} element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
        <Route
          path={APP_ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
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
          path={APP_ROUTES.STOCK_DETAILS}
          element={
            <ProtectedRoute>
              <StockDetails />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};
