import { useClientQueries } from '@/hooks/useClientQueries';
import { useToast } from '@/hooks/useToast';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthBranding } from './authBranding';
import { AuthForm } from './authForm';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleModeSwitch = () => {
    navigate('/signup');
  };

  const {
    auth: { useSignIn },
  } = useClientQueries();
  const signIn = useSignIn({
    onSuccess: (data) => {
      console.log('Sign in successful', data);
      // store token and move on
      localStorage.setItem('accessToken', data.accessToken);
      navigate('/');
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
