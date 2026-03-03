import { Navigate, Route, Routes } from 'react-router-dom';
import { SignIn } from './views/auth/signIn';
import { SignUp } from './views/auth/signUp';
import { NotFound } from './views/notFound/notFound';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
