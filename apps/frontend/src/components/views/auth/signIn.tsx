import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthBranding } from './authBranding';
import { AuthForm } from './authForm';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();

  const handleModeSwitch = () => {
    navigate('/signup');
  };

  const handleAuth = () => {
    console.log('Sign in successful');
    // proceed with post-auth actions or navigate to dashboard, etc.
  };

  return (
    <div className="min-h-screen flex">
      <AuthBranding />
      <AuthForm isSignIn onAuth={handleAuth} onModeSwitch={handleModeSwitch} />
    </div>
  );
};
