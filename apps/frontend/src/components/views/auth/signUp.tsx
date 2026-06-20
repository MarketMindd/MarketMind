import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { APP_ROUTES } from '@/consts/routes';
import { useClientQueries } from '@/hooks/useClientQueries';
import { useToast } from '@/hooks/useToast';
import { parsePortfolioFile } from '@/utils/fileParsingUtils';
import { PortfolioItem } from '@market-mind/common';
import {
  ArrowRight,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthBranding } from './authBranding';
import { PortfolioUpload } from './portfolioUpload';
import { SocialAuthButtons } from './socialAuthButtons';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    auth: { useSignUp },
    portfolio: { useSavePortfolio },
    stocks: { useGetBasicStocks },
  } = useClientQueries();

  const { data: basicStocks = [] } = useGetBasicStocks();

  const { mutate: savePortfolio } = useSavePortfolio({
    onSuccess: () => {
      toast({ title: 'Welcome!', description: 'Portfolio imported successfully.' });
      navigate(APP_ROUTES.RISK_TOLERANCE);
    },
  });

  const signUp = useSignUp({
    onSuccess: () => {
      if (portfolio.length > 0) {
        savePortfolio({ items: portfolio });
      } else {
        navigate(APP_ROUTES.RISK_TOLERANCE);
      }
    },
    onError: (err: Error) => {
      toast({
        title: 'Sign up failed',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signUp.mutate({ email, password, fullName: name });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(fileExtension)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an Excel (.xlsx, .xls) or CSV file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const validSymbols = basicStocks.map((s) => s.symbol);
      const parsedStocks = await parsePortfolioFile(file, validSymbols);

      if (parsedStocks.length === 0) {
        toast({
          title: 'No valid stocks found',
          description: 'Please ensure your file has Ticker, Shares, and Price columns.',
          variant: 'destructive',
        });
        return;
      }

      setPortfolio((prev) => {
        const existingTickers = new Set(prev.map((p) => p.ticker));
        const newStocks = parsedStocks.filter((s) => !existingTickers.has(s.ticker));
        return [...prev, ...newStocks];
      });

      toast({
        title: 'Portfolio imported',
        description: `Successfully imported ${parsedStocks.length} stocks from your file.`,
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: 'Error reading file',
        description: 'There was a problem parsing your file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGoogleAuth = () => {
    toast({
      title: 'Google Sign Up',
      description: 'Google authentication would be triggered here. This is a demo.',
    });
  };

  const handleAppleAuth = () => {
    toast({
      title: 'Apple Sign Up',
      description: 'Apple authentication would be triggered here. This is a demo.',
    });
  };

  return (
    <div className="min-h-screen flex">
      <AuthBranding />

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
            <h2 className="text-2xl font-semibold text-foreground mb-2">Create your account</h2>
            <p className="text-muted-foreground">Start your journey to smarter investing</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <PortfolioUpload
              showPortfolio={showPortfolio}
              setShowPortfolio={setShowPortfolio}
              portfolio={portfolio}
              setPortfolio={setPortfolio}
              fileInputRef={fileInputRef}
              handleFileUpload={handleFileUpload}
            />

            <Button
              type="submit"
              variant="glow"
              size="lg"
              className="w-full"
              disabled={signUp.isPending}
            >
              {signUp.isPending ? 'Processing...' : 'Create Account'}
              <ArrowRight size={18} />
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-background text-muted-foreground">or continue with</span>
              </div>
            </div>

            <SocialAuthButtons
              onGoogleAuth={handleGoogleAuth}
              onAppleAuth={handleAppleAuth}
            />
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground">Already have an account?</span>
            <button
              type="button"
              onClick={() => navigate(APP_ROUTES.SIGN_IN)}
              className="ml-2 text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </div>

          <p className="mt-8 text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy. This is a demo
            application — no real data is stored.
          </p>
        </div>
      </div>
    </div>
  );
};
