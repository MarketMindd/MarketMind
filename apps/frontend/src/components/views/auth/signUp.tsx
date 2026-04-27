import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useClientQueries } from '@/hooks/useClientQueries';
import { useToast } from '@/hooks/useToast';
import { AuthBranding } from './authBranding';
import { AuthForm } from './authForm';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleModeSwitch = () => {
    navigate('/signin');
  };

  const {
    auth: { useSignUp },
  } = useClientQueries();
  const signUp = useSignUp({
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (err: Error) =>
      toast({
        title: 'Sign up failed',
        description: err.message,
        variant: 'destructive',
      }),
  });

  return (
    <div className="min-h-screen flex">
      <AuthBranding />
      <AuthForm
        isSignIn={false}
        onAuth={(payload) => signUp.mutate(payload)}
        onModeSwitch={handleModeSwitch}
      />
    </div>
  );
};
