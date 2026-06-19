import React from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '@/consts/routes';
import { useClientQueries } from '@/hooks/useClientQueries';
import { useToast } from '@/hooks/useToast';
import { AuthBranding } from './authBranding';
import { AuthForm } from './authForm';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleModeSwitch = () => {
    navigate(APP_ROUTES.SIGN_IN);
  };

  const {
    auth: { useSignUp, useGoogleSignIn },
  } = useClientQueries();

  const signUp = useSignUp({
    onSuccess: () => navigate(APP_ROUTES.RISK_TOLERANCE),
    onError: (err: Error) =>
      toast({
        title: 'Sign up failed',
        description: err.message,
        variant: 'destructive',
      }),
  });

  const googleSignIn = useGoogleSignIn({
    onSuccess: () => navigate(APP_ROUTES.RISK_TOLERANCE),
    onError: (err: Error) =>
      toast({
        title: 'Google Sign up failed',
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
        onGoogleAuth={(payload) => googleSignIn.mutate(payload)}
        onModeSwitch={handleModeSwitch}
      />
    </div>
  );
};
