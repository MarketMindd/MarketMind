import { Route, Routes } from 'react-router-dom';
import { SignIn } from './views/signIn';
import { SignUp } from './views/signUp';

export const App = () => {
  return (
    <Routes>
      <Route index path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
