import { Route, Routes } from 'react-router-dom';
import { SignIn } from './views/signInn';
import { SignUp } from './views/signUpp';

export const App = () => {
  return (
    <Routes>
      <Route index path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
