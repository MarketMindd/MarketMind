import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { FeaturesSection } from './featuresSection';
import { LandingHero } from './landingHero';
import { PerformanceStats } from './performanceStats';

export const Landing = () => {
  const navigate = useNavigate();
  const onNavigateToAuth = () => navigate('/signin');

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
      <LandingHero onNavigateToAuth={onNavigateToAuth} />

      {/* Performance Stats */}
      <PerformanceStats />

      {/* Features */}
      <FeaturesSection />

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Invest Smarter?</h2>
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
            Not financial advice. Past performance does not guarantee future results.
          </p>
        </div>
      </footer>
    </div>
  );
};
