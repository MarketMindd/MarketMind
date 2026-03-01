import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthBranding } from './authBranding';
import { AuthForm } from './authForm';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const handleModeSwitch = () => {
    navigate('/signin');
  };

  const handleAuth = () => {
    console.log('Sign up successful');
    // proceed with account creation flow or navigation
  };

  return (
    <div className="min-h-screen flex">
      <AuthBranding />
      <AuthForm
        isSignIn={false}
        onAuth={handleAuth}
        onModeSwitch={handleModeSwitch}
      />
    </div>
  );
};
