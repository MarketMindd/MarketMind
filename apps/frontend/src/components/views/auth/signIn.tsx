import React from 'react';
import { AuthForm } from './authForm';

export const SignIn: React.FC = () => {
  return (
    <div>
      <h1>Sign In</h1>
      <AuthForm onAuth={() => console.log('Sign in successful')} />
    </div>
  );
};
