import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Lock,
  Mail,
  Upload,
  User,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortfolioItem } from '@market-mind/common';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PortfolioInput } from '@/components/views/portfolio/portfolioInput';
import { APP_ROUTES } from '@/consts/routes';
import { useClientQueries } from '@/hooks/useClientQueries';
import { useToast } from '@/hooks/useToast';
import { parsePortfolioFile } from '@/utils/fileParsingUtils';

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
    stocks: { useGetAllStocks },
  } = useClientQueries();

  const { data: availableStocks = [] } = useGetAllStocks();

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
      const validSymbols = availableStocks.map((s) => s.symbol);
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-background p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <img src={logo} alt="MarketMind Logo" className="w-12 h-12 rounded-xl" />
            <span className="text-2xl font-semibold">
              <span className="text-foreground">Market</span>
              <span className="text-primary">Mind</span>
            </span>
          </div>

          <h1 className="text-4xl font-bold text-foreground leading-tight mb-6">
            AI-Powered Stock
            <br />
            <span className="gradient-text">Recommendations</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Make smarter investment decisions with clear, explainable AI insights tailored to your
            risk profile.
          </p>
        </div>
      </div>

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

            <div className="animate-fade-in">
              <button
                type="button"
                onClick={() => setShowPortfolio(!showPortfolio)}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Add Your Portfolio</p>
                    <p className="text-xs text-muted-foreground">
                      Optional - Add your existing holdings
                    </p>
                  </div>
                </div>
                {showPortfolio ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {showPortfolio && (
                <div className="mt-4 p-4 rounded-lg border border-border bg-card animate-fade-in space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="portfolio-file"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileSpreadsheet size={16} />
                      Import from Excel/CSV
                      <Upload size={14} />
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-card text-muted-foreground">or add manually</span>
                    </div>
                  </div>
                  <PortfolioInput portfolio={portfolio} onChange={setPortfolio} compact />
                </div>
              )}
            </div>

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

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleGoogleAuth}
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleAppleAuth}
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Apple
              </Button>
            </div>
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
