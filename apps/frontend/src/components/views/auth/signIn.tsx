import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OAuthResponse } from '@market-mind/common';
import { APP_ROUTES } from '@/consts/routes';
import { useClientQueries } from '@/hooks/useClientQueries';
import { useToast } from '@/hooks/useToast';
import { AuthBranding } from './authBranding';
import { AuthForm } from './authForm';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleModeSwitch = () => {
    navigate(APP_ROUTES.SIGN_UP);
  };

  const {
    auth: { useSignIn, useGoogleSignIn },
  } = useClientQueries();
  const signIn = useSignIn({
    onSuccess: () => navigate(APP_ROUTES.DASHBOARD),
    onError: (err: Error) => {
      toast({
        title: 'Sign in failed',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const googleSignIn = useGoogleSignIn({
    onSuccess: ({ user: { isNewUser } }: OAuthResponse) =>
      isNewUser ? navigate(APP_ROUTES.RISK_TOLERANCE) : navigate(APP_ROUTES.DASHBOARD),
    onError: (err: Error) => {
      toast({
        title: 'Google Sign in failed',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="min-h-screen flex">
      <AuthBranding />
      <AuthForm
        isSignIn
        onAuth={(payload) => signIn.mutate(payload)}
        onGoogleAuth={(payload) => googleSignIn.mutate(payload)}
        onModeSwitch={handleModeSwitch}
      />
    </div>
  );
};
