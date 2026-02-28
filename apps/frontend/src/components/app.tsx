import { Route, Routes } from 'react-router-dom';
import { SignIn } from './views/auth/signIn';
import { SignUp } from './views/auth/signUp';

export const App = () => {
  return (
    <Routes>
      <Route index path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
