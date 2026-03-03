import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './elements/protectedRoute';
import { PublicRoute } from './elements/publicRoute';
import { SignIn } from './views/auth/signIn';
import { SignUp } from './views/auth/signUp';
import { Dashboard } from './views/dashboard/dashboard';
import { NotFound } from './views/notFound/notFound';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
