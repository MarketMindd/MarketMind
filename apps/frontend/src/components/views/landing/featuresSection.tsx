import { BarChart3, Brain, Shield, Sparkles } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description:
        'Advanced algorithms analyze market trends, company fundamentals, and sentiment data.',
    },
    {
      icon: Shield,
      title: 'Risk-Adjusted Recommendations',
      description: 'Personalized insights based on your risk tolerance and investment goals.',
    },
    {
      icon: BarChart3,
      title: 'Transparent Performance',
      description: 'Full track record of past recommendations with outcomes and returns.',
    },
    {
      icon: Sparkles,
      title: 'Clear Explanations',
      description: 'Understand the "why" behind every recommendation with detailed analysis.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Why MarketMind?</h2>
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
  );
};
