import { useState } from 'react';
import { Button } from '@/components/elements/button';
import { Input } from '@/components/elements/input';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import Logo from '@/assets/logo.png';

interface AuthFormProps {
  onAuth: () => void;
}

export const AuthForm = ({ onAuth }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-background p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <img src={Logo} alt="MarketMind Logo" className="w-12 h-12 rounded-xl" />
            <span className="text-2xl font-semibold">
              <span className="text-foreground">Market</span>
              <span className="text-primary">Mind</span>
            </span>
          </div>

          <h1 className="text-4xl font-bold text-foreground leading-tight mb-6">
            AI-Powered Stock<br />
            <span className="gradient-text">Recommendations</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Make smarter investment decisions with clear, explainable AI insights tailored to your risk profile.
          </p>
        </div>

        <div className="relative space-y-6">
          <div className="glass-card p-4 max-w-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-primary font-semibold">AAPL</span>
              <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">Invest</span>
            </div>
            <p className="text-sm text-muted-foreground">Strong services growth and AI integration potential...</p>
          </div>

          <div className="glass-card p-4 max-w-xs ml-12 animate-fade-in stagger-1">
            <div className="text-2xl font-semibold text-foreground">87%</div>
            <div className="text-sm text-muted-foreground">Confidence Score</div>
          </div>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src={Logo} alt="MarketMind Logo" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-semibold">
              <span className="text-foreground">Market</span>
              <span className="text-primary">Mind</span>
            </span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? 'Enter your credentials to access your portfolio'
                : 'Start your journey to smarter investing'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative animate-fade-in">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" variant="glow" size="lg" className="w-full">
              {isLogin ? 'Sign In' : 'Create Account'}
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
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
              }}
              className="ml-2 text-primary hover:underline font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          <p className="mt-8 text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            This is a demo application — no real data is stored.
          </p>
        </div>
      </div>
    </div>
  );
};
