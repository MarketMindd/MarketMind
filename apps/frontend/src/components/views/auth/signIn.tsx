import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { APP_ROUTES } from '@/consts/routes';
import { useClientQueries } from '@/hooks/useClientQueries';
import { useToast } from '@/hooks/useToast';
import { AuthBranding } from './authBranding';
import { GoogleAuthButton } from './socialAuthButtons';

export const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

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

  const googleSignIn = useGoogleSignIn({ errorTitle: 'Google Sign in failed' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <AuthBranding />

      {/* Right panel - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src={logo} alt="MarketMind Logo" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-semibold">
              <span className="text-foreground">Market</span>
              <span className="text-primary">Mind</span>
            </span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Enter your credentials to access your portfolio</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="text-right">
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="lg"
              className="w-full"
              disabled={signIn.isPending}
            >
              {signIn.isPending ? 'Processing...' : 'Sign In'}
              <ArrowRight size={18} />
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-background text-muted-foreground">or continue with</span>
              </div>
            </div>

            <GoogleAuthButton onAuth={(payload) => googleSignIn.mutate(payload)} />
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground">Don't have an account?</span>
            <button
              type="button"
              onClick={() => navigate(APP_ROUTES.SIGN_UP)}
              className="ml-2 text-primary hover:underline font-medium"
            >
              Sign up
            </button>
          </div>

          <p className="mt-8 text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
