import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingHeroProps {
  onNavigateToAuth: () => void;
}

export const LandingHero = ({ onNavigateToAuth }: LandingHeroProps) => {
  return (
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
            Get clear, explainable stock recommendations powered by advanced AI. Understand the "why"
            behind every call with our transparent approach to investing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-3">
            <Button variant="glow" size="xl" onClick={onNavigateToAuth}>
              Start Free Today
              <ArrowRight size={20} />
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() =>
                document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              View Track Record
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
