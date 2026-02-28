import React from 'react';
import { AuthForm } from './authForm';

export const SignUp: React.FC = () => {
  return (
    <div>
      <h1>Sign Up</h1>
      <AuthForm onAuth={() => console.log('Sign up successful')} />
    </div>
  );
};
