import { useState } from 'react';
import { Button } from '@/components/elements/button';
import { Input } from '@/components/elements/input';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthFormProps {
  isSignIn: boolean;
  onAuth: (payload: any) => void | Promise<any>;
  onModeSwitch: () => void;
}

export const AuthForm = ({ isSignIn, onAuth, onModeSwitch }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignIn) {
      onAuth({ email, password });
    } else {
      onAuth({ email, password, fullName });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {isSignIn ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-muted-foreground">
            {isSignIn
              ? 'Enter your credentials to access your portfolio'
              : 'Start your journey to smarter investing'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignIn && (
            <div className="relative animate-fade-in">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

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

          <Button type="submit" variant="glow" size="lg" className="w-full">
            {isSignIn ? 'Sign In' : 'Create Account'}
            <ArrowRight size={18} />
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-background text-muted-foreground">
                or continue with
              </span>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center">
          <span className="text-muted-foreground">
            {isSignIn ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            type="button"
            onClick={onModeSwitch}
            className="ml-2 text-primary hover:underline font-medium"
          >
            {isSignIn ? 'Sign up' : 'Sign in'}
          </button>
        </div>

        <p className="mt-8 text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
