import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Shield,
  Brain,
  BarChart3,
  Users,
  Sparkles
} from 'lucide-react';
import { cn } from '@/utils/tailwindUtils';
import logo from '@/assets/logo.png';

const mockPastRecommendations = [
  {
    id: '1',
    ticker: 'NVDA',
    recommendation: 'invest',
    returnPercent: 45.2,
    outcome: 'success'
  },
  {
    id: '2',
    ticker: 'AAPL',
    recommendation: 'invest',
    returnPercent: 12.4,
    outcome: 'success'
  },
  {
    id: '3',
    ticker: 'TSLA',
    recommendation: 'exit',
    returnPercent: -15.2,
    outcome: 'success' // Successfully avoided loss
  },
  {
    id: '4',
    ticker: 'MSFT',
    recommendation: 'invest',
    returnPercent: 8.7,
    outcome: 'success'
  },
  {
    id: '5',
    ticker: 'SNOW',
    recommendation: 'invest',
    returnPercent: -5.4,
    outcome: 'failure'
  }
];

export const Landing = () => {
  const navigate = useNavigate();
  const onNavigateToAuth = () => navigate('/signin');

  const successCount = mockPastRecommendations.filter(r => r.outcome === 'success').length;
  const totalCount = mockPastRecommendations.length;
  const successRate = Math.round((successCount / totalCount) * 100);

  const totalReturn = mockPastRecommendations.reduce((acc, r) => {
    return acc + (r.outcome === 'success' ? r.returnPercent : -Math.abs(r.returnPercent));
  }, 0);
  const avgReturn = (totalReturn / totalCount).toFixed(1);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced algorithms analyze market trends, company fundamentals, and sentiment data.'
    },
    {
      icon: Shield,
      title: 'Risk-Adjusted Recommendations',
      description: 'Personalized insights based on your risk tolerance and investment goals.'
    },
    {
      icon: BarChart3,
      title: 'Transparent Performance',
      description: 'Full track record of past recommendations with outcomes and returns.'
    },
    {
      icon: Sparkles,
      title: 'Clear Explanations',
      description: 'Understand the "why" behind every recommendation with detailed analysis.'
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="MarketMind Logo" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-semibold">
                <span className="text-foreground">Market</span>
                <span className="text-primary">Mind</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onNavigateToAuth}>
                Sign In
              </Button>
              <Button variant="glow" onClick={onNavigateToAuth}>
                Get Started
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 opacity-30 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm text-primary font-medium">AI-Powered Investment Insights</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in stagger-1">
              Make Smarter Investment
              <br />
              <span className="gradient-text">Decisions with AI</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in stagger-2">
              Get clear, explainable stock recommendations powered by advanced AI. 
              Understand the "why" behind every call with our transparent approach to investing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-3">
              <Button variant="glow" size="xl" onClick={onNavigateToAuth}>
                Start Free Today
                <ArrowRight size={20} />
              </Button>
              <Button variant="outline" size="xl" onClick={() => document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' })}>
                View Track Record
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Stats */}
      <section id="performance" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Proven Track Record
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Transparency is core to our approach. Here's our complete recommendation history.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-8 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-success" />
              </div>
              <div className="text-5xl font-bold text-success mb-2">{successRate}%</div>
              <div className="text-muted-foreground">Success Rate</div>
              <div className="text-sm text-muted-foreground mt-1">
                {successCount} of {totalCount} calls
              </div>
            </div>

            <div className="glass-card p-8 text-center animate-fade-in stagger-1">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <div className={cn(
                'text-5xl font-bold mb-2',
                Number(avgReturn) > 0 ? 'text-success' : 'text-destructive'
              )}>
                +{avgReturn}%
              </div>
              <div className="text-muted-foreground">Average Return</div>
              <div className="text-sm text-muted-foreground mt-1">Per recommendation</div>
            </div>

            <div className="glass-card p-8 text-center animate-fade-in stagger-2">
              <div className="w-14 h-14 rounded-xl bg-warning/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-warning" />
              </div>
              <div className="text-5xl font-bold text-foreground mb-2">{totalCount}</div>
              <div className="text-muted-foreground">Total Recommendations</div>
              <div className="text-sm text-muted-foreground mt-1">Since September 2024</div>
            </div>
          </div>

          {/* Recent Recommendations */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground">Recent Recommendations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 text-left">
                    <th className="p-4 text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Call</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Return</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPastRecommendations.slice(0, 5).map((rec, i) => (
                    <tr 
                      key={rec.id} 
                      className="border-b border-border/30 animate-fade-in"
                      style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                    >
                      <td className="p-4">
                        <span className="font-mono text-primary font-medium">{rec.ticker}</span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium capitalize',
                          rec.recommendation === 'invest' && 'bg-success/20 text-success',
                          rec.recommendation === 'hold' && 'bg-warning/20 text-warning',
                          rec.recommendation === 'exit' && 'bg-destructive/20 text-destructive'
                        )}>
                          {rec.recommendation}
                        </span>
                      </td>
                      <td className={cn(
                        'p-4 font-mono font-medium',
                        rec.returnPercent > 0 ? 'text-success' : 'text-destructive'
                      )}>
                        {rec.returnPercent > 0 ? '+' : ''}{rec.returnPercent.toFixed(1)}%
                      </td>
                      <td className="p-4">
                        {rec.outcome === 'success' ? (
                          <CheckCircle size={18} className="text-success" />
                        ) : (
                          <XCircle size={18} className="text-destructive" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why MarketMind?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We combine cutting-edge AI with transparent, explainable recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div 
                key={feature.title}
                className="glass-card p-6 animate-fade-in"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Invest Smarter?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of investors using AI-powered insights to make better decisions.
          </p>
          <Button variant="glow" size="xl" onClick={onNavigateToAuth}>
            Get Started Free
            <ArrowRight size={20} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MarketMind Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-semibold">
              <span className="text-foreground">Market</span>
              <span className="text-primary">Mind</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Demo application. Not financial advice. Past performance does not guarantee future results.
          </p>
        </div>
      </footer>
    </div>
  );
};

