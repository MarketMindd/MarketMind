import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    auth: { useSignIn },
  } = useClientQueries();
  const signIn = useSignIn({
    onSuccess: () => {
      navigate(APP_ROUTES.DASHBOARD);
    },
    onError: (err: Error) => {
      toast({
        title: 'Sign in failed',
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
        onModeSwitch={handleModeSwitch}
      />
    </div>
  );
};
