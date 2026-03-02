import { useClientQueries } from '@/hooks/useClientQueries';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthBranding } from './authBranding';
import { AuthForm } from './authForm';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const handleModeSwitch = () => {
    navigate('/signin');
  };

  const {
    auth: { useSignUp },
  } = useClientQueries();
  const signUp = useSignUp({
    onSuccess: (data) => {
      console.log('Sign up successful', data);
      // navigate to sign-in or dashboard
    },
    onError: (err: Error) => console.error('Sign up failed', err.message),
  });

  return (
    <div className="min-h-screen flex">
      <AuthBranding />
      <AuthForm
        isSignIn={false}
        onAuth={(payload) => signUp.mutate(payload as any)}
        onModeSwitch={handleModeSwitch}
      />
    </div>
  );
};
