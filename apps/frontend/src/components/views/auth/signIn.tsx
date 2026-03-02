import { useClientQueries } from '@/hooks/useClientQueries';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthBranding } from './authBranding';
import { AuthForm } from './authForm';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();

  const handleModeSwitch = () => {
    navigate('/signup');
  };

  const {
    auth: { useSignIn },
  } = useClientQueries();
  const signIn = useSignIn({
    onSuccess: (data) => {
      console.log('Sign in successful', data);
      // navigate to app dashboard or similar
    },
    onError: (err: Error) => {
      console.error('Sign in failed', err.message);
    },
  });

  return (
    <div className="min-h-screen flex">
      <AuthBranding />
      <AuthForm
        isSignIn
        onAuth={(payload) => signIn.mutate(payload as any)}
        onModeSwitch={handleModeSwitch}
      />
    </div>
  );
};
